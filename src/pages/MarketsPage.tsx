import React, { useState, useEffect } from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import type { AssetId } from '../types';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { PriceCandleChart } from '../components/charts/PriceCandleChart';
import { DrawdownChart } from '../components/charts/DrawdownChart';
import { Layers } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const { selectedAssets, filteredCandles, metricsMap } = useQuant();
  const [activeAsset, setActiveAsset] = useState<AssetId>('GOLD');

  // Ensure activeAsset is always in selectedAssets
  useEffect(() => {
    if (selectedAssets.length > 0 && !selectedAssets.includes(activeAsset)) {
      setActiveAsset(selectedAssets[0]);
    }
  }, [selectedAssets, activeAsset]);

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const currentInfo = ASSET_REGISTRY[activeAsset];
  const currentMetrics = metricsMap[activeAsset];
  const candles = filteredCandles[activeAsset] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Asset Switcher Bar */}
      <div className="quant-card p-4 flex flex-wrap items-center justify-between gap-3 bg-[#111111] border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#A39985] uppercase tracking-wider flex items-center gap-1.5 font-display">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            Selected Markets:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {selectedAssets.map(assetId => {
              const info = ASSET_REGISTRY[assetId];
              const isActive = activeAsset === assetId;

              return (
                <button
                  key={assetId}
                  onClick={() => setActiveAsset(assetId)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#181818] text-white border border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                      : 'bg-[#121212] text-[#A39985] border border-white/10 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                  style={{
                    borderColor: isActive ? info?.color : undefined,
                    boxShadow: isActive ? `0 0 14px -2px ${info?.color}40` : undefined,
                  }}
                >
                  <span>{info?.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-mono text-[#A39985]">
          Viewing <strong className="text-[#D4AF37]">{currentInfo?.name}</strong> ({currentInfo?.exchange})
        </div>
      </div>

      {/* Selected Asset Detailed Stat Cards Grid */}
      {currentMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">Latest Price</div>
            <div className="text-sm lg:text-base font-bold text-white font-mono mt-0.5">
              ${currentMetrics.latestPrice.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#D4AF37]/70 font-mono mt-0.5">USD Spot</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">1D Return</div>
            <div
              className={`text-sm lg:text-base font-bold font-mono mt-0.5 ${
                currentMetrics.dailyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentMetrics.dailyReturn >= 0 ? '+' : ''}
              {(currentMetrics.dailyReturn * 100).toFixed(2)}%
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Daily delta</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">Total Return</div>
            <div
              className={`text-sm lg:text-base font-bold font-mono mt-0.5 ${
                currentMetrics.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentMetrics.totalReturn >= 0 ? '+' : ''}
              {(currentMetrics.totalReturn * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">
              CAGR: <strong className="text-[#D4AF37]">{(currentMetrics.cagr * 100).toFixed(1)}%</strong>
            </div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">Avg Volume</div>
            <div className="text-sm lg:text-base font-bold text-slate-200 font-mono mt-0.5">
              {currentMetrics.avgDailyVolume > 1000000
                ? `${(currentMetrics.avgDailyVolume / 1000000).toFixed(1)}M`
                : `${(currentMetrics.avgDailyVolume / 1000).toFixed(0)}k`}
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Daily units</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">Annualized Vol</div>
            <div className="text-sm lg:text-base font-bold text-[#F59E0B] font-mono mt-0.5">
              {(currentMetrics.volatility * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Historical 252D</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">SMA 50 / 200</div>
            <div className="text-xs font-bold text-slate-200 font-mono mt-1">
              ${currentMetrics.sma50.toLocaleString(undefined, { maximumFractionDigits: 1 })} / $
              {currentMetrics.sma200.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Moving avg</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">EMA 12 / 26</div>
            <div className="text-xs font-bold text-purple-300 font-mono mt-1">
              ${currentMetrics.ema12.toLocaleString(undefined, { maximumFractionDigits: 1 })} / $
              {currentMetrics.ema26.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Fast trend</div>
          </div>

          <div className="quant-card p-3">
            <div className="text-[10px] text-[#A39985] uppercase font-semibold">Max Drawdown</div>
            <div className="text-sm lg:text-base font-bold text-rose-400 font-mono mt-0.5">
              {(currentMetrics.maxDrawdown * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#A39985] font-mono mt-0.5">Peak decline</div>
          </div>
        </div>
      )}

      {/* Interactive Price Chart with SMA/EMA Overlays */}
      <div className="quant-card p-5">
        <PriceCandleChart assetId={activeAsset} candles={candles} height={380} />
      </div>

      {/* Underwater Drawdown */}
      <div className="quant-card p-5">
        <DrawdownChart height={200} />
      </div>
    </div>
  );
};
