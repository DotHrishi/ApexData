from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from fastf1.ergast import Ergast
from datetime import datetime, time, timezone
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import fastf1
import fastf1.plotting
import io
import os

app = Flask(__name__)
CORS(app)

current_year=datetime.now(timezone.utc).year
today=datetime.now(timezone.utc).date()

@app.route("/schedule", methods=["GET"])
def get_race_schedule():
    try:
        ergast = Ergast()
        schedule = ergast.get_race_schedule(season=current_year)

        df=pd.DataFrame(schedule)
        df=df.replace({pd.NaT: None, np.nan: None})

        schedule_json=df.to_dict(orient="records")

        for race in schedule_json:
            for key, value in race.items():
                if isinstance(value, (datetime, time)):
                    race[key]=value.isoformat()

        return jsonify(schedule_json)
    
    except Exception as e:
        return jsonify({"error":f"Failed to fetch F1 schedule {str(e)}"}), 500

@app.route("/upcoming_race", methods=["GET"])
def get_upcoming_race():
    CACHE_DIR = os.getenv("FASTF1_CACHE_DIR", "cache")
    os.makedirs(CACHE_DIR, exist_ok=True)
    fastf1.Cache.enable_cache(CACHE_DIR)

    schedule = fastf1.get_event_schedule(current_year)

    now = pd.Timestamp.now().tz_localize(None)
    upcoming_races = schedule[schedule['EventDate'] >= now]

    if upcoming_races.empty:
        next_race = schedule.iloc[-1]
    else:
        next_race = upcoming_races.iloc[0]

    event = fastf1.get_event(current_year, next_race['RoundNumber'])

    race_session = event.get_session("Race")
    race_session.load()  

    race_data = {
        "event": event['EventName'],
        "country": event['Country'],
        "race_date": race_session.date.isoformat()  
    }

    return jsonify(race_data)

if __name__=="__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
