"""
Data models and structures for the F1 Strategy Recommendation Engine.
Pure Python dataclasses with zero framework or HTTP coupling.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class DriverState:
    """Represents the telemetry and stint state of the focus driver."""
    driver_id: str
    current_lap: int
    compound: str  # "SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"
    tyre_life: int
    estimated_fuel_kg: float
    rolling_pace_3: float
    rolling_pace_5: float
    lap_delta: float
    stint_progress: float  # Percentage 0.0 to 100.0


@dataclass
class OpponentState:
    """Represents the race state of an opponent driver for gap and traffic evaluation."""
    driver_id: str
    gap_sec: float  # Interval relative to focus driver (+ means behind, - means ahead)
    compound: str
    tyre_life: int
    estimated_fuel_kg: float
    rolling_pace_3: float


@dataclass
class WeatherState:
    """Represents environmental track and atmospheric conditions."""
    track_temp: float
    air_temp: float
    humidity: float
    pressure: float
    rainfall: bool = False


@dataclass
class RaceState:
    """Full snapshot of the current race state."""
    driver: DriverState
    opponents: List[OpponentState]
    weather: WeatherState
    circuit: str
    total_race_laps: int
    race_progress: float  # Percentage 0.0 to 100.0


@dataclass
class CandidateStrategy:
    """Represents a simulated candidate strategy option."""
    pit_lap: int
    target_compound: str
    projected_race_time_sec: float
    predicted_lap_times: List[float]
    pit_loss_added_sec: float
    avg_pace_before_pit: float
    avg_pace_after_pit: float
    expected_tyre_life_at_pit: int
    traffic_delay_sec: float = 0.0


@dataclass
class StrategyRecommendation:
    """Final Strategy Recommendation output payload."""
    recommended_pit_lap: int
    recommended_compound: str
    strategy_type: str  # "One Stop", "Stay Out", "Emergency", "Two Stop"
    predicted_lap_times: List[float]
    candidate_strategies: List[CandidateStrategy]
    projected_race_time_sec: float
    pit_lane_time_loss: float
    next_lap_prediction_interval: Dict[str, float]
    propagated_race_interval: Dict[str, float]
    model_version: str
    expected_rmse_sec: float
    top_factors: Dict[str, float]

    def to_dto_dict(self) -> Dict:
        """Convert recommendation object into clean DTO dictionary for API responses."""
        return {
            "recommendedPitLap": self.recommended_pit_lap,
            "recommendedCompound": self.recommended_compound,
            "strategyType": self.strategy_type,
            "predictedLapTimes": [round(t, 3) for t in self.predicted_lap_times],
            "projectedRaceTimeSec": round(self.projected_race_time_sec, 2),
            "pitLaneTimeLoss": round(self.pit_lane_time_loss, 2),
            "nextLapPredictionInterval": {
                "lower": round(self.next_lap_prediction_interval["lower"], 3),
                "upper": round(self.next_lap_prediction_interval["upper"], 3),
            },
            "propagatedRaceTimeInterval": {
                "lower": round(self.propagated_race_interval["lower"], 2),
                "upper": round(self.propagated_race_interval["upper"], 2),
            },
            "modelVersion": self.model_version,
            "expectedRMSE": round(self.expected_rmse_sec, 3),
            "topFactors": {k: round(v, 4) for k, v in self.top_factors.items()},
            "candidateStrategies": [
                {
                    "pitLap": s.pit_lap,
                    "targetCompound": s.target_compound,
                    "projectedRaceTimeSec": round(s.projected_race_time_sec, 2),
                    "expectedTyreLifeAtPit": s.expected_tyre_life_at_pit,
                    "avgPaceBeforePit": round(s.avg_pace_before_pit, 3),
                    "avgPaceAfterPit": round(s.avg_pace_after_pit, 3),
                    "trafficDelaySec": round(s.traffic_delay_sec, 2),
                }
                for s in self.candidate_strategies
            ],
        }
