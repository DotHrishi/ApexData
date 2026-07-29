"""
Data loader module for fetching Formula 1 session data via FastF1 with local caching.
"""

import logging
from pathlib import Path
from typing import List, Optional, Union
import fastf1
import pandas as pd
from tqdm import tqdm

logger = logging.getLogger("dataset_builder.loader")

# Suppress verbose FastF1 logger messages unless debugging
fastf1.set_log_level(logging.WARNING)


class FastF1DataLoader:
    """Handles fetching session, lap, and weather data from FastF1 with SQLite caching."""

    def __init__(self, cache_dir: Union[str, Path] = "cache"):
        self.cache_dir = Path(cache_dir).resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        fastf1.Cache.enable_cache(str(self.cache_dir))
        logger.info(f"FastF1 SQLite cache enabled at: {self.cache_dir}")

    def load_season_data(
        self,
        seasons: List[int],
        session_types: List[str] = ["R"],
        max_rounds: Optional[int] = None,
    ) -> pd.DataFrame:
        """
        Fetch lap and weather data across specified seasons and session types.

        Args:
            seasons: List of season years (e.g. [2023, 2024]).
            session_types: List of session identifiers (e.g. ['R'] for Race).
            max_rounds: Optional cap on the number of rounds per season (for fast testing).

        Returns:
            pd.DataFrame: Combined raw laps with merged weather data.
        """
        all_laps = []

        for season in seasons:
            logger.info(f"Fetching schedule for season {season}...")
            try:
                schedule = fastf1.get_event_schedule(season)
            except Exception as e:
                logger.error(f"Failed to fetch schedule for season {season}: {e}")
                continue

            # Filter out pre-season testing events if needed (RoundNumber > 0)
            race_events = schedule[schedule["RoundNumber"] > 0]

            if max_rounds and max_rounds > 0:
                race_events = race_events.head(max_rounds)

            for _, event in tqdm(
                race_events.iterrows(),
                total=len(race_events),
                desc=f"Season {season}",
            ):
                round_num = event["RoundNumber"]
                event_name = event["EventName"]
                location = event.get("Location", event_name)

                for sess_type in session_types:
                    try:
                        session_laps = self._load_single_session(
                            season=season,
                            round_num=round_num,
                            event_name=event_name,
                            location=location,
                            session_type=sess_type,
                        )
                        if session_laps is not None and not session_laps.empty:
                            all_laps.append(session_laps)
                    except Exception as e:
                        logger.warning(
                            f"Skipping {season} Round {round_num} ({event_name}) "
                            f"Session '{sess_type}': {e}"
                        )

        if not all_laps:
            logger.error("No lap data was successfully fetched.")
            return pd.DataFrame()

        combined_df = pd.concat(all_laps, ignore_index=True)
        logger.info(f"Total raw laps loaded: {len(combined_df)}")
        return combined_df

    def _load_single_session(
        self,
        season: int,
        round_num: int,
        event_name: str,
        location: str,
        session_type: str,
    ) -> Optional[pd.DataFrame]:
        """Load laps and weather for a single Grand Prix session."""
        session = fastf1.get_session(season, round_num, session_type)
        session.load(laps=True, telemetry=False, weather=True)

        laps = session.laps.copy()
        if laps.empty:
            return None

        # Fetch matching weather data aligned with laps
        try:
            weather = laps.get_weather_data()
        except Exception as e:
            logger.warning(f"Could not fetch weather data for {event_name}: {e}")
            weather = pd.DataFrame(index=laps.index)

        # Reset index to ensure alignment when assigning weather columns
        laps = laps.reset_index(drop=True)
        weather = weather.reset_index(drop=True)

        # Basic metadata
        laps["Season"] = season
        laps["RoundNumber"] = round_num
        laps["Circuit"] = event_name
        laps["Location"] = location
        laps["SessionType"] = session_type

        # Add Weather columns if present
        weather_cols = ["AirTemp", "TrackTemp", "Humidity", "Pressure", "Rainfall", "WindSpeed"]
        for col in weather_cols:
            if col in weather.columns:
                laps[col] = weather[col]
            else:
                laps[col] = pd.NA

        return laps
