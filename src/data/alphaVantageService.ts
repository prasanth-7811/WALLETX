import type { AssetId, OHLCV } from '../types';

export interface AlphaVantageDailyQuote {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const SYMBOL_MAP: Record<AssetId, { function: string; symbol: string; market?: string }> = {
  GOLD: { function: 'TIME_SERIES_DAILY', symbol: 'GLD' },
  BTC: { function: 'DIGITAL_CURRENCY_DAILY', symbol: 'BTC', market: 'USD' },
  NVDA: { function: 'TIME_SERIES_DAILY', symbol: 'NVDA' },
  ETH: { function: 'DIGITAL_CURRENCY_DAILY', symbol: 'ETH', market: 'USD' },
  SPY: { function: 'TIME_SERIES_DAILY', symbol: 'SPY' },
};

/**
 * Fetch official daily time series directly from Alpha Vantage API
 */
export async function fetchAlphaVantageData(
  assetId: AssetId,
  apiKey: string
): Promise<OHLCV[] | null> {
  if (!apiKey || apiKey.trim() === '') return null;

  const mapping = SYMBOL_MAP[assetId];
  if (!mapping) return null;

  let url = `https://www.alphavantage.co/query?function=${mapping.function}&symbol=${mapping.symbol}&outputsize=full&apikey=${apiKey}`;
  if (mapping.market) {
    url += `&market=${mapping.market}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();

    const timeSeriesKey = Object.keys(json).find(
      k => k.includes('Time Series') || k.includes('Time Series (Digital Currency')
    );

    if (!timeSeriesKey || !json[timeSeriesKey]) {
      console.warn(`Alpha Vantage rate limit or error for ${assetId}:`, json['Note'] || json['Error Message'] || json['Information']);
      return null;
    }

    const rawData = json[timeSeriesKey];
    const candles: OHLCV[] = [];

    const today = new Date().toISOString().split('T')[0];
    for (const dateStr of Object.keys(rawData).sort()) {
      if (dateStr < '2016-01-01' || dateStr > today) continue;
      const day = rawData[dateStr];
      const open = parseFloat(day['1. open'] || day['1a. open (USD)'] || '0');
      const high = parseFloat(day['2. high'] || day['2a. high (USD)'] || '0');
      const low = parseFloat(day['3. low'] || day['3a. low (USD)'] || '0');
      const close = parseFloat(day['4. close'] || day['4a. close (USD)'] || '0');
      const volume = parseInt(day['5. volume'] || day['5. volume (USD)'] || '0', 10);

      if (close > 0) {
        candles.push({
          date: dateStr,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume,
        });
      }
    }

    return candles.length > 0 ? candles : null;
  } catch (err) {
    console.error(`Error fetching Alpha Vantage data for ${assetId}:`, err);
    return null;
  }
}
