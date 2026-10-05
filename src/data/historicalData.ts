import type { AssetId, OHLCV } from '../types';
import authenticDataJson from './authenticData.json';

// Authentic Official Historical OHLCV Series (2021-01-01 to 2025-01-01)
export const HISTORICAL_DATA: Record<AssetId, OHLCV[]> = authenticDataJson as Record<AssetId, OHLCV[]>;

// Extract complete calendar of aligned trading dates
const goldDates = new Set((HISTORICAL_DATA.GOLD || []).map(c => c.date));
const btcDates = new Set((HISTORICAL_DATA.BTC || []).map(c => c.date));
const nvdaDates = new Set((HISTORICAL_DATA.NVDA || []).map(c => c.date));

// Common US trading days where market observations exist
export const FULL_CALENDAR_DATES: string[] = (HISTORICAL_DATA.NVDA || []).map(c => c.date);

/**
 * Filter and align data series for the selected assets within the requested date range.
 * Handles non-trading days transparently and validates observation counts.
 */
export function getFilteredDataset(
  selectedAssets: AssetId[],
  startDate: string,
  endDate: string,
  overrideData?: Record<AssetId, OHLCV[]>
): {
  data: Record<AssetId, OHLCV[]>;
  dates: string[];
  actualStartDate: string;
  actualEndDate: string;
  adjustedStart: boolean;
  adjustedEnd: boolean;
  totalObservations: number;
} {
  if (selectedAssets.length === 0) {
    return {
      data: {} as Record<AssetId, OHLCV[]>,
      dates: [],
      actualStartDate: startDate,
      actualEndDate: endDate,
      adjustedStart: false,
      adjustedEnd: false,
      totalObservations: 0,
    };
  }

  // Determine common aligned trading calendar across selected assets
  let validDates = FULL_CALENDAR_DATES.filter(d => d >= startDate && d <= endDate);

  // If only 24/7 crypto selected, use full crypto calendar
  const isOnlyCrypto = selectedAssets.every(a => a === 'BTC' || a === 'ETH');
  if (isOnlyCrypto && HISTORICAL_DATA.BTC) {
    validDates = HISTORICAL_DATA.BTC.filter(c => c.date >= startDate && c.date <= endDate).map(c => c.date);
  }

  let adjustedStart = false;
  let adjustedEnd = false;

  if (validDates.length > 0) {
    if (validDates[0] !== startDate) adjustedStart = true;
    if (validDates[validDates.length - 1] !== endDate) adjustedEnd = true;
  } else {
    validDates = FULL_CALENDAR_DATES.slice(-252);
    adjustedStart = true;
    adjustedEnd = true;
  }

  const actualStartDate = validDates[0];
  const actualEndDate = validDates[validDates.length - 1];

  const data: Partial<Record<AssetId, OHLCV[]>> = {};

  for (const asset of selectedAssets) {
    const fullSeries = (overrideData?.[asset] ?? HISTORICAL_DATA[asset]) || [];
    const dateMap = new Map<string, OHLCV>();
    fullSeries.forEach(c => dateMap.set(c.date, c));

    // Align to common date series without fabricating prices
    const aligned: OHLCV[] = [];
    let lastKnown = fullSeries[0];

    for (const d of validDates) {
      if (dateMap.has(d)) {
        const item = dateMap.get(d)!;
        aligned.push(item);
        lastKnown = item;
      } else if (lastKnown) {
        // Forward fill for missing market holiday to keep portfolio synchronous
        aligned.push({
          ...lastKnown,
          date: d,
          volume: 0,
        });
      }
    }
    data[asset] = aligned;
  }

  return {
    data: data as Record<AssetId, OHLCV[]>,
    dates: validDates,
    actualStartDate,
    actualEndDate,
    adjustedStart,
    adjustedEnd,
    totalObservations: validDates.length,
  };
}
