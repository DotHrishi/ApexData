"""
Inference predictor interface for loading serialized tyre degradation models and serving
traceable predictions for FastAPI backend integration.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Union
import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger("models.predictor")

DEFAULT_MODEL_DIR = Path(__file__).resolve().parent.parent / "trained_models"


class TyreDegradationPredictor:
    """Production-ready inference predictor for tyre degradation prediction."""

    def __init__(self, model_dir: Union[str, Path] = DEFAULT_MODEL_DIR):
        self.model_dir = Path(model_dir).resolve()
        self.model_path = self.model_dir / "latest.joblib"
        if not self.model_path.exists():
            self.model_path = self.model_dir / "tyre_model_v1.joblib"

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"No trained model found in {self.model_dir}. Please train a model first."
            )

        self.feature_cols_path = self.model_dir / "feature_columns.json"
        if not self.feature_cols_path.exists():
            raise FileNotFoundError(
                f"Feature columns schema missing at: {self.feature_cols_path}"
            )

        # Load model and schema
        self.model = joblib.load(self.model_path)
        with open(self.feature_cols_path, "r") as f:
            self.feature_columns = json.load(f)

        # Load metadata if available
        self.metadata = {}
        meta_path = self.model_dir / "metadata.json"
        if meta_path.exists():
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)

        self.model_version = self.metadata.get("version", "v1")
        self.trained_on = f"Seasons {self.metadata.get('dataset_samples', 'N/A')} samples"

        logger.info(f"Loaded predictor model ({self.model_version}) from: {self.model_path}")

    def predict(self, input_data: Union[pd.DataFrame, Dict, List[Dict]]) -> np.ndarray:
        """
        Generate next lap time predictions for input data.

        Args:
            input_data: DataFrame, dictionary, or list of dictionaries.

        Returns:
            np.ndarray: Predicted next lap time(s) in seconds.
        """
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            df = pd.DataFrame(input_data)
        elif isinstance(input_data, pd.DataFrame):
            df = input_data.copy()
        else:
            raise TypeError(f"Unsupported input data type: {type(input_data)}")

        missing_cols = [col for col in self.feature_columns if col not in df.columns]
        if missing_cols:
            raise ValueError(
                f"Input data is missing required feature columns: {missing_cols}. "
                f"Expected features: {self.feature_columns}"
            )

        X = df[self.feature_columns]
        predictions = self.model.predict(X)
        return predictions

    def predict_traceable(self, feature_dict: Dict[str, Union[float, int]]) -> Dict:
        """
        Generate a statistically grounded traceable prediction payload suitable for FastAPI response.

        Args:
            feature_dict: Dictionary containing required feature values.

        Returns:
            Dict: Comprehensive prediction payload including predicted time, 95% error prediction interval,
                  expected RMSE, and model version info.
        """
        predicted_time = float(self.predict(feature_dict)[0])
        test_rmse = float(self.metadata.get("test_metrics", {}).get("rmse", 0.8589))

        # 95% Empirical Prediction Interval based on hold-out residual error
        margin_95 = 1.96 * test_rmse
        lower_bound = round(predicted_time - margin_95, 3)
        upper_bound = round(predicted_time + margin_95, 3)

        return {
            "predicted_next_lap_time": round(predicted_time, 3),
            "expected_rmse_sec": round(test_rmse, 3),
            "prediction_interval_95pct": {
                "lower": lower_bound,
                "upper": upper_bound,
            },
            "model_version": self.model_version,
            "trained_samples": self.metadata.get("dataset_samples", "N/A"),
            "model_architecture": self.metadata.get("model_type", "XGBoostRegressor"),
        }

    def predict_single(self, feature_dict: Dict[str, Union[float, int]]) -> float:
        """Convenience method returning raw predicted next lap time in float seconds."""
        preds = self.predict(feature_dict)
        return float(preds[0])
