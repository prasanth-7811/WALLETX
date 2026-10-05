import {
  AssetId,
  BacktestResult,
  OHLCV,
  PortfolioPoint,
  StrategyParams,
  TradeRecord
} from '../types';
import {
  calculateCumulativeReturns,
  calculateDailyReturns,
  calculateDrawdown,
  calculateEMA,
  calculateSMA,
  calculateStdDev
} from './quantMath';

/**
 * Generate signal series for an asset given strategy parameters
 * 1 = LONG, 0 = CASH
 */
export function generateStrategySignals(
  candles: OHLCV[],
  params: StrategyParams
): number[] {
  const n = candles.length;
  if (n === 0) return [];
  const signals: number[] = new Array(n).fill(0);
  const closes = candles.map(c => c.close);

  switch (params.type) {
    case 'SMA_CROSSOVER': {
      const shortW = params.shortWindow || 20;
      const longW = params.longWindow || 50;
      const shortSMA = calculateSMA(closes, shortW);
      const longSMA = calculateSMA(closes, longW);

      for (let i = longW; i < n; i++) {
        if (shortSMA[i] > longSMA[i]) {
          signals[i] = 1;
        } else {
          signals[i] = 0;
        }
      }
      break;
    }

    case 'EMA_TREND': {
      const shortW = params.shortWindow || 12;
      const longW = params.longWindow || 26;
      const fastEMA = calculateEMA(closes, shortW);
      const slowEMA = calculateEMA(closes, longW);

      for (let i = longW; i < n; i++) {
        signals[i] = fastEMA[i] > slowEMA[i] ? 1 : 0;
      }
      break;
    }

    case 'MOMENTUM': {
      const lookback = params.momentumLookback || 20;
      const threshold = (params.momentumThreshold || 1.0) / 100; // e.g. 1%

      for (let i = lookback; i < n; i++) {
        const pastPrice = closes[i - lookback];
        const currentPrice = closes[i];
        const mom = pastPrice === 0 ? 0 : (currentPrice - pastPrice) / pastPrice;
        signals[i] = mom > threshold ? 1 : 0;
      }
      break;
    }

    case 'MEAN_REVERSION': {
      const window = params.mrWindow || 20;
      const numStd = params.mrStdDev || 2.0;
      const sma = calculateSMA(closes, window);

      let inPosition = false;
      for (let i = window; i < n; i++) {
        const slice = closes.slice(i - window, i);
        const std = calculateStdDev(slice);
        const lowerBand = sma[i] - numStd * std;
        const upperBand = sma[i] + numStd * std;

        if (!inPosition && closes[i] < lowerBand) {
          // Oversold -> Buy
          inPosition = true;
          signals[i] = 1;
        } else if (inPosition && closes[i] >= sma[i]) {
          // Reverted to mean -> Exit
          inPosition = false;
          signals[i] = 0;
        } else {
          signals[i] = inPosition ? 1 : 0;
        }
      }
      break;
    }
  }

  return signals;
}

/**
 * Execute full backtest simulation on single asset or multi-asset weighted portfolio
 */
export function runBacktest(
  selectedAssets: AssetId[],
  assetCandles: Record<AssetId, OHLCV[]>,
  params: StrategyParams,
  weights?: Record<AssetId, number>,
  riskFreeRate: number = 0.045
): BacktestResult {
  const isMultiAsset = selectedAssets.length > 1;

  // Normalize weights
  const finalWeights: Record<AssetId, number> = {} as Record<AssetId, number>;
  if (isMultiAsset && weights) {
    let totalW = 0;
    for (const asset of selectedAssets) {
      totalW += weights[asset] || 0;
    }
    for (const asset of selectedAssets) {
      finalWeights[asset] = totalW > 0 ? (weights[asset] || 0) / totalW : 1 / selectedAssets.length;
    }
  } else {
    for (const asset of selectedAssets) {
      finalWeights[asset] = 1 / selectedAssets.length;
    }
  }

  const primaryDates = (assetCandles[selectedAssets[0]] || []).map(c => c.date);
  const nDays = primaryDates.length;
  const initialCapital = params.initialCapital || 100000;
  const feeRate = (params.transactionCostBps || 10) / 10000; // e.g. 10 bps = 0.0010
  const slippageRate = (params.slippageBps || 5) / 10000;

  // Track simulation state
  const trades: TradeRecord[] = [];
  let totalFeesPaid = 0;

  // Simulation per asset
  interface AssetSimState {
    allocationCapital: number;
    cash: number;
    shares: number;
    inPosition: boolean;
    entryPrice: number;
    signals: number[];
  }

  const assetStates: Record<AssetId, AssetSimState> = {} as Record<AssetId, AssetSimState>;

  for (const asset of selectedAssets) {
    const candles = assetCandles[asset] || [];
    const signals = generateStrategySignals(candles, params);
    const alloc = initialCapital * (finalWeights[asset] || 1);
    assetStates[asset] = {
      allocationCapital: alloc,
      cash: alloc,
      shares: 0,
      inPosition: false,
      entryPrice: 0,
      signals,
    };
  }

  const timeline: PortfolioPoint[] = [];

  // Compute Benchmark Buy-and-Hold units
  const benchmarkUnits: Record<AssetId, number> = {} as Record<AssetId, number>;
  for (const asset of selectedAssets) {
    const candles = assetCandles[asset] || [];
    const startPrice = candles[0]?.close || 1;
    const alloc = initialCapital * (finalWeights[asset] || 1);
    benchmarkUnits[asset] = alloc / startPrice;
  }

  let tradeIdCounter = 1;

  for (let day = 0; day < nDays; day++) {
    const dateStr = primaryDates[day];
    let dailyStrategyValue = 0;
    let dailyBenchmarkValue = 0;
    let dailyCash = 0;
    const dailyAssetValues: Record<AssetId, number> = {} as Record<AssetId, number>;

    for (const asset of selectedAssets) {
      const candles = assetCandles[asset] || [];
      const candle = candles[day] || candles[candles.length - 1];
      const closePrice = candle.close;
      const state = assetStates[asset];
      const signal = state.signals[day] || 0;

      // Execute trades at close price with slippage + fee
      if (signal === 1 && !state.inPosition) {
        // BUY signal
        const buyPrice = closePrice * (1 + slippageRate);
        const positionCapital = state.cash * (params.positionSize || 1.0);
        const fee = positionCapital * feeRate;
        const netCapital = positionCapital - fee;
        const sharesToBuy = netCapital / buyPrice;

        state.shares = sharesToBuy;
        state.cash -= positionCapital;
        state.inPosition = true;
        state.entryPrice = buyPrice;
        totalFeesPaid += fee;

        trades.push({
          id: `TRD-${tradeIdCounter++}`,
          date: dateStr,
          assetId: asset,
          type: 'BUY',
          price: Number(buyPrice.toFixed(2)),
          shares: Number(sharesToBuy.toFixed(4)),
          notional: Number(positionCapital.toFixed(2)),
          fee: Number(fee.toFixed(2)),
          portfolioValueAfter: 0, // set later
        });
      } else if (signal === 0 && state.inPosition) {
        // SELL signal
        const sellPrice = closePrice * (1 - slippageRate);
        const grossValue = state.shares * sellPrice;
        const fee = grossValue * feeRate;
        const netValue = grossValue - fee;
        const costBasis = state.shares * state.entryPrice;
        const pnl = netValue - costBasis;
        const pnlPct = costBasis === 0 ? 0 : pnl / costBasis;

        state.cash += netValue;
        state.shares = 0;
        state.inPosition = false;
        totalFeesPaid += fee;

        trades.push({
          id: `TRD-${tradeIdCounter++}`,
          date: dateStr,
          assetId: asset,
          type: 'SELL',
          price: Number(sellPrice.toFixed(2)),
          shares: Number(state.shares.toFixed(4)),
          notional: Number(grossValue.toFixed(2)),
          fee: Number(fee.toFixed(2)),
          pnl: Number(pnl.toFixed(2)),
          pnlPct: Number(pnlPct.toFixed(4)),
          portfolioValueAfter: 0,
        });
      }

      const currentAssetVal = state.shares * closePrice;
      dailyAssetValues[asset] = currentAssetVal + state.cash;
      dailyStrategyValue += currentAssetVal + state.cash;
      dailyCash += state.cash;

      // Benchmark value
      dailyBenchmarkValue += benchmarkUnits[asset] * closePrice;
    }

    timeline.push({
      date: dateStr,
      strategyValue: dailyStrategyValue,
      benchmarkValue: dailyBenchmarkValue,
      drawdown: 0, // filled below
      cash: dailyCash,
      assetValues: dailyAssetValues,
    });
  }

  // Calculate drawdowns and link trade portfolio values
  const strategyValues = timeline.map(t => t.strategyValue);
  const benchmarkValues = timeline.map(t => t.benchmarkValue);

  const { drawdownSeries, maxDrawdown } = calculateDrawdown(strategyValues);
  const { maxDrawdown: benchmarkMaxDrawdown } = calculateDrawdown(benchmarkValues);

  for (let i = 0; i < timeline.length; i++) {
    timeline[i].drawdown = drawdownSeries[i];
  }

  // Update trades with final portfolio value context
  for (const trade of trades) {
    const pt = timeline.find(p => p.date === trade.date);
    if (pt) trade.portfolioValueAfter = pt.strategyValue;
  }

  // Aggregate Metrics
  const finalValue = strategyValues[strategyValues.length - 1] || initialCapital;
  const totalReturn = (finalValue - initialCapital) / initialCapital;
  const years = Math.max(nDays / 252, 0.01);
  const cagr = Math.pow(Math.max(0.001, 1 + totalReturn), 1 / years) - 1;

  const strategyDailyReturns = calculateDailyReturns(strategyValues).slice(1);
  const vol = calculateStdDev(strategyDailyReturns) * Math.sqrt(252);
  const sharpeRatio = vol === 0 ? 0 : (cagr - riskFreeRate) / vol;

  const downsideReturns = strategyDailyReturns.filter(r => r < 0);
  const downsideVol = Math.sqrt(
    downsideReturns.length > 0
      ? downsideReturns.reduce((acc, r) => acc + r * r, 0) / strategyDailyReturns.length
      : 0.0001
  ) * Math.sqrt(252);
  const sortinoRatio = downsideVol === 0 ? 0 : (cagr - riskFreeRate) / downsideVol;
  const calmarRatio = Math.abs(maxDrawdown) === 0 ? 0 : cagr / Math.abs(maxDrawdown);

  // Benchmark metrics
  const benchmarkFinalValue = benchmarkValues[benchmarkValues.length - 1] || initialCapital;
  const benchmarkTotalReturn = (benchmarkFinalValue - initialCapital) / initialCapital;
  const benchmarkCagr = Math.pow(Math.max(0.001, 1 + benchmarkTotalReturn), 1 / years) - 1;
  const benchmarkDailyReturns = calculateDailyReturns(benchmarkValues).slice(1);
  const benchmarkVol = calculateStdDev(benchmarkDailyReturns) * Math.sqrt(252);
  const benchmarkSharpe = benchmarkVol === 0 ? 0 : (benchmarkCagr - riskFreeRate) / benchmarkVol;

  // Alpha & Beta
  const covNumerator = strategyDailyReturns.reduce((sum, r, i) => {
    const br = benchmarkDailyReturns[i] || 0;
    return sum + (r - (cagr / 252)) * (br - (benchmarkCagr / 252));
  }, 0);
  const bVariance = benchmarkDailyReturns.reduce((sum, br) => sum + Math.pow(br - (benchmarkCagr / 252), 2), 0);
  const beta = bVariance === 0 ? 1.0 : Number((covNumerator / bVariance).toFixed(2));
  const alpha = Number((cagr - (riskFreeRate + beta * (benchmarkCagr - riskFreeRate))).toFixed(4));

  // Trade analytics
  const closedTrades = trades.filter(t => t.type === 'SELL');
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) <= 0).length;
  const winRate = closedTrades.length > 0 ? winningTrades / closedTrades.length : 0;

  const totalGains = closedTrades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + (t.pnl || 0), 0);
  const totalLosses = Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((s, t) => s + (t.pnl || 0), 0));
  const profitFactor = totalLosses === 0 ? (totalGains > 0 ? 99.9 : 1.0) : Number((totalGains / totalLosses).toFixed(2));

  // Asset breakdown
  const assetBreakdown: Record<AssetId, { finalValue: number; totalReturn: number; contribution: number }> = {} as any;
  for (const asset of selectedAssets) {
    const initAlloc = initialCapital * (finalWeights[asset] || 1);
    const endAlloc = timeline[timeline.length - 1]?.assetValues[asset] || initAlloc;
    const aRet = initAlloc === 0 ? 0 : (endAlloc - initAlloc) / initAlloc;
    const cont = initialCapital === 0 ? 0 : (endAlloc - initAlloc) / initialCapital;
    assetBreakdown[asset] = {
      finalValue: Number(endAlloc.toFixed(2)),
      totalReturn: Number(aRet.toFixed(4)),
      contribution: Number(cont.toFixed(4)),
    };
  }

  return {
    isMultiAsset,
    selectedAssets,
    weights: finalWeights,
    params,
    initialCapital,
    finalValue: Number(finalValue.toFixed(2)),
    totalReturn: Number(totalReturn.toFixed(4)),
    cagr: Number(cagr.toFixed(4)),
    volatility: Number(vol.toFixed(4)),
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    sortinoRatio: Number(sortinoRatio.toFixed(2)),
    calmarRatio: Number(calmarRatio.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(4)),
    benchmarkFinalValue: Number(benchmarkFinalValue.toFixed(2)),
    benchmarkTotalReturn: Number(benchmarkTotalReturn.toFixed(4)),
    benchmarkCagr: Number(benchmarkCagr.toFixed(4)),
    benchmarkSharpe: Number(benchmarkSharpe.toFixed(2)),
    benchmarkMaxDrawdown: Number(benchmarkMaxDrawdown.toFixed(4)),
    alpha,
    beta,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate: Number(winRate.toFixed(4)),
    profitFactor,
    totalFeesPaid: Number(totalFeesPaid.toFixed(2)),
    timeline,
    trades,
    assetBreakdown,
  };
}
