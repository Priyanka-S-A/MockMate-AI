import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

// Shared chart defaults
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#a3a3a3',
        font: { family: 'Outfit', size: 11 },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.9)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      titleColor: '#f5f5f5',
      bodyColor: '#a3a3a3',
      padding: 10,
      cornerRadius: 8,
      titleFont: { family: 'Outfit', weight: '600' },
      bodyFont: { family: 'Outfit' },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#737373', font: { family: 'Outfit', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#737373', font: { family: 'Outfit', size: 11 } },
    },
  },
};

/** Score trend over time - Line chart */
export const ScoreTrendChart = ({ data }) => {
  const labels = data.map((d) =>
    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const scores = data.map((d) => d.score);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Score',
        data: scores,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212,175,55,0.08)',
        pointBackgroundColor: '#d4af37',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { display: false },
    },
    scales: {
      ...baseOptions.scales,
      y: { ...baseOptions.scales.y, min: 0, max: 100 },
    },
  };

  return <Line data={chartData} options={options} />;
};

/** Weekly activity - Bar chart */
export const WeeklyActivityChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Interviews',
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) =>
          d.count > 0 ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.05)'
        ),
        borderColor: data.map((d) =>
          d.count > 0 ? '#d4af37' : 'rgba(255,255,255,0.08)'
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { display: false },
    },
    scales: {
      ...baseOptions.scales,
      y: { ...baseOptions.scales.y, min: 0, ticks: { ...baseOptions.scales.y.ticks, stepSize: 1 } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

/** Domain distribution - Doughnut chart */
export const DomainDistributionChart = ({ data }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const palette = [
    '#d4af37', '#b8962e', '#9c7c25', '#6b5518', '#f0d060',
    '#e8c84e', '#c8a030', '#a07820', '#805810', '#604008',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: palette.slice(0, labels.length).map((c) => c + '99'),
        borderColor: palette.slice(0, labels.length),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a3a3a3',
          font: { family: 'Outfit', size: 10 },
          boxWidth: 10,
          padding: 12,
        },
      },
      tooltip: baseOptions.plugins.tooltip,
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

/** Difficulty distribution - Radar chart */
export const DifficultyRadarChart = ({ data }) => {
  const chartData = {
    labels: ['Beginner', 'Intermediate', 'Advanced'],
    datasets: [
      {
        label: 'Interviews',
        data: [data.Beginner || 0, data.Intermediate || 0, data.Advanced || 0],
        backgroundColor: 'rgba(212,175,55,0.12)',
        borderColor: '#d4af37',
        pointBackgroundColor: '#d4af37',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: { color: '#a3a3a3', font: { family: 'Outfit', size: 11 } },
        ticks: {
          color: '#525252',
          backdropColor: 'transparent',
          stepSize: 1,
          font: { size: 9 },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: baseOptions.plugins.tooltip,
    },
  };

  return <Radar data={chartData} options={options} />;
};
