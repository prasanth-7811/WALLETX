import React from 'react';
import './ChartSetup';
import { Line } from 'react-chartjs-2';
import { useQuant } from '../../context/QuantContext';
import { ASSET_REGISTRY } from '../../data/assets';
import { calculateDrawdown } from '../../engine/quantMath';

interface Props {
  height?: number;
}

export const DrawdownChart: React.FC<Props> = ({ height = 240 }) => {
  const { selectedAssets, filteredCandles, allDates } = useQuant();

  if (selectedAssets.length === 0 || allDates.length === 0) return null;

  const step = Math.max(1, Math.floor(allDates.length / 250));
  const sampledDates = allDates.filter((_, i) => i % step === 0 || i === allDates.length - 1);

  const datasets = selectedAssets.map(assetId => {
    const info = ASSET_REGISTRY[assetId];
    const candles = filteredCandles[assetId] || [];
    const closes = candles.map(c => c.close);
    const { drawdownSeries } = calculateDrawdown(closes);

    const sampledData = drawdownSeries
      .filter((_, i) => i % step === 0 || i === drawdownSeries.length - 1)
      .map(d => Number((d * 100).toFixed(2)));

    const isSingle = selectedAssets.length === 1;

    return {
      label: `${info?.name || assetId} Drawdown`,
      data: sampledData,
      borderColor: isSingle ? '#F43F5E' : info?.color || '#F43F5E',
      backgroundColor: isSingle ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
      fill: isSingle,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.1,
    };
  });

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: selectedAssets.length > 1,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 10, family: "'Inter', sans-serif" },
          color: '#A39985',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
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
        max: 0,
        ticks: {
          callback: (value: any) => `${value}%`,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
          Underwater Drawdown Profile
        </h4>
        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
          Peak-to-Trough %
        </span>
      </div>
      <div style={{ height }}>
        <Line data={{ labels: sampledDates, datasets }} options={options} />
      </div>
    </div>
  );
};
