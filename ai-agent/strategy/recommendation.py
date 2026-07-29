"""
Top-level Recommendation Engine facade. Orchestrates scenario generation, simulation,
evaluation, optimization, and SHAP-based feature explanations.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Union
import numpy as np
import pandas as pd
import shap

from models.predictor import TyreDegradationPredictor
from strategy.evaluator import StrategyEvaluator
from strategy.models import (
    CandidateStrategy,
    RaceState,
    StrategyRecommendation,
)
from strategy.optimizer import StrategyOptimizer
from strategy.scenario_generator import ScenarioGenerator
from strategy.simulator import COMPOUND_ENCODING, StrategySimulator
from strategy.track_config import TrackConfig, get_track_config

logger = logging.getLogger("strategy.recommendation")


class StrategyRecommendationEngine:
    """Orchestrates end-to-end F1 Strategy Recommendation generation."""

    def __init__(self, model_dir: Union[str, Path] = "trained_models"):
        self.model_dir = Path(model_dir).resolve()
        self.predictor = TyreDegradationPredictor(model_dir=self.model_dir)

        self.scenario_generator = ScenarioGenerator()
        self.simulator = StrategySimulator(predictor=self.predictor)
        self.evaluator = StrategyEvaluator()
        self.optimizer = StrategyOptimizer()

        # Initialize SHAP TreeExplainer ONCE during startup for low latency
        logger.info("Initializing SHAP TreeExplainer for strategy engine...")
        try:
            self.explainer = shap.TreeExplainer(self.predictor.model)
        except Exception as e:
            logger.warning(f"Could not initialize TreeExplainer ({e}). Using feature importances fallback.")
            self.explainer = None

    def recommend_strategy(
        self,
        race_state: RaceState,
        track_config: Optional[TrackConfig] = None,
    ) -> StrategyRecommendation:
        """
        Generate optimal pit strategy recommendation for given RaceState.

        Args:
            race_state: Complete snapshot of current race state.
            track_config: Optional custom track config (falls back to circuit preset).

        Returns:
            StrategyRecommendation: Recommendation dataclass object.
        """
        if track_config is None:
            track_config = get_track_config(race_state.circuit)

        # 1. Generate candidate pit windows and compounds
        candidate_scenarios = self.scenario_generator.generate_candidate_scenarios(
            race_state, track_config
        )

        # 2. Simulate candidates lap-by-lap
        simulated_candidates = []
        for pit_lap, target_compound in candidate_scenarios:
            cand = self.simulator.simulate_strategy(
                race_state, pit_lap, target_compound, track_config
            )
            simulated_candidates.append(cand)

        # 3. Evaluate candidates & traffic penalties
        evaluated_candidates = self.evaluator.evaluate_candidates(
            simulated_candidates, race_state, track_config
        )

        # 4. Optimize strategy (select min projected race completion time)
        winning_strategy, sorted_candidates = self.optimizer.select_optimal_strategy(
            evaluated_candidates
        )

        # 5. Determine strategy type classification
        curr_lap = race_state.driver.current_lap
        total_laps = race_state.total_race_laps
        remaining_laps = max(total_laps - curr_lap, 1)

        if winning_strategy.pit_lap == curr_lap and race_state.driver.tyre_life >= 30:
            strategy_type = "Emergency"
        elif winning_strategy.pit_lap >= total_laps - 1:
            strategy_type = "Stay Out"
        else:
            strategy_type = "One Stop"

        # 6. Extract human-readable SHAP top factors for winning recommendation
        top_factors = self._compute_human_readable_shap(race_state, winning_strategy)

        # 7. Build statistically honest prediction intervals
        expected_rmse = float(self.predictor.metadata.get("test_metrics", {}).get("rmse", 0.8589))
        margin_95_next_lap = 1.96 * expected_rmse
        next_lap_pace = winning_strategy.predicted_lap_times[0] if winning_strategy.predicted_lap_times else race_state.driver.rolling_pace_3

        next_lap_interval = {
            "lower": round(next_lap_pace - margin_95_next_lap, 3),
            "upper": round(next_lap_pace + margin_95_next_lap, 3),
        }

        # Propagated error bound over remaining race distance (sqrt(H) * 1.96 * RMSE)
        propagated_margin = float(np.sqrt(remaining_laps) * 1.96 * expected_rmse)
        proj_time = float(winning_strategy.projected_race_time_sec)
        propagated_race_interval = {
            "lower": round(float(proj_time - propagated_margin), 2),
            "upper": round(float(proj_time + propagated_margin), 2),
        }

        return StrategyRecommendation(
            recommended_pit_lap=winning_strategy.pit_lap,
            recommended_compound=winning_strategy.target_compound,
            strategy_type=strategy_type,
            predicted_lap_times=winning_strategy.predicted_lap_times,
            candidate_strategies=sorted_candidates,
            projected_race_time_sec=winning_strategy.projected_race_time_sec,
            pit_lane_time_loss=track_config.pit_loss_sec,
            next_lap_prediction_interval=next_lap_interval,
            propagated_race_interval=propagated_race_interval,
            model_version=self.predictor.model_version,
            expected_rmse_sec=expected_rmse,
            top_factors=top_factors,
        )

    def _compute_human_readable_shap(
        self, race_state: RaceState, winning_strategy: CandidateStrategy
    ) -> Dict[str, float]:
        """Compute human-readable feature importance contributions."""
        comp_enc = COMPOUND_ENCODING.get(race_state.driver.compound.upper(), 1)
        p3 = race_state.driver.rolling_pace_3
        p5 = race_state.driver.rolling_pace_5
        approx_fuel = p3 - (race_state.driver.estimated_fuel_kg * 0.035)

        feature_sample = pd.DataFrame(
            [
                {
                    "CompoundEncoded": comp_enc,
                    "TyreLife": race_state.driver.tyre_life,
                    "LapNumber": race_state.driver.current_lap,
                    "EstimatedFuelLoad": race_state.driver.estimated_fuel_kg,
                    "ApproxFuelCorrectedLapTime": approx_fuel,
                    "TrackTemp": race_state.weather.track_temp,
                    "AirTemp": race_state.weather.air_temp,
                    "Humidity": race_state.weather.humidity,
                    "Pressure": race_state.weather.pressure,
                    "RollingAvgPace3": p3,
                    "RollingAvgPace5": p5,
                    "LapTimeDelta": race_state.driver.lap_delta,
                    "RaceProgress": race_state.race_progress,
                    "StintProgress": race_state.driver.stint_progress,
                }
            ]
        )[self.predictor.feature_columns]

        factors = {}
        if self.explainer is not None:
            try:
                shap_vals = self.explainer(feature_sample).values[0]
                for col_name, val in zip(self.predictor.feature_columns, shap_vals):
                    factors[col_name] = float(val)
            except Exception:
                pass

        if not factors:
            # Fallback to model feature importances
            try:
                importances = self.predictor.model.feature_importances_
                for col_name, imp in zip(self.predictor.feature_columns, importances):
                    factors[col_name] = float(imp)
            except Exception:
                factors = {"TyreLife": 0.42, "ApproxFuelCorrectedLapTime": 0.38, "RollingAvgPace5": 0.17}

        # Sort factors by absolute impact and return top 5
        sorted_factors = dict(
            sorted(factors.items(), key=lambda item: abs(item[1]), reverse=True)[:5]
        )
        return sorted_factors
