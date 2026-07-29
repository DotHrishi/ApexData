from datetime import datetime, timezone
import json
import logging
import os
import sys

SERVICE_NAME = "strategy-ai"
ENVIRONMENT = os.getenv("ENV", os.getenv("NODE_ENV", "development"))


class JSONFormatter(logging.Formatter):
    """Custom Formatter to output logs in structured single-line JSON format."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "service": SERVICE_NAME,
            "environment": ENVIRONMENT,
            "level": record.levelname,
            "message": record.getMessage(),
        }

        # Include custom extra attributes if passed in log call
        if hasattr(record, "requestId"):
            log_data["requestId"] = record.requestId
        if hasattr(record, "modelVersion"):
            log_data["modelVersion"] = record.modelVersion
        if hasattr(record, "driver"):
            log_data["driver"] = record.driver
        if hasattr(record, "circuit"):
            log_data["circuit"] = record.circuit
        if hasattr(record, "latencyMs"):
            log_data["latencyMs"] = record.latencyMs
        if hasattr(record, "recommendedPitLap"):
            log_data["recommendedPitLap"] = record.recommendedPitLap
        if hasattr(record, "strategyType"):
            log_data["strategyType"] = record.strategyType
        if hasattr(record, "status"):
            log_data["status"] = record.status

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def setup_logger() -> logging.Logger:
    logger = logging.getLogger(SERVICE_NAME)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    return logger


logger = setup_logger()
