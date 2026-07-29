"""
FastAPI Application for F1 Strategy AI Analyzer Pro.
Replaces Streamlit with a high-performance REST API and static web frontend interface.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from strategy_engine import (
    optimize_strategy,
    explain_strategy,
    get_weather,
    TRACK_COORDS,
    track_laps_dict,
    resolve_track_name
)

load_dotenv()

app = FastAPI(
    title="F1 Strategy AI Analyzer Pro API",
    version="2.0.0",
    description="Formula 1 Race Strategy Optimization API & Pitwall Analytics",
)

# Enable CORS for cross-origin frontend integration
# Set ALLOWED_ORIGINS env var in production (comma-separated list of origins)
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory if present
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

COMPOUND_COLORS = {
    'SOFT': '#ef4444',
    'MEDIUM': '#eab308',
    'HARD': '#f4f4f5',
    'INTERMEDIATE': '#10b981',
    'WET': '#3b82f6',
}

class StrategyAnalysisRequest(BaseModel):
    track: str = Field(default="Bahrain", example="Bahrain")
    team: str = Field(default="Red Bull", example="Red Bull")
    use_llm: bool = Field(default=False)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "f1-strategy-ai",
        "version": "2.0.0",
    }

@app.post("/api/strategy/analyze")
def analyze_strategy(req: StrategyAnalysisRequest):
    try:
        clean_track = resolve_track_name(req.track)
        weather = get_weather(clean_track)
        strategy, total_time, pit_laps, analytics = optimize_strategy(clean_track, req.team, weather)
        total_laps = track_laps_dict[clean_track]

        # Key Metrics
        total_time_min = round(total_time / 60.0, 2)
        historical_avg_min = 90.0 * total_laps / 60.0
        speed_up_pct = (historical_avg_min - total_time_min) / historical_avg_min * 100.0
        win_prob = round(min(95.0, max(20.0, 50.0 + speed_up_pct * 2.0)), 1)
        stops_count = max(0, len(strategy) - 1)

        # Stint Breakdown Table Data
        breakdown = []
        cum_lap = 0
        for i, (comp, stint_laps) in enumerate(strategy):
            start_lap = cum_lap + 1
            end_lap = cum_lap + stint_laps
            pit_lap = pit_laps[i - 1] if i > 0 else None
            stint_time = round(analytics['stint_times'][i], 2)
            avg_lap = round(analytics['avg_lap_times'][i], 2)
            deg_pen = round(analytics['deg_penalties'][i], 2)

            breakdown.append({
                "stint": i + 1,
                "compound": comp,
                "laps": f"{start_lap}-{end_lap}",
                "start_lap": start_lap,
                "end_lap": end_lap,
                "pit_lap": pit_lap,
                "avg_lap_sec": avg_lap,
                "stint_time_sec": stint_time,
                "deg_penalty_sec": deg_pen,
                "color": COMPOUND_COLORS.get(comp, "#71717a")
            })
            cum_lap += stint_laps

        # Pace Evolution Chart Data
        cum_times = [round(t, 2) for t in analytics['cum_times'][1:]]
        laps_axis = list(range(1, total_laps + 1))

        # Tire Allocation Chart Data
        compounds_list = [s[0] for s in strategy]
        stint_times_list = [round(t, 2) for t in analytics['stint_times']]
        compound_colors_list = [COMPOUND_COLORS.get(c, "#71717a") for c in compounds_list]

        # Weather Sensitivity Data
        track_defaults = {
            'Bahrain': 40, 'Monaco': 25, 'Monza': 32, 'Silverstone': 28,
            'Spa': 26, 'China': 28, 'Miami': 32, 'Imola': 25, 'Australia': 22, 'Japan': 28
        }
        base_temp = weather['track_temp'] if weather['track_temp'] != 30 else track_defaults.get(clean_track, 30)
        sens_temps = [base_temp - 10, base_temp, base_temp + 10]
        sens_factors = [1 + max(0, (t - 30) / 100) for t in sens_temps]
        sens_times_min = [round((total_time * f) / 60.0, 2) for f in sens_factors]

        # Narrative Explanation
        explanation = None
        if req.use_llm:
            explanation = explain_strategy(strategy, clean_track, weather)

        return {
            "success": True,
            "track": clean_track,
            "team": req.team,
            "total_laps": total_laps,
            "weather": {
                "track_temp_c": round(weather['track_temp'], 1),
                "rain_prob_pct": round(weather['rain_prob'] * 100, 1),
            },
            "metrics": {
                "total_race_time_sec": round(total_time, 2),
                "total_race_time_min": total_time_min,
                "win_probability_pct": win_prob,
                "stops_count": stops_count,
            },
            "breakdown": breakdown,
            "charts": {
                "pace_evolution": {
                    "laps": laps_axis,
                    "cum_times": cum_times,
                    "pit_laps": pit_laps,
                },
                "tire_allocation": {
                    "compounds": compounds_list,
                    "stint_times": stint_times_list,
                    "colors": compound_colors_list,
                },
                "sensitivity": {
                    "temps": sens_temps,
                    "times_min": sens_times_min,
                    "base_temp": base_temp,
                }
            },
            "narrative": explanation,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/validation")
def get_validation_results():
    val_file = Path("val_results.txt")
    if val_file.exists():
        return {"success": True, "output": val_file.read_text(encoding="utf-8")}
    return {"success": False, "output": "No validation results available yet."}

@app.get("/", response_class=HTMLResponse)
def index_page():
    index_file = static_dir / "index.html"
    if index_file.exists():
        return HTMLResponse(content=index_file.read_text(encoding="utf-8"))
    return HTMLResponse(content="<h2>F1 Strategy AI API Server Running</h2><p>Access static UI at /static/index.html or API at /api/strategy/analyze</p>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
