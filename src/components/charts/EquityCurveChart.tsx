import React from 'react';
import './ChartSetup';
import { Line } from 'react-chartjs-2';
import { BacktestResult } from '../../types';

interface Props {
  backtest: BacktestResult;
  height?: number;
}

export const EquityCurveChart: React.FC<Props> = ({ backtest, height = 320 }) => {
  const timeline = backtest.timeline;
  if (!timeline || timeline.length === 0) return null;

  const step = Math.max(1, Math.floor(timeline.length / 250));
  const sampledTimeline = timeline.filter((_, i) => i % step === 0 || i === timeline.length - 1);

  const dates = sampledTimeline.map(t => t.date);
  const strategyValues = sampledTimeline.map(t => t.strategyValue);
  const benchmarkValues = sampledTimeline.map(t => t.benchmarkValue);

  const isOutperforming = backtest.totalReturn >= backtest.benchmarkTotalReturn;

  const datasets = [
    {
      label: `WALLETX Strategy (${backtest.params.type.replace('_', ' ')})`,
      data: strategyValues,
      borderColor: '#D4AF37',
      backgroundColor: 'rgba(212, 175, 55, 0.14)',
      fill: true,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.1,
    },
    {
      label: 'Benchmark (Buy & Hold)',
      data: benchmarkValues,
      borderColor: '#8A8578',
      borderDash: [4, 4],
      fill: false,
      borderWidth: 1.8,
      pointRadius: 0,
      tension: 0.1,
    },
  ];

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#A39985',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: $${Number(context.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 7,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
      y: {
        grid: { color: 'rgba(212, 175, 55, 0.07)' },
        ticks: {
          callback: (value: any) => `$${Number(value).toLocaleString()}`,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
            Strategy vs Buy-and-Hold Equity Curve
          </h4>
          <p className="text-[11px] text-[#A39985]">
            Initial Capital: <strong className="font-mono text-[#D4AF37]">${backtest.initialCapital.toLocaleString()}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-mono font-semibold border ${
              isOutperforming
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/35'
            }`}
          >
            Alpha: {(backtest.alpha * 100).toFixed(2)}% | Beta: {backtest.beta}
          </span>
        </div>
      </div>
      <div style={{ height }}>
        <Line data={{ labels: dates, datasets }} options={options} />
      </div>
    </div>
  );
};
