import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PacePredictionChart = ({ recommendation, currentLap = 20, totalLaps = 57, currentCompound = 'MEDIUM' }) => {
  if (!recommendation || !recommendation.predictedLapTimes || !recommendation.predictedLapTimes.length) {
    return (
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-6 h-full min-h-[340px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-bold mb-3">
          📊
        </div>
        <h4 className="text-sm font-bold text-white font-inter uppercase tracking-wider mb-1">
          No strategy generated.
        </h4>
        <p className="text-xs text-zinc-400 font-tech-mono max-w-sm">
          Select race parameters and click "Generate AI Strategy" to simulate pit windows and pace forecasts.
        </p>
      </div>
    );
  }

  const {
    predictedLapTimes,
    recommendedPitLap,
    recommendedCompound = 'SOFT',
    tyre_life: initialTyreLife = 15,
  } = recommendation;

  const recommendedIndex = Math.max(0, recommendedPitLap - currentLap);
  const labels = predictedLapTimes.map((_, i) => `Lap ${currentLap + i}`);

  // Memoized Chart Data Generation with distinct marker for Next Lap ML Prediction (index 0) vs Simulator Projections (index > 0)
  const chartData = useMemo(() => {
    const pointBackgroundColors = predictedLapTimes.map((_, i) => {
      if (i === 0) return '#06b6d4'; // Cyan highlight for Next Lap Direct ML Prediction
      if (i === recommendedIndex) return '#ef4444'; // Red highlight for Recommended Pit Stop
      return 'rgba(255, 255, 255, 0.4)';
    });

    const pointBorderColors = predictedLapTimes.map((_, i) => {
      if (i === 0) return '#0891b2';
      if (i === recommendedIndex) return '#dc2626';
      return 'rgba(255, 255, 255, 0.4)';
    });

    const pointRadius = predictedLapTimes.map((_, i) => {
      if (i === 0) return 7; // Direct ML Prediction
      if (i === recommendedIndex) return 8; // Pit Stop
      return 2.5;
    });

    const pointHoverRadius = predictedLapTimes.map((_, i) => {
      if (i === 0 || i === recommendedIndex) return 10;
      return 4.5;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Race Pace Forecast & Simulation (s)',
          data: predictedLapTimes,
          borderColor: '#ef4444',
          borderWidth: 2,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
            return gradient;
          },
          fill: true,
          tension: 0.25,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: pointBorderColors,
          pointRadius,
          pointHoverRadius,
        },
      ],
    };
  }, [predictedLapTimes, recommendedIndex, labels]);

  // Memoized Chart Options with explicit tooltips detailing ML vs Simulation source
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#09090b',
          titleColor: '#ffffff',
          bodyColor: '#e4e4e7',
          borderColor: '#27272a',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const idx = items[0].dataIndex;
              const lapNum = currentLap + idx;
              const isFirstPredicted = idx === 0;
              const isPit = lapNum === recommendedPitLap;

              if (isFirstPredicted) return `LAP ${lapNum} — NEXT LAP ML PREDICTION ⚡`;
              if (isPit) return `LAP ${lapNum} — RECOMMENDED PIT STOP ⛽`;
              return `LAP ${lapNum} — SIMULATED PROJECTION`;
            },
            label: (context) => {
              const idx = context.dataIndex;
              const lapNum = currentLap + idx;
              const isFirstPredicted = idx === 0;
              const isPit = lapNum === recommendedPitLap;
              const compoundAtLap = lapNum <= recommendedPitLap ? currentCompound : recommendedCompound;
              const tyreAgeAtLap = lapNum <= recommendedPitLap 
                ? (initialTyreLife + idx) 
                : (idx - recommendedIndex);

              const lines = [
                `Forecast Pace: ${context.parsed.y.toFixed(3)}s`,
                `Tyre Compound: ${compoundAtLap}`,
                `Tyre Age: ${tyreAgeAtLap} Laps`,
              ];

              if (isFirstPredicted) {
                lines.push(`Source: Direct Machine Learning Model Prediction (XGBoost)`);
              } else if (isPit) {
                lines.push(`Pit Stop: Estimated pit lane time loss (22.5s)`);
                lines.push(`Source: Strategy Simulator Projection`);
              } else {
                lines.push(`Source: Strategy Simulator Projection (Iterative ML Inference)`);
              }

              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(39, 39, 42, 0.4)' },
          ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 12 },
        },
        y: {
          grid: { color: 'rgba(39, 39, 42, 0.4)' },
          ticks: {
            color: '#71717a',
            font: { family: 'JetBrains Mono', size: 9 },
            callback: (value) => `${value}s`,
          },
        },
      },
    };
  }, [currentLap, recommendedPitLap, currentCompound, recommendedCompound, initialTyreLife, recommendedIndex]);

  return (
    <div 
      className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col justify-between h-full min-h-[340px]"
      aria-label="Projected Race Pace Simulation Chart"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5 gap-2">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-inter flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Projected Race Pace Simulation
          </h3>
          <p className="text-[11px] text-zinc-400 font-inter mt-0.5">
            Iterative strategy simulation using machine learning lap-time forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-zinc-300 font-tech-mono bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Next Lap ML</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>Pit Stop (Lap {recommendedPitLap})</span>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full min-h-[260px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PacePredictionChart;
