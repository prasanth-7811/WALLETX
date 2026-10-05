import {
  AssetId,
  OHLCV,
  RobustnessGridPoint,
  RobustnessResult,
  StrategyParams,
  StrategyType
} from '../types';
import { runBacktest } from './backtestEngine';

/**
 * Execute parameter sensitivity grid sweep across 2 parameters
 */
export function runRobustnessSweep(
  selectedAssets: AssetId[],
  assetCandles: Record<AssetId, OHLCV[]>,
  strategyType: StrategyType,
  targetAsset: AssetId | 'PORTFOLIO' = 'PORTFOLIO',
  weights?: Record<AssetId, number>
): RobustnessResult {
  const assetsToTest = targetAsset === 'PORTFOLIO' ? selectedAssets : [targetAsset];

  let paramXName = '';
  let paramYName = '';
  let paramXValues: number[] = [];
  let paramYValues: number[] = [];

  switch (strategyType) {
    case 'SMA_CROSSOVER':
    case 'EMA_TREND':
      paramXName = 'Fast Window (days)';
      paramYName = 'Slow Window (days)';
      paramXValues = [5, 10, 15, 20, 25, 30];
      paramYValues = [40, 50, 60, 80, 100, 150];
      break;

    case 'MOMENTUM':
      paramXName = 'Lookback Window (days)';
      paramYName = 'Threshold (%)';
      paramXValues = [10, 15, 20, 30, 45, 60];
      paramYValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
      break;

    case 'MEAN_REVERSION':
      paramXName = 'Lookback Window (days)';
      paramYName = 'Band Std Dev (σ)';
      paramXValues = [10, 15, 20, 25, 30, 40];
      paramYValues = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
      break;
  }

  const grid: RobustnessGridPoint[][] = [];
  const allSharpes: number[] = [];
  const allDrawdowns: number[] = [];

  for (let yIdx = 0; yIdx < paramYValues.length; yIdx++) {
    const row: RobustnessGridPoint[] = [];
    const valY = paramYValues[yIdx];

    for (let xIdx = 0; xIdx < paramXValues.length; xIdx++) {
      const valX = paramXValues[xIdx];

      const testParams: StrategyParams = {
        type: strategyType,
        initialCapital: 100000,
        positionSize: 1.0,
        transactionCostBps: 10,
        slippageBps: 5,
      };

      if (strategyType === 'SMA_CROSSOVER' || strategyType === 'EMA_TREND') {
        testParams.shortWindow = valX;
        testParams.longWindow = valY;
      } else if (strategyType === 'MOMENTUM') {
        testParams.momentumLookback = valX;
        testParams.momentumThreshold = valY;
      } else if (strategyType === 'MEAN_REVERSION') {
        testParams.mrWindow = valX;
        testParams.mrStdDev = valY;
      }

      const res = runBacktest(assetsToTest, assetCandles, testParams, weights);
      const point: RobustnessGridPoint = {
        paramX: valX,
        paramY: valY,
        sharpe: res.sharpeRatio,
        cagr: res.cagr,
        maxDrawdown: res.maxDrawdown,
        trades: res.totalTrades,
        winRate: res.winRate,
      };

      row.push(point);
      allSharpes.push(res.sharpeRatio);
      allDrawdowns.push(res.maxDrawdown);
    }
    grid.push(row);
  }

  // Quantile & summary calculations
  allSharpes.sort((a, b) => a - b);
  allDrawdowns.sort((a, b) => a - b);

  const n = allSharpes.length;
  const minSharpe = allSharpes[0];
  const maxSharpe = allSharpes[n - 1];
  const medianSharpe = allSharpes[Math.floor(n * 0.5)];
  const p25Sharpe = allSharpes[Math.floor(n * 0.25)];
  const p75Sharpe = allSharpes[Math.floor(n * 0.75)];

  const minDrawdown = allDrawdowns[0];
  const maxDrawdown = allDrawdowns[n - 1];
  const medianDrawdown = allDrawdowns[Math.floor(n * 0.5)];

  const positiveSharpes = allSharpes.filter(s => s > 0).length;
  const stableRegionPct = n > 0 ? positiveSharpes / n : 0;

  return {
    strategyType,
    targetAsset,
    paramXName,
    paramYName,
    paramXValues,
    paramYValues,
    grid,
    summary: {
      minSharpe: Number(minSharpe.toFixed(2)),
      maxSharpe: Number(maxSharpe.toFixed(2)),
      medianSharpe: Number(medianSharpe.toFixed(2)),
      p25Sharpe: Number(p25Sharpe.toFixed(2)),
      p75Sharpe: Number(p75Sharpe.toFixed(2)),
      minDrawdown: Number(minDrawdown.toFixed(4)),
      maxDrawdown: Number(maxDrawdown.toFixed(4)),
      medianDrawdown: Number(medianDrawdown.toFixed(4)),
      stableRegionPct: Number(stableRegionPct.toFixed(2)),
    },
  };
}
