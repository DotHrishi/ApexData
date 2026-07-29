"""
Data cleaner module for filtering invalid, pit, safety car, and outlier laps.
"""

import logging
from typing import Dict, Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger("dataset_builder.cleaner")


class LapDataCleaner:
    """Filters raw FastF1 lap data into clean, representative racing laps."""

    def __init__(self, max_pace_multiplier: float = 1.20, max_pace_delta_sec: float = 12.0):
        """
        Args:
            max_pace_multiplier: Max allowed ratio relative to driver/stint median pace.
            max_pace_delta_sec: Max allowed absolute seconds above median pace.
        """
        self.max_pace_multiplier = max_pace_multiplier
        self.max_pace_delta_sec = max_pace_delta_sec

    def clean_laps_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, int]]:
        """
        Clean the input DataFrame by removing non-representative laps.

        Returns:
            Tuple[pd.DataFrame, Dict[str, int]]: Cleaned DataFrame and metric counts.
        """
        if df.empty:
            return df, {}

        metrics = {"raw_laps": len(df)}
        work_df = df.copy()

        # Step 1: Convert Timedeltas to seconds
        for time_col in ["LapTime", "Sector1Time", "Sector2Time", "Sector3Time"]:
            if time_col in work_df.columns:
                sec_col = f"{time_col}Seconds"
                work_df[sec_col] = pd.to_timedelta(work_df[time_col]).dt.total_seconds()

        # Step 2: Remove pit-in and pit-out laps
        pit_mask = work_df["PitInTime"].notna() | work_df["PitOutTime"].notna()
        metrics["removed_pit_laps"] = int(pit_mask.sum())
        work_df = work_df[~pit_mask]

        # Step 3: Remove deleted and inaccurate laps
        invalid_mask = pd.Series(False, index=work_df.index)
        if "Deleted" in work_df.columns:
            invalid_mask |= work_df["Deleted"] == True
        if "IsAccurate" in work_df.columns:
            invalid_mask |= work_df["IsAccurate"] != True
        metrics["removed_invalid_laps"] = int(invalid_mask.sum())
        work_df = work_df[~invalid_mask]

        # Step 4: Remove Safety Car / VSC / Yellow / Red flag laps
        # TrackStatus codes: '1'=Green, '2'=Yellow, '4'=SC, '5'=Red, '6'=VSC, '7'=VSC Ending
        non_green_codes = ["2", "4", "5", "6", "7"]
        if "TrackStatus" in work_df.columns:

            def is_flagged(status):
                if pd.isna(status):
                    return True
                s = str(status).strip()
                if s != "1":
                    return True
                return any(code in s for code in non_green_codes)

            sc_vsc_mask = work_df["TrackStatus"].apply(is_flagged)
        else:
            sc_vsc_mask = pd.Series(False, index=work_df.index)

        metrics["removed_sc_vsc_laps"] = int(sc_vsc_mask.sum())
        work_df = work_df[~sc_vsc_mask]

        # Step 5: Remove missing core fields
        core_fields = [
            "LapTimeSeconds",
            "Compound",
            "TyreLife",
            "Stint",
            "Driver",
            "TrackTemp",
            "AirTemp",
        ]
        existing_core_fields = [f for f in core_fields if f in work_df.columns]
        missing_mask = work_df[existing_core_fields].isna().any(axis=1)
        metrics["removed_missing_telemetry_laps"] = int(missing_mask.sum())
        work_df = work_df[~missing_mask]

        # Step 6: Remove pace outliers (formation, cool-down, or slow laps)
        # Compute median lap time per driver and stint
        stint_medians = (
            work_df.groupby(["Season", "Circuit", "Driver", "Stint"])["LapTimeSeconds"]
            .transform("median")
        )
        outlier_mask = (
            (work_df["LapTimeSeconds"] <= 0)
            | (work_df["LapTimeSeconds"] > stint_medians * self.max_pace_multiplier)
            | (work_df["LapTimeSeconds"] > stint_medians + self.max_pace_delta_sec)
        )
        metrics["removed_outlier_slow_laps"] = int(outlier_mask.sum())
        work_df = work_df[~outlier_mask]

        metrics["final_cleaned_laps"] = len(work_df)

        logger.info(
            f"Cleaning Summary: Raw={metrics['raw_laps']} | "
            f"PitRemoved={metrics['removed_pit_laps']} | "
            f"InvalidRemoved={metrics['removed_invalid_laps']} | "
            f"SC_VSC_Removed={metrics['removed_sc_vsc_laps']} | "
            f"MissingRemoved={metrics['removed_missing_telemetry_laps']} | "
            f"OutliersRemoved={metrics['removed_outlier_slow_laps']} | "
            f"FinalCount={metrics['final_cleaned_laps']}"
        )

        return work_df, metrics
