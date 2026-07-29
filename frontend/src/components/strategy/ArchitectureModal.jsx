import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ArchitectureModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500 text-lg font-bold">ⓘ</span>
            <h3 className="text-base font-bold text-white orbitron">
              HOW DOES THE APEXDATA AI WORK?
            </h3>
          </div>

          <p className="text-xs text-zinc-400 font-inter mb-6 leading-relaxed">
            The ApexData backend uses a two-stage decision pipeline. Single-lap pace degradation is forecasted using XGBoost Machine Learning, while overall race strategy is evaluated deterministically by the Strategy Simulator.
          </p>

          <div className="space-y-3 font-tech-mono text-xs mb-6">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs">1</span>
              <div>
                <span className="text-white font-bold block">Current Race State</span>
                <span className="text-zinc-500 text-[10px]">Telemetry, tyre age, fuel load, and weather conditions</span>
              </div>
            </div>

            <div className="text-center text-zinc-600 text-xs">↓</div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/40">
              <span className="w-6 h-6 rounded-md bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <span className="text-red-400 font-bold block">Machine Learning Forecast</span>
                <span className="text-zinc-400 text-[10px]">XGBoost Regressor predicts next-lap pace & 95% confidence interval</span>
              </div>
            </div>

            <div className="text-center text-zinc-600 text-xs">↓</div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
              <span className="w-6 h-6 rounded-md bg-amber-600/30 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <span className="text-amber-300 font-bold block">Strategy Simulator</span>
                <span className="text-zinc-400 text-[10px]">Iteratively projects pace over remaining laps updating fuel & tyres</span>
              </div>
            </div>

            <div className="text-center text-zinc-600 text-xs">↓</div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
              <span className="w-6 h-6 rounded-md bg-cyan-600/30 text-cyan-400 flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <span className="text-cyan-300 font-bold block">Candidate Evaluation</span>
                <span className="text-zinc-400 text-[10px]">Evaluates pit windows across SOFT, MEDIUM, and HARD compounds</span>
              </div>
            </div>

            <div className="text-center text-zinc-600 text-xs">↓</div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <span className="w-6 h-6 rounded-md bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-bold">5</span>
              <div>
                <span className="text-emerald-400 font-bold block">Optimal Recommendation</span>
                <span className="text-zinc-400 text-[10px]">Ranks candidates to select minimum projected total race duration</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-inter text-xs px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArchitectureModal;
