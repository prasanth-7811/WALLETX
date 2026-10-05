import React from 'react';
import { useQuant } from '../context/QuantContext';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { RegimeTimelineChart } from '../components/charts/RegimeTimelineChart';
import { getHMMRegimeAnalysis } from '../data/hmmRegimeService';

const HMM_ASSETS = ['NVDA', 'BTC'];

const REGIME_COLORS: Record<string, string> = {
  'Bull Market':    'text-emerald-400 border-l-emerald-500',
  'Bear Market':    'text-rose-400 border-l-rose-500',
  'High Volatility':'text-amber-400 border-l-amber-500',
  'Low Volatility': 'text-teal-400 border-l-teal-500',
};

export const HMMModelPage: React.FC = () => {
  const { selectedAssets, setRegimeMode } = useQuant();

  // Always use HMM mode when on this page
  React.useEffect(() => {
    setRegimeMode('hmm');
  }, []);

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="quant-card p-5 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ML Model
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
            Gaussian HMM
          </span>
        </div>
        <h2 className="text-xl font-bold text-white font-display">HMM Market Regime Classifier</h2>
        <p className="text-xs text-[#A39985] mt-1">
          4-state Gaussian Hidden Markov Model trained on log returns, 20-day rolling volatility,
          and 20-day momentum. Unsupervised ML — no labels required.
        </p>
      </div>

      {/* Model Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="quant-card p-4 border border-[#222] bg-[#111]">
          <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2">Model</div>
          <div className="text-sm font-semibold text-white">GaussianHMM</div>
          <div className="text-[11px] text-[#A39985] mt-1">hmmlearn · Full covariance · 2000 iterations</div>
        </div>
        <div className="quant-card p-4 border border-[#222] bg-[#111]">
          <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2">Features</div>
          <div className="text-[11px] text-[#F5E6C8] font-mono space-y-0.5">
            <div>• Log returns (daily)</div>
            <div>• 20-day rolling volatility</div>
            <div>• 20-day price momentum</div>
          </div>
        </div>
        <div className="quant-card p-4 border border-[#222] bg-[#111]">
          <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2">State Mapping</div>
          <div className="text-[11px] text-[#F5E6C8] font-mono space-y-0.5">
            <div>• Highest vol → High Volatility</div>
            <div>• Lowest vol → Low Volatility</div>
            <div>• High return → Bull Market</div>
            <div>• Low return → Bear Market</div>
          </div>
        </div>
      </div>

      {/* Per-asset HMM results */}
      <div className="space-y-6">
        {HMM_ASSETS.map(assetId => {
          const analysis = getHMMRegimeAnalysis(assetId as any);
          if (!analysis) return null;

          const isSelected = selectedAssets.includes(assetId as any);

          return (
            <div key={assetId} className="space-y-3">
              {/* Regime breakdown stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(analysis.regimeBreakdown).map(([regime, pct]) => (
                  <div key={regime} className={`quant-card p-3 border-l-4 border border-[#222] bg-[#111] ${REGIME_COLORS[regime] || ''}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${REGIME_COLORS[regime]?.split(' ')[0]}`}>{regime}</div>
                    <div className="text-lg font-bold text-white mt-0.5">{pct}%</div>
                    <div className="text-[10px] text-[#A39985]">
                      {analysis.regimeReturns[regime as keyof typeof analysis.regimeReturns]?.daysCount} days
                    </div>
                  </div>
                ))}
              </div>

              {/* Current regime badge */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#A39985]">{assetId} current regime:</span>
                <span className="px-2 py-0.5 rounded-full font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
                  {analysis.currentRegime}
                </span>
                {!isSelected && (
                  <span className="text-[#A39985] text-[10px]">(asset not selected in header)</span>
                )}
              </div>

              {/* Timeline chart — only if asset is selected */}
              {isSelected && <RegimeTimelineChart analysis={analysis} />}
            </div>
          );
        })}
      </div>

      {/* Fallback note */}
      <div className="quant-card p-3.5 border border-[#222] bg-[#111] text-[11px] text-[#A39985]">
        <span className="text-[#FFD700] font-semibold">Note: </span>
        HMM is trained on NVDA and BTC only. GOLD, ETH, and SPY use rule-based classification on the Market Regimes page.
        To retrain with latest data run: <span className="font-mono text-[#F5E6C8]">python scripts/hmm_regime_classifier.py</span>
      </div>
    </div>
  );
};
