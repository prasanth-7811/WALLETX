import React from 'react';
import { useQuant } from '../context/QuantContext';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { RegimeTimelineChart } from '../components/charts/RegimeTimelineChart';

const HMM_ASSETS = ['NVDA', 'BTC'];

export const MarketRegimesPage: React.FC = () => {
  const { selectedAssets, regimesMap, regimeMode, setRegimeMode } = useQuant();

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const isHMM = regimeMode === 'hmm';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="quant-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
              Macro Regime Classifier
            </span>
            <span className="text-xs text-[#A39985] font-mono">
              {selectedAssets.length} Selected Assets
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            {isHMM ? 'HMM Machine Learning Regime Modeling' : 'Rule-Based Market Regime Modeling'}
          </h2>
          <p className="text-xs text-[#A39985] mt-0.5">
            {isHMM
              ? 'Gaussian HMM trained on log returns, rolling volatility, and 20D momentum. Available for NVDA and BTC.'
              : 'Transparent four-state market segmentation: Bull, Bear, High Volatility, and Low Volatility.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setRegimeMode('rule')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isHMM ? 'bg-[#D4AF37] text-black' : 'text-[#A39985] hover:text-white'
            }`}
          >
            Rule-Based
          </button>
          <button
            onClick={() => setRegimeMode('hmm')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isHMM ? 'bg-[#D4AF37] text-black' : 'text-[#A39985] hover:text-white'
            }`}
          >
            HMM Model
          </button>
        </div>
      </div>

      {/* Rule Definition Reference Cards — rule-based mode only */}
      {!isHMM && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="quant-card p-3.5 border-l-4 border-l-emerald-500 border border-[#222222] bg-[#111111]">
            <div className="text-xs font-bold text-emerald-400 uppercase">Bull Market</div>
            <div className="text-[11px] text-[#F5E6C8] font-mono mt-1">
              Price &ge; SMA 200 &amp; 20D Momentum &gt; 0
            </div>
            <p className="text-[10px] text-[#A39985] mt-1">
              Sustained positive trend regime with institutional momentum.
            </p>
          </div>
          <div className="quant-card p-3.5 border-l-4 border-l-rose-500 border border-[#222222] bg-[#111111]">
            <div className="text-xs font-bold text-rose-400 uppercase">Bear Market</div>
            <div className="text-[11px] text-[#F5E6C8] font-mono mt-1">
              Price &lt; SMA 200 &amp; 20D Momentum &lt; 0
            </div>
            <p className="text-[10px] text-[#A39985] mt-1">
              Macro downtrend regime with capital flight and weakness.
            </p>
          </div>
          <div className="quant-card p-3.5 border-l-4 border-l-amber-500 border border-[#222222] bg-[#111111]">
            <div className="text-xs font-bold text-amber-400 uppercase">High Volatility</div>
            <div className="text-[11px] text-[#F5E6C8] font-mono mt-1">
              Realized 20D Vol &ge; 75th Percentile
            </div>
            <p className="text-[10px] text-[#A39985] mt-1">
              Turbulent macro stress, large directional swings, tail risk.
            </p>
          </div>
          <div className="quant-card p-3.5 border-l-4 border-l-teal-500 border border-[#222222] bg-[#111111]">
            <div className="text-xs font-bold text-teal-400 uppercase">Low Volatility</div>
            <div className="text-[11px] text-[#F5E6C8] font-mono mt-1">
              Realized 20D Vol &le; 25th Percentile
            </div>
            <p className="text-[10px] text-[#A39985] mt-1">
              Consolidation, ranging price action, and trend compression.
            </p>
          </div>
        </div>
      )}

      {/* HMM info banner */}
      {isHMM && (
        <div className="quant-card p-3.5 border border-[#D4AF37]/20 bg-[#111111] text-xs text-[#A39985]">
          <span className="text-[#FFD700] font-semibold">HMM Model — </span>
          4-state Gaussian HMM trained on 3 features: log returns, 20-day rolling volatility, 20-day momentum.
          States are mapped by volatility extremes first (High / Low Vol), then by mean return (Bull / Bear).
          GOLD, ETH, and SPY fall back to rule-based classification automatically.
        </div>
      )}

      {/* Regime Charts */}
      <div className="space-y-6">
        {selectedAssets.map(assetId => {
          const analysis = regimesMap[assetId];
          if (!analysis) return null;
          const isFallback = isHMM && !HMM_ASSETS.includes(assetId);
          return (
            <div key={assetId}>
              {isFallback && (
                <div className="mb-2 px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-[#333] text-[11px] text-[#A39985]">
                  {assetId} — HMM not available, showing rule-based classification.
                </div>
              )}
              <RegimeTimelineChart analysis={analysis} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
