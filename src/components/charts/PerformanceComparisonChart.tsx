import React from 'react';
import './ChartSetup';
import { Line } from 'react-chartjs-2';
import { useQuant } from '../../context/QuantContext';
import { ASSET_REGISTRY } from '../../data/assets';
import { calculateCumulativeReturns, calculateDailyReturns } from '../../engine/quantMath';

interface Props {
  height?: number;
  showTitle?: boolean;
}

export const PerformanceComparisonChart: React.FC<Props> = ({ height = 320, showTitle = true }) => {
  const { selectedAssets, filteredCandles, allDates } = useQuant();

  if (selectedAssets.length === 0 || allDates.length === 0) {
    return null;
  }

  // Sample points if too many (downsample for smooth 60fps rendering if > 300 points)
  const step = Math.max(1, Math.floor(allDates.length / 250));
  const sampledDates = allDates.filter((_, i) => i % step === 0 || i === allDates.length - 1);

  const datasets = selectedAssets.map(assetId => {
    const info = ASSET_REGISTRY[assetId];
    const candles = filteredCandles[assetId] || [];
    const closes = candles.map(c => c.close);
    const returns = calculateDailyReturns(closes);
    const cumReturns = calculateCumulativeReturns(returns);

    const sampledData = cumReturns
      .filter((_, i) => i % step === 0 || i === cumReturns.length - 1)
      .map(r => Number((r * 100).toFixed(2)));

    const isSingle = selectedAssets.length === 1;
    const color = info ? info.color : '#D4AF37';

    return {
      label: info ? info.name : assetId,
      data: sampledData,
      borderColor: color,
      backgroundColor: isSingle ? `${color}18` : 'transparent',
      fill: isSingle,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
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
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#A39985',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const val = context.parsed.y;
            return ` ${context.dataset.label}: ${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
      y: {
        grid: { color: 'rgba(212, 175, 55, 0.07)' },
        ticks: {
          callback: (value: any) => `${value >= 0 ? '+' : ''}${value}%`,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
    },
  };

  const chartTitle =
    selectedAssets.length === 1
      ? `${ASSET_REGISTRY[selectedAssets[0]]?.name} Cumulative Performance`
      : selectedAssets.length === 2
      ? `${selectedAssets[0]} vs ${selectedAssets[1]} Cumulative Performance`
      : 'Multi-Asset Relative Performance Comparison';

  return (
    <div className="w-full">
      {showTitle && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
            {chartTitle}
          </h3>
          <span className="text-[10px] font-mono text-[#D4AF37]/80 bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
            Base 0.0% Normalized
          </span>
        </div>
      )}
      <div style={{ height }}>
        <Line
          data={{
            labels: sampledDates,
            datasets,
          }}
          options={options}
        />
      </div>
    </div>
  );
};
