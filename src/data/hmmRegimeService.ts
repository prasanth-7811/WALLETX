import type { AssetId, AssetRegimeAnalysis, MarketRegime, RegimeObservation } from '../types';
import hmmData from './hmm_regimes.json';

type HMMTimeline = { date: string; regime: string; close: number }[];

function buildRegimeReturns(timeline: HMMTimeline): AssetRegimeAnalysis['regimeReturns'] {
  const regimes: MarketRegime[] = ['Bull Market', 'Bear Market', 'High Volatility', 'Low Volatility'];
  const buckets: Record<MarketRegime, number[]> = {
    'Bull Market': [], 'Bear Market': [], 'High Volatility': [], 'Low Volatility': [],
  };

  for (let i = 1; i < timeline.length; i++) {
    const ret = (timeline[i].close - timeline[i - 1].close) / timeline[i - 1].close;
    const regime = timeline[i].regime as MarketRegime;
    if (buckets[regime]) buckets[regime].push(ret);
  }

  const result = {} as AssetRegimeAnalysis['regimeReturns'];
  for (const reg of regimes) {
    const rets = buckets[reg];
    const days = rets.length;
    if (days === 0) {
      result[reg] = { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 };
    } else {
      const mean = rets.reduce((a, b) => a + b, 0) / days;
      const annReturn = Math.pow(1 + mean, 252) - 1;
      const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / days;
      const vol = Math.sqrt(variance) * Math.sqrt(252);
      const sharpe = vol === 0 ? 0 : (annReturn - 0.045) / vol;
      result[reg] = {
        avgDailyReturn: Number(mean.toFixed(5)),
        annualizedReturn: Number(annReturn.toFixed(4)),
        annualizedVol: Number(vol.toFixed(4)),
        sharpe: Number(sharpe.toFixed(2)),
        daysCount: days,
      };
    }
  }
  return result;
}

function convertToAnalysis(assetId: AssetId, raw: { current: string; breakdown: Record<string, number>; timeline: HMMTimeline }): AssetRegimeAnalysis {
  const timeline: RegimeObservation[] = raw.timeline.map((t, i) => ({
    date: t.date,
    regime: t.regime as MarketRegime,
    price: t.close,
    sma200: t.close,       // HMM doesn't compute SMA200 — use price as placeholder
    volatility20d: 0,
    momentum20d: 0,
  }));

  const regimeBreakdown = raw.breakdown as Record<MarketRegime, number>;

  return {
    assetId,
    currentRegime: raw.current as MarketRegime,
    regimeBreakdown,
    timeline,
    regimeReturns: buildRegimeReturns(raw.timeline),
  };
}

/** Returns HMM-based AssetRegimeAnalysis for NVDA and BTC, null for others */
export function getHMMRegimeAnalysis(assetId: AssetId): AssetRegimeAnalysis | null {
  const assets = (hmmData as any).assets as Record<string, any>;
  const raw = assets[assetId];
  if (!raw) return null;
  return convertToAnalysis(assetId, raw);
}
