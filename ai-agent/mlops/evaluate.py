"""
Standalone CLI tool for evaluating any serialized model on any dataset without retraining.
"""

import argparse
import logging
from pathlib import Path
import sys
import pandas as pd

# Ensure parent directory (ai-agent) is in python path
current_file = Path(__file__).resolve()
ai_agent_dir = current_file.parent.parent
if str(ai_agent_dir) not in sys.path:
    sys.path.insert(0, str(ai_agent_dir))

from models.model_utils import evaluate_predictions, load_and_prepare_dataset
from models.predictor import TyreDegradationPredictor


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args():
    parser = argparse.ArgumentParser(
        description="Standalone Model Evaluation CLI"
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default=str(ai_agent_dir / "trained_models"),
        help="Directory containing trained model and schema.",
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default=str(ai_agent_dir / "datasets" / "master.parquet"),
        help="Dataset parquet/csv file to evaluate on.",
    )
    return parser.parse_args()


def main():
    setup_logging()
    logger = logging.getLogger("mlops.evaluate")
    args = parse_args()

    dataset_path = Path(args.dataset).resolve()
    if not dataset_path.exists():
        # Fallback to data/dataset.parquet
        dataset_path = ai_agent_dir / "data" / "dataset.parquet"

    logger.info("==================================================")
    logger.info("📊 STANDALONE MODEL EVALUATION")
    logger.info(f"Model Directory: {args.model_dir}")
    logger.info(f"Evaluating On Dataset: {dataset_path}")
    logger.info("==================================================")

    # 1. Load Data
    X, y, groups, full_df = load_and_prepare_dataset(dataset_path)

    # 2. Instantiate Predictor
    predictor = TyreDegradationPredictor(model_dir=args.model_dir)

    # 3. Generate Predictions
    y_pred = predictor.predict(X)

    # 4. Compute Metrics
    metrics = evaluate_predictions(y.values, y_pred)

    print("\n" + "=" * 55)
    print("APEXDATA MODEL EVALUATION RESULTS")
    print("=" * 55)
    print(f"Evaluated Samples : {len(X)}")
    print(f"Evaluated Races   : {groups.nunique()}")
    print("-" * 55)
    print(f"RMSE     : {metrics['rmse']:.4f} s")
    print(f"MAE      : {metrics['mae']:.4f} s")
    print(f"R2 Score : {metrics['r2']:.4f}")
    print(f"MAPE     : {metrics['mape_pct']:.4f} %")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    main()
