from flask import Flask, jsonify
from fastf1.ergast import Ergast
import pandas as pd

app = Flask(__name__)

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    ergast = Ergast()
    schedule = ergast.get_schedule()
    df = pd.DataFrame(schedule)
    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)