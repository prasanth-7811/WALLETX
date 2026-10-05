import React from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import { EquityCurveChart } from '../components/charts/EquityCurveChart';
import { TradeBlotter } from '../components/TradeBlotter';
import {
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const BacktestingPage: React.FC = () => {
  const { selectedAssets, backtestResult, setActiveTab } = useQuant();

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  if (!backtestResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center quant-card min-h-[50vh] border border-[#D4AF37]/20 bg-[#111111]">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#FFD700] mb-4">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-display">
          No Backtest Executed Yet
        </h3>
        <p className="text-xs text-[#A39985] max-w-md mb-6">
          Formulate your quantitative strategy rules and parameter thresholds in the Strategy Lab to run a multi-asset simulation.
        </p>
        <button
          onClick={() => setActiveTab('strategy')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] hover:brightness-110 text-black text-xs font-bold rounded-lg shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          Open Strategy Lab
        </button>
      </div>
    );
  }

  const bt = backtestResult;
  const isMulti = bt.isMultiAsset;
  const isOutperforming = bt.totalReturn >= bt.benchmarkTotalReturn;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Backtest Summary Hero */}
      <div className="quant-card p-6 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111] border border-[#D4AF37]/25">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
                Backtest Simulation Report
              </span>
              <span className="text-xs text-[#A39985] font-mono">
                Strategy: <strong className="text-[#F5E6C8]">{bt.params.type.replace('_', ' ')}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white font-display">
              {isMulti
                ? `Multi-Asset Portfolio Backtest (${bt.selectedAssets.length} Assets)`
                : `Single-Asset Backtest: ${ASSET_REGISTRY[bt.selectedAssets[0]]?.name}`}
            </h2>

            {/* Allocation breakdown subtitle */}
            {isMulti && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#F5E6C8] font-mono">
                <span className="text-[#A39985]">Allocations:</span>
                {bt.selectedAssets.map(a => (
                  <span
                    key={a}
                    className="px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#222222] text-[#F5E6C8]"
                  >
                    {a}: <strong className="text-[#FFD700]">{Math.round((bt.weights[a] || 0) * 100)}%</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('strategy')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] hover:bg-[#14120c] text-[#F5E6C8] text-xs font-semibold rounded-lg border border-[#D4AF37]/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Modify Strategy</span>
            </button>
            <button
              onClick={() => setActiveTab('robustness')}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#FFD700] border border-[#D4AF37]/35 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Robustness</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Initial Capital</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            ${bt.initialCapital.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">Starting equity</div>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Final Portfolio Value</div>
          <div className="text-lg font-bold text-[#FFD700] font-mono mt-1">
            ${bt.finalValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">Ending balance</div>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Total Net Return</div>
          <div
            className={`text-lg font-bold font-mono mt-1 ${
              bt.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {bt.totalReturn >= 0 ? '+' : ''}
            {(bt.totalReturn * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">
            CAGR: {(bt.cagr * 100).toFixed(1)}%
          </div>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Annualized Sharpe</div>
          <div className="text-lg font-bold text-[#FFD700] font-mono mt-1">
            {bt.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">
            Sortino: {bt.sortinoRatio.toFixed(2)}
          </div>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Max Drawdown</div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-1">
            {(bt.maxDrawdown * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">Peak decline</div>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/15 bg-[#111111]">
          <div className="text-[10px] text-[#A39985] uppercase font-semibold">Trade Statistics</div>
          <div className="text-lg font-bold text-[#F5E6C8] font-mono mt-1">
            {bt.totalTrades} <span className="text-xs font-normal text-[#A39985]">orders</span>
          </div>
          <div className="text-[10px] text-[#A39985] mt-0.5">
            Win: {(bt.winRate * 100).toFixed(0)}% | Fees: ${bt.totalFeesPaid.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Strategy vs Buy & Hold Benchmark Attribution */}
      <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
          <div>
            <h3 className="text-sm font-semibold text-[#D4AF37]">
              Strategy vs Buy-and-Hold Benchmark Attribution
            </h3>
            <p className="text-xs text-[#A39985]">
              Direct comparison using identical initial capital and date range
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded font-mono border ${
                isOutperforming
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              Excess Return: {isOutperforming ? '+' : ''}
              {((bt.totalReturn - bt.benchmarkTotalReturn) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#222222] text-[#D4AF37] font-mono text-[11px]">
                <th className="py-2.5 text-left">Portfolio Configuration</th>
                <th className="py-2.5 text-right">Initial Capital</th>
                <th className="py-2.5 text-right">Final Value</th>
                <th className="py-2.5 text-right">Total Return</th>
                <th className="py-2.5 text-right">CAGR</th>
                <th className="py-2.5 text-right">Sharpe Ratio</th>
                <th className="py-2.5 text-right">Max Drawdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              <tr className="hover:bg-[#14120c] bg-[#D4AF37]/5">
                <td className="py-3 font-sans font-semibold text-[#FFD700] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                  <span>WALLETX Strategy ({bt.params.type.replace('_', ' ')})</span>
                </td>
                <td className="py-3 text-right text-[#F5E6C8]">${bt.initialCapital.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-white">${bt.finalValue.toLocaleString()}</td>
                <td className={`py-3 text-right font-bold ${bt.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {bt.totalReturn >= 0 ? '+' : ''}{(bt.totalReturn * 100).toFixed(2)}%
                </td>
                <td className="py-3 text-right text-[#F5E6C8]">{(bt.cagr * 100).toFixed(2)}%</td>
                <td className="py-3 text-right font-bold text-[#FFD700]">{bt.sharpeRatio.toFixed(2)}</td>
                <td className="py-3 text-right font-bold text-rose-400">{(bt.maxDrawdown * 100).toFixed(2)}%</td>
              </tr>
              <tr className="hover:bg-[#14120c]">
                <td className="py-3 font-sans font-medium text-[#A39985] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Buy-and-Hold Benchmark Portfolio</span>
                </td>
                <td className="py-3 text-right text-[#A39985]">${bt.initialCapital.toLocaleString()}</td>
                <td className="py-3 text-right font-bold text-[#F5E6C8]">${bt.benchmarkFinalValue.toLocaleString()}</td>
                <td className={`py-3 text-right font-semibold ${bt.benchmarkTotalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {bt.benchmarkTotalReturn >= 0 ? '+' : ''}{(bt.benchmarkTotalReturn * 100).toFixed(2)}%
                </td>
                <td className="py-3 text-right text-[#A39985]">{(bt.benchmarkCagr * 100).toFixed(2)}%</td>
                <td className="py-3 text-right text-[#F5E6C8]">{bt.benchmarkSharpe.toFixed(2)}</td>
                <td className="py-3 text-right text-rose-400/80">{(bt.benchmarkMaxDrawdown * 100).toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Equity Curve Chart & Portfolio Drawdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
          <EquityCurveChart backtest={bt} height={320} />
        </div>

        <div className="quant-card p-5 flex flex-col justify-between border border-[#D4AF37]/20 bg-[#111111]">
          <div>
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              Multi-Asset Asset Contribution
            </h4>

            <div className="space-y-3 font-mono text-xs">
              {bt.selectedAssets.map(assetId => {
                const info = ASSET_REGISTRY[assetId];
                const breakdown = bt.assetBreakdown[assetId];
                if (!breakdown) return null;

                return (
                  <div key={assetId} className="p-3 bg-[#0A0A0A] rounded-xl border border-[#222222]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info?.color }} />
                        <span className="font-sans font-semibold text-[#F5E6C8]">{info?.name}</span>
                      </div>
                      <span className="font-bold text-white">${breakdown.finalValue.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[#A39985] mt-1">
                      <span>Asset Return: <strong className={breakdown.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{breakdown.totalReturn >= 0 ? '+' : ''}{(breakdown.totalReturn * 100).toFixed(1)}%</strong></span>
                      <span>Contribution: <strong className="text-[#FFD700]">+{((breakdown.contribution || 0) * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#222222] flex justify-between text-[11px] text-[#A39985] font-mono">
            <span>Win Rate: <strong className="text-[#F5E6C8]">{(bt.winRate * 100).toFixed(1)}%</strong></span>
            <span>Profit Factor: <strong className="text-[#FFD700]">{bt.profitFactor}</strong></span>
          </div>
        </div>
      </div>

      {/* Execution Trade Blotter Table */}
      <TradeBlotter trades={bt.trades} />
    </div>
  );
};

