import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FEATURE_LABEL_MAP = {
  TyreLife: 'Tyre Life (Laps)',
  ApproxFuelCorrectedLapTime: 'Fuel Corrected Pace',
  RollingAvgPace5: 'Rolling Pace (5 Laps)',
  RollingAvgPace3: 'Rolling Pace (3 Laps)',
  TrackTemp: 'Track Temperature',
  AirTemp: 'Air Temperature',
  Humidity: 'Humidity (%)',
  EstimatedFuelLoad: 'Fuel Load (kg)',
  LapTimeDelta: 'Lap Delta (s)',
};

const FeatureImportanceChart = ({ topFactors = {} }) => {
  const keys = Object.keys(topFactors);
  if (!keys.length) {
    return (
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 h-full flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-lg font-bold mb-2">
          ⚡
        </div>
        <h4 className="text-xs font-bold text-white font-inter uppercase tracking-wider mb-1">
          No forecast generated.
        </h4>
        <p className="text-[11px] text-zinc-400 font-tech-mono max-w-xs">
          SHAP feature contribution values for the next lap forecast will display here after simulation.
        </p>
      </div>
    );
  }

  const labels = keys.map((key) => FEATURE_LABEL_MAP[key] || key);
  const rawValues = keys.map((key) => topFactors[key]);

  const absSum = rawValues.reduce((sum, val) => sum + Math.abs(val), 0) || 1;
  const pctValues = rawValues.map((val) => Number(((Math.abs(val) / absSum) * 100).toFixed(1)));

  const data = {
    labels,
    datasets: [
      {
        label: 'SHAP Contribution to Next Lap Forecast (%)',
        data: pctValues,
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(168, 85, 247, 0.85)',
        ],
        borderColor: [
          '#ef4444',
          '#f59e0b',
          '#3b82f6',
          '#10b981',
          '#a855f7',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
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
        padding: 10,
        callbacks: {
          label: (context) => [
            `Contribution: ${context.parsed.x}%`,
            `Source: XGBoost TreeExplainer for Next Lap ML Forecast`,
            `Higher value → Greater influence on next lap pace prediction`,
          ],
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(39, 39, 42, 0.4)' },
        ticks: {
          color: '#71717a',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#e4e4e7',
          font: { family: 'Inter', size: 10, weight: '600' },
        },
      },
    },
  };

  return (
    <div 
      className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-4 shadow-lg shadow-black/40 flex flex-col h-full"
      aria-label="AI Prediction Explanation SHAP Panel"
    >
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-inter">
            AI Prediction Explanation
          </h3>
          <p className="text-[11px] text-zinc-400 font-inter mt-0.5">
            Factors contributing to the next lap forecast.
          </p>
        </div>
        <span className="text-[10px] font-tech-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          TreeExplainer SHAP
        </span>
      </div>

      <div className="h-60 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
