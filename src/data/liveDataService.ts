import type { AssetId, OHLCV } from '../types';
import { fetchAlphaVantageData } from './alphaVantageService';

const CACHE_PREFIX = 'walletx_live_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  candles: OHLCV[];
  fetchedAt: number;
}

function readCache(assetId: AssetId): OHLCV[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + assetId);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry.candles;
  } catch {
    return null;
  }
}

function writeCache(assetId: AssetId, candles: OHLCV[]) {
  try {
    const entry: CacheEntry = { candles, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_PREFIX + assetId, JSON.stringify(entry));
  } catch {
    // storage quota exceeded — skip silently
  }
}

/** Merge static + live candles, deduplicate by date, sort ascending */
export function mergeCandles(staticCandles: OHLCV[], liveCandles: OHLCV[]): OHLCV[] {
  const map = new Map<string, OHLCV>();
  for (const c of staticCandles) map.set(c.date, c);
  for (const c of liveCandles) map.set(c.date, c);   // live overwrites static
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch live OHLCV for an asset via Alpha Vantage.
 * Returns cached data if fresh, otherwise fetches and caches.
 */
export async function fetchLiveCandles(
  assetId: AssetId,
  apiKey: string
): Promise<OHLCV[] | null> {
  const cached = readCache(assetId);
  if (cached) return cached;

  const candles = await fetchAlphaVantageData(assetId, apiKey);
  if (candles && candles.length > 0) {
    writeCache(assetId, candles);
    return candles;
  }
  return null;
}

/** Clear cached live data for all assets (force re-fetch) */
export function clearLiveCache() {
  const assets: AssetId[] = ['GOLD', 'BTC', 'NVDA', 'ETH', 'SPY'];
  for (const a of assets) localStorage.removeItem(CACHE_PREFIX + a);
}

/** Returns ISO date string of last cache write, or null */
export function getCacheTimestamp(assetId: AssetId): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + assetId);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    return new Date(entry.fetchedAt).toISOString();
  } catch {
    return null;
  }
}
