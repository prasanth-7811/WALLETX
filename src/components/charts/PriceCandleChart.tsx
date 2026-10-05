import React, { useState } from 'react';
import './ChartSetup';
import { Line } from 'react-chartjs-2';
import { AssetId, OHLCV } from '../../types';
import { ASSET_REGISTRY } from '../../data/assets';
import { calculateEMA, calculateSMA } from '../../engine/quantMath';

interface Props {
  assetId: AssetId;
  candles: OHLCV[];
  height?: number;
}

export const PriceCandleChart: React.FC<Props> = ({ assetId, candles, height = 340 }) => {
  const info = ASSET_REGISTRY[assetId];
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showEMA12, setShowEMA12] = useState(false);

  if (!candles || candles.length === 0) return null;

  const dates = candles.map(c => c.date);
  const closes = candles.map(c => c.close);

  const sma20 = showSMA20 ? calculateSMA(closes, 20) : [];
  const sma50 = showSMA50 ? calculateSMA(closes, 50) : [];
  const sma200 = showSMA200 ? calculateSMA(closes, 200) : [];
  const ema12 = showEMA12 ? calculateEMA(closes, 12) : [];

  // Downsample for clean display if many candles
  const step = Math.max(1, Math.floor(dates.length / 250));
  const sampledDates = dates.filter((_, i) => i % step === 0 || i === dates.length - 1);
  const sampledCloses = closes.filter((_, i) => i % step === 0 || i === closes.length - 1);

  const mainColor = info?.color || '#D4AF37';

  const datasets: any[] = [
    {
      label: `${info?.name || assetId} Price`,
      data: sampledCloses,
      borderColor: mainColor,
      backgroundColor: `${mainColor}15`,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.1,
      yAxisID: 'y',
    },
  ];

  if (showSMA20) {
    datasets.push({
      label: 'SMA 20',
      data: sma20.filter((_, i) => i % step === 0 || i === sma20.length - 1),
      borderColor: '#E5C158',
      borderWidth: 1.5,
      borderDash: [3, 3],
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      yAxisID: 'y',
    });
  }

  if (showSMA50) {
    datasets.push({
      label: 'SMA 50',
      data: sma50.filter((_, i) => i % step === 0 || i === sma50.length - 1),
      borderColor: '#D4AF37',
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      yAxisID: 'y',
    });
  }

  if (showSMA200) {
    datasets.push({
      label: 'SMA 200',
      data: sma200.filter((_, i) => i % step === 0 || i === sma200.length - 1),
      borderColor: '#8B5CF6',
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      yAxisID: 'y',
    });
  }

  if (showEMA12) {
    datasets.push({
      label: 'EMA 12',
      data: ema12.filter((_, i) => i % step === 0 || i === ema12.length - 1),
      borderColor: '#10B981',
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      yAxisID: 'y',
    });
  }

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
      {/* Indicator Toggles Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
            {info?.name} Price Action
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#161616] text-[#D4AF37] border border-[#D4AF37]/30">
            {info?.exchange}
          </span>
        </div>

        {/* Indicator Checkboxes */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[#8A8578] font-medium mr-1">Overlays:</span>
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              showSMA20 ? 'bg-[#D4AF37]/20 text-[#FFE89C] border-[#D4AF37]/45 font-bold' : 'bg-[#141414] text-[#8A8578] border-[#262626] hover:text-white'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              showSMA50 ? 'bg-[#D4AF37]/20 text-[#FFE89C] border-[#D4AF37]/45 font-bold' : 'bg-[#141414] text-[#8A8578] border-[#262626] hover:text-white'
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              showSMA200 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' : 'bg-[#141414] text-[#8A8578] border-[#262626] hover:text-white'
            }`}
          >
            SMA 200
          </button>
          <button
            onClick={() => setShowEMA12(!showEMA12)}
            className={`px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              showEMA12 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-[#141414] text-[#8A8578] border-[#262626] hover:text-white'
            }`}
          >
            EMA 12
          </button>
        </div>
      </div>

      <div style={{ height }}>
        <Line data={{ labels: sampledDates, datasets }} options={options} />
      </div>
    </div>
  );
};
