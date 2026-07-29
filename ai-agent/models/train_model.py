"""
Main execution script for training, evaluating, and serializing the Tyre Degradation XGBoost Model.
"""

import argparse
from datetime import datetime
import json
import logging
from pathlib import Path
import sys
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import GroupShuffleSplit, RandomizedSearchCV
from xgboost import XGBRegressor

# Ensure parent directory (ai-agent) is in python path
current_file = Path(__file__).resolve()
ai_agent_dir = current_file.parent.parent
if str(ai_agent_dir) not in sys.path:
    sys.path.insert(0, str(ai_agent_dir))

from models.model_utils import (
    FEATURE_COLUMNS,
    TARGET_COLUMN,
    evaluate_predictions,
    load_and_prepare_dataset,
    log_experiment,
    plot_feature_importance,
    plot_prediction_vs_actual,
    plot_residuals,
    plot_shap_plots,
    race_grouped_cv,
)


def setup_logging():
    """Configure structured logging output."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args():
    parser = argparse.ArgumentParser(
        description="ApexData AI Tyre Degradation Model Training Pipeline"
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default=str(ai_agent_dir / "data" / "dataset.parquet"),
        help="Path to cleaned dataset file (parquet or csv).",
    )
    parser.add_argument(
        "--models-dir",
        type=str,
        default=str(ai_agent_dir / "trained_models"),
        help="Directory to save serialized models and metadata.",
    )
    parser.add_argument(
        "--reports-dir",
        type=str,
        default=str(ai_agent_dir / "reports"),
        help="Directory to save diagnostic plots and experiment logs.",
    )
    parser.add_argument(
        "--random-seed",
        type=int,
        default=42,
        help="Random seed for reproducibility.",
    )
    parser.add_argument(
        "--n-iter-search",
        type=int,
        default=10,
        help="Number of iterations for XGBoost hyperparameter search.",
    )
    return parser.parse_args()


def main():
    setup_logging()
    logger = logging.getLogger("models.train_model")
    args = parse_args()

    models_dir = Path(args.models_dir).resolve()
    reports_dir = Path(args.reports_dir).resolve()
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    logger.info("==================================================")
    logger.info("🏎️ APEXDATA AI TYRE DEGRADATION MODEL TRAINING")
    logger.info(f"Dataset Path: {args.data_path}")
    logger.info(f"Output Models Dir: {models_dir}")
    logger.info(f"Output Reports Dir: {reports_dir}")
    logger.info("==================================================")

    start_time = time.time()

    # 1. Load Dataset
    X, y, groups, full_df = load_and_prepare_dataset(args.data_path)
    logger.info(f"Dataset Sample Count: {len(X)} | Features: {X.shape[1]}")
    logger.info(f"Unique Race Groups: {groups.nunique()}")

    # 2. Race-Grouped 80/20 Train/Test Split (Prevent Data Leakage)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=args.random_seed)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))

    X_train, y_train, groups_train = X.iloc[train_idx], y.iloc[train_idx], groups.iloc[train_idx]
    X_test, y_test, groups_test = X.iloc[test_idx], y.iloc[test_idx], groups.iloc[test_idx]

    logger.info(
        f"Race-Grouped Train Split: {len(X_train)} samples ({groups_train.nunique()} races) | "
        f"Test Split: {len(X_test)} samples ({groups_test.nunique()} races)"
    )

    # 3. Train Baseline Models
    logger.info("--- Training Baseline Models ---")

    # Baseline 1: Linear Regression
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    lr_metrics = evaluate_predictions(y_test, lr_preds)
    logger.info(f"Baseline Linear Regression -> RMSE: {lr_metrics['rmse']}s | R²: {lr_metrics['r2']}")

    # Baseline 2: Random Forest
    rf = RandomForestRegressor(n_estimators=100, random_state=args.random_seed, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_metrics = evaluate_predictions(y_test, rf_preds)
    logger.info(f"Baseline Random Forest     -> RMSE: {rf_metrics['rmse']}s | R²: {rf_metrics['r2']}")

    # 4. Hyperparameter Tuning for XGBoost Regressor
    logger.info(f"--- Tuning XGBoost Regressor ({args.n_iter_search} iterations) ---")
    param_grid = {
        "n_estimators": [100, 200, 300],
        "max_depth": [3, 5, 7, 9],
        "learning_rate": [0.01, 0.03, 0.05, 0.1],
        "subsample": [0.7, 0.8, 0.9, 1.0],
        "colsample_bytree": [0.7, 0.8, 0.9, 1.0],
        "min_child_weight": [1, 3, 5],
    }

    base_xgb = XGBRegressor(random_state=args.random_seed, n_jobs=-1)
    # Perform randomized search with leak-free GroupKFold
    from sklearn.model_selection import GroupKFold

    gkf = GroupKFold(n_splits=min(5, groups_train.nunique()))

    search = RandomizedSearchCV(
        estimator=base_xgb,
        param_distributions=param_grid,
        n_iter=args.n_iter_search,
        scoring="neg_root_mean_squared_error",
        cv=gkf,
        random_state=args.random_seed,
        n_jobs=-1,
    )
    search.fit(X_train, y_train, groups=groups_train)

    best_xgb = search.best_estimator_
    logger.info(f"Best XGBoost Hyperparameters: {search.best_params_}")

    # 5. Evaluate Tuned XGBoost on Hold-out Test Set
    xgb_preds = best_xgb.predict(X_test)
    xgb_metrics = evaluate_predictions(y_test, xgb_preds)

    # Calculate percentage improvement over Linear Regression baseline
    rmse_improvement = (
        (lr_metrics["rmse"] - xgb_metrics["rmse"]) / lr_metrics["rmse"]
    ) * 100.0

    logger.info(
        f"Tuned XGBoost Test Metrics -> RMSE: {xgb_metrics['rmse']}s | "
        f"MAE: {xgb_metrics['mae']}s | R²: {xgb_metrics['r2']} | MAPE: {xgb_metrics['mape_pct']}%"
    )
    logger.info(f"RMSE Improvement over Baseline: {rmse_improvement:.2f}%")

    # 6. Leak-Free GroupKFold Cross-Validation (5-Fold)
    logger.info("--- Performing 5-Fold GroupKFold Cross-Validation ---")
    cv_metrics = race_grouped_cv(best_xgb, X, y, groups, n_splits=5)
    logger.info(
        f"5-Fold Race GroupKFold CV -> Mean RMSE: {cv_metrics['cv_rmse_mean']} ± {cv_metrics['cv_rmse_std']}s | "
        f"Mean R²: {cv_metrics['cv_r2_mean']} ± {cv_metrics['cv_r2_std']}"
    )

    elapsed_time = round(time.time() - start_time, 2)

    # 7. Model & Metadata Serialization
    logger.info("--- Serializing Trained Model & Metadata ---")
    version = "v1"
    model_v1_path = models_dir / f"tyre_model_{version}.joblib"
    latest_model_path = models_dir / "latest.joblib"

    joblib.dump(best_xgb, model_v1_path)
    joblib.dump(best_xgb, latest_model_path)

    # Save feature schema
    feature_schema_path = models_dir / "feature_columns.json"
    with open(feature_schema_path, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    # Save test metrics
    metrics_path = models_dir / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(xgb_metrics, f, indent=2)

    # Save full run metadata
    metadata = {
        "version": version,
        "trained_timestamp": datetime.now().isoformat(),
        "model_type": "XGBoostRegressor",
        "best_hyperparameters": search.best_params_,
        "dataset_samples": len(X),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "test_metrics": xgb_metrics,
        "cross_validation_metrics": cv_metrics,
        "baseline_comparison": {
            "linear_regression_rmse": lr_metrics["rmse"],
            "random_forest_rmse": rf_metrics["rmse"],
            "xgboost_rmse": xgb_metrics["rmse"],
            "rmse_improvement_pct": round(rmse_improvement, 2),
        },
        "training_duration_seconds": elapsed_time,
    }

    metadata_path = models_dir / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # 8. Generate Reports & Diagnostic Plots
    logger.info("--- Generating Diagnostic Plots & SHAP Explanations ---")

    # Feature Importance Plot
    plot_feature_importance(
        model=best_xgb,
        feature_names=FEATURE_COLUMNS,
        output_path=reports_dir / "feature_importance.png",
        top_n=10,
    )

    # Prediction vs Actual Scatter Plot
    plot_prediction_vs_actual(
        y_true=y_test.values,
        y_pred=xgb_preds,
        output_path=reports_dir / "prediction_vs_actual.png",
    )

    # Residuals Plot
    plot_residuals(
        y_true=y_test.values,
        y_pred=xgb_preds,
        output_path=reports_dir / "residuals.png",
    )

    # SHAP Plots
    try:
        plot_shap_plots(
            model=best_xgb,
            X_sample=X_test.sample(min(200, len(X_test)), random_state=args.random_seed),
            reports_dir=reports_dir,
        )
    except Exception as e:
        logger.warning(f"Could not generate SHAP plots: {e}")

    # 9. Experiment Tracking Logging
    exp_record = {
        "model_name": "XGBoostRegressor",
        "version": version,
        "n_samples": len(X),
        "n_features": len(FEATURE_COLUMNS),
        "rmse": xgb_metrics["rmse"],
        "mae": xgb_metrics["mae"],
        "r2": xgb_metrics["r2"],
        "mape_pct": xgb_metrics["mape_pct"],
        "cv_rmse_mean": cv_metrics["cv_rmse_mean"],
        "cv_r2_mean": cv_metrics["cv_r2_mean"],
        "training_time_sec": elapsed_time,
    }
    log_experiment(reports_dir / "experiment_results.csv", exp_record)

    # 10. Print Concise Training Summary Report
    importances = best_xgb.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_10_features = [
        f"{FEATURE_COLUMNS[i]} ({importances[i]:.4f})" for i in sorted_idx[:10]
    ]

    print("\n" + "=" * 60)
    print("APEXDATA TYRE DEGRADATION MODEL TRAINING REPORT")
    print("=" * 60)
    print(f"Dataset Size     : {len(X)} samples across {groups.nunique()} Grand Prix races")
    print(f"Training Time    : {elapsed_time} seconds")
    print("-" * 60)
    print("Model Comparison (Test RMSE):")
    print(f"   * Baseline Linear Regression : {lr_metrics['rmse']:.4f} s")
    print(f"   * Baseline Random Forest     : {rf_metrics['rmse']:.4f} s")
    print(f"   * Tuned XGBoost (Winner)     : {xgb_metrics['rmse']:.4f} s  ({rmse_improvement:+.2f}% improvement)")
    print("-" * 60)
    print("XGBoost Test Set Performance:")
    print(f"   * RMSE : {xgb_metrics['rmse']} s")
    print(f"   * MAE  : {xgb_metrics['mae']} s")
    print(f"   * R2   : {xgb_metrics['r2']}")
    print(f"   * MAPE : {xgb_metrics['mape_pct']}%")
    print("-" * 60)
    print("Leak-Free 5-Fold GroupKFold Cross-Validation:")
    print(f"   * Mean CV RMSE : {cv_metrics['cv_rmse_mean']} +/- {cv_metrics['cv_rmse_std']} s")
    print(f"   * Mean CV R2   : {cv_metrics['cv_r2_mean']} +/- {cv_metrics['cv_r2_std']}")
    print("-" * 60)
    print("Top 10 Most Important Features:")
    for rank, feat in enumerate(top_10_features, 1):
        print(f"   {rank:2d}. {feat}")
    print("-" * 60)
    print(f"Model Saved To   : {latest_model_path}")
    print(f"Reports Saved To : {reports_dir}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
