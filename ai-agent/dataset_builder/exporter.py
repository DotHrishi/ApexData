"""
Dataset exporter module for saving machine learning datasets to CSV and Parquet formats.
"""

import logging
from pathlib import Path
from typing import List, Optional, Union
import pandas as pd

logger = logging.getLogger("dataset_builder.exporter")


class DatasetExporter:
    """Handles exporting cleaned and feature-engineered datasets to CSV and Parquet."""

    PREFERRED_COLUMNS = [
        # Metadata / Identifiers
        "Season",
        "RoundNumber",
        "Circuit",
        "Driver",
        "Team",
        "LapNumber",
        "Stint",
        "Position",
        # Core Tyre Features
        "Compound",
        "CompoundEncoded",
        "TyreLife",
        "StintProgress",
        # Pace Features
        "LapTimeSeconds",
        "PreviousLapTime",
        "LapTimeDelta",
        "RollingAvgPace3",
        "RollingAvgPace5",
        "Sector1TimeSeconds",
        "Sector2TimeSeconds",
        "Sector3TimeSeconds",
        # Fuel & Distance Features
        "EstimatedFuelLoad",
        "ApproxFuelCorrectedLapTime",
        "RaceProgress",
        "RemainingRaceLaps",
        "TotalRaceLaps",
        # Weather Features
        "TrackTemp",
        "AirTemp",
        "Humidity",
        "Pressure",
        "Rainfall",
        "WindSpeed",
        # Supervised Target Labels ⭐
        "TargetNextLapTime",
        "TargetNextLapDelta",
    ]

    def __init__(self, output_dir: Union[str, Path] = "data"):
        self.output_dir = Path(output_dir).resolve()
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export(
        self,
        df: pd.DataFrame,
        seasons: Optional[List[int]] = None,
        base_filename: str = "dataset",
    ) -> List[Path]:
        """
        Export DataFrame to CSV and Parquet files in the output directory.

        Args:
            df: Feature-engineered dataset.
            seasons: Optional list of season years included in dataset.
            base_filename: Primary file stem (default 'dataset').

        Returns:
            List[Path]: Paths of generated export files.
        """
        if df.empty:
            logger.warning("Attempted to export an empty DataFrame.")
            return []

        # Order columns cleanly, retaining any extra columns at the end
        existing_cols = [col for col in self.PREFERRED_COLUMNS if col in df.columns]
        extra_cols = [col for col in df.columns if col not in existing_cols]
        final_cols = existing_cols + extra_cols
        export_df = df[final_cols]

        generated_files = []

        # File suffixes
        if seasons:
            seasons_str = "_".join(str(s) for s in sorted(seasons))
            season_filename = f"{base_filename}_{seasons_str}"
            file_stems = [base_filename, season_filename]
        else:
            file_stems = [base_filename]

        # De-duplicate file stems while keeping order
        unique_stems = list(dict.fromkeys(file_stems))

        for stem in unique_stems:
            csv_path = self.output_dir / f"{stem}.csv"
            parquet_path = self.output_dir / f"{stem}.parquet"

            export_df.to_csv(csv_path, index=False)
            export_df.to_parquet(parquet_path, index=False)

            generated_files.extend([csv_path, parquet_path])
            logger.info(f"Exported CSV ({export_df.shape[0]} rows, {export_df.shape[1]} cols) -> {csv_path}")
            logger.info(f"Exported Parquet ({export_df.shape[0]} rows, {export_df.shape[1]} cols) -> {parquet_path}")

        self._log_summary(export_df)
        return generated_files

    def _log_summary(self, df: pd.DataFrame):
        """Log concise dataset statistics."""
        logger.info("========== DATASET SUMMARY ==========")
        logger.info(f"Total Rows: {len(df)}")
        logger.info(f"Total Columns: {len(df.columns)}")

        if "Compound" in df.columns:
            compound_counts = df["Compound"].value_counts().to_dict()
            logger.info(f"Compound Distribution: {compound_counts}")

        if "TargetNextLapTime" in df.columns and not df["TargetNextLapTime"].dropna().empty:
            target = df["TargetNextLapTime"].dropna()
            logger.info(
                f"TargetNextLapTime Stats: min={target.min():.2f}s, "
                f"mean={target.mean():.2f}s, max={target.max():.2f}s, std={target.std():.2f}s"
            )
        logger.info("=====================================")
