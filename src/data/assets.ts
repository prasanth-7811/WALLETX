import type { AssetId, AssetInfo } from '../types';

export const ASSET_REGISTRY: Record<AssetId, AssetInfo> = {
  GOLD: {
    id: 'GOLD',
    name: 'Gold (Spot)',
    symbol: 'XAU/USD',
    category: 'Commodity',
    color: '#D4AF37', // Metallic Gold
    lightColor: 'rgba(212, 175, 55, 0.16)',
    currency: 'USD',
    exchange: 'COMEX / LBMA',
    dataSource: 'Alpha Vantage (Commodities / LBMA Fix)',
    decimals: 2,
    description: 'Precious metal monetary reserve, inflation hedge, safe haven asset.',
    iconName: 'Coins'
  },
  BTC: {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC/USD',
    category: 'Crypto',
    color: '#F59E0B', // Amber Gold
    lightColor: 'rgba(245, 158, 11, 0.16)',
    currency: 'USD',
    exchange: 'Coinbase / Binance',
    dataSource: 'Alpha Vantage (Digital Currency Daily)',
    decimals: 2,
    description: 'Decentralized digital currency, high beta store of value.',
    iconName: 'Bitcoin'
  },
  NVDA: {
    id: 'NVDA',
    name: 'NVIDIA Corporation',
    symbol: 'NVDA',
    category: 'Equity',
    color: '#10B981', // Emerald green
    lightColor: 'rgba(16, 185, 129, 0.16)',
    currency: 'USD',
    exchange: 'NASDAQ',
    dataSource: 'Alpha Vantage (Time Series Daily / Equity)',
    decimals: 2,
    description: 'Leading GPU and AI hardware/infrastructure computing titan.',
    iconName: 'Cpu'
  },
  ETH: {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH/USD',
    category: 'Crypto',
    color: '#8B5CF6', // Deep Violet
    lightColor: 'rgba(139, 92, 246, 0.16)',
    currency: 'USD',
    exchange: 'Coinbase / Kraken',
    dataSource: 'Alpha Vantage (Digital Currency Daily)',
    decimals: 2,
    description: 'Smart contract and decentralized application base protocol.',
    iconName: 'Zap'
  },
  SPY: {
    id: 'SPY',
    name: 'S&P 500 ETF Trust',
    symbol: 'SPY',
    category: 'Index',
    color: '#14B8A6', // Muted Teal
    lightColor: 'rgba(20, 184, 166, 0.16)',
    currency: 'USD',
    exchange: 'NYSE Arca',
    dataSource: 'Alpha Vantage (Time Series Daily / ETF)',
    decimals: 2,
    description: 'Broad benchmark equity index of 500 leading US corporations.',
    iconName: 'TrendingUp'
  }
};

export const DEFAULT_SELECTED_ASSETS: AssetId[] = ['GOLD', 'BTC', 'NVDA'];
export const AVAILABLE_ASSETS: AssetId[] = ['GOLD', 'BTC', 'NVDA', 'ETH', 'SPY'];
