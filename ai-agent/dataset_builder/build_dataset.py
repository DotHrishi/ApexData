"""
Main CLI entrypoint script for executing the Formula 1 Tyre Degradation Dataset Builder pipeline.
"""

import argparse
import logging
from pathlib import Path
import sys

# Ensure parent directory (ai-agent) is in python path when run directly
current_file = Path(__file__).resolve()
ai_agent_dir = current_file.parent.parent
if str(ai_agent_dir) not in sys.path:
    sys.path.insert(0, str(ai_agent_dir))

from dataset_builder.cleaner import LapDataCleaner
from dataset_builder.exporter import DatasetExporter
from dataset_builder.feature_engineering import FeatureEngineer
from dataset_builder.loader import FastF1DataLoader


def setup_logging():
    """Configure structured logging output."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="F1 Tyre Degradation Dataset Builder Pipeline"
    )
    parser.add_argument(
        "--seasons",
        nargs="+",
        type=int,
        default=[2024],
        help="List of season years to extract (e.g. 2023 2024). Default: [2024]",
    )
    parser.add_argument(
        "--sessions",
        nargs="+",
        type=str,
        default=["R"],
        help="List of session codes to extract (e.g. R for Race). Default: ['R']",
    )
    parser.add_argument(
        "--max-rounds",
        type=int,
        default=None,
        help="Maximum number of rounds to fetch per season (optional for quick testing).",
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default=str(ai_agent_dir / "cache"),
        help="Directory for FastF1 SQLite cache.",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=str(ai_agent_dir / "data"),
        help="Output directory for generated dataset files.",
    )
    parser.add_argument(
        "--max-fuel",
        type=float,
        default=110.0,
        help="Maximum fuel load at race start in kg. Default: 110.0",
    )
    parser.add_argument(
        "--fuel-correction",
        type=float,
        default=0.033,
        help="Fuel lap time correction factor in seconds per kg. Default: 0.033",
    )
    return parser.parse_args()


def main():
    setup_logging()
    logger = logging.getLogger("dataset_builder.main")
    args = parse_args()

    logger.info("==================================================")
    logger.info("🚀 STARTING F1 TYRE DEGRADATION DATASET BUILDER")
    logger.info(f"Seasons: {args.seasons}")
    logger.info(f"Sessions: {args.sessions}")
    logger.info(f"Cache Dir: {args.cache_dir}")
    logger.info(f"Output Dir: {args.output_dir}")
    logger.info("==================================================")

    # 1. Load Data
    loader = FastF1DataLoader(cache_dir=args.cache_dir)
    raw_df = loader.load_season_data(
        seasons=args.seasons,
        session_types=args.sessions,
        max_rounds=args.max_rounds,
    )

    if raw_df.empty:
        logger.error("Data loading failed or returned no records. Aborting pipeline.")
        sys.exit(1)

    # 2. Clean Data
    cleaner = LapDataCleaner()
    cleaned_df, metrics = cleaner.clean_laps_data(raw_df)

    if cleaned_df.empty:
        logger.error("Data cleaning produced 0 representative laps. Aborting pipeline.")
        sys.exit(1)

    # 3. Engineer Features & Target Label
    engineer = FeatureEngineer(
        max_fuel_kg=args.max_fuel,
        fuel_correction_sec_per_kg=args.fuel_correction,
        drop_unlabelled_target=True,
    )
    final_df = engineer.engineer_features(cleaned_df)

    # 4. Export Dataset
    exporter = DatasetExporter(output_dir=args.output_dir)
    exported_paths = exporter.export(
        df=final_df,
        seasons=args.seasons,
        base_filename="dataset",
    )

    logger.info("✅ PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    logger.info("Generated Files:")
    for path in exported_paths:
        logger.info(f"  - {path}")


if __name__ == "__main__":
    main()
