import React from 'react';
import { useQuant } from '../../context/QuantContext';
import { ASSET_REGISTRY } from '../../data/assets';
import { Layers } from 'lucide-react';

export const CorrelationHeatmap: React.FC = () => {
  const { selectedAssets, correlationData } = useQuant();

  // If 1 asset selected: Show clear informative message as required in Section 6
  if (selectedAssets.length < 2 || !correlationData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#121212] rounded-xl border border-[#D4AF37]/20 text-center min-h-[220px]">
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
          <Layers className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1 font-display">Correlation Analysis</h4>
        <p className="text-xs text-[#A39985] max-w-sm">
          Select at least <strong className="text-[#D4AF37]">2 assets</strong> from the top global bar to calculate return-based Pearson correlation.
        </p>
      </div>
    );
  }

  const { assetIds, matrix } = correlationData;

  // Function to get color based on correlation coefficient (-1 to +1)
  const getCellColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'bg-[#D4AF37]/20 text-[#FFE89C] border-[#D4AF37]/60 font-bold shadow-sm';
    if (val >= 0.7) return 'bg-emerald-500/25 text-emerald-200 border-emerald-500/45 font-bold';
    if (val >= 0.3) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (val >= 0.0) return 'bg-[#181818] text-slate-200 border-[#2A2A2A]';
    if (val >= -0.3) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/25 text-rose-200 border-rose-500/40 font-bold';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
            {assetIds.length}×{assetIds.length} Return Correlation Matrix
          </h3>
          <p className="text-[11px] text-[#A39985]">
            Calculated on daily returns (Pearson $r$)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#A39985] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/60"></span> High +</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#2A2A2A]"></span> Uncorrelated</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500/60"></span> Inverse -</span>
        </div>
      </div>

      {/* Grid Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2.5 text-left text-[#D4AF37]/80 font-mono text-[11px] uppercase">Asset</th>
              {assetIds.map(id => {
                const info = ASSET_REGISTRY[id];
                return (
                  <th key={id} className="p-2.5 text-center font-semibold text-slate-300">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info?.color }} />
                      <span>{info?.name.split(' ')[0]}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {assetIds.map((rowId, i) => {
              const rowInfo = ASSET_REGISTRY[rowId];
              return (
                <tr key={rowId} className="border-t border-[#222222]">
                  <td className="p-2.5 font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rowInfo?.color }} />
                    <span>{rowInfo?.name.split(' ')[0]}</span>
                  </td>
                  {assetIds.map((colId, j) => {
                    const val = matrix[i][j];
                    const isDiag = i === j;
                    return (
                      <td key={colId} className="p-2 text-center">
                        <div
                          className={`py-2 px-3 rounded-lg border font-mono transition-all ${getCellColor(
                            val,
                            isDiag
                          )}`}
                        >
                          {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
