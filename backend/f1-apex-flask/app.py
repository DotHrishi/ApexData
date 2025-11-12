from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from fastf1.ergast import Ergast
from datetime import date, datetime, time, timezone
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import fastf1
import fastf1 as ff1
import fastf1.plotting
import io
import os
import logging
import matplotlib

app = Flask(__name__)
CORS(app)
matplotlib.use('Agg')

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

@app.route("/next_race", methods=["GET"])
def get_next_race():
    try:
        schedule = fastf1.get_event_schedule(date.today().year)
    except fastf1.api.ErgastAPIError:
        return jsonify({"error": "Could not fetch event schedule from API."}), 500

    today = date.today()

    upcoming_events = schedule[schedule['EventDate'].dt.date >= today]

    if not upcoming_events.empty:
        next_event = upcoming_events.iloc[0]
        next_race_name = next_event['EventName']

        response_data = {
            "name": str(next_race_name),
            "date": str(next_event['EventDate'].strftime('%Y-%m-%d')),
            "location": str(next_event['Location']),
            "round": int(next_event['RoundNumber'].item() if hasattr(next_event['RoundNumber'], 'item') else next_event['RoundNumber'])
        }

        
        return jsonify(response_data), 200
    else:
        return jsonify({"message": "No upcoming races found!!"}), 200
    
fastf1.Cache.enable_cache('./cache') 
fastf1.plotting.setup_mpl()
logging.basicConfig(level=logging.INFO)

@app.route("/getGraphs", methods=["GET"])
def driver_vs_driver():
    try:
        # --- 1. Get Data from Frontend Request ---
        year = request.args.get('year', default=2023, type=int)
        event = request.args.get('event', default='Monza', type=str)
        session_type = request.args.get('session', default='R', type=str)
        driver_1 = request.args.get('driver1', default='SAI', type=str)
        driver_2 = request.args.get('driver2', default='VER', type=str)

        app.logger.info(f"Received request for: {year}, {event}, {session_type}, {driver_1} vs {driver_2}")

        # --- 2. Load FastF1 Data ---
        session = fastf1.get_session(year, event, session_type)
        session.load(laps=True, telemetry=True, weather=False)

        # --- 3. Get Laps and Telemetry ---
        lap_drv1 = session.laps.pick_drivers(driver_1).pick_fastest()
        lap_drv2 = session.laps.pick_drivers(driver_2).pick_fastest()

        if not lap_drv1.LapTime or not lap_drv2.LapTime:
            app.logger.error("Could not find fastest lap for one or both drivers.")
            return jsonify({"error": "Could not find fastest lap data for one or both drivers."}), 404

        tel_drv1 = lap_drv1.get_car_data().add_distance()
        tel_drv2 = lap_drv2.get_car_data().add_distance()

        # --- FIX: Check for 'Gear' data ---
        gear_available = 'Gear' in tel_drv1.columns and 'Gear' in tel_drv2.columns

        # --- (Optional) Log all available columns for debugging ---
        # app.logger.info(f"Available telemetry columns: {tel_drv1.columns.tolist()}")

        color_drv1 = fastf1.plotting.get_driver_color(driver_1, session=session)
        color_drv2 = fastf1.plotting.get_driver_color(driver_2, session=session)

        # --- 4. Generate Plot (Dynamically) ---
        
        # Adjust number of plots and figure size based on data
        num_plots = 4 if gear_available else 3
        fig_height = 12 if gear_available else 10
        
        fig, ax = plt.subplots(num_plots, 1, figsize=(15, fig_height), sharex=True)
        
        # Ensure 'ax' is always an array, even if num_plots=1 (for future-proofing)
        if num_plots == 1:
            ax = [ax] 

        fig.suptitle(f"Fastest Lap Telemetry Comparison\n"
                     f"{session.event['EventName']} {session.event.year} {session_type}\n"
                     f"{driver_1} (Lap {lap_drv1['LapNumber']}) vs. {driver_2} (Lap {lap_drv2['LapNumber']})",
                     fontsize=16)

        # Plot Speed
        ax[0].plot(tel_drv1['Distance'], tel_drv1['Speed'], color=color_drv1, label=driver_1)
        ax[0].plot(tel_drv2['Distance'], tel_drv2['Speed'], color=color_drv2, label=driver_2)
        ax[0].set_ylabel('Speed [km/h]')
        ax[0].legend(loc="lower right")

        # Plot Throttle
        ax[1].plot(tel_drv1['Distance'], tel_drv1['Throttle'], color=color_drv1)
        ax[1].plot(tel_drv2['Distance'], tel_drv2['Throttle'], color=color_drv2)
        ax[1].set_ylabel('Throttle [%]')

        # Plot Brake
        ax[2].plot(tel_drv1['Distance'], tel_drv1['Brake'], color=color_drv1)
        ax[2].plot(tel_drv2['Distance'], tel_drv2['Brake'], color=color_drv2)
        ax[2].set_ylabel('Brake [%]')

        # Plot Gear (only if available)
        if gear_available:
            ax[3].plot(tel_drv1['Distance'], tel_drv1['Gear'], color=color_drv1)
            ax[3].plot(tel_drv2['Distance'], tel_drv2['Gear'], color=color_drv2)
            ax[3].set_ylabel('Gear')
            ax[3].set_xlabel('Distance [m]') # X-label on the last plot
        else:
            app.logger.warning("Gear data not available. Skipping plot.")
            ax[2].set_xlabel('Distance [m]') # X-label on the last plot

        for a in ax:
            a.grid(True, which='both', linestyle='--', linewidth=0.5)

        plt.tight_layout(rect=[0, 0.03, 1, 0.95])

        # --- 5. Save Plot to Memory and Send ---
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        plt.close(fig)

        app.logger.info("Successfully generated and sending plot.")
        return send_file(buf, mimetype='image/png')

    except Exception as e:
        app.logger.error(f"An error occurred: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500



if __name__=="__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
