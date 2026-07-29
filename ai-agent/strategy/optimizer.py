"""
Strategy optimizer module. Selects optimal strategy candidate by minimizing projected race completion time.
"""

from typing import List, Tuple
from strategy.models import CandidateStrategy


class StrategyOptimizer:
    """Optimizes candidate pit stop strategies."""

    def select_optimal_strategy(
        self, candidates: List[CandidateStrategy]
    ) -> Tuple[CandidateStrategy, List[CandidateStrategy]]:
        """
        Select candidate strategy with minimum projected race completion time.

        Args:
            candidates: Evaluated list of CandidateStrategy objects.

        Returns:
            Tuple[CandidateStrategy, List[CandidateStrategy]]:
                (winning_candidate, sorted_candidate_list)
        """
        if not candidates:
            raise ValueError("Cannot optimize empty list of candidate strategies.")

        sorted_candidates = sorted(candidates, key=lambda c: c.projected_race_time_sec)
        winning_candidate = sorted_candidates[0]

        return winning_candidate, sorted_candidates
