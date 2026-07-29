"""
Model Registry and MLOps deployment manager. Handles candidate model evaluation,
version archiving, latest.joblib promotion, and Model Card generation.
"""

from datetime import datetime
import json
import logging
from pathlib import Path
import shutil
from typing import Dict, Optional, Tuple, Union
import joblib

logger = logging.getLogger("mlops.model_registry")


class ModelRegistry:
    """Manages model registry, candidate deployment comparisons, and version archiving."""

    def __init__(self, models_dir: Union[str, Path] = "trained_models"):
        self.models_dir = Path(models_dir).resolve()
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.archive_dir = self.models_dir / "archive"
        self.archive_dir.mkdir(parents=True, exist_ok=True)
        self.registry_path = self.models_dir / "registry.json"

    def get_registry(self) -> Dict:
        """Load current registry state or return default."""
        if self.registry_path.exists():
            with open(self.registry_path, "r") as f:
                return json.load(f)
        return {
            "production_version": None,
            "best_rmse": float("inf"),
            "best_r2": float("-inf"),
            "versions": {},
        }

    def evaluate_and_register_candidate(
        self,
        candidate_model_path: Union[str, Path],
        metadata: Dict,
        reports_dir: Union[str, Path],
    ) -> Tuple[bool, str, Dict]:
        """
        Compare candidate model performance against production model in registry.
        Promotes candidate to latest.joblib ONLY IF RMSE or R² improves.

        Returns:
            Tuple[bool, str, Dict]: (promoted, version_tag, decision_summary)
        """
        registry = self.get_registry()
        cand_rmse = metadata["test_metrics"]["rmse"]
        cand_r2 = metadata["test_metrics"]["r2"]

        prod_version = registry.get("production_version")
        prod_rmse = registry.get("best_rmse", float("inf"))
        prod_r2 = registry.get("best_r2", float("-inf"))

        # Determine version tag (e.g. v1, v2)
        next_ver_num = len(registry.get("versions", {})) + 1
        version_tag = f"v{next_ver_num}"

        # Promotion logic: Promote if no production model exists, OR if candidate RMSE is lower, OR candidate R2 is higher
        is_better = (
            prod_version is None
            or (cand_rmse < prod_rmse)
            or (cand_r2 > prod_r2 and abs(cand_rmse - prod_rmse) < 0.1)
        )

        version_archive_dir = self.archive_dir / version_tag
        version_archive_dir.mkdir(parents=True, exist_ok=True)

        # Archive versioned model artifact
        version_model_path = version_archive_dir / f"tyre_model_{version_tag}.joblib"
        shutil.copy(candidate_model_path, version_model_path)

        # Save version metadata
        with open(version_archive_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        # Generate Model Card
        self._generate_model_card(version_archive_dir, metadata, version_tag)

        # Update registry record
        registry["versions"][version_tag] = {
            "timestamp": datetime.now().isoformat(),
            "rmse": cand_rmse,
            "r2": cand_r2,
            "promoted_to_production": is_better,
        }

        if is_better:
            logger.info(
                f"CANDIDATE PROMOTED TO PRODUCTION ({version_tag})! "
                f"Candidate RMSE: {cand_rmse:.4f}s (Previous Prod RMSE: {prod_rmse:.4f}s)"
            )
            # Deploy to latest.joblib
            target_latest = self.models_dir / "latest.joblib"
            if Path(candidate_model_path).resolve() != target_latest.resolve():
                shutil.copy(candidate_model_path, target_latest)

            shutil.copy(version_archive_dir / "metadata.json", self.models_dir / "metadata.json")
            shutil.copy(version_archive_dir / "metadata.json", self.models_dir / "metrics.json")

            registry["production_version"] = version_tag
            registry["best_rmse"] = cand_rmse
            registry["best_r2"] = cand_r2
        else:
            logger.warning(
                f"⛔ CANDIDATE REJECTED ({version_tag}). "
                f"Candidate RMSE: {cand_rmse:.4f}s was not better than Production ({prod_version}) RMSE: {prod_rmse:.4f}s. "
                f"Production latest.joblib remains unchanged."
            )

        with open(self.registry_path, "w") as f:
            json.dump(registry, f, indent=2)

        decision_summary = {
            "version": version_tag,
            "promoted": is_better,
            "candidate_rmse": cand_rmse,
            "production_rmse": prod_rmse if prod_version else None,
            "production_version": registry["production_version"],
        }

        return is_better, version_tag, decision_summary

    def _generate_model_card(self, archive_dir: Path, metadata: Dict, version: str):
        """Generate HuggingFace/Google-style Model Card markdown document."""
        card_content = f"""# Model Card: ApexData Tyre Degradation Predictor ({version})

## Model Overview
- **Model Identifier**: `tyre_model_{version}`
- **Model Type**: Gradient Boosted Decision Trees (`XGBoostRegressor`)
- **Trained Date**: `{metadata.get('trained_timestamp', datetime.now().isoformat())}`
- **Target Variable**: `TargetNextLapTime` (Next lap duration in seconds)

## Intended Use
- **Primary Task**: Predict short-term tyre degradation and next lap pace for Formula 1 strategy optimization.
- **Consumers**: ApexData FastAPI AI Engine & Race Strategy Simulator.

## Training Dataset & Scope
- **Dataset Size**: {metadata.get('dataset_samples', 'N/A')} samples across {metadata.get('train_samples', 'N/A')} training and {metadata.get('test_samples', 'N/A')} test samples.
- **Features Used ({len(metadata.get('features', []))} features)**:
  `{", ".join(metadata.get('features', []))}`

## Performance Metrics (Hold-out Test Set)
- **RMSE**: `{metadata.get('test_metrics', {}).get('rmse', 'N/A')} s`
- **MAE**: `{metadata.get('test_metrics', {}).get('mae', 'N/A')} s`
- **R² Score**: `{metadata.get('test_metrics', {}).get('r2', 'N/A')}`
- **MAPE**: `{metadata.get('test_metrics', {}).get('mape_pct', 'N/A')}%`

## Cross-Validation (5-Fold Leak-Free GroupKFold)
- **Mean CV RMSE**: `{metadata.get('cross_validation_metrics', {}).get('cv_rmse_mean', 'N/A')} s`
- **Mean CV R²**: `{metadata.get('cross_validation_metrics', {}).get('cv_r2_mean', 'N/A')}`

## Best Hyperparameters
```json
{json.dumps(metadata.get('best_hyperparameters', {}), indent=2)}
```

## Known Limitations
- Model performance relies on clean green flag laps; non-representative laps (SC/VSC/yellow flags) must be filtered prior to inference.
- Extreme weather shifts (sudden heavy rain) require specialized wet tyre pace scaling.
"""
        with open(archive_dir / "model_card.md", "w") as f:
            f.write(card_content)
        logger.info(f"Generated Model Card -> {archive_dir / 'model_card.md'}")
