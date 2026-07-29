"""
Feature engineering module for computing tyre degradation metrics, pace indicators,
fuel estimates, and supervised learning target labels.
"""

import logging
import numpy as np
import pandas as pd

logger = logging.getLogger("dataset_builder.feature_engineering")


class FeatureEngineer:
    """Computes ML feature variables and target labels for tyre degradation prediction."""

    COMPOUND_MAP = {
        "SOFT": 0,
        "MEDIUM": 1,
        "HARD": 2,
        "INTERMEDIATE": 3,
        "WET": 4,
        # Additional FastF1 compound names fallback
        "C1": 2,
        "C2": 2,
        "C3": 1,
        "C4": 0,
        "C5": 0,
    }

    def __init__(
        self,
        max_fuel_kg: float = 110.0,
        fuel_correction_sec_per_kg: float = 0.033,
        drop_unlabelled_target: bool = True,
    ):
        self.max_fuel_kg = max_fuel_kg
        self.fuel_correction_sec_per_kg = fuel_correction_sec_per_kg
        self.drop_unlabelled_target = drop_unlabelled_target

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate feature set and target label on cleaned lap data.

        Args:
            df: Cleaned lap DataFrame.

        Returns:
            pd.DataFrame: Feature-engineered DataFrame ready for ML.
        """
        if df.empty:
            return df

        logger.info("Starting feature engineering...")
        work_df = df.copy()

        # Sort values to guarantee chronological sequence per driver
        sort_cols = ["Season", "Circuit", "Driver", "LapNumber"]
        work_df = work_df.sort_values(sort_cols).reset_index(drop=True)

        # 1. Compound Encoding
        work_df["CompoundEncoded"] = (
            work_df["Compound"].astype(str).str.upper().map(self.COMPOUND_MAP).fillna(-1).astype(int)
        )

        # 2. Previous Lap Time & Lap Time Delta
        driver_session_group = work_df.groupby(["Season", "Circuit", "Driver"])["LapTimeSeconds"]
        work_df["PreviousLapTime"] = driver_session_group.shift(1)
        work_df["LapTimeDelta"] = work_df["LapTimeSeconds"] - work_df["PreviousLapTime"]

        # 3. Rolling Pace Features (3-lap and 5-lap averages)
        work_df["RollingAvgPace3"] = driver_session_group.transform(
            lambda s: s.rolling(3, min_periods=1).mean()
        )
        work_df["RollingAvgPace5"] = driver_session_group.transform(
            lambda s: s.rolling(5, min_periods=1).mean()
        )

        # 4. Total Race Laps per event
        race_group = work_df.groupby(["Season", "Circuit"])["LapNumber"]
        total_race_laps = race_group.transform("max")
        work_df["TotalRaceLaps"] = total_race_laps

        # 5. Estimated Fuel Load & Honest Fuel Corrected Pace
        # Linear fuel burn model: full tank at start decreasing per lap
        lap_progress = (work_df["LapNumber"] - 1) / np.maximum(total_race_laps, 1)
        estimated_fuel = self.max_fuel_kg * (1.0 - lap_progress)
        work_df["EstimatedFuelLoad"] = np.clip(estimated_fuel, 0.0, self.max_fuel_kg)
        work_df["ApproxFuelCorrectedLapTime"] = (
            work_df["LapTimeSeconds"] - (work_df["EstimatedFuelLoad"] * self.fuel_correction_sec_per_kg)
        )

        # 6. Race & Stint Progress (%)
        work_df["RaceProgress"] = (work_df["LapNumber"] / np.maximum(total_race_laps, 1)) * 100.0
        work_df["RemainingRaceLaps"] = total_race_laps - work_df["LapNumber"]

        stint_group = work_df.groupby(["Season", "Circuit", "Driver", "Stint"])["TyreLife"]
        stint_max_tyre_life = stint_group.transform("max")
        work_df["StintProgress"] = (work_df["TyreLife"] / np.maximum(stint_max_tyre_life, 1.0)) * 100.0

        # 7. Supervised Target Label ⭐ TargetNextLapTime & TargetNextLapDelta
        work_df["TargetNextLapTime"] = driver_session_group.shift(-1)
        work_df["TargetNextLapDelta"] = work_df["TargetNextLapTime"] - work_df["LapTimeSeconds"]

        # Drop unlabelled rows (last lap of each driver session) if requested
        if self.drop_unlabelled_target:
            initial_len = len(work_df)
            work_df = work_df.dropna(subset=["TargetNextLapTime"]).reset_index(drop=True)
            logger.info(
                f"Dropped {initial_len - len(work_df)} unlabelled target rows (final session laps)."
            )

        logger.info(f"Feature engineering completed. Final output shape: {work_df.shape}")
        return work_df
