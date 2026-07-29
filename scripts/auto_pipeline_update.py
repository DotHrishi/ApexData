"""
Automated Pipeline Retraining & Synchronization Script for ApexData.
Triggers FastF1 data fetching, MLOps model evaluation, and f1-strategy-ai model sync.
"""
import os
import sys
import subprocess
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AI_AGENT_DIR = os.path.join(BASE_DIR, "ai-agent")
STRATEGY_AI_DIR = os.path.join(BASE_DIR, "f1-strategy-ai")

def run_automated_update():
    logging.info("==================================================")
    logging.info("🚀 STARTING AUTOMATED RACE DATA & MLOPS RETRAINING")
    logging.info("==================================================")

    # Step 1: Update ai-agent dataset and retrain candidate models
    logging.info("Step 1: Fetching latest race telemetry and running MLOps model evaluation...")
    try:
        cmd1 = [sys.executable, "-m", "uv", "run", "python", "mlops/auto_retrain.py", "--update", "--seasons", "2024", "2025", "2026"]
        # Fallback to direct python if uv invocation differs
        res1 = subprocess.run(["uv", "run", "python", "mlops/auto_retrain.py", "--update", "--seasons", "2024", "2025", "2026"], cwd=AI_AGENT_DIR, capture_output=True, text=True)
        if res1.returncode == 0:
            logging.info("✅ ai-agent MLOps update completed successfully.")
            logging.info(res1.stdout[-400:] if res1.stdout else "No stdout output.")
        else:
            logging.warning(f"⚠️ ai-agent MLOps warning/notice:\n{res1.stderr}")
    except Exception as e:
        logging.error(f"❌ Error during ai-agent retraining: {e}")

    # Step 2: Synchronize f1-strategy-ai track degradation models
    logging.info("Step 2: Synchronizing f1-strategy-ai degradation and pit models...")
    try:
        res2 = subprocess.run(["python", "data_prep.py"], cwd=STRATEGY_AI_DIR, capture_output=True, text=True)
        if res2.returncode == 0:
            logging.info("✅ f1-strategy-ai models synchronized successfully.")
        else:
            logging.warning(f"⚠️ f1-strategy-ai sync warning:\n{res2.stderr}")
    except Exception as e:
        logging.error(f"❌ Error during f1-strategy-ai model sync: {e}")

    logging.info("==================================================")
    logging.info(f"🏁 AUTOMATED PIPELINE COMPLETE - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logging.info("==================================================")

if __name__ == "__main__":
    run_automated_update()
