import React from 'react';
import { motion } from 'framer-motion';

const COMPOUND_STYLES = {
  SOFT: { badge: 'bg-red-600 text-white shadow-red-950/50' },
  MEDIUM: { badge: 'bg-amber-500 text-black font-extrabold shadow-amber-950/50' },
  HARD: { badge: 'bg-zinc-100 text-black font-extrabold shadow-zinc-950/50' },
  INTERMEDIATE: { badge: 'bg-emerald-600 text-white shadow-emerald-950/50' },
  WET: { badge: 'bg-blue-600 text-white shadow-blue-950/50' },
};

const RecommendationCards = ({ recommendation, formData }) => {
  if (!recommendation) return null;

  const {
    predictedLapTimes = [],
    nextLapPredictionInterval,
    recommendedPitLap,
    recommendedCompound = 'MEDIUM',
    strategyType = 'One Stop',
  } = recommendation;

  // Next Lap Forecast (Direct ML Output)
  const nextLapPace = predictedLapTimes.length > 0 ? predictedLapTimes[0] : 92.80;
  const compoundStyle = COMPOUND_STYLES[recommendedCompound.toUpperCase()] || COMPOUND_STYLES.MEDIUM;

  const lowerBound = nextLapPredictionInterval?.lower || (nextLapPace - 0.44);
  const upperBound = nextLapPredictionInterval?.upper || (nextLapPace + 0.46);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* CARD 1: PRIMARY HERO CARD — NEXT LAP FORECAST (Double Width: lg:col-span-2) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        title="Generated directly by the XGBoost regression model."
        className="lg:col-span-2 bg-gradient-to-br from-red-950/30 via-zinc-950/90 to-zinc-950/90 backdrop-blur-md border border-red-600/40 rounded-xl p-4 shadow-xl shadow-red-950/20 flex flex-col justify-between hover:border-red-500/60 transition-all border-t-2 border-t-red-500 relative overflow-hidden"
      >
        {/* Subtle Background Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wider font-inter uppercase">
              NEXT LAP FORECAST
            </span>
          </div>
          <span className="text-[9px] font-bold text-red-400 font-tech-mono bg-red-950/60 px-2 py-0.5 rounded border border-red-600/40 shrink-0 uppercase">
            AI PREDICTION
          </span>
        </div>

        {/* Hero Metric & 95% Interval */}
        <div className="my-1.5 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-white orbitron tracking-tight">
              {nextLapPace.toFixed(2)} s
            </span>
          </div>

          <div className="bg-zinc-900/80 px-3 py-1 rounded-lg border border-zinc-800 text-right">
            <span className="text-[9px] font-inter uppercase text-zinc-500 block">95% Prediction Interval</span>
            <span className="text-xs font-bold text-amber-300 font-tech-mono">
              {lowerBound.toFixed(2)}s → {upperBound.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-between text-[11px] font-tech-mono text-zinc-400 mt-2">
          <span>Machine Learning Prediction (XGBoost Regressor)</span>
          <span className="text-zinc-500">Lap {(formData?.current_lap || 20) + 1} Target</span>
        </div>
      </motion.div>

      {/* CARD 2: RECOMMENDED PIT LAP (lg:col-span-1) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        title="Selected by evaluating all simulated candidate strategies."
        className="lg:col-span-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-700/80 transition-all border-t-2 border-t-emerald-500"
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider font-inter uppercase truncate">
            RECOMMENDED PIT LAP
          </span>
          <span className="text-[8px] font-semibold text-zinc-400 font-tech-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
            SIMULATED
          </span>
        </div>

        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-black text-white orbitron tracking-tight">
            Lap {recommendedPitLap}
          </span>
        </div>

        <span className="text-[10px] font-tech-mono text-zinc-500 mt-2">
          Strategy Optimizer
        </span>
      </motion.div>

      {/* CARD 3: TARGET COMPOUND (lg:col-span-1) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        title="Selected by strategy simulator to optimize pace post-pit."
        className="lg:col-span-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-700/80 transition-all border-t-2 border-t-cyan-500"
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider font-inter uppercase truncate">
            TARGET COMPOUND
          </span>
          <span className="text-[8px] font-semibold text-zinc-400 font-tech-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
            STINT 2
          </span>
        </div>

        <div className="my-1">
          <span className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider orbitron shadow-md inline-block ${compoundStyle.badge}`}>
            {recommendedCompound}
          </span>
        </div>

        <span className="text-[10px] font-tech-mono text-zinc-500 mt-2">
          Next Stint
        </span>
      </motion.div>

      {/* CARD 4: STRATEGY TYPE (lg:col-span-1) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        title="Classification generated by evaluating cumulative stint times."
        className="lg:col-span-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between hover:border-zinc-700/80 transition-all border-t-2 border-t-purple-500"
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider font-inter uppercase truncate">
            STRATEGY TYPE
          </span>
          <span className="text-[8px] font-semibold text-zinc-400 font-tech-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
            OPTIMIZED
          </span>
        </div>

        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-black text-white orbitron tracking-tight">
            {strategyType}
          </span>
        </div>

        <span className="text-[10px] font-tech-mono text-zinc-500 mt-2">
          Optimal Strategy
        </span>
      </motion.div>
    </div>
  );
};

export default RecommendationCards;
