import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PIPELINE_STEPS = [
  "Loading telemetry input",
  "Running ML pace forecast",
  "Simulating pit strategies",
  "Ranking candidate options",
  "Generating optimal recommendation"
];

const LoadingOverlay = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center justify-center p-8 bg-zinc-950/95 border border-red-600/40 rounded-2xl shadow-2xl shadow-red-950/50 max-w-md w-full mx-4 text-center">
        {/* Pulsing Outer Ring */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping" />
          <div className="w-16 h-16 rounded-full border-4 border-t-red-600 border-r-red-600/40 border-b-zinc-800 border-l-zinc-800 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 font-bold text-xs orbitron">AI</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide orbitron mb-1">
          STRATEGY SIMULATOR ACTIVE
        </h3>
        
        <p className="text-xs text-zinc-400 font-inter mb-5">
          Processing telemetry through machine learning forecast pipeline...
        </p>

        {/* Pipeline Step Indicators */}
        <div className="w-full space-y-2 mb-5 text-left">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div key={step} className="flex items-center gap-3 text-xs font-tech-mono">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isDone ? 'bg-emerald-500 text-black' : isCurrent ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={isCurrent ? 'text-white font-bold' : isDone ? 'text-zinc-400' : 'text-zinc-600'}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / PIPELINE_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;
