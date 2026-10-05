export type AssetId = 'GOLD' | 'BTC' | 'NVDA' | 'ETH' | 'SPY';

export interface AssetInfo {
  id: AssetId;
  name: string;
  symbol: string;
  category: 'Commodity' | 'Crypto' | 'Equity' | 'Index';
  color: string;
  lightColor: string;
  currency: string;
  exchange: string;
  dataSource: string;
  decimals: number;
  description: string;
  iconName: string;
}

export interface OHLCV {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetDataSeries {
  assetId: AssetId;
  candles: OHLCV[];
  startDate: string;
  endDate: string;
  totalRecords: number;
}

export interface AssetMetrics {
  assetId: AssetId;
  latestPrice: number;
  dailyReturn: number;
  totalReturn: number;
  cagr: number;
  volatility: number; // Annualized
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  winRate: number;
  currentDrawdown: number;
  bestDay: number;
  worstDay: number;
  avgDailyVolume: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  rsi14: number;
}

export interface CorrelationMatrixData {
  assetIds: AssetId[];
  matrix: number[][]; // N x N
}

export interface RollingCorrelationSeries {
  dates: string[];
  pairLabel: string;
  correlations: number[];
}

export type StrategyType = 'SMA_CROSSOVER' | 'EMA_TREND' | 'MOMENTUM' | 'MEAN_REVERSION';

export interface StrategyParams {
  type: StrategyType;
  // SMA / EMA
  shortWindow?: number;
  longWindow?: number;
  // Momentum
  momentumLookback?: number;
  momentumThreshold?: number; // %
  // Mean Reversion
  mrWindow?: number;
  mrStdDev?: number;
  // Execution
  initialCapital: number;
  positionSize: number; // 0 to 1
  transactionCostBps: number; // e.g. 10 bps = 0.10%
  slippageBps: number;
  rebalanceFrequency?: 'Daily' | 'Weekly' | 'Monthly';
}

export interface TradeRecord {
  id: string;
  date: string;
  assetId: AssetId;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
  notional: number;
  fee: number;
  pnl?: number;
  pnlPct?: number;
  portfolioValueAfter: number;
}

export interface PortfolioPoint {
  date: string;
  strategyValue: number;
  benchmarkValue: number; // Buy and Hold
  drawdown: number;
  cash: number;
  assetValues: Record<AssetId, number>;
}

export interface BacktestResult {
  isMultiAsset: boolean;
  selectedAssets: AssetId[];
  weights: Record<AssetId, number>;
  params: StrategyParams;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  benchmarkFinalValue: number;
  benchmarkTotalReturn: number;
  benchmarkCagr: number;
  benchmarkSharpe: number;
  benchmarkMaxDrawdown: number;
  alpha: number;
  beta: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  totalFeesPaid: number;
  timeline: PortfolioPoint[];
  trades: TradeRecord[];
  assetBreakdown: Record<AssetId, {
    finalValue: number;
    totalReturn: number;
    contribution: number;
  }>;
}

export type MarketRegime = 'Bull Market' | 'Bear Market' | 'High Volatility' | 'Low Volatility';

export interface RegimeObservation {
  date: string;
  regime: MarketRegime;
  price: number;
  sma200: number;
  volatility20d: number;
  momentum20d: number;
}

export interface AssetRegimeAnalysis {
  assetId: AssetId;
  currentRegime: MarketRegime;
  regimeBreakdown: Record<MarketRegime, number>; // percentages
  timeline: RegimeObservation[];
  regimeReturns: Record<MarketRegime, {
    avgDailyReturn: number;
    annualizedReturn: number;
    annualizedVol: number;
    sharpe: number;
    daysCount: number;
  }>;
}

export interface RobustnessGridPoint {
  paramX: number;
  paramY: number;
  sharpe: number;
  cagr: number;
  maxDrawdown: number;
  trades: number;
  winRate: number;
}

export interface RobustnessResult {
  strategyType: StrategyType;
  targetAsset: AssetId | 'PORTFOLIO';
  paramXName: string;
  paramYName: string;
  paramXValues: number[];
  paramYValues: number[];
  grid: RobustnessGridPoint[][];
  summary: {
    minSharpe: number;
    maxSharpe: number;
    medianSharpe: number;
    p25Sharpe: number;
    p75Sharpe: number;
    minDrawdown: number;
    maxDrawdown: number;
    medianDrawdown: number;
    stableRegionPct: number; // % of parameter space with positive Sharpe
  };
}

export interface DataQualityAudit {
  assetId: AssetId;
  assetName: string;
  source: string;
  frequency: string;
  currency: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  missingValues: number;
  duplicates: number;
  invalidRecords: number;
  status: 'VALIDATED' | 'WARNING' | 'ERROR';
  calendarAlignment: string;
  lastAuditTimestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metricsPayload?: any;
  quickAction?: string;
}
