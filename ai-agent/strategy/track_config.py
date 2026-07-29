"""
Track and compound assumptions configuration repository.
Defines circuit-specific pit loss times, compound pace offsets, and degradation parameters.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class TrackConfig:
    """Configurable track layout and tyre performance parameters."""
    circuit_name: str = "Generic"
    pit_loss_sec: float = 22.0
    fuel_effect_sec_per_kg: float = 0.035  # ~0.035s pace benefit per kg fuel burned
    degradation_multiplier: float = 1.0
    prediction_horizon_laps: int = 10
    
    # Base compound lap time offsets relative to Medium compound (0.0s)
    compound_offsets: Dict[str, float] = field(
        default_factory=lambda: {
            "SOFT": -0.7,
            "MEDIUM": 0.0,
            "HARD": 0.6,
            "INTERMEDIATE": 2.5,
            "WET": 5.0,
        }
    )
    
    # Fresh tyre initial grip bonus profile (laps -> delta seconds)
    fresh_tyre_grip_bonus: Dict[str, List[float]] = field(
        default_factory=lambda: {
            "SOFT": [-0.9, -0.6, -0.3],
            "MEDIUM": [-0.5, -0.2],
            "HARD": [-0.2],
        }
    )
    
    # Out-lap tyre warm-up penalty
    compound_warmup_penalty: Dict[str, float] = field(
        default_factory=lambda: {
            "SOFT": 0.0,
            "MEDIUM": 0.2,
            "HARD": 0.5,
        }
    )


# Presets for major Formula 1 circuits
TRACK_PRESETS: Dict[str, TrackConfig] = {
    "Monaco": TrackConfig(
        circuit_name="Monaco",
        pit_loss_sec=20.0,
        degradation_multiplier=0.7,  # Very low tyre wear
    ),
    "Singapore": TrackConfig(
        circuit_name="Singapore",
        pit_loss_sec=28.0,
        degradation_multiplier=1.2,  # Heavy street circuit wear
    ),
    "Monza": TrackConfig(
        circuit_name="Monza",
        pit_loss_sec=24.0,
        degradation_multiplier=0.8,
    ),
    "Silverstone": TrackConfig(
        circuit_name="Silverstone",
        pit_loss_sec=22.0,
        degradation_multiplier=1.3,  # High-speed lateral degradation
    ),
    "Bahrain": TrackConfig(
        circuit_name="Bahrain",
        pit_loss_sec=22.5,
        degradation_multiplier=1.4,  # Highly abrasive asphalt
    ),
}


def get_track_config(circuit_name: str) -> TrackConfig:
    """Retrieve TrackConfig for known circuit preset or return default."""
    for key, config in TRACK_PRESETS.items():
        if key.lower() in circuit_name.lower():
            return config
    return TrackConfig(circuit_name=circuit_name)
