from flask import Flask, jsonify, request
from flask_cors import CORS
from fastf1.ergast import Ergast
from datetime import datetime, time
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

current_year=datetime.now().year

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
    
if __name__=="__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
