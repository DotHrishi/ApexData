"""
MLOps Orchestration CLI for updating multi-season race data, validating datasets,
training candidate models, and performing conditional model promotion.
"""

import argparse
import logging
from pathlib import Path
import shutil
import sys

# Ensure parent directory (ai-agent) is in python path
current_file = Path(__file__).resolve()
ai_agent_dir = current_file.parent.parent
if str(ai_agent_dir) not in sys.path:
    sys.path.insert(0, str(ai_agent_dir))

from dataset_builder.cleaner import LapDataCleaner
from dataset_builder.exporter import DatasetExporter
from dataset_builder.feature_engineering import FeatureEngineer
from dataset_builder.loader import FastF1DataLoader
from mlops.data_validation import DatasetValidator
from mlops.model_registry import ModelRegistry


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args():
    parser = argparse.ArgumentParser(
        description="ApexData MLOps Pipeline Automation CLI"
    )
    parser.add_argument(
        "--seasons",
        nargs="+",
        type=int,
        default=[2024, 2025, 2026],
        help="Seasons to fetch and include in dataset (e.g. 2024 2025 2026).",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Fetch latest completed races and run full MLOps update.",
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default=str(ai_agent_dir / "cache"),
        help="FastF1 SQLite cache directory.",
    )
    parser.add_argument(
        "--datasets-dir",
        type=str,
        default=str(ai_agent_dir / "datasets"),
        help="Directory to save versioned season datasets.",
    )
    parser.add_argument(
        "--models-dir",
        type=str,
        default=str(ai_agent_dir / "trained_models"),
        help="Directory to save trained models and registry.",
    )
    parser.add_argument(
        "--reports-dir",
        type=str,
        default=str(ai_agent_dir / "reports"),
        help="Directory to save visual reports and logs.",
    )
    return parser.parse_args()


def main():
    setup_logging()
    logger = logging.getLogger("mlops.auto_retrain")
    args = parse_args()

    datasets_dir = Path(args.datasets_dir).resolve()
    models_dir = Path(args.models_dir).resolve()
    reports_dir = Path(args.reports_dir).resolve()

    datasets_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    logger.info("==================================================")
    logger.info("🚀 STARTING MLOPS AUTOMATED RETRAINING PIPELINE")
    logger.info(f"Target Seasons: {args.seasons}")
    logger.info(f"Datasets Dir: {datasets_dir}")
    logger.info("==================================================")

    # Step 1: Fetch and Combine Multi-Season Data
    loader = FastF1DataLoader(cache_dir=args.cache_dir)
    raw_df = loader.load_season_data(seasons=args.seasons, session_types=["R"])

    if raw_df.empty:
        logger.error("No lap data retrieved. Aborting MLOps pipeline.")
        sys.exit(1)

    # Step 2: Clean Data
    cleaner = LapDataCleaner()
    cleaned_df, cleaning_metrics = cleaner.clean_laps_data(raw_df)

    # Step 3: Feature Engineering
    engineer = FeatureEngineer()
    final_df = engineer.engineer_features(cleaned_df)

    # Step 4: Data Validation Check ⭐
    validator = DatasetValidator()
    is_valid, issues, val_summary = validator.validate(final_df)
    if not is_valid:
        logger.error("❌ Data validation failed. Aborting model training to prevent corrupt models.")
        for issue in issues:
            logger.error(f"   - {issue}")
        sys.exit(1)

    # Save versioned season & master datasets
    master_parquet_path = datasets_dir / "master.parquet"
    final_df.to_parquet(master_parquet_path, index=False)

    # Also mirror to data/dataset.parquet for default tools
    data_dir = ai_agent_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    final_df.to_parquet(data_dir / "dataset.parquet", index=False)
    final_df.to_csv(data_dir / "dataset.csv", index=False)

    logger.info(f"Saved master dataset ({len(final_df)} rows) -> {master_parquet_path}")

    # Step 5: Train Candidate Model
    from models.train_model import main as run_training

    logger.info("--- Training Candidate Model ---")

    # Run training using train_model script
    import subprocess
    cmd = [
        sys.executable,
        str(ai_agent_dir / "models" / "train_model.py"),
        "--data-path", str(master_parquet_path),
        "--models-dir", str(models_dir),
        "--reports-dir", str(reports_dir),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        logger.error(f"Candidate model training failed: {res.stderr}")
        sys.exit(1)

    logger.info(res.stdout)

    # Step 6: Evaluate & Register Candidate Model in ModelRegistry ⭐
    registry = ModelRegistry(models_dir=models_dir)

    # Read generated metadata
    meta_path = models_dir / "metadata.json"
    import json
    with open(meta_path, "r") as f:
        candidate_meta = json.load(f)

    candidate_model_path = models_dir / "latest.joblib"
    promoted, ver_tag, summary = registry.evaluate_and_register_candidate(
        candidate_model_path=candidate_model_path,
        metadata=candidate_meta,
        reports_dir=reports_dir,
    )

    # Step 7: Archive Versioned Diagnostic Reports
    version_reports_dir = reports_dir / ver_tag
    version_reports_dir.mkdir(parents=True, exist_ok=True)

    for plot_file in ["feature_importance.png", "prediction_vs_actual.png", "residuals.png", "shap_summary.png", "shap_bar.png"]:
        src = reports_dir / plot_file
        if src.exists():
            shutil.copy(src, version_reports_dir / plot_file)

    logger.info("==================================================")
    if promoted:
        logger.info(f"🎉 MLOps PIPELINE SUCCESS: Version {ver_tag} PROMOTED to Production!")
    else:
        logger.info(f"⚠️ MLOps PIPELINE COMPLETED: Candidate {ver_tag} REJECTED. Production remains on {summary['production_version']}.")
    logger.info("==================================================")


if __name__ == "__main__":
    main()
