import React from 'react';
import { useQuant, NavigationTab } from '../context/QuantContext';
import { ASSET_REGISTRY } from '../data/assets';
import {
  LayoutDashboard,
  CandlestickChart,
  LineChart,
  FlaskConical,
  History,
  ShieldCheck,
  Compass,
  Sparkles,
  Database,
  Settings,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'markets', label: 'Markets', icon: CandlestickChart },
  { id: 'quant', label: 'Quant Analysis', icon: LineChart },
  { id: 'strategy', label: 'Strategy Lab', icon: FlaskConical },
  { id: 'backtest', label: 'Backtesting', icon: History },
  { id: 'robustness', label: 'Robustness', icon: ShieldCheck },
  { id: 'regimes', label: 'Market Regimes', icon: Compass },
  { id: 'ai', label: 'AI Research', icon: Sparkles, badge: 'Featherless' },
  { id: 'data_quality', label: 'Data Quality', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, selectedAssets } = useQuant();

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#D4AF37]/20 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl">
      {/* Top Branding */}
      <div>
        <div className="px-5 py-4 border-b border-[#D4AF37]/15 flex items-center justify-between bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#997A15] via-[#D4AF37] to-[#FFE89C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/25 border border-[#FFE89C]/50">
              <TrendingUp className="w-4.5 h-4.5 text-[#0A0A0A] stroke-[2.8]" />
            </div>
            <div>
              <div className="font-display font-extrabold tracking-tight text-xl text-white flex items-center gap-0.5">
                <span>VAL</span>
                <span className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">TO</span>
              </div>
              <div className="text-[9px] text-[#A39985] uppercase tracking-wider font-mono">
                Multi-Asset Quant Engine
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#FFF5E0] border border-[#D4AF37]/45 shadow-[0_0_15px_rgba(212,175,55,0.15)] font-semibold'
                    : 'text-[#A39985] hover:text-[#FFFFFF] hover:bg-[#161616] hover:border-[#D4AF37]/20 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8A8578]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono uppercase bg-[#D4AF37]/20 text-[#FFE89C] border border-[#D4AF37]/35 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Selection Status Pill */}
      <div className="p-4 border-t border-[#D4AF37]/15 bg-[#0D0D0D]">
        <div className="text-[11px] font-semibold text-[#A39985] uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#D4AF37]">
            <Layers className="w-3.5 h-3.5" />
            Active Universe
          </span>
          <span className="font-mono text-xs text-[#D4AF37] font-bold bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
            {selectedAssets.length} / 3 Active
          </span>
        </div>

        {selectedAssets.length === 0 ? (
          <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
            No assets selected
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedAssets.map(assetId => {
              const info = ASSET_REGISTRY[assetId];
              return (
                <div
                  key={assetId}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#D4AF37]/15 text-xs transition-colors hover:border-[#D4AF37]/35"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{info?.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A39985]">{info?.symbol}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
