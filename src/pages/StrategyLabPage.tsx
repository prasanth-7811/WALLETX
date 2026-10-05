import React, { useState } from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import type { AssetId, StrategyType } from '../types';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Percent,
  DollarSign,
  TrendingUp,
  Zap,
  Activity,
  RotateCcw,
} from 'lucide-react';

export const StrategyLabPage: React.FC = () => {
  const {
    selectedAssets,
    strategyParams,
    setStrategyParams,
    backtestMode,
    setBacktestMode,
    targetSingleAsset,
    setTargetSingleAsset,
    portfolioWeights,
    setWeight,
    normalizeWeights,
    weightsValid,
    runBacktestSimulation,
    setActiveTab,
  } = useQuant();

  const [validationError, setValidationError] = useState<string | null>(null);

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const isSingleAsset = selectedAssets.length === 1;

  // Handle Strategy Parameter Changes
  const handleStrategyTypeChange = (type: StrategyType) => {
    setStrategyParams(prev => ({
      ...prev,
      type,
    }));
  };

  const handleRunBacktest = () => {
    if (!isSingleAsset && backtestMode === 'PORTFOLIO' && !weightsValid) {
      setValidationError('Portfolio weights must sum exactly to 100%. Click "Auto Equalize" or adjust sliders.');
      return;
    }
    setValidationError(null);
    runBacktestSimulation();
    setActiveTab('backtest');
  };

  const STRATEGIES: { id: StrategyType; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'SMA_CROSSOVER',
      name: 'SMA Crossover',
      desc: 'Classic golden cross / death cross trend-following model using short and long Simple Moving Averages.',
      icon: <TrendingUp className="w-4 h-4 text-[#D4AF37]" />,
    },
    {
      id: 'EMA_TREND',
      name: 'EMA Trend Confirmation',
      desc: 'Fast-response Exponential Moving Average trend system designed for volatility breakouts.',
      icon: <Zap className="w-4 h-4 text-[#D4AF37]" />,
    },
    {
      id: 'MOMENTUM',
      name: 'Cross-Sectional Momentum',
      desc: 'Quant momentum system entering when N-day rate of change exceeds hurdle rate.',
      icon: <Activity className="w-4 h-4 text-[#D4AF37]" />,
    },
    {
      id: 'MEAN_REVERSION',
      name: 'Mean Reversion (Bollinger)',
      desc: 'Statistical arbitrage model buying oversold standard deviation dips and taking profit at mean.',
      icon: <RotateCcw className="w-4 h-4 text-[#D4AF37]" />,
    },
  ];

  // Calculate current portfolio weights total
  const currentTotalWeight = selectedAssets.reduce((sum, a) => sum + (portfolioWeights[a] || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="quant-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
              Strategy Studio
            </span>
            <span className="text-xs text-[#A39985] font-mono">
              Universe: [{selectedAssets.join(', ')}]
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Strategy Lab & Parameter Formulation
          </h2>
          <p className="text-xs text-[#A39985] mt-0.5">
            Configure quantitative logic, capital allocation weights, execution sizing, and transaction cost frictions.
          </p>
        </div>

        {/* Big Run Button */}
        <button
          onClick={handleRunBacktest}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] hover:brightness-110 text-black text-sm font-bold rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>RUN BACKTEST</span>
        </button>
      </div>

      {/* Validation Warning if Weights do not total 100% */}
      {validationError && (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={normalizeWeights}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded border border-rose-500/30 transition-colors"
          >
            Auto Equalize to 100%
          </button>
        </div>
      )}

      {/* 2-Column Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Strategy Selection & Model Parameters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Strategy Selection Cards */}
          <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
            <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              1. Select Quantitative Strategy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRATEGIES.map(st => {
                const isSelected = strategyParams.type === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStrategyTypeChange(st.id)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-md shadow-[#D4AF37]/10'
                        : 'bg-[#0A0A0A] border-[#222222] hover:border-[#D4AF37]/40 hover:bg-[#14120c]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {st.icon}
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#FFD700]' : 'text-[#F5E6C8]'}`}>
                          {st.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />}
                    </div>
                    <p className="text-xs text-[#A39985] leading-relaxed">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Specific Tunable Parameters */}
          <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
            <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
              2. Quantitative Parameter Tuning
            </h3>

            {/* SMA Crossover Params */}
            {strategyParams.type === 'SMA_CROSSOVER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Fast SMA Window</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.shortWindow || 20} days</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={strategyParams.shortWindow || 20}
                    onChange={e => setStrategyParams(p => ({ ...p, shortWindow: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A39985] font-mono mt-1">
                    <span>5d</span>
                    <span>20d (Default)</span>
                    <span>50d</span>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Slow SMA Window</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.longWindow || 50} days</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={strategyParams.longWindow || 50}
                    onChange={e => setStrategyParams(p => ({ ...p, longWindow: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#A39985] font-mono mt-1">
                    <span>20d</span>
                    <span>50d (Default)</span>
                    <span>200d</span>
                  </div>
                </div>
              </div>
            )}

            {/* EMA Trend Params */}
            {strategyParams.type === 'EMA_TREND' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Fast EMA (e.g. 12)</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.shortWindow || 12} days</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={strategyParams.shortWindow || 12}
                    onChange={e => setStrategyParams(p => ({ ...p, shortWindow: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Slow EMA (e.g. 26)</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.longWindow || 26} days</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={strategyParams.longWindow || 26}
                    onChange={e => setStrategyParams(p => ({ ...p, longWindow: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Momentum Params */}
            {strategyParams.type === 'MOMENTUM' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Lookback Period</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.momentumLookback || 20} days</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={strategyParams.momentumLookback || 20}
                    onChange={e => setStrategyParams(p => ({ ...p, momentumLookback: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Hurdle Threshold</span>
                    <span className="font-mono text-[#FFD700] font-bold">+{strategyParams.momentumThreshold || 1.5}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={strategyParams.momentumThreshold || 1.5}
                    onChange={e => setStrategyParams(p => ({ ...p, momentumThreshold: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Mean Reversion Params */}
            {strategyParams.type === 'MEAN_REVERSION' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Z-Score Window</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.mrWindow || 20} days</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={strategyParams.mrWindow || 20}
                    onChange={e => setStrategyParams(p => ({ ...p, mrWindow: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#F5E6C8] font-medium">Band Std Deviation (σ)</span>
                    <span className="font-mono text-[#FFD700] font-bold">{strategyParams.mrStdDev || 2.0} σ</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.5"
                    step="0.1"
                    value={strategyParams.mrStdDev || 2.0}
                    onChange={e => setStrategyParams(p => ({ ...p, mrStdDev: Number(e.target.value) }))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Execution & Friction Controls */}
          <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
            <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">
              3. Execution & Transaction Friction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222]">
                <div className="text-xs text-[#A39985] mb-1">Initial Capital ($)</div>
                <div className="flex items-center gap-1.5 font-mono text-sm text-[#F5E6C8]">
                  <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <input
                    type="number"
                    step="5000"
                    value={strategyParams.initialCapital || 100000}
                    onChange={e => setStrategyParams(p => ({ ...p, initialCapital: Number(e.target.value) }))}
                    className="bg-transparent font-bold focus:outline-none w-full text-white"
                  />
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222]">
                <div className="text-xs text-[#A39985] mb-1">Position Size (% Capital)</div>
                <div className="flex items-center gap-1.5 font-mono text-sm text-[#F5E6C8]">
                  <Percent className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="10"
                    value={Math.round((strategyParams.positionSize || 1.0) * 100)}
                    onChange={e => setStrategyParams(p => ({ ...p, positionSize: Number(e.target.value) / 100 }))}
                    className="bg-transparent font-bold focus:outline-none w-full text-white"
                  />
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222]">
                <div className="text-xs text-[#A39985] mb-1">Transaction Fee (bps)</div>
                <div className="flex items-center gap-1.5 font-mono text-sm text-[#FFD700]">
                  <span className="text-[#A39985]">bps</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={strategyParams.transactionCostBps || 10}
                    onChange={e => setStrategyParams(p => ({ ...p, transactionCostBps: Number(e.target.value) }))}
                    className="bg-transparent font-bold focus:outline-none w-full text-white"
                  />
                  <span className="text-[10px] text-[#A39985] font-sans">({((strategyParams.transactionCostBps || 10) / 100).toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Asset Mode & Allocation Weights */}
        <div className="space-y-6">
          
          {/* Target Mode Selector */}
          <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
            <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
              Target Asset / Portfolio
            </h3>

            {isSingleAsset ? (
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#222222] text-xs">
                <div className="text-[#A39985]">Single Target Asset:</div>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ASSET_REGISTRY[selectedAssets[0]]?.color }}
                  />
                  <span>{ASSET_REGISTRY[selectedAssets[0]]?.name}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setBacktestMode('PORTFOLIO')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    backtestMode === 'PORTFOLIO'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#FFD700] font-semibold'
                      : 'bg-[#0A0A0A] border-[#222222] text-[#F5E6C8] hover:bg-[#14120c] hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    <span>Multi-Asset Portfolio Backtest</span>
                  </div>
                  {backtestMode === 'PORTFOLIO' && <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />}
                </button>

                <button
                  onClick={() => setBacktestMode('INDIVIDUAL')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    backtestMode === 'INDIVIDUAL'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#FFD700] font-semibold'
                      : 'bg-[#0A0A0A] border-[#222222] text-[#F5E6C8] hover:bg-[#14120c] hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#A39985]" />
                    <span>Individual Asset Backtest</span>
                  </div>
                  {backtestMode === 'INDIVIDUAL' && <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />}
                </button>

                {backtestMode === 'INDIVIDUAL' && (
                  <div className="pt-2">
                    <label className="text-[11px] text-[#A39985] uppercase font-semibold">Choose Asset:</label>
                    <select
                      value={targetSingleAsset}
                      onChange={e => setTargetSingleAsset(e.target.value as AssetId)}
                      className="mt-1 w-full bg-[#0A0A0A] border border-[#222222] p-2.5 rounded-lg text-xs font-semibold text-[#F5E6C8] focus:border-[#D4AF37] focus:outline-none"
                    >
                      {selectedAssets.map(id => (
                        <option key={id} value={id}>
                          {ASSET_REGISTRY[id]?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multi-Asset Portfolio Allocation Sliders */}
          {!isSingleAsset && backtestMode === 'PORTFOLIO' && (
            <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    Portfolio Allocation (%)
                  </h3>
                  <div className="text-[11px] font-mono mt-0.5 text-[#A39985]">
                    Total:{' '}
                    <strong
                      className={
                        weightsValid ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      {Math.round(currentTotalWeight * 100)}%
                    </strong>{' '}
                    / 100%
                  </div>
                </div>

                <button
                  onClick={normalizeWeights}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#0A0A0A] hover:bg-[#14120c] text-[#FFD700] border border-[#D4AF37]/30 transition-colors cursor-pointer"
                  title="Equally distribute weights across selected assets"
                >
                  Auto Equalize
                </button>
              </div>

              <div className="space-y-4">
                {selectedAssets.map(assetId => {
                  const info = ASSET_REGISTRY[assetId];
                  const w = portfolioWeights[assetId] || 0;
                  const pct = Math.round(w * 100);

                  return (
                    <div key={assetId} className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222222]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: info?.color }}
                          />
                          <span className="font-semibold text-[#F5E6C8]">{info?.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#FFD700]">{pct}%</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={pct}
                        onChange={e => setWeight(assetId, Number(e.target.value) / 100)}
                        className="w-full accent-[#D4AF37] cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between text-xs">
                <span className="text-[#A39985]">Allocation Status:</span>
                {weightsValid ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VALIDATED (100%)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> INVALID (Must = 100%)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Launch Card */}
          <div className="quant-card p-5 bg-gradient-to-b from-[#14120c] to-[#0A0A0A] border border-[#D4AF37]/30">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
              Ready to Simulate
            </h4>
            <p className="text-xs text-[#A39985] mb-4 leading-relaxed">
              Executes the deterministic quant backtest simulation using real historical OHLCV data with slippage and fee accounting.
            </p>
            <button
              onClick={handleRunBacktest}
              className="w-full py-3 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN QUANT BACKTEST</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

