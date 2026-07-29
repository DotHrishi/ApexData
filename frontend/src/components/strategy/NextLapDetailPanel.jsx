import React from 'react';
import { motion } from 'framer-motion';

const NextLapDetailPanel = ({ recommendation, formData }) => {
  if (!recommendation) return null;

  const {
    predictedLapTimes = [],
    nextLapPredictionInterval,
    expectedRMSE = 0.859,
  } = recommendation;

  const nextLapPace = predictedLapTimes.length > 0 ? predictedLapTimes[0] : 91.34;
  const currentPace = formData?.rolling_pace_3 || 92.5;
  const rolling5Pace = formData?.rolling_pace_5 || 92.4;

  const diffPrev = (nextLapPace - currentPace).toFixed(2);
  const diffRolling = (nextLapPace - rolling5Pace).toFixed(2);

  const lowerBound = nextLapPredictionInterval?.lower || (nextLapPace - 0.44);
  const upperBound = nextLapPredictionInterval?.upper || (nextLapPace - 0.46);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950/90 backdrop-blur-md border border-red-600/40 rounded-xl p-5 shadow-xl shadow-red-950/20 relative overflow-hidden"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-zinc-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/50 flex items-center justify-center text-red-500 font-bold text-sm orbitron">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white orbitron uppercase tracking-wide">
                Next Lap AI Forecast
              </h3>
              <span className="text-[9px] font-tech-mono bg-red-600/20 text-red-400 border border-red-600/40 px-2 py-0.5 rounded font-semibold uppercase">
                Direct XGBoost ML Output
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-inter mt-0.5">
              Direct machine learning inference for Lap {(formData?.current_lap || 20) + 1} based on live telemetry feeds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-tech-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Stage 1: Single-Lap ML Inference</span>
        </div>
      </div>

      {/* Main Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Next Lap Pace */}
        <div className="bg-zinc-900/70 border border-red-600/30 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            PREDICTED LAP PACE
          </span>
          <div className="my-1">
            <span className="text-2xl font-black text-white orbitron tracking-tight">
              {nextLapPace.toFixed(2)} s
            </span>
          </div>
          <span className="text-[10px] font-tech-mono text-red-400">
            Target Lap {(formData?.current_lap || 20) + 1} Forecast
          </span>
        </div>

        {/* Metric 2: 95% Bound */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            95% PREDICTION BOUND
          </span>
          <div className="my-1">
            <span className="text-xs font-bold text-amber-300 font-tech-mono block">
              {lowerBound.toFixed(2)}s → {upperBound.toFixed(2)}s
            </span>
          </div>
          <span className="text-[10px] font-tech-mono text-zinc-500">
            ±{((upperBound - lowerBound) / 2).toFixed(2)}s Interval
          </span>
        </div>

        {/* Metric 3: Delta vs Previous */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            DELTA VS PREV LAP
          </span>
          <div className="my-1">
            <span className={`text-base font-bold font-tech-mono ${Number(diffPrev) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {Number(diffPrev) > 0 ? `+${diffPrev} s` : `${diffPrev} s`}
            </span>
          </div>
          <span className="text-[10px] font-tech-mono text-zinc-500">
            vs Lap {formData?.current_lap || 20} Pace ({currentPace}s)
          </span>
        </div>

        {/* Metric 4: Delta vs Rolling Pace */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            DELTA VS ROLLING AVG
          </span>
          <div className="my-1">
            <span className={`text-base font-bold font-tech-mono ${Number(diffRolling) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {Number(diffRolling) > 0 ? `+${diffRolling} s` : `${diffRolling} s`}
            </span>
          </div>
          <span className="text-[10px] font-tech-mono text-zinc-500">
            vs 5-Lap Avg ({rolling5Pace}s)
          </span>
        </div>

        {/* Metric 5: Tyre & Fuel Telemetry */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            TELEMETRY STATE
          </span>
          <div className="my-1 font-tech-mono text-xs text-white">
            <span>{formData?.compound || 'MEDIUM'}</span> • <span className="text-amber-400">{formData?.tyre_life || 15} Laps</span>
          </div>
          <span className="text-[10px] font-tech-mono text-zinc-500">
            Fuel: {formData?.estimated_fuel_kg || 65.0} kg
          </span>
        </div>

        {/* Metric 6: Confidence */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 font-inter uppercase tracking-wider">
            MODEL CONFIDENCE
          </span>
          <div className="my-1 font-tech-mono text-xs text-emerald-400 font-bold">
            HIGH (RMSE {expectedRMSE?.toFixed(3)}s)
          </div>
          <span className="text-[10px] font-tech-mono text-zinc-500">
            Track: {formData?.track_temp || 34}°C | Air: {formData?.air_temp || 25}°C
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NextLapDetailPanel;
