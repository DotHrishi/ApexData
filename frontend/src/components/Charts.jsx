import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const LapTimeChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
      title: { display: true, text: 'Fastest Lap Times', color: 'white', font: { size: 16 } },
    },
    scales: {
      y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, title: { display: true, text: 'Time (s)', color: 'white' } },
      x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };

  return <Bar options={options} data={data} />;
};

export const TelemetryChart = ({ data, type = 'Speed' }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: 'white' } },
            title: { display: true, text: `${type} Telemetry (Comparison)`, color: 'white', font: { size: 16 } },
        },
        scales: {
            y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, title: { display: true, text: type, color: 'white' } },
            x: { type: 'linear', position: 'bottom', ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, title: { display: true, text: 'Distance (m) / Time', color: 'white' } }
        },
        elements: {
            point: { radius: 0 } // Hide points for smoother lines
        }
    };

    return <Line options={options} data={data} />;
};
