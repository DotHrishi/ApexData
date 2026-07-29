import React from 'react';
import { motion } from 'framer-motion';

const StrategyRecommendationBanner = ({ recommendation }) => {
  if (!recommendation) return null;

  const {
    recommendedPitLap = 23,
    recommendedCompound = 'SOFT',
    candidateStrategies = [],
  } = recommendation;

  // Calculate Estimated Gain vs Runner-up
  let gainSec = '1.17';
  if (candidateStrategies.length >= 2) {
    const best = candidateStrategies[0].projectedRaceTimeSec;
    const runnerUp = candidateStrategies[1].projectedRaceTimeSec;
    gainSec = (runnerUp - best).toFixed(2);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 font-bold text-lg orbitron shrink-0">
          🏆
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm font-inter">
            <span className="text-white font-bold">
              Pit on <span className="text-red-400 orbitron">Lap {recommendedPitLap}</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">
              Target Compound: <span className="text-amber-400 font-bold orbitron">{recommendedCompound}</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-bold font-tech-mono">
              Estimated Gain: -{gainSec} s vs Runner-up
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-inter mt-1.5 leading-relaxed">
            <span className="text-zinc-300 font-semibold">Reason: </span>
            Tyre degradation exceeds optimal threshold. Fresh {recommendedCompound.toLowerCase()} tyres minimize projected race completion time.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyRecommendationBanner;
