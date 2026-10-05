import React, { useState } from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import type { AssetId, StrategyType } from '../types';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { RobustnessHeatmap } from '../components/charts/RobustnessHeatmap';
import {
  HelpCircle,
  Layers,
} from 'lucide-react';

export const RobustnessPage: React.FC = () => {
  const {
    selectedAssets,
    strategyParams,
    setStrategyParams,
    robustnessResult,
  } = useQuant();

  const [selectedTarget, setSelectedTarget] = useState<AssetId | 'PORTFOLIO'>('PORTFOLIO');

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const isSingle = selectedAssets.length === 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="quant-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
              Parameter Sensitivity Engine
            </span>
            <span className="text-xs text-[#A39985] font-mono">
              Strategy: <strong className="text-[#F5E6C8]">{strategyParams.type.replace('_', ' ')}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Strategy Parameter Robustness & Overfitting Audit
          </h2>
          <p className="text-xs text-[#A39985] mt-0.5">
            2D sensitivity matrix testing stability neighborhoods across window lookbacks and threshold bounds.
          </p>
        </div>

        {/* Strategy Switcher */}
        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#222222] p-1.5 rounded-lg text-xs">
          <span className="text-[#A39985]">Strategy:</span>
          <select
            value={strategyParams.type}
            onChange={e => setStrategyParams(p => ({ ...p, type: e.target.value as StrategyType }))}
            className="bg-transparent font-semibold text-[#FFD700] focus:outline-none cursor-pointer"
          >
            <option value="SMA_CROSSOVER" className="bg-[#0A0A0A] text-[#F5E6C8]">SMA Crossover</option>
            <option value="EMA_TREND" className="bg-[#0A0A0A] text-[#F5E6C8]">EMA Trend</option>
            <option value="MOMENTUM" className="bg-[#0A0A0A] text-[#F5E6C8]">Momentum</option>
            <option value="MEAN_REVERSION" className="bg-[#0A0A0A] text-[#F5E6C8]">Mean Reversion</option>
          </select>
        </div>
      </div>

      {/* Target Asset Selector if Multi-Asset */}
      {!isSingle && (
        <div className="quant-card p-4 flex flex-wrap items-center justify-between gap-3 border border-[#D4AF37]/20 bg-[#111111]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              Sweep Target:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedTarget('PORTFOLIO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTarget === 'PORTFOLIO'
                    ? 'bg-[#D4AF37]/20 text-[#FFD700] border border-[#D4AF37]/40'
                    : 'bg-[#0A0A0A] text-[#A39985] border border-[#222222] hover:text-[#F5E6C8]'
                }`}
              >
                Multi-Asset Portfolio
              </button>

              {selectedAssets.map(assetId => {
                const info = ASSET_REGISTRY[assetId];
                const isActive = selectedTarget === assetId;
                return (
                  <button
                    key={assetId}
                    onClick={() => setSelectedTarget(assetId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#14120c] text-white border shadow-sm'
                        : 'bg-[#0A0A0A] text-[#A39985] border border-[#222222] hover:text-[#F5E6C8]'
                    }`}
                    style={{
                      borderColor: isActive ? info?.color : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: info?.color }}
                    />
                    <span>{info?.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs font-mono text-[#A39985]">
            Testing 36 Parameter Combinations (6×6 Matrix)
          </div>
        </div>
      )}

      {/* 2D Heatmap Component */}
      {robustnessResult && <RobustnessHeatmap robustness={robustnessResult} />}

      {/* Philosophy Callout */}
      <div className="quant-card p-5 border-l-4 border-l-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/20">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
              WALLETX Overfitting & Parameter Stability Philosophy
            </h4>
            <p className="text-xs text-[#F5E6C8] leading-relaxed">
              We deliberately do not label a single isolated parameter combination as "best". In quantitative research, single parameter peaks often suffer from data snooping and curve fitting. The true objective is verifying whether the strategy exhibits a <strong>broad plateau of profitability and positive Sharpe ratios</strong> across neighboring parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

