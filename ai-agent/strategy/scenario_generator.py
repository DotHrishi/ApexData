"""
Scenario generator for generating candidate pit windows and stint compound options.
"""

from typing import List, Tuple
from strategy.models import RaceState
from strategy.track_config import TrackConfig


class ScenarioGenerator:
    """Generates candidate pit stop strategies over the evaluation horizon."""

    def __init__(self, default_horizon: int = 10):
        self.default_horizon = default_horizon

    def generate_candidate_scenarios(
        self, race_state: RaceState, track_config: TrackConfig
    ) -> List[Tuple[int, str]]:
        """
        Generate (pit_lap, target_compound) candidate pairs.

        Args:
            race_state: Current race state snapshot.
            track_config: Track and compound configuration.

        Returns:
            List[Tuple[int, str]]: List of (candidate_pit_lap, target_compound) options.
        """
        curr_lap = race_state.driver.current_lap
        total_laps = race_state.total_race_laps
        horizon = track_config.prediction_horizon_laps or self.default_horizon

        max_pit_lap = min(curr_lap + horizon, total_laps - 1)

        # Select target compounds (prefer alternative compound to comply with F1 two-compound rule)
        curr_compound = race_state.driver.compound.upper()
        if curr_compound == "MEDIUM":
            candidate_compounds = ["HARD", "SOFT"]
        elif curr_compound == "SOFT":
            candidate_compounds = ["MEDIUM", "HARD"]
        else:  # HARD
            candidate_compounds = ["MEDIUM", "SOFT"]

        scenarios = []
        for pit_lap in range(curr_lap, max_pit_lap + 1):
            for compound in candidate_compounds:
                scenarios.append((pit_lap, compound))

        return scenarios
