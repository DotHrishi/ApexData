"""
ApexData F1 AI Strategy Recommendation Engine Package.
"""

from strategy.models import (
    CandidateStrategy,
    DriverState,
    OpponentState,
    RaceState,
    StrategyRecommendation,
    WeatherState,
)
from strategy.optimizer import StrategyOptimizer
from strategy.recommendation import StrategyRecommendationEngine
from strategy.scenario_generator import ScenarioGenerator
from strategy.simulator import StrategySimulator
from strategy.track_config import TRACK_PRESETS, TrackConfig, get_track_config

__all__ = [
    "DriverState",
    "OpponentState",
    "WeatherState",
    "RaceState",
    "CandidateStrategy",
    "StrategyRecommendation",
    "TrackConfig",
    "TRACK_PRESETS",
    "get_track_config",
    "ScenarioGenerator",
    "StrategySimulator",
    "StrategyOptimizer",
    "StrategyRecommendationEngine",
]
