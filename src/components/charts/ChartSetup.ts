import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Black & Gold Theme defaults for Chart.js
ChartJS.defaults.color = '#A39985';
ChartJS.defaults.borderColor = 'rgba(212, 175, 55, 0.08)';
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(16, 16, 16, 0.96)';
ChartJS.defaults.plugins.tooltip.titleColor = '#FFE89C';
ChartJS.defaults.plugins.tooltip.bodyColor = '#FFFFFF';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(212, 175, 55, 0.35)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
