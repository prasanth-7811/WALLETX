import { AssetId, DataQualityAudit, OHLCV } from '../types';
import { ASSET_REGISTRY } from './assets';

/**
 * Generate data quality audit records for the selected assets
 */
export function auditDataQuality(
  selectedAssets: AssetId[],
  assetCandles: Record<AssetId, OHLCV[]>,
  startDate: string,
  endDate: string
): DataQualityAudit[] {
  const audits: DataQualityAudit[] = [];

  for (const assetId of selectedAssets) {
    const info = ASSET_REGISTRY[assetId];
    const candles = assetCandles[assetId] || [];

    // Audit checks
    let missingValues = 0;
    let duplicates = 0;
    let invalidRecords = 0;

    const seenDates = new Set<string>();

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (seenDates.has(c.date)) {
        duplicates++;
      } else {
        seenDates.add(c.date);
      }

      if (c.open == null || c.high == null || c.low == null || c.close == null || isNaN(c.close)) {
        missingValues++;
      }

      if (c.low > c.high || c.close <= 0 || c.open <= 0 || c.volume < 0) {
        invalidRecords++;
      }
    }

    const hasIssues = missingValues > 0 || duplicates > 0 || invalidRecords > 0;
    const status = hasIssues ? 'WARNING' : 'VALIDATED';

    audits.push({
      assetId,
      assetName: info ? info.name : assetId,
      source: info ? info.dataSource : 'Aggregated Market API',
      frequency: 'Daily (1D)',
      currency: info ? info.currency : 'USD',
      startDate: candles[0]?.date || startDate,
      endDate: candles[candles.length - 1]?.date || endDate,
      recordCount: candles.length,
      missingValues,
      duplicates,
      invalidRecords,
      status,
      calendarAlignment: assetId === 'BTC' || assetId === 'ETH' ? '24/7 Aligned to US Trading Calendar' : 'NYSE / COMEX Trading Calendar',
      lastAuditTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    });
  }

  return audits;
}
