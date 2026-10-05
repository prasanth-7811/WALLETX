import React from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { PerformanceComparisonChart } from '../components/charts/PerformanceComparisonChart';
import { PriceCandleChart } from '../components/charts/PriceCandleChart';
import { DrawdownChart } from '../components/charts/DrawdownChart';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';
import {
  TrendingUp,
  Activity,
  ShieldAlert,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { selectedAssets, metricsMap, filteredCandles, setActiveTab } = useQuant();

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const isSingleAsset = selectedAssets.length === 1;
  const singleAssetId = selectedAssets[0];
  const singleMetrics = metricsMap[singleAssetId];
  const singleInfo = ASSET_REGISTRY[singleAssetId];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Hero in Black & Gold */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#141414] via-[#1A1813] to-[#141414] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#F5E6C8] border border-[#D4AF37]/35 shadow-sm">
              Quantitative Intelligence Dashboard
            </span>
            <span className="text-xs text-[#A39985]">
              {isSingleAsset ? 'Single Asset Deep Dive' : `Multi-Asset Portfolio Analysis (${selectedAssets.length} Assets)`}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            {isSingleAsset
              ? `${singleInfo?.name} Analysis Overview`
              : 'Multi-Asset Market & Quantitative Overview'}
          </h1>
          <p className="text-xs text-[#A39985] mt-1 max-w-2xl leading-relaxed">
            {isSingleAsset
              ? `Real-time statistical breakdown, return distribution, drawdown profile, and strategy performance for ${singleInfo?.name}.`
              : 'Dynamic multi-asset performance matrix, cross-asset correlation, risk attribution, and portfolio optimization metrics.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('strategy')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B8860B] hover:from-[#FFE89C] hover:via-[#E5C158] hover:to-[#D4AF37] text-[#0A0A0A] text-xs font-extrabold rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer active:scale-95 border border-[#FFDF79]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Launch Strategy Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1A14] hover:bg-[#2A261D] text-[#FFE89C] border border-[#D4AF37]/40 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:border-[#D4AF37]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI Research</span>
          </button>
        </div>
      </div>

      {/* SECTION A: SINGLE ASSET VIEW */}
      {isSingleAsset && singleMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="quant-card p-4">
              <div className="flex items-center justify-between text-[#A39985] text-xs mb-1">
                <span>Latest Spot Price</span>
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-xl lg:text-2xl font-bold text-white font-mono">
                ${singleMetrics.latestPrice.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs mt-1 font-mono">
                <span className={singleMetrics.dailyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {singleMetrics.dailyReturn >= 0 ? '+' : ''}
                  {(singleMetrics.dailyReturn * 100).toFixed(2)}%
                </span>
                <span className="text-[#8A8578]">1D Return</span>
              </div>
            </div>

            <div className="quant-card p-4">
              <div className="flex items-center justify-between text-[#A39985] text-xs mb-1">
                <span>Total Return</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl lg:text-2xl font-bold text-emerald-400 font-mono">
                {singleMetrics.totalReturn >= 0 ? '+' : ''}
                {(singleMetrics.totalReturn * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-[#A39985] mt-1 font-mono">
                CAGR: <strong className="text-[#D4AF37]">{(singleMetrics.cagr * 100).toFixed(2)}%</strong>
              </div>
            </div>

            <div className="quant-card p-4">
              <div className="flex items-center justify-between text-[#A39985] text-xs mb-1">
                <span>Annualized Volatility</span>
                <Activity className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="text-xl lg:text-2xl font-bold text-[#F59E0B] font-mono">
                {(singleMetrics.volatility * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-[#A39985] mt-1 font-mono">
                Sharpe: <strong className="text-[#D4AF37]">{singleMetrics.sharpeRatio.toFixed(2)}</strong> (Rf 4.5%)
              </div>
            </div>

            <div className="quant-card p-4">
              <div className="flex items-center justify-between text-[#A39985] text-xs mb-1">
                <span>Maximum Drawdown</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl lg:text-2xl font-bold text-rose-400 font-mono">
                {(singleMetrics.maxDrawdown * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-[#A39985] mt-1 font-mono">
                Sortino: <strong className="text-slate-300">{singleMetrics.sortinoRatio.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="quant-card p-5">
            <PriceCandleChart assetId={singleAssetId} candles={filteredCandles[singleAssetId] || []} height={340} />
          </div>

          <div className="quant-card p-5">
            <DrawdownChart height={220} />
          </div>
        </div>
      )}

      {/* SECTION B: MULTIPLE ASSETS VIEW */}
      {!isSingleAsset && (
        <div className="space-y-6">
          <div className="quant-card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D4AF37]/15">
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Selected Assets Quantitative Comparison
                </h3>
                <p className="text-xs text-[#A39985]">
                  Dynamic cross-asset statistical benchmarks
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                {selectedAssets.length} Active Columns
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#D4AF37]/80 font-mono text-[11px] uppercase">
                    <th className="py-2.5 text-left font-semibold">Financial Metric</th>
                    {selectedAssets.map(id => {
                      const info = ASSET_REGISTRY[id];
                      return (
                        <th key={id} className="py-2.5 px-4 text-right font-semibold text-slate-200">
                          <span>{info?.name}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222] font-mono">
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Latest Price</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right font-bold text-white">
                        ${metricsMap[id]?.latestPrice.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Total Return</td>
                    {selectedAssets.map(id => {
                      const ret = metricsMap[id]?.totalReturn || 0;
                      return (
                        <td
                          key={id}
                          className={`py-3 px-4 text-right font-bold ${
                            ret >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ret >= 0 ? '+' : ''}
                          {(ret * 100).toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Annualized Return (CAGR)</td>
                    {selectedAssets.map(id => {
                      const cagr = metricsMap[id]?.cagr || 0;
                      return (
                        <td
                          key={id}
                          className={`py-3 px-4 text-right font-semibold ${
                            cagr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {cagr >= 0 ? '+' : ''}
                          {(cagr * 100).toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Annualized Volatility</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right text-[#F59E0B] font-semibold">
                        {((metricsMap[id]?.volatility || 0) * 100).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Sharpe Ratio (Rf 4.5%)</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right font-bold text-[#D4AF37]">
                        {metricsMap[id]?.sharpeRatio.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Sortino Ratio</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right text-slate-300">
                        {metricsMap[id]?.sortinoRatio.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Maximum Drawdown</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right font-bold text-rose-400">
                        {((metricsMap[id]?.maxDrawdown || 0) * 100).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-3 font-sans font-medium text-slate-300">Daily Win Rate</td>
                    {selectedAssets.map(id => (
                      <td key={id} className="py-3 px-4 text-right text-slate-300">
                        {((metricsMap[id]?.winRate || 0) * 100).toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 quant-card p-5">
              <PerformanceComparisonChart height={320} />
            </div>

            <div className="quant-card p-5 flex flex-col justify-between">
              <CorrelationHeatmap />
            </div>
          </div>

          <div className="quant-card p-5">
            <DrawdownChart height={220} />
          </div>
        </div>
      )}
    </div>
  );
};
