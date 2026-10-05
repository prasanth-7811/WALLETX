import {
  AssetId,
  AssetRegimeAnalysis,
  MarketRegime,
  OHLCV,
  RegimeObservation
} from '../types';
import {
  calculateDailyReturns,
  calculateSMA,
  calculateStdDev
} from './quantMath';

/**
 * Classify market regimes across the historical timeline for an asset
 */
export function classifyAssetRegimes(
  assetId: AssetId,
  candles: OHLCV[]
): AssetRegimeAnalysis {
  const n = candles.length;
  if (n === 0) {
    return {
      assetId,
      currentRegime: 'Bull Market',
      regimeBreakdown: { 'Bull Market': 0, 'Bear Market': 0, 'High Volatility': 0, 'Low Volatility': 0 },
      timeline: [],
      regimeReturns: {
        'Bull Market': { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 },
        'Bear Market': { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 },
        'High Volatility': { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 },
        'Low Volatility': { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 },
      }
    };
  }

  const closes = candles.map(c => c.close);
  const returns = calculateDailyReturns(closes);
  const sma200 = calculateSMA(closes, Math.min(200, Math.floor(n / 2)));

  // Calculate 20d rolling volatility series
  const rollingVol20d: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i < 20) {
      rollingVol20d.push(0.015);
    } else {
      const slice = returns.slice(i - 20, i);
      const vol = calculateStdDev(slice) * Math.sqrt(252);
      rollingVol20d.push(vol);
    }
  }

  // Find volatility thresholds
  const sortedVols = [...rollingVol20d].sort((a, b) => a - b);
  const highVolThreshold = sortedVols[Math.floor(sortedVols.length * 0.75)] || 0.35;
  const lowVolThreshold = sortedVols[Math.floor(sortedVols.length * 0.25)] || 0.15;

  const timeline: RegimeObservation[] = [];
  const regimeCounts: Record<MarketRegime, number> = {
    'Bull Market': 0,
    'Bear Market': 0,
    'High Volatility': 0,
    'Low Volatility': 0,
  };

  const regimeDailyReturns: Record<MarketRegime, number[]> = {
    'Bull Market': [],
    'Bear Market': [],
    'High Volatility': [],
    'Low Volatility': [],
  };

  for (let i = 0; i < n; i++) {
    const price = closes[i];
    const ma = sma200[i] || price;
    const vol = rollingVol20d[i];
    const mom = i >= 20 && closes[i - 20] > 0 ? (price - closes[i - 20]) / closes[i - 20] : 0;
    const dayRet = returns[i];

    let regime: MarketRegime = 'Bull Market';

    if (vol >= highVolThreshold && Math.abs(mom) > 0.05) {
      regime = 'High Volatility';
    } else if (price >= ma && mom >= 0) {
      regime = 'Bull Market';
    } else if (price < ma && mom < 0) {
      regime = 'Bear Market';
    } else if (vol <= lowVolThreshold) {
      regime = 'Low Volatility';
    } else {
      regime = price >= ma ? 'Bull Market' : 'Bear Market';
    }

    regimeCounts[regime]++;
    regimeDailyReturns[regime].push(dayRet);

    timeline.push({
      date: candles[i].date,
      regime,
      price,
      sma200: ma,
      volatility20d: Number(vol.toFixed(4)),
      momentum20d: Number(mom.toFixed(4)),
    });
  }

  const currentRegime = timeline[timeline.length - 1]?.regime || 'Bull Market';

  const regimeBreakdown: Record<MarketRegime, number> = {
    'Bull Market': Number(((regimeCounts['Bull Market'] / n) * 100).toFixed(1)),
    'Bear Market': Number(((regimeCounts['Bear Market'] / n) * 100).toFixed(1)),
    'High Volatility': Number(((regimeCounts['High Volatility'] / n) * 100).toFixed(1)),
    'Low Volatility': Number(((regimeCounts['Low Volatility'] / n) * 100).toFixed(1)),
  };

  const regimeReturns: Record<MarketRegime, {
    avgDailyReturn: number;
    annualizedReturn: number;
    annualizedVol: number;
    sharpe: number;
    daysCount: number;
  }> = {} as any;

  const regimesList: MarketRegime[] = ['Bull Market', 'Bear Market', 'High Volatility', 'Low Volatility'];

  for (const reg of regimesList) {
    const rets = regimeDailyReturns[reg];
    const days = rets.length;
    if (days === 0) {
      regimeReturns[reg] = { avgDailyReturn: 0, annualizedReturn: 0, annualizedVol: 0, sharpe: 0, daysCount: 0 };
    } else {
      const meanDaily = rets.reduce((a, b) => a + b, 0) / days;
      const annReturn = Math.pow(1 + meanDaily, 252) - 1;
      const vol = calculateStdDev(rets) * Math.sqrt(252);
      const sharpe = vol === 0 ? 0 : (annReturn - 0.045) / vol;

      regimeReturns[reg] = {
        avgDailyReturn: Number(meanDaily.toFixed(5)),
        annualizedReturn: Number(annReturn.toFixed(4)),
        annualizedVol: Number(vol.toFixed(4)),
        sharpe: Number(sharpe.toFixed(2)),
        daysCount: days,
      };
    }
  }

  return {
    assetId,
    currentRegime,
    regimeBreakdown,
    timeline,
    regimeReturns,
  };
}
