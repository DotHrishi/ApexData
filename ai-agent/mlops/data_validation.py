"""
Data validation module for verifying data quality, schema compliance, and checking for anomalies before training.
"""

import logging
from typing import Dict, List, Tuple
import pandas as pd

logger = logging.getLogger("mlops.data_validation")

REQUIRED_FEATURES = [
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


class DatasetValidator:
    """Validates raw and feature-engineered datasets prior to model training."""

    def __init__(self, max_missing_ratio: float = 0.05):
        self.max_missing_ratio = max_missing_ratio

    def validate(self, df: pd.DataFrame) -> Tuple[bool, List[str], Dict]:
        """
        Validate input dataset against schema and data quality rules.

        Returns:
            Tuple[bool, List[str], Dict]: (is_valid, list_of_issues, summary_stats)
        """
        if df.empty:
            return False, ["Dataset is completely empty."], {}

        issues = []

        # Rule 1: Schema Compliance
        missing_features = [col for col in REQUIRED_FEATURES if col not in df.columns]
        if missing_features:
            issues.append(f"Missing required feature columns: {missing_features}")

        if TARGET_COLUMN not in df.columns:
            issues.append(f"Missing target column: '{TARGET_COLUMN}'")

        if issues:
            return False, issues, {}

        # Drop unlabelled rows (last lap of each driver session) for validation
        clean_target_df = df.dropna(subset=[TARGET_COLUMN]).copy()
        total_rows = len(clean_target_df)

        sub_cols = REQUIRED_FEATURES + [TARGET_COLUMN]
        missing_counts = clean_target_df[sub_cols].isna().sum()
        max_missing = missing_counts.max()
        missing_ratio = max_missing / total_rows

        if missing_ratio > self.max_missing_ratio:
            issues.append(
                f"Missing value ratio ({missing_ratio:.2%}) exceeds threshold ({self.max_missing_ratio:.2%})."
            )

        # Rule 3: Target Validity (No negative or zero lap times)
        invalid_targets = (df[TARGET_COLUMN] <= 0) | (df[TARGET_COLUMN] > 300)
        if invalid_targets.sum() > 0:
            issues.append(f"Found {invalid_targets.sum()} invalid target values (<= 0 or > 300s).")

        # Rule 4: Tyre Life Validity
        if "TyreLife" in df.columns:
            invalid_tyre_life = df["TyreLife"] <= 0
            if invalid_tyre_life.sum() > 0:
                issues.append(f"Found {invalid_tyre_life.sum()} non-positive TyreLife records.")

        # Rule 5: Compound Encoding Check
        if "CompoundEncoded" in df.columns:
            invalid_compounds = ~df["CompoundEncoded"].isin([0, 1, 2, 3, 4])
            if invalid_compounds.sum() > 0:
                issues.append(f"Found {invalid_compounds.sum()} unknown/invalid CompoundEncoded values.")

        is_valid = len(issues) == 0

        summary = {
            "total_samples": total_rows,
            "features_checked": len(REQUIRED_FEATURES),
            "missing_rows": int(df[sub_cols].isna().any(axis=1).sum()),
            "passed": is_valid,
            "issues_count": len(issues),
        }

        if is_valid:
            logger.info(f"✅ Data Validation PASSED ({total_rows} samples verified).")
        else:
            logger.error(f"❌ Data Validation FAILED with {len(issues)} issues:")
            for issue in issues:
                logger.error(f"   - {issue}")

        return is_valid, issues, summary
