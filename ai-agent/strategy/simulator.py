"""
Strategy simulator module. Performs lap-by-lap prediction querying TyreDegradationPredictor
and extrapolating remaining race completion pace.
"""

from typing import Dict, List, Tuple
import numpy as np

from models.predictor import TyreDegradationPredictor
from strategy.models import CandidateStrategy, RaceState
from strategy.track_config import TrackConfig


# Mapping compound names to integer encoding expected by ML model
COMPOUND_ENCODING = {
    "HARD": 0,
    "MEDIUM": 1,
    "SOFT": 2,
    "INTERMEDIATE": 3,
    "WET": 4,
}


class StrategySimulator:
    """Simulates F1 lap pace and pit stop windows using ML predictions and track physics."""

    def __init__(self, predictor: TyreDegradationPredictor):
        self.predictor = predictor

    def simulate_strategy(
        self,
        race_state: RaceState,
        candidate_pit_lap: int,
        target_compound: str,
        track_config: TrackConfig,
    ) -> CandidateStrategy:
        """
        Simulate a candidate pit strategy from current lap to finish line.

        Args:
            race_state: Current race state snapshot.
            candidate_pit_lap: Lap on which pit stop occurs.
            target_compound: Compound fitted during pit stop.
            track_config: Circuit configuration parameters.

        Returns:
            CandidateStrategy: Simulated strategy results and lap pace profile.
        """
        curr_lap = race_state.driver.current_lap
        total_laps = race_state.total_race_laps
        fuel_kg = race_state.driver.estimated_fuel_kg
        fuel_rate = fuel_kg / max(total_laps - curr_lap + 1, 1)

        simulated_lap_times = []
        before_pit_times = []
        after_pit_times = []

        curr_compound = race_state.driver.compound.upper()
        tyre_life = race_state.driver.tyre_life
        rolling_pace_history = [
            race_state.driver.rolling_pace_5,
            race_state.driver.rolling_pace_3,
        ]

        fresh_bonus_profile = track_config.fresh_tyre_grip_bonus.get(target_compound, [])
        laps_since_pit = 0

        for lap in range(curr_lap, total_laps + 1):
            is_pit_lap = (lap == candidate_pit_lap)

            if is_pit_lap:
                # Switch compound and reset stint counters
                curr_compound = target_compound.upper()
                tyre_life = 1
                laps_since_pit = 1
            else:
                tyre_life += 1
                if lap > candidate_pit_lap:
                    laps_since_pit += 1

            # Prepare feature dictionary for ML model
            comp_enc = COMPOUND_ENCODING.get(curr_compound, 1)
            p3 = float(np.mean(rolling_pace_history[-3:]))
            p5 = float(np.mean(rolling_pace_history[-5:]))
            lap_delta = float(rolling_pace_history[-1] - rolling_pace_history[-2]) if len(rolling_pace_history) >= 2 else 0.0

            race_prog = (lap / total_laps) * 100.0
            stint_prog = min((tyre_life / 30.0) * 100.0, 100.0)

            # Fuel effect adjustment
            fuel_kg = max(fuel_kg - fuel_rate, 0.0)
            approx_fuel_corrected = p3 - (fuel_kg * track_config.fuel_effect_sec_per_kg)

            feature_dict = {
                "CompoundEncoded": comp_enc,
                "TyreLife": tyre_life,
                "LapNumber": lap,
                "EstimatedFuelLoad": fuel_kg,
                "ApproxFuelCorrectedLapTime": approx_fuel_corrected,
                "TrackTemp": race_state.weather.track_temp,
                "AirTemp": race_state.weather.air_temp,
                "Humidity": race_state.weather.humidity,
                "Pressure": race_state.weather.pressure,
                "RollingAvgPace3": p3,
                "RollingAvgPace5": p5,
                "LapTimeDelta": lap_delta,
                "RaceProgress": race_prog,
                "StintProgress": stint_prog,
            }

            # Predict base pace from ML model
            base_pred_pace = self.predictor.predict_single(feature_dict)

            # Apply base prediction and compound pace offset
            comp_offset = track_config.compound_offsets.get(curr_compound, 0.0)
            
            # Apply compound degradation cliff penalty past optimal stint length
            deg_cliff_penalty = 0.0
            if curr_compound == "SOFT" and tyre_life > 15:
                deg_cliff_penalty = (tyre_life - 15) * 0.18 * track_config.degradation_multiplier
            elif curr_compound == "MEDIUM" and tyre_life > 25:
                deg_cliff_penalty = (tyre_life - 25) * 0.12 * track_config.degradation_multiplier
            elif curr_compound == "HARD" and tyre_life > 35:
                deg_cliff_penalty = (tyre_life - 35) * 0.08 * track_config.degradation_multiplier

            sim_lap_time = base_pred_pace + comp_offset + deg_cliff_penalty

            # Apply fresh tyre grip bonus if recently fitted
            if laps_since_pit > 0 and (laps_since_pit - 1) < len(fresh_bonus_profile):
                bonus = fresh_bonus_profile[laps_since_pit - 1]
                sim_lap_time += bonus

            # Apply pit stop time loss and out-lap warm-up penalty
            added_pit_loss = 0.0
            if is_pit_lap:
                added_pit_loss += track_config.pit_loss_sec
                added_pit_loss += track_config.compound_warmup_penalty.get(target_compound, 0.0)
                sim_lap_time += added_pit_loss

            simulated_lap_times.append(sim_lap_time)
            rolling_pace_history.append(sim_lap_time - (added_pit_loss if is_pit_lap else 0.0))

            if lap < candidate_pit_lap:
                before_pit_times.append(sim_lap_time)
            elif lap > candidate_pit_lap:
                after_pit_times.append(sim_lap_time)

        projected_total_time = float(sum(simulated_lap_times))
        avg_before = float(np.mean(before_pit_times)) if before_pit_times else race_state.driver.rolling_pace_3
        avg_after = float(np.mean(after_pit_times)) if after_pit_times else race_state.driver.rolling_pace_3
        tyre_life_at_pit = race_state.driver.tyre_life + (candidate_pit_lap - curr_lap)

        return CandidateStrategy(
            pit_lap=candidate_pit_lap,
            target_compound=target_compound,
            projected_race_time_sec=projected_total_time,
            predicted_lap_times=simulated_lap_times,
            pit_loss_added_sec=track_config.pit_loss_sec,
            avg_pace_before_pit=avg_before,
            avg_pace_after_pit=avg_after,
            expected_tyre_life_at_pit=tyre_life_at_pit,
        )
