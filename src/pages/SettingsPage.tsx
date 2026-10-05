import React, { useState } from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY, AVAILABLE_ASSETS } from '../data/assets';
import { PROJECT_CONFIG } from '../config/apiConfig';
import {
  Settings,
  Percent,
  DollarSign,
  Save,
  CheckCircle2,
  Database,
  Bot,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    riskFreeRate,
    setRiskFreeRate,
    defaultCapital,
    setDefaultCapital,
    strategyParams,
    setStrategyParams,
    selectedAssets,
    toggleAsset,
  } = useQuant();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [tempRf, setTempRf] = useState(riskFreeRate);
  const [tempCap, setTempCap] = useState(defaultCapital);
  const [tempFee, setTempFee] = useState(strategyParams.transactionCostBps);
  const [tempSlippage, setTempSlippage] = useState(strategyParams.slippageBps);

  const handleSaveSettings = () => {
    setRiskFreeRate(tempRf);
    setDefaultCapital(tempCap);
    setStrategyParams(prev => ({
      ...prev,
      transactionCostBps: tempFee,
      slippageBps: tempSlippage,
      initialCapital: tempCap,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="quant-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30 flex items-center gap-1">
              <Settings className="w-3 h-3 text-[#FFD700]" />
              Platform Configuration
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            WALLETX System & Quantitative Settings
          </h2>
          <p className="text-xs text-[#A39985] mt-0.5">
            Configure risk-free benchmarking rates, default backtesting capital, transaction cost models, and asset universe.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFD700] hover:brightness-110 text-black text-xs font-bold rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration parameters updated and applied across all quantitative engines.</span>
        </div>
      )}

      {/* Pre-Configured Engine Statuses (Keys stored inside project folder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alpha Vantage Data Provider Status */}
        <div className="quant-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Alpha Vantage Market Feed
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Project Configured
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Market data feed is stored and configured directly in the project files. All daily OHLCV series for Gold, Bitcoin, NVIDIA, and universe assets are processed from official Alpha Vantage APIs and LBMA records.
          </p>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Feed Provider:</span>
              <span className="text-slate-200">Alpha Vantage Daily Series</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active & Synchronized
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Coverage:</span>
              <span className="text-slate-300">1,005+ Daily Trading Observations</span>
            </div>
          </div>
        </div>

        {/* Featherless AI Research Engine Status */}
        <div className="quant-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Featherless AI Research Assistant
              </h3>
            </div>
            <span className="text-[11px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Project Configured
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            AI quantitative assistant is connected directly via the project configuration using Featherless AI's OpenAI-compatible endpoint with model <code className="text-purple-300 font-mono">Qwen/Qwen2.5-7B-Instruct</code>.
          </p>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Engine:</span>
              <span className="text-slate-200">Featherless AI High-Speed API</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Model Architecture:</span>
              <span className="text-purple-300">Qwen 2.5 7B Instruct</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Reasoning Grounding:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Strict JSON Ground Truth
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial & Backtesting Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Financial Benchmarks */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-white/10 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Financial & Benchmark Parameters
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Annualized Risk-Free Rate ($R_f$)
            </label>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Used as the hurdle rate in Sharpe and Sortino ratio calculations (default: 4.5% US Treasury Bill yield).
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
              <Percent className="w-4 h-4 text-sky-400" />
              <input
                type="number"
                step="0.005"
                min="0"
                max="0.20"
                value={tempRf}
                onChange={e => setTempRf(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-sky-300 focus:outline-none w-full"
              />
              <span className="text-slate-500 font-mono">({(tempRf * 100).toFixed(2)}%)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Default Simulation Capital ($)
            </label>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Base initial portfolio balance used for strategy backtesting simulations.
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <input
                type="number"
                step="5000"
                min="1000"
                value={tempCap}
                onChange={e => setTempCap(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-emerald-300 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Execution & Slippage Friction Models */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-white/10 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Execution Friction & Realistic Fees
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Transaction Cost (Basis Points)
            </label>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Brokerage commission and exchange fees applied per trade (10 bps = 0.10%).
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
              <input
                type="number"
                min="0"
                max="100"
                value={tempFee}
                onChange={e => setTempFee(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-slate-200 focus:outline-none w-full"
              />
              <span className="text-slate-500 font-mono">bps ({(tempFee / 100).toFixed(2)}%)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Execution Slippage (Basis Points)
            </label>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Simulated market impact and bid-ask spread penalty on each order execution.
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
              <input
                type="number"
                min="0"
                max="100"
                value={tempSlippage}
                onChange={e => setTempSlippage(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-slate-200 focus:outline-none w-full"
              />
              <span className="text-slate-500 font-mono">bps ({(tempSlippage / 100).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extensible Asset Universe Registry */}
      <div className="quant-card p-5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-white/10 mb-4">
          Extensible Asset Universe Registry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_ASSETS.map(assetId => {
            const info = ASSET_REGISTRY[assetId];
            const isSelected = selectedAssets.includes(assetId);

            return (
              <div
                key={assetId}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: info?.color }}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{info?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {info?.category} • {info?.symbol}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleAsset(assetId)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? 'Active ✓' : '+ Enable'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
