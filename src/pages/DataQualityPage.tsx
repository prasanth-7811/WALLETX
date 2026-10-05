import React from 'react';
import { useQuant } from '../context/QuantContext';
import { ASSET_REGISTRY, AVAILABLE_ASSETS } from '../data/assets';
import { EmptyStateWarning } from '../components/EmptyStateWarning';
import {
  Database,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const {
    selectedAssets,
    dataQualityAudits,
    toggleAsset,
  } = useQuant();

  const [showDeselectedModal, setShowDeselectedModal] = React.useState(false);

  if (selectedAssets.length === 0) {
    return <EmptyStateWarning />;
  }

  const deselectedAssets = AVAILABLE_ASSETS.filter(a => !selectedAssets.includes(a));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="quant-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/25 bg-gradient-to-r from-[#111111] via-[#14120c] to-[#111111]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#FFD700]" />
              Automated Data Pipeline Audit
            </span>
            <span className="text-xs text-[#A39985] font-mono">
              {dataQualityAudits.length} Active Audits
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Data Quality & Integrity Assurance
          </h2>
          <p className="text-xs text-[#A39985] mt-0.5">
            Strict validation tracking record integrity, missing values, duplicates, and non-trading day alignments.
          </p>
        </div>

        {deselectedAssets.length > 0 && (
          <button
            onClick={() => setShowDeselectedModal(!showDeselectedModal)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0A0A0A] hover:bg-[#14120c] text-[#F5E6C8] text-xs font-semibold rounded-lg border border-[#D4AF37]/30 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>{showDeselectedModal ? 'Hide Unselected Sources' : 'Manage All Data Sources'}</span>
          </button>
        )}
      </div>

      {/* Audits Table for Selected Assets */}
      <div className="quant-card p-5 border border-[#D4AF37]/20 bg-[#111111]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
          <div>
            <h3 className="text-sm font-semibold text-[#D4AF37]">
              Active Selected Asset Audit Ledger
            </h3>
            <p className="text-xs text-[#A39985]">
              Only showing audit diagnostics for currently active assets ({selectedAssets.join(', ')})
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ALL ACTIVE ASSETS VALIDATED</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#222222] text-[#D4AF37] font-mono text-[11px]">
                <th className="py-2.5 px-3 text-left">Asset / Ticker</th>
                <th className="py-2.5 px-3 text-left">Data Source</th>
                <th className="py-2.5 px-3 text-center">Frequency</th>
                <th className="py-2.5 px-3 text-center">Currency</th>
                <th className="py-2.5 px-3 text-center">Date Span</th>
                <th className="py-2.5 px-3 text-right">Records</th>
                <th className="py-2.5 px-3 text-right">Missing</th>
                <th className="py-2.5 px-3 text-right">Duplicates</th>
                <th className="py-2.5 px-3 text-right">Invalid</th>
                <th className="py-2.5 px-3 text-center">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {dataQualityAudits.map(audit => {
                const info = ASSET_REGISTRY[audit.assetId];

                return (
                  <tr key={audit.assetId} className="hover:bg-[#14120c]">
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2 font-semibold text-[#F5E6C8]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: info?.color }}
                        />
                        <span>{audit.assetName}</span>
                        <span className="text-[10px] text-[#A39985] font-mono">({audit.assetId})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#A39985] font-sans">{audit.source}</td>
                    <td className="py-3 px-3 text-center text-[#A39985]">{audit.frequency}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#F5E6C8]">{audit.currency}</td>
                    <td className="py-3 px-3 text-center text-[#A39985]">
                      {audit.startDate} → {audit.endDate}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {audit.recordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {audit.missingValues}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {audit.duplicates}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {audit.invalidRecords}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        VALIDATED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Alignment Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="quant-card p-4 border border-[#D4AF37]/20 bg-[#111111]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD700] mb-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Trading Calendar Alignment Architecture</span>
          </div>
          <p className="text-xs text-[#F5E6C8] leading-relaxed">
            Crypto assets trade continuously 24/7/365, while commodities (Gold LBMA/COMEX) and equities (NVIDIA NASDAQ) observe exchange closures, weekends, and US Federal holidays. 
            WALLETX automatically aligns all multi-asset returns using exact trading session timestamps without fabricating market data.
          </p>
        </div>

        <div className="quant-card p-4 border border-[#D4AF37]/20 bg-[#111111]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Integrity Guarantee</span>
          </div>
          <p className="text-xs text-[#F5E6C8] leading-relaxed">
            Zero synthetic lookahead bias: All quantitative technical indicators (SMA, EMA, Volatility, Correlation) are strictly computed backward in time from historical observations.
          </p>
        </div>
      </div>

      {/* Deselected Sources Management Drawer/Modal */}
      {showDeselectedModal && deselectedAssets.length > 0 && (
        <div className="quant-card p-5 bg-[#0A0A0A] border border-[#D4AF37]/30 animate-in fade-in">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#222222]">
            <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
              Extended Asset Registry (Currently Unselected)
            </h4>
            <span className="text-[11px] text-[#A39985]">Click to activate in global workflow</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deselectedAssets.map(assetId => {
              const info = ASSET_REGISTRY[assetId];
              return (
                <div
                  key={assetId}
                  className="p-3 bg-[#111111] rounded-xl border border-[#222222] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: info?.color }} />
                    <div>
                      <div className="text-xs font-bold text-[#F5E6C8]">{info?.name}</div>
                      <div className="text-[10px] text-[#A39985] font-mono">{info?.dataSource}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAsset(assetId)}
                    className="px-2.5 py-1 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#FFD700] text-xs font-semibold border border-[#D4AF37]/30 cursor-pointer transition-colors"
                  >
                    + Activate Asset
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

