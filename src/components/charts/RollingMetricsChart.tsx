import React, { useState } from 'react';
import './ChartSetup';
import { Line } from 'react-chartjs-2';
import { useQuant } from '../../context/QuantContext';
import { ASSET_REGISTRY } from '../../data/assets';
import { computeRollingSharpe, computeRollingVolatility } from '../../engine/quantMath';

export const RollingMetricsChart: React.FC = () => {
  const { selectedAssets, filteredCandles, rollingCorrelations, riskFreeRate } = useQuant();
  const [metricMode, setMetricMode] = useState<'VOLATILITY' | 'SHARPE' | 'CORRELATION'>('VOLATILITY');

  if (selectedAssets.length === 0) return null;

  let datasets: any[] = [];
  let labels: string[] = [];
  let yAxisFormatter = (v: any) => `${v}`;

  if (metricMode === 'VOLATILITY') {
    yAxisFormatter = (v: any) => `${(v * 100).toFixed(0)}%`;
    datasets = selectedAssets.map(assetId => {
      const info = ASSET_REGISTRY[assetId];
      const candles = filteredCandles[assetId] || [];
      const res = computeRollingVolatility(candles, 30);
      labels = res.dates;

      return {
        label: `${info?.name || assetId} 30D Vol`,
        data: res.volatility.map(v => v),
        borderColor: info?.color || '#D4AF37',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      };
    });
  } else if (metricMode === 'SHARPE') {
    yAxisFormatter = (v: any) => `${Number(v).toFixed(1)}`;
    datasets = selectedAssets.map(assetId => {
      const info = ASSET_REGISTRY[assetId];
      const candles = filteredCandles[assetId] || [];
      const res = computeRollingSharpe(candles, 60, riskFreeRate);
      labels = res.dates;

      return {
        label: `${info?.name || assetId} 60D Sharpe`,
        data: res.sharpe,
        borderColor: info?.color || '#D4AF37',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      };
    });
  } else if (metricMode === 'CORRELATION') {
    yAxisFormatter = (v: any) => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}`;
    if (rollingCorrelations.length > 0) {
      labels = rollingCorrelations[0].dates;
      datasets = rollingCorrelations.map((pair, idx) => {
        const colors = ['#D4AF37', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6'];
        return {
          label: pair.pairLabel,
          data: pair.correlations,
          borderColor: colors[idx % colors.length],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        };
      });
    }
  }

  // Downsample labels and datasets for smooth rendering
  const step = Math.max(1, Math.floor(labels.length / 250));
  const sampledLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
  const sampledDatasets = datasets.map(d => ({
    ...d,
    data: d.data.filter((_: any, i: number) => i % step === 0 || i === d.data.length - 1),
  }));

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
          font: { size: 10, family: "'Inter', sans-serif" },
          color: '#A39985',
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
          callback: yAxisFormatter,
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          color: '#8A8578',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
          Dynamic Rolling Quant Metrics
        </h4>

        {/* Metric Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#D4AF37]/20 text-xs">
          <button
            onClick={() => setMetricMode('VOLATILITY')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              metricMode === 'VOLATILITY' ? 'bg-[#D4AF37]/20 text-[#FFE89C] font-bold border border-[#D4AF37]/35' : 'text-[#A39985] hover:text-white'
            }`}
          >
            Rolling 30D Volatility
          </button>
          <button
            onClick={() => setMetricMode('SHARPE')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              metricMode === 'SHARPE' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/35' : 'text-[#A39985] hover:text-white'
            }`}
          >
            Rolling 60D Sharpe
          </button>
          {selectedAssets.length >= 2 && (
            <button
              onClick={() => setMetricMode('CORRELATION')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'CORRELATION' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/35' : 'text-[#A39985] hover:text-white'
              }`}
            >
              Rolling 60D Correlation
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 260 }}>
        <Line data={{ labels: sampledLabels, datasets: sampledDatasets }} options={options} />
      </div>
    </div>
  );
};
