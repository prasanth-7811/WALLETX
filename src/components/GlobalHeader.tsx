import React from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import { AssetId } from '../types';
import {
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Play,
  Info,
  ChevronDown,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

export const GlobalHeader: React.FC = () => {
  const {
    selectedAssets,
    toggleAsset,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    applyAnalysis,
    actualStartDate,
    actualEndDate,
    isDateAdjusted,
    allDates,
    liveStatus,
    refreshLiveData,
  } = useQuant();

  const [showUniverseMenu, setShowUniverseMenu] = React.useState(false);
  const [clock, setClock] = React.useState(() => new Date().toLocaleTimeString());

  React.useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 lg:px-6 py-3 shadow-lg">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        
        {/* Left: Global Asset Selection Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F5E6C8] bg-[#D4AF37]/15 px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/35 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>ANALYSE ASSETS</span>
            <span className="ml-1 px-1.5 py-0.2 bg-[#D4AF37]/25 text-[#FFE89C] rounded text-[10px] font-mono font-bold">
              {selectedAssets.length} Active
            </span>
          </div>

          {/* Asset Checkbox Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(['GOLD', 'BTC', 'NVDA'] as AssetId[]).map(assetId => {
              const info = ASSET_REGISTRY[assetId];
              const isSelected = selectedAssets.includes(assetId);

              return (
                <button
                  key={assetId}
                  onClick={() => toggleAsset(assetId)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#181818] text-white border shadow-md'
                      : 'bg-[#121212] text-[#A39985] border border-white/10 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                  style={{
                    borderColor: isSelected ? info.color : undefined,
                    boxShadow: isSelected ? `0 0 14px -2px ${info.color}45` : undefined
                  }}
                  title={info.description}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5" style={{ color: info.color }} />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="font-semibold">{info.name.split(' ')[0]}</span>
                </button>
              );
            })}

            {/* Additional Universe Dropdown (ETH, SPY) */}
            <div className="relative">
              <button
                onClick={() => setShowUniverseMenu(!showUniverseMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#141414] text-[#C5BAA5] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:text-white transition-colors cursor-pointer"
                title="Expand Asset Universe"
              >
                <span>+ More Assets</span>
                <ChevronDown className="w-3 h-3 text-[#A39985]" />
              </button>

              {showUniverseMenu && (
                <div className="absolute left-0 mt-1.5 w-52 bg-[#121212] border border-[#D4AF37]/30 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-semibold text-[#D4AF37] px-2 py-1 uppercase tracking-wider">
                    Extended Universe
                  </div>
                  {(['ETH', 'SPY'] as AssetId[]).map(assetId => {
                    const info = ASSET_REGISTRY[assetId];
                    const isSelected = selectedAssets.includes(assetId);
                    return (
                      <button
                        key={assetId}
                        onClick={() => {
                          toggleAsset(assetId);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-[#1C1C1C] transition-colors text-slate-200 cursor-pointer"
                      >
                        <span className="font-medium">{info.name}</span>
                        {isSelected && <span className="text-[#D4AF37] text-xs font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Date Range & Execution Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date Pickers */}
          <div className="flex items-center gap-1.5 bg-[#121212] border border-[#D4AF37]/25 px-2.5 py-1 rounded-xl text-xs text-[#F5E6C8] shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <input
              type="date"
              value={startDate}
              min="2015-01-01"
              max="2026-10-05"
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-[#F5E6C8] font-mono text-xs focus:outline-none cursor-pointer"
            />
            <span className="text-[#8A8578] font-bold">→</span>
            <input
              type="date"
              value={endDate}
              min="2015-01-05"
              max="2026-10-05"
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-[#F5E6C8] font-mono text-xs focus:outline-none cursor-pointer"
            />
          </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1a1a1a] border border-[#333] text-[11px] font-mono text-[#D4AF37]">
          <span>{new Date().toLocaleDateString()}</span>
          <span className="text-[#A39985]">|</span>
          <span>{clock}</span>
        </div>

          {/* Apply Button */}
          <button
            onClick={applyAnalysis}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#E5C158] via-[#D4AF37] to-[#B8860B] hover:from-[#FFE89C] hover:via-[#E5C158] hover:to-[#D4AF37] text-[#0A0A0A] text-xs font-extrabold rounded-xl shadow-md shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 transition-all cursor-pointer active:scale-95 border border-[#FFDF79]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apply Analysis</span>
          </button>

          {/* Live Data Status + Refresh */}
          {(() => {
            const activeStatuses = selectedAssets.map(a => liveStatus[a]);
            const anyLive    = activeStatuses.some(s => s === 'live');
            const anyLoading = activeStatuses.some(s => s === 'loading');
            const allError   = activeStatuses.every(s => s === 'error' || s === 'idle');
            return (
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${
                  anyLoading ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  anyLive    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                               'bg-[#1a1a1a] border-[#333] text-[#A39985]'
                }`}>
                  {anyLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : anyLive ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{anyLoading ? 'Syncing...' : anyLive ? 'Live' : 'Static'}</span>
                </div>
                <button
                  onClick={refreshLiveData}
                  title="Force refresh live data"
                  className="p-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-[#A39985] hover:text-white hover:border-[#D4AF37]/40 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Active Observation Window Badge */}
      {selectedAssets.length > 0 && actualStartDate && actualEndDate && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#E5C158] bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg border border-[#D4AF37]/25 shadow-sm">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
          <span>
            Active Data Span: <strong className="font-mono text-[#FFE89C]">{actualStartDate}</strong> → <strong className="font-mono text-[#FFE89C]">{actualEndDate}</strong>
          </span>
          <span className="text-[#A39985]">•</span>
          <span className="font-mono text-[#F5E6C8]">
            {allDates.length} observations
          </span>
        </div>
      )}
    </header>
  );
};
