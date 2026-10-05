import { AssetId, AssetMetrics, CorrelationMatrixData, OHLCV, RollingCorrelationSeries } from '../types';

/**
 * Calculate simple daily returns from an array of prices
 */
export function calculateDailyReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];
  const returns: number[] = [0]; // First day return is 0
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    returns.push(prev === 0 ? 0 : (curr - prev) / prev);
  }
  return returns;
}

/**
 * Calculate cumulative returns series starting from 0 (or normalized base 1.0)
 */
export function calculateCumulativeReturns(returns: number[]): number[] {
  let cum = 1.0;
  return returns.map((r, i) => {
    if (i === 0) return 0;
    cum *= (1 + r);
    return cum - 1;
  });
}

/**
 * Simple Moving Average
 */
export function calculateSMA(prices: number[], window: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < window - 1) {
      sma.push(prices[i]); // early fill with available
    } else {
      let sum = 0;
      for (let j = i - window + 1; j <= i; j++) {
        sum += prices[j];
      }
      sma.push(sum / window);
    }
  }
  return sma;
}

/**
 * Exponential Moving Average
 */
export function calculateEMA(prices: number[], window: number): number[] {
  if (prices.length === 0) return [];
  const ema: number[] = [prices[0]];
  const multiplier = 2 / (window + 1);

  for (let i = 1; i < prices.length; i++) {
    const val = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(val);
  }
  return ema;
}

/**
 * Relative Strength Index (RSI 14)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return prices.map(() => 50);
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Initial RSI
  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  for (let i = period; i < prices.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

/**
 * Calculate drawdown series and maximum drawdown
 */
export function calculateDrawdown(prices: number[]): {
  drawdownSeries: number[];
  maxDrawdown: number;
  currentDrawdown: number;
} {
  if (prices.length === 0) return { drawdownSeries: [], maxDrawdown: 0, currentDrawdown: 0 };
  let peak = prices[0];
  const drawdownSeries: number[] = [];
  let maxDrawdown = 0;

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    }
    const dd = peak === 0 ? 0 : (prices[i] - peak) / peak;
    drawdownSeries.push(dd);
    if (dd < maxDrawdown) {
      maxDrawdown = dd;
    }
  }

  const currentDrawdown = drawdownSeries[drawdownSeries.length - 1] || 0;
  return { drawdownSeries, maxDrawdown, currentDrawdown };
}

/**
 * Standard Deviation of an array
 */
export function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Full quantitative metrics for a single asset series
 */
export function computeAssetMetrics(
  assetId: AssetId,
  candles: OHLCV[],
  riskFreeRate: number = 0.045
): AssetMetrics {
  if (candles.length === 0) {
    return {
      assetId,
      latestPrice: 0,
      dailyReturn: 0,
      totalReturn: 0,
      cagr: 0,
      volatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      currentDrawdown: 0,
      bestDay: 0,
      worstDay: 0,
      avgDailyVolume: 0,
      sma20: 0,
      sma50: 0,
      sma200: 0,
      ema12: 0,
      ema26: 0,
      rsi14: 50,
    };
  }

  const closes = candles.map(c => c.close);
  const returns = calculateDailyReturns(closes);
  const nonZeroReturns = returns.slice(1);

  const startPrice = closes[0];
  const endPrice = closes[closes.length - 1];
  const totalReturn = startPrice === 0 ? 0 : (endPrice - startPrice) / startPrice;

  // CAGR
  const nDays = candles.length;
  const years = Math.max(nDays / 252, 0.01);
  const cagr = Math.pow(1 + totalReturn, 1 / years) - 1;

  // Annualized Volatility
  const dailyVol = calculateStdDev(nonZeroReturns);
  const volatility = dailyVol * Math.sqrt(252);

  // Sharpe Ratio
  const sharpeRatio = volatility === 0 ? 0 : (cagr - riskFreeRate) / volatility;

  // Downside deviation & Sortino
  const downsideReturns = nonZeroReturns.filter(r => r < 0);
  const downsideVariance = downsideReturns.length > 0
    ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / nonZeroReturns.length
    : 0.0001;
  const downsideVol = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortinoRatio = downsideVol === 0 ? 0 : (cagr - riskFreeRate) / downsideVol;

  // Drawdown
  const { maxDrawdown, currentDrawdown } = calculateDrawdown(closes);
  const calmarRatio = Math.abs(maxDrawdown) === 0 ? 0 : cagr / Math.abs(maxDrawdown);

  // Win Rate
  const winDays = nonZeroReturns.filter(r => r > 0).length;
  const winRate = nonZeroReturns.length > 0 ? winDays / nonZeroReturns.length : 0;

  // Best / Worst day
  const bestDay = nonZeroReturns.length > 0 ? Math.max(...nonZeroReturns) : 0;
  const worstDay = nonZeroReturns.length > 0 ? Math.min(...nonZeroReturns) : 0;

  // Moving averages
  const sma20Series = calculateSMA(closes, 20);
  const sma50Series = calculateSMA(closes, 50);
  const sma200Series = calculateSMA(closes, 200);
  const ema12Series = calculateEMA(closes, 12);
  const ema26Series = calculateEMA(closes, 26);
  const rsiSeries = calculateRSI(closes, 14);

  const totalVol = candles.reduce((acc, c) => acc + c.volume, 0);
  const avgDailyVolume = totalVol / candles.length;

  return {
    assetId,
    latestPrice: endPrice,
    dailyReturn: nonZeroReturns[nonZeroReturns.length - 1] || 0,
    totalReturn,
    cagr,
    volatility,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdown,
    winRate,
    currentDrawdown,
    bestDay,
    worstDay,
    avgDailyVolume,
    sma20: sma20Series[sma20Series.length - 1] || endPrice,
    sma50: sma50Series[sma50Series.length - 1] || endPrice,
    sma200: sma200Series[sma200Series.length - 1] || endPrice,
    ema12: ema12Series[ema12Series.length - 1] || endPrice,
    ema26: ema26Series[ema26Series.length - 1] || endPrice,
    rsi14: rsiSeries[rsiSeries.length - 1] || 50,
  };
}

/**
 * Pearson Correlation between two series of daily returns
 */
export function calculatePearsonCorrelation(seriesA: number[], seriesB: number[]): number {
  const len = Math.min(seriesA.length, seriesB.length);
  if (len < 2) return 1.0;

  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < len; i++) {
    sumA += seriesA[i];
    sumB += seriesB[i];
  }
  const meanA = sumA / len;
  const meanB = sumB / len;

  let num = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < len; i++) {
    const diffA = seriesA[i] - meanA;
    const diffB = seriesB[i] - meanB;
    num += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denom = Math.sqrt(denomA * denomB);
  if (denom === 0) return 0;
  return Math.max(-1, Math.min(1, num / denom));
}

/**
 * Compute N x N Correlation Matrix for selected assets using daily returns
 */
export function computeCorrelationMatrix(
  selectedAssets: AssetId[],
  assetCandles: Record<AssetId, OHLCV[]>
): CorrelationMatrixData {
  if (selectedAssets.length < 2) {
    return {
      assetIds: selectedAssets,
      matrix: selectedAssets.map(() => [1.0]),
    };
  }

  // Extract aligned daily returns for each asset
  const returnsMap: Record<AssetId, number[]> = {} as Record<AssetId, number[]>;
  for (const asset of selectedAssets) {
    const closes = (assetCandles[asset] || []).map(c => c.close);
    returnsMap[asset] = calculateDailyReturns(closes);
  }

  const matrix: number[][] = [];

  for (let i = 0; i < selectedAssets.length; i++) {
    const row: number[] = [];
    const assetA = selectedAssets[i];
    for (let j = 0; j < selectedAssets.length; j++) {
      const assetB = selectedAssets[j];
      if (i === j) {
        row.push(1.0);
      } else {
        const corr = calculatePearsonCorrelation(returnsMap[assetA], returnsMap[assetB]);
        row.push(Number(corr.toFixed(4)));
      }
    }
    matrix.push(row);
  }

  return {
    assetIds: selectedAssets,
    matrix,
  };
}

/**
 * Compute Rolling 60-day Pairwise Correlations
 */
export function computeRollingCorrelations(
  selectedAssets: AssetId[],
  assetCandles: Record<AssetId, OHLCV[]>,
  window: number = 60
): RollingCorrelationSeries[] {
  if (selectedAssets.length < 2) return [];

  const pairs: [AssetId, AssetId][] = [];
  for (let i = 0; i < selectedAssets.length; i++) {
    for (let j = i + 1; j < selectedAssets.length; j++) {
      pairs.push([selectedAssets[i], selectedAssets[j]]);
    }
  }

  const dates = (assetCandles[selectedAssets[0]] || []).map(c => c.date);
  const returnsMap: Record<AssetId, number[]> = {} as Record<AssetId, number[]>;
  for (const asset of selectedAssets) {
    const closes = (assetCandles[asset] || []).map(c => c.close);
    returnsMap[asset] = calculateDailyReturns(closes);
  }

  const results: RollingCorrelationSeries[] = [];

  for (const [assetA, assetB] of pairs) {
    const retA = returnsMap[assetA];
    const retB = returnsMap[assetB];
    const correlations: number[] = [];
    const validDates: string[] = [];

    for (let i = window; i < dates.length; i++) {
      const sliceA = retA.slice(i - window, i);
      const sliceB = retB.slice(i - window, i);
      const corr = calculatePearsonCorrelation(sliceA, sliceB);
      correlations.push(Number(corr.toFixed(3)));
      validDates.push(dates[i]);
    }

    results.push({
      dates: validDates,
      pairLabel: `${assetA} vs ${assetB}`,
      correlations,
    });
  }

  return results;
}

/**
 * Compute Rolling Volatility Series (30-day window, annualized)
 */
export function computeRollingVolatility(
  candles: OHLCV[],
  window: number = 30
): { dates: string[]; volatility: number[] } {
  const closes = candles.map(c => c.close);
  const returns = calculateDailyReturns(closes);
  const dates = candles.map(c => c.date);

  const volSeries: number[] = [];
  const validDates: string[] = [];

  for (let i = window; i < dates.length; i++) {
    const slice = returns.slice(i - window, i);
    const dailyVol = calculateStdDev(slice);
    const annVol = dailyVol * Math.sqrt(252);
    volSeries.push(Number(annVol.toFixed(4)));
    validDates.push(dates[i]);
  }

  return { dates: validDates, volatility: volSeries };
}

/**
 * Compute Rolling Sharpe Series (60-day window, annualized)
 */
export function computeRollingSharpe(
  candles: OHLCV[],
  window: number = 60,
  riskFreeRate: number = 0.045
): { dates: string[]; sharpe: number[] } {
  const closes = candles.map(c => c.close);
  const returns = calculateDailyReturns(closes);
  const dates = candles.map(c => c.date);

  const sharpeSeries: number[] = [];
  const validDates: string[] = [];

  for (let i = window; i < dates.length; i++) {
    const slice = returns.slice(i - window, i);
    const startPrice = closes[i - window];
    const endPrice = closes[i];
    const ret = startPrice === 0 ? 0 : (endPrice - startPrice) / startPrice;
    const years = window / 252;
    const cagr = Math.pow(1 + Math.max(-0.99, ret), 1 / years) - 1;
    const dailyVol = calculateStdDev(slice);
    const annVol = dailyVol * Math.sqrt(252);
    const s = annVol === 0 ? 0 : (cagr - riskFreeRate) / annVol;
    sharpeSeries.push(Number(Math.max(-5, Math.min(5, s)).toFixed(3)));
    validDates.push(dates[i]);
  }

  return { dates: validDates, sharpe: sharpeSeries };
}
