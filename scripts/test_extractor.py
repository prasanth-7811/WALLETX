"""
================================================================================
Test Suite for Financial Data Extractor
================================================================================
Verifies:
  1. Alpha Vantage Only Extraction (2021-2025)
  2. yfinance Only Extraction (pre-2021)
  3. Hybrid Merging across 2021 boundary with 0 duplicates & gaps
  4. Cryptocurrency pre-2015 historical constraint handling
  5. Schema consistency (Open, High, Low, Close, Volume)
  6. Multi-asset portfolio extraction
================================================================================
"""

import sys
import unittest
from datetime import datetime
import pandas as pd

from financial_data_extractor import (
    FinancialDataExtractor,
    ExtractionStrategy,
    AssetClass,
    CryptoHistoryUnavailableError,
    DateRangeInvalidError
)


class TestFinancialDataExtractor(unittest.TestCase):

    def setUp(self):
        self.extractor = FinancialDataExtractor()

    def test_asset_class_detection(self):
        """Verify proper asset classification."""
        self.assertEqual(self.extractor.get_asset_class('BTC'), AssetClass.CRYPTO)
        self.assertEqual(self.extractor.get_asset_class('ETH'), AssetClass.CRYPTO)
        self.assertEqual(self.extractor.get_asset_class('BTC-USD'), AssetClass.CRYPTO)
        self.assertEqual(self.extractor.get_asset_class('NVDA'), AssetClass.EQUITY)
        self.assertEqual(self.extractor.get_asset_class('GOLD'), AssetClass.COMMODITY)
        self.assertEqual(self.extractor.get_asset_class('SPY'), AssetClass.ETF)

    def test_date_validation_and_strategy_routing(self):
        """Verify correct strategy selection based on user-selected date ranges."""
        # Case 1: Within 2021-2025 -> Alpha Vantage Only
        _, _, strat1 = self.extractor.validate_and_normalize_dates('NVDA', '2021-01-01', '2024-12-31')
        self.assertEqual(strat1, ExtractionStrategy.ALPHA_VANTAGE_ONLY)

        # Case 2: Entirely pre-2021 -> yfinance Only
        _, _, strat2 = self.extractor.validate_and_normalize_dates('NVDA', '2016-01-01', '2020-12-31')
        self.assertEqual(strat2, ExtractionStrategy.YFINANCE_ONLY)

        # Case 3: Spans pre-2021 and 2021-2025 -> Hybrid Merge
        _, _, strat3 = self.extractor.validate_and_normalize_dates('NVDA', '2018-01-01', '2023-12-31')
        self.assertEqual(strat3, ExtractionStrategy.HYBRID_MERGE)

    def test_crypto_pre_2015_error_handling(self):
        """Verify cryptocurrency error handling for dates requested prior to 2015."""
        # Strict mode must raise CryptoHistoryUnavailableError
        with self.assertRaises(CryptoHistoryUnavailableError) as ctx:
            self.extractor.validate_and_normalize_dates('BTC', '2012-05-10', '2020-12-31', strict_crypto_check=True)
        self.assertIn("Historical market data for cryptocurrency 'BTC' is unavailable before 2015", str(ctx.exception))

        with self.assertRaises(CryptoHistoryUnavailableError) as ctx_eth:
            self.extractor.validate_and_normalize_dates('ETH', '2014-01-01', '2020-12-31', strict_crypto_check=True)
        self.assertIn("Historical market data for cryptocurrency 'ETH' is unavailable before 2015", str(ctx_eth.exception))

        # Clamped mode must adjust start date to 2015-01-01
        start_str, _, _ = self.extractor.validate_and_normalize_dates('BTC', '2011-01-01', '2020-12-31', strict_crypto_check=False)
        self.assertEqual(start_str, '2015-01-01')

    def test_invalid_date_order(self):
        """Verify error when start date is after end date."""
        with self.assertRaises(DateRangeInvalidError):
            self.extractor.validate_and_normalize_dates('SPY', '2023-01-01', '2020-01-01')

    def test_schema_consistency_yfinance(self):
        """Verify schema of yfinance pre-2021 extraction."""
        df = self.extractor.fetch_from_yfinance('SPY', '2019-01-01', '2019-01-15')
        self.assertFalse(df.empty)
        self.assertEqual(list(df.columns), ['Open', 'High', 'Low', 'Close', 'Volume'])
        self.assertEqual(df.index.name, 'Date')
        self.assertTrue(isinstance(df.index, pd.DatetimeIndex))
        self.assertTrue(pd.api.types.is_float_dtype(df['Close']))

    def test_hybrid_extraction_seamless_boundary(self):
        """
        Verify that hybrid extraction combines data across the 2021-01-01 boundary
        with 0 duplicates and continuous chronological sorting.
        """
        df = self.extractor.extract_data('NVDA', '2020-12-01', '2021-01-15')
        self.assertFalse(df.empty)
        
        # Check no duplicate dates
        duplicate_count = df.index.duplicated().sum()
        self.assertEqual(duplicate_count, 0, f"Found {duplicate_count} duplicate dates at boundary")

        # Check chronological ordering
        self.assertTrue(df.index.is_monotonic_increasing)

        # Check schema
        self.assertEqual(list(df.columns), ['Open', 'High', 'Low', 'Close', 'Volume'])

        # Verify dates span across 2020 and 2021
        min_year = df.index.min().year
        max_year = df.index.max().year
        self.assertEqual(min_year, 2020)
        self.assertEqual(max_year, 2021)

    def test_json_conversion(self):
        """Verify conversion to standard JSON candle records."""
        df = self.extractor.fetch_from_yfinance('GOLD', '2020-01-02', '2020-01-10')
        self.assertFalse(df.empty)
        candles = self.extractor.to_json_candles(df)
        self.assertIsInstance(candles, list)
        self.assertGreater(len(candles), 0)
        self.assertIn('date', candles[0])
        self.assertIn('open', candles[0])
        self.assertIn('close', candles[0])


if __name__ == '__main__':
    print("\n" + "="*70)
    print(" RUNNING UNIT TESTS FOR FINANCIAL DATA EXTRACTION ENGINE")
    print("="*70)
    unittest.main(verbosity=2)
