import React, { useState } from 'react';
import { TradeRecord } from '../types';
import { ASSET_REGISTRY } from '../data/assets';
import { Download, Search } from 'lucide-react';

interface Props {
  trades: TradeRecord[];
}

export const TradeBlotter: React.FC<Props> = ({ trades }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredTrades = trades.filter(trade => {
    const matchesSearch =
      trade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.date.includes(searchTerm);

    const matchesType = filterType === 'ALL' || trade.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const displayedTrades = filteredTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Asset', 'Type', 'Price', 'Shares', 'Notional', 'Fee', 'PnL', 'PnL%'];
    const rows = trades.map(t => [
      t.id,
      t.date,
      t.assetId,
      t.type,
      t.price,
      t.shares,
      t.notional,
      t.fee,
      t.pnl ?? '',
      t.pnlPct ? `${(t.pnlPct * 100).toFixed(2)}%` : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `walletx_trade_blotter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full quant-card p-5">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D4AF37]/15">
        <div>
          <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            Execution Trade Blotter
          </h4>
          <p className="text-xs text-[#A39985] mt-0.5">
            Total Executed Orders: <strong className="font-mono text-[#D4AF37] font-bold">{trades.length}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#D4AF37]/20 px-2.5 py-1.5 rounded-xl text-xs">
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Search date or asset..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none w-36 placeholder:text-[#8A8578]"
            />
          </div>

          {/* Filter Type */}
          <div className="flex items-center bg-[#141414] p-0.5 rounded-xl border border-[#D4AF37]/20 text-xs">
            {(['ALL', 'BUY', 'SELL'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setFilterType(t);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === t ? 'bg-[#D4AF37]/20 text-[#FFE89C] font-bold border border-[#D4AF37]/30' : 'text-[#A39985] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#222222] text-[#F5E6C8] text-xs font-semibold rounded-xl border border-[#D4AF37]/30 transition-all cursor-pointer hover:border-[#D4AF37]"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Trades Table */}
      {displayedTrades.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#8A8578]">
          No trade records match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#D4AF37]/15 text-[#D4AF37]/80 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Trade ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3 text-right">Execution Price</th>
                <th className="py-2.5 px-3 text-right">Shares / Units</th>
                <th className="py-2.5 px-3 text-right">Notional Value</th>
                <th className="py-2.5 px-3 text-right">Fee (10 bps)</th>
                <th className="py-2.5 px-3 text-right">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {displayedTrades.map(trade => {
                const info = ASSET_REGISTRY[trade.assetId];
                const isBuy = trade.type === 'BUY';
                const hasPnl = trade.pnl !== undefined;
                const isProfitable = (trade.pnl || 0) > 0;

                return (
                  <tr key={trade.id} className="hover:bg-[#1A1813]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#A39985] font-bold">{trade.id}</td>
                    <td className="py-2.5 px-3 text-slate-300">{trade.date}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info?.color }} />
                        <span className="font-semibold text-slate-200">{trade.assetId}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35' : 'bg-rose-500/20 text-rose-300 border border-rose-500/35'
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      ${trade.price.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#A39985]">
                      {trade.shares.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      ${trade.notional.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#8A8578]">
                      ${trade.fee.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {hasPnl ? (
                        <span
                          className={`font-semibold ${
                            isProfitable ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfitable ? '+' : ''}${trade.pnl?.toFixed(2)} ({isProfitable ? '+' : ''}
                          {((trade.pnlPct || 0) * 100).toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#D4AF37]/15 text-xs text-[#A39985]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTrades.length)} of {filteredTrades.length} trades
          </span>
          <div className="flex items-center gap-1 font-mono">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#D4AF37]/20 disabled:opacity-40 hover:bg-[#1E1E1E] cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2 py-1 text-[#D4AF37] font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#D4AF37]/20 disabled:opacity-40 hover:bg-[#1E1E1E] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
