"""
FastAPI Server for ApexData AI Engine. Exposes strategy recommendation endpoints.
Production Hardened with Structured Logging, Request Validation, Error Handling, & Correlation IDs.
"""

from pathlib import Path
import sys
import time
import uuid
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

# Ensure parent directory (ai-agent) is in python path
current_file = Path(__file__).resolve()
ai_agent_dir = current_file.parent
if str(ai_agent_dir) not in sys.path:
    sys.path.insert(0, str(ai_agent_dir))

from logging_config import logger
from strategy import (
    DriverState,
    OpponentState,
    RaceState,
    StrategyRecommendationEngine,
    WeatherState,
)

app = FastAPI(
    title="ApexData F1 AI Strategy Engine API",
    version="1.0.0",
    description="Machine Learning Powered Pit Strategy Optimization API",
)

# Enable CORS for frontend integration
import os as _os
_raw_origins = _os.getenv("ALLOWED_ORIGINS", "")
if not _raw_origins or _raw_origins.strip() == "*":
    _cors_kwargs = {
        "allow_origins": ["*"],
        "allow_origin_regex": r"https?://.*",
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
else:
    _parsed_origins = [o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()]
    if "*" in _parsed_origins:
        _cors_kwargs = {
            "allow_origins": ["*"],
            "allow_origin_regex": r"https?://.*",
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }
    else:
        _cors_kwargs = {
            "allow_origins": _parsed_origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }

app.add_middleware(CORSMiddleware, **_cors_kwargs)

# Global engine instance and startup timestamp
engine: Optional[StrategyRecommendationEngine] = None
start_time_seconds: float = time.time()


@app.on_event("startup")
def startup_event():
    global engine, start_time_seconds
    start_time_seconds = time.time()
    try:
        engine = StrategyRecommendationEngine(model_dir=ai_agent_dir / "trained_models")
        logger.info("Strategy Recommendation Engine initialized successfully", extra={"status": "success"})
    except Exception as e:
        logger.error(f"Failed to initialize Strategy Recommendation Engine: {e}", extra={"status": "failure"})


@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or request.headers.get("X-Correlation-ID")
    if not req_id:
        req_id = f"req_{uuid.uuid4().hex[:8]}"
    request.state.request_id = req_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response


class TelemetryRequest(BaseModel):
    driver_id: str = Field(default="VER", min_length=1, example="VER")
    circuit: str = Field(default="Bahrain", min_length=1, example="Bahrain")
    current_lap: int = Field(default=20, ge=0, le=80)
    compound: str = Field(default="MEDIUM", example="MEDIUM")
    tyre_life: int = Field(default=15, ge=0, le=60)
    estimated_fuel_kg: float = Field(default=65.0, ge=0.0)
    track_temp: float = Field(default=34.0, ge=-20.0, le=80.0)
    air_temp: float = Field(default=25.0, ge=-20.0, le=80.0)
    humidity: float = Field(default=50.0, ge=0.0, le=100.0)
    pressure: float = Field(default=1013.0)
    rolling_pace_3: float = Field(default=92.5)
    rolling_pace_5: float = Field(default=92.4)
    lap_delta: float = Field(default=0.1)
    stint_progress: float = Field(default=50.0)
    total_race_laps: int = Field(default=57)
    opponents: Optional[List[dict]] = None

    @validator("compound")
    def validate_compound(cls, v):
        valid = {"SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"}
        if not isinstance(v, str) or v.upper() not in valid:
            raise ValueError(f"Compound must be one of: {', '.join(sorted(valid))}.")
        return v.upper()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "req_unknown")
    msg_parts = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg_parts.append(f"{loc}: {err.get('msg')}" if loc else err.get('msg', 'Invalid input'))
    error_message = "; ".join(msg_parts) if msg_parts else "Invalid request telemetry data."

    logger.warn(
        "Telemetry request validation failed",
        extra={"requestId": req_id, "status": "failure", "message": error_message}
    )

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "requestId": req_id,
            "code": "INVALID_REQUEST",
            "message": error_message
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    req_id = getattr(request.state, "request_id", "req_unknown")
    code = "INVALID_REQUEST" if exc.status_code == 400 else "MODEL_UNAVAILABLE" if exc.status_code == 503 else "INTERNAL_SERVER_ERROR"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "requestId": req_id,
            "code": code,
            "message": str(exc.detail)
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", "req_unknown")
    logger.error(
        f"Unhandled Engine Error: {str(exc)}",
        extra={"requestId": req_id, "status": "failure"}
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "requestId": req_id,
            "code": "INTERNAL_SERVER_ERROR",
            "message": "Strategy engine encountered an internal server error."
        }
    )


@app.get("/")
def root(request: Request):
    req_id = getattr(request.state, "request_id", "req_unknown")
    return {
        "success": True,
        "requestId": req_id,
        "status": "online",
        "service": "strategy-ai",
        "version": "1.0.0",
    }


@app.get("/health")
def health(request: Request):
    req_id = getattr(request.state, "request_id", "req_unknown")
    uptime = round(time.time() - start_time_seconds, 2)
    return {
        "status": "healthy",
        "service": "strategy-ai",
        "modelLoaded": engine is not None,
        "uptimeSeconds": uptime,
        "requestId": req_id,
    }


@app.post("/strategy/recommend")
@app.post("/api/strategy/recommend")
def recommend_strategy(req: TelemetryRequest, request: Request):
    req_id = getattr(request.state, "request_id", "req_unknown")

    if engine is None:
        logger.error("Strategy Engine is not initialized", extra={"requestId": req_id, "status": "failure"})
        raise HTTPException(status_code=503, detail="Strategy engine is currently unavailable.")

    start_time = time.time()

    try:
        driver = DriverState(
            driver_id=req.driver_id,
            current_lap=req.current_lap,
            compound=req.compound.upper(),
            tyre_life=req.tyre_life,
            estimated_fuel_kg=req.estimated_fuel_kg,
            rolling_pace_3=req.rolling_pace_3,
            rolling_pace_5=req.rolling_pace_5,
            lap_delta=req.lap_delta,
            stint_progress=req.stint_progress,
        )

        opponents = []
        if req.opponents:
            for opp in req.opponents:
                opponents.append(
                    OpponentState(
                        driver_id=opp.get("driver_id", "NOR"),
                        gap_sec=opp.get("gap_sec", 2.0),
                        compound=opp.get("compound", "MEDIUM"),
                        tyre_life=opp.get("tyre_life", 15),
                        estimated_fuel_kg=opp.get("estimated_fuel_kg", 65.0),
                        rolling_pace_3=opp.get("rolling_pace_3", 92.4),
                    )
                )
        else:
            opponents = [
                OpponentState("NOR", -1.8, "MEDIUM", 15, 65.0, 92.4),
                OpponentState("LEC", 8.5, "HARD", 10, 65.0, 92.8),
            ]

        weather = WeatherState(
            track_temp=req.track_temp,
            air_temp=req.air_temp,
            humidity=req.humidity,
            pressure=req.pressure,
        )

        race_state = RaceState(
            driver=driver,
            opponents=opponents,
            weather=weather,
            circuit=req.circuit,
            total_race_laps=req.total_race_laps,
            race_progress=(req.current_lap / req.total_race_laps) * 100.0,
        )

        recommendation = engine.recommend_strategy(race_state)
        elapsed_ms = round((time.time() - start_time) * 1000.0, 2)

        dto = recommendation.to_dto_dict()
        dto["inferenceTimeMs"] = elapsed_ms
        dto["modelVersion"] = "v1"

        recommended_pit_lap = dto.get("recommendedPitLap")
        strategy_type = dto.get("strategyType", "One Stop")

        logger.info(
            "Strategy recommendation completed successfully",
            extra={
                "requestId": req_id,
                "modelVersion": "v1",
                "driver": req.driver_id,
                "circuit": req.circuit,
                "latencyMs": elapsed_ms,
                "recommendedPitLap": recommended_pit_lap,
                "strategyType": strategy_type,
                "status": "success",
            },
        )

        return {
            "success": True,
            "requestId": req_id,
            "data": dto,
            **dto,
        }

    except Exception as e:
        logger.error(
            f"Prediction failed: {str(e)}",
            extra={
                "requestId": req_id,
                "modelVersion": "v1",
                "driver": req.driver_id,
                "circuit": req.circuit,
                "status": "failure",
            },
        )
        raise HTTPException(status_code=500, detail="Strategy calculation failed.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
