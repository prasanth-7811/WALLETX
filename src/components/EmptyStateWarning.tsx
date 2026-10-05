import React from 'react';
import { useQuant } from '../context/QuantContext';
import { AlertCircle, Sparkles } from 'lucide-react';
import { ASSET_REGISTRY } from '../data/assets';
import { AssetId } from '../types';

export const EmptyStateWarning: React.FC = () => {
  const { toggleAsset, selectAllAssets } = useQuant();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2 font-display">
        Please select at least one asset to continue.
      </h2>
      <p className="text-sm text-[#A39985] max-w-md mb-6 leading-relaxed">
        WALLETX is an asset-driven quantitative analytics system. Select one or more assets from the global header or click below to launch immediate analysis.
      </p>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {(['GOLD', 'BTC', 'NVDA'] as AssetId[]).map(assetId => {
          const info = ASSET_REGISTRY[assetId];
          return (
            <button
              key={assetId}
              onClick={() => toggleAsset(assetId)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 text-sm font-medium text-slate-200 hover:text-white transition-all cursor-pointer shadow-md"
            >
              <span>Select {info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
