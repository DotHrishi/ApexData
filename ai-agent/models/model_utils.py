"""
Machine learning utility functions for data loading, evaluation, leak-free GroupKFold CV,
visualization, and experiment tracking.
"""

from datetime import datetime
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import GroupKFold

logger = logging.getLogger("models.model_utils")

# Explicit Feature Set required for Tyre Degradation Prediction
FEATURE_COLUMNS = [
    "CompoundEncoded",
    "TyreLife",
    "LapNumber",
    "EstimatedFuelLoad",
    "ApproxFuelCorrectedLapTime",
    "TrackTemp",
    "AirTemp",
    "Humidity",
    "Pressure",
    "RollingAvgPace3",
    "RollingAvgPace5",
    "LapTimeDelta",
    "RaceProgress",
    "StintProgress",
]

TARGET_COLUMN = "TargetNextLapTime"


def load_and_prepare_dataset(
    data_path: Union[str, Path]
) -> Tuple[pd.DataFrame, pd.Series, pd.Series, pd.DataFrame]:
    """
    Load dataset from parquet (or csv), validate columns, drop NaNs,
    and construct the RaceGroup grouping key.

    Returns:
        Tuple[X, y, groups, full_df]: Features DataFrame, Target Series, Groups Series, Full DataFrame.
    """
    path = Path(data_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path}")

    if path.suffix == ".parquet":
        df = pd.read_parquet(path)
    else:
        df = pd.read_csv(path)

    logger.info(f"Loaded dataset from {path.name} with shape: {df.shape}")

    # Check for missing required feature or target columns
    missing_features = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_features:
        raise KeyError(f"Dataset is missing required features: {missing_features}")

    if TARGET_COLUMN not in df.columns:
        raise KeyError(f"Dataset is missing target column: '{TARGET_COLUMN}'")

    # Clean missing values in features or target
    sub_cols = FEATURE_COLUMNS + [TARGET_COLUMN]
    initial_count = len(df)
    clean_df = df.dropna(subset=sub_cols).copy()
    if len(clean_df) < initial_count:
        logger.info(f"Dropped {initial_count - len(clean_df)} rows containing missing values.")

    # Construct grouping key for leak-free GroupKFold & GroupShuffleSplit (Season + Circuit)
    if "Season" in clean_df.columns and "Circuit" in clean_df.columns:
        clean_df["RaceGroup"] = (
            clean_df["Season"].astype(str) + "_" + clean_df["Circuit"].astype(str)
        )
    else:
        clean_df["RaceGroup"] = "DefaultGroup"

    X = clean_df[FEATURE_COLUMNS].copy()
    y = clean_df[TARGET_COLUMN].copy()
    groups = clean_df["RaceGroup"].copy()

    return X, y, groups, clean_df


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Compute regression metrics: RMSE, MAE, R², and MAPE (%).
    """
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    mape = float(mean_absolute_percentage_error(y_true, y_pred) * 100.0)

    return {
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2": round(r2, 4),
        "mape_pct": round(mape, 4),
    }


def race_grouped_cv(
    model,
    X: pd.DataFrame,
    y: pd.Series,
    groups: pd.Series,
    n_splits: int = 5,
) -> Dict[str, float]:
    """
    Perform leak-free GroupKFold cross-validation grouped by Grand Prix (RaceGroup).
    """
    unique_groups = groups.nunique()
    actual_splits = min(n_splits, unique_groups)
    gkf = GroupKFold(n_splits=actual_splits)

    rmse_scores = []
    r2_scores = []

    for train_idx, val_idx in gkf.split(X, y, groups=groups):
        X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
        X_val, y_val = X.iloc[val_idx], y.iloc[val_idx]

        # Fit model clone
        import copy

        fold_model = copy.deepcopy(model)
        fold_model.fit(X_tr, y_tr)

        preds = fold_model.predict(X_val)
        rmse_scores.append(np.sqrt(mean_squared_error(y_val, preds)))
        r2_scores.append(r2_score(y_val, preds))

    return {
        "cv_rmse_mean": round(float(np.mean(rmse_scores)), 4),
        "cv_rmse_std": round(float(np.std(rmse_scores)), 4),
        "cv_r2_mean": round(float(np.mean(r2_scores)), 4),
        "cv_r2_std": round(float(np.std(r2_scores)), 4),
    }


def plot_feature_importance(
    model,
    feature_names: List[str],
    output_path: Union[str, Path],
    top_n: int = 10,
):
    """Generate and save horizontal Feature Importance bar plot."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    else:
        logger.warning("Model does not have feature_importances_ attribute.")
        return

    indices = np.argsort(importances)[::-1]
    top_indices = indices[:top_n]

    top_features = [feature_names[i] for i in top_indices][::-1]
    top_scores = importances[top_indices][::-1]

    plt.figure(figsize=(9, 5), dpi=300)
    plt.barh(top_features, top_scores, color="#1f77b4", edgecolor="black")
    plt.xlabel("Feature Importance Score")
    plt.title(f"Top {top_n} Feature Importances")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    logger.info(f"Saved Feature Importance plot -> {output_path}")


def plot_shap_plots(
    model,
    X_sample: pd.DataFrame,
    reports_dir: Union[str, Path],
):
    """Generate and save SHAP Summary and Bar plots."""
    reports_dir = Path(reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X_sample)

    # 1. SHAP Summary Beeswarm Plot
    plt.figure(figsize=(10, 6), dpi=300)
    shap.summary_plot(shap_values, X_sample, show=False)
    summary_path = reports_dir / "shap_summary.png"
    plt.title("SHAP Summary Beeswarm Plot", fontsize=12, pad=15)
    plt.tight_layout()
    plt.savefig(summary_path)
    plt.close()
    logger.info(f"Saved SHAP Summary Plot -> {summary_path}")

    # 2. SHAP Bar Plot
    plt.figure(figsize=(10, 6), dpi=300)
    shap.plots.bar(shap_values, show=False)
    bar_path = reports_dir / "shap_bar.png"
    plt.title("SHAP Feature Importance Bar Plot", fontsize=12, pad=15)
    plt.tight_layout()
    plt.savefig(bar_path)
    plt.close()
    logger.info(f"Saved SHAP Bar Plot -> {bar_path}")


def plot_prediction_vs_actual(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    output_path: Union[str, Path],
):
    """Generate and save Actual vs Predicted scatter plot."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(7, 6), dpi=300)
    plt.scatter(y_true, y_pred, alpha=0.5, color="#2ca02c", edgecolors="none", s=25)

    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], "r--", label="Ideal Prediction (y=x)")

    plt.xlabel("Actual Next Lap Time (s)")
    plt.ylabel("Predicted Next Lap Time (s)")
    plt.title("Prediction vs Actual Lap Times")
    plt.legend()
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    logger.info(f"Saved Prediction vs Actual plot -> {output_path}")


def plot_residuals(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    output_path: Union[str, Path],
):
    """Generate and save Residual Error Distribution plot."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    residuals = y_true - y_pred

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=300)

    # Histogram of residuals
    ax1.hist(residuals, bins=30, color="#ff7f0e", edgecolor="black", alpha=0.7)
    ax1.axvline(0, color="black", linestyle="--", linewidth=1.5)
    ax1.set_xlabel("Residual Error (Actual - Predicted) [s]")
    ax1.set_ylabel("Frequency")
    ax1.set_title("Residual Error Distribution")
    ax1.grid(True, linestyle=":", alpha=0.6)

    # Residuals vs Predicted scatter
    ax2.scatter(y_pred, residuals, alpha=0.5, color="#d62728", s=25)
    ax2.axhline(0, color="black", linestyle="--", linewidth=1.5)
    ax2.set_xlabel("Predicted Next Lap Time (s)")
    ax2.set_ylabel("Residual Error (s)")
    ax2.set_title("Residuals vs Predicted Pace")
    ax2.grid(True, linestyle=":", alpha=0.6)

    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    logger.info(f"Saved Residual Error plot -> {output_path}")


def log_experiment(
    csv_path: Union[str, Path],
    run_info: Dict[str, Union[str, float, int]],
):
    """Append run metrics to experiment results CSV log."""
    csv_path = Path(csv_path)
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    run_data = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        **run_info,
    }

    df_new = pd.DataFrame([run_data])

    if csv_path.exists():
        df_new.to_csv(csv_path, mode="a", header=False, index=False)
    else:
        df_new.to_csv(csv_path, index=False)

    logger.info(f"Appended experiment run record to: {csv_path}")
