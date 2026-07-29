"""
Strategy evaluator module. Evaluates simulated candidate strategies and assesses traffic impact.
"""

from typing import List
from strategy.models import CandidateStrategy, RaceState
from strategy.track_config import TrackConfig


class StrategyEvaluator:
    """Evaluates simulated strategy candidates and computes traffic and time penalties."""

    def evaluate_candidates(
        self,
        candidates: List[CandidateStrategy],
        race_state: RaceState,
        track_config: TrackConfig,
    ) -> List[CandidateStrategy]:
        """
        Evaluate candidate strategies, adjusting for opponent traffic re-entry where applicable.

        Args:
            candidates: List of simulated CandidateStrategy objects.
            race_state: Current race state with opponent gap data.
            track_config: Circuit configuration parameters.

        Returns:
            List[CandidateStrategy]: Evaluated and penalty-adjusted candidate strategies.
        """
        evaluated = []
        for cand in candidates:
            traffic_delay = 0.0

            # Simple traffic re-entry check against opponent gap positions
            for opp in race_state.opponents:
                # Check if pit stop drops driver into opponent traffic window (0.5s to 2.0s gap)
                pit_exit_gap = opp.gap_sec - cand.pit_loss_added_sec
                if 0.0 < pit_exit_gap < 2.0:
                    traffic_delay += 0.8  # ~0.8s traffic delay per opponent encountered in re-entry window

            cand.traffic_delay_sec = traffic_delay
            cand.projected_race_time_sec += traffic_delay
            evaluated.append(cand)

        return evaluated
