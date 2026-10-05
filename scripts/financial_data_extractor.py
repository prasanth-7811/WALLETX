"""
================================================================================
Financial Data Extraction Engine (Alpha Vantage + yfinance Fallback)
================================================================================
A hybrid financial data extraction system with automatic source routing:
  - Primary source: Alpha Vantage (2021 to 2025)
  - Historical Fallback source: yfinance (pre-2021)
  - Cryptocurrency constraint: Minimum start year 2015 for BTC & ETH
  - Boundary handling: Seamless merging at the 2021-01-01 threshold without gaps or duplicates
  - Schema consistency: Normalized ['Open', 'High', 'Low', 'Close', 'Volume']
================================================================================
"""

import os
import sys
import json
import logging
from enum import Enum
from datetime import datetime, date, timezone
from typing import Dict, List, Optional, Tuple, Union, Any

import pandas as pd
import numpy as np
import requests

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

# Ensure standard UTF-8 stream output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("FinancialDataExtractor")


class AssetClass(Enum):
    CRYPTO = "CRYPTO"
    EQUITY = "EQUITY"
    COMMODITY = "COMMODITY"
    ETF = "ETF"


class ExtractionStrategy(Enum):
    ALPHA_VANTAGE_ONLY = "ALPHA_VANTAGE_ONLY"  # Entirely within 2021-2025
    YFINANCE_ONLY = "YFINANCE_ONLY"             # Entirely before 2021 (or outside AV coverage)
    HYBRID_MERGE = "HYBRID_MERGE"               # Spans across 2021 boundary


class FinancialDataExtractorError(Exception):
    """Base exception for extraction errors."""
    pass


class CryptoHistoryUnavailableError(FinancialDataExtractorError):
    """Raised when cryptocurrency data is requested before the 2015 historical threshold."""
    def __init__(self, symbol: str, requested_start: str, min_year: int = 2015):
        self.symbol = symbol
        self.requested_start = requested_start
        self.min_year = min_year
        self.message = (
            f"Historical market data for cryptocurrency '{symbol}' is unavailable before {min_year}. "
            f"Requested start date '{requested_start}' precedes the minimum availability boundary ({min_year}-01-01). "
            f"Please adjust the start year to {min_year} or later."
        )
        super().__init__(self.message)


class DateRangeInvalidError(FinancialDataExtractorError):
    """Raised when start date is after end date."""
    pass


class FinancialDataExtractor:
    """
    Unified Multi-Asset Financial Data Extractor.
    Automatically coordinates Alpha Vantage and yfinance with seamless hybrid merging.
    """

    # Boundary Constants
    AV_START_DATE = "2021-01-01"
    AV_END_DATE = "2025-01-01"
    CRYPTO_MIN_START_YEAR = 2015
    STANDARD_COLUMNS = ['Open', 'High', 'Low', 'Close', 'Volume']

    # Known Ticker Mappings (Internal Symbol -> Provider Symbols)
    TICKER_MAP = {
        'BTC': {'av_crypto': 'BTC', 'av_stock': None, 'yf': 'BTC-USD', 'class': AssetClass.CRYPTO, 'name': 'Bitcoin'},
        'ETH': {'av_crypto': 'ETH', 'av_stock': None, 'yf': 'ETH-USD', 'class': AssetClass.CRYPTO, 'name': 'Ethereum'},
        'BTC-USD': {'av_crypto': 'BTC', 'av_stock': None, 'yf': 'BTC-USD', 'class': AssetClass.CRYPTO, 'name': 'Bitcoin'},
        'ETH-USD': {'av_crypto': 'ETH', 'av_stock': None, 'yf': 'ETH-USD', 'class': AssetClass.CRYPTO, 'name': 'Ethereum'},
        'NVDA': {'av_crypto': None, 'av_stock': 'NVDA', 'yf': 'NVDA', 'class': AssetClass.EQUITY, 'name': 'NVIDIA Corp'},
        'SPY': {'av_crypto': None, 'av_stock': 'SPY', 'yf': 'SPY', 'class': AssetClass.ETF, 'name': 'SPDR S&P 500 ETF'},
        'GOLD': {'av_crypto': None, 'av_stock': 'GC=F', 'yf': 'GC=F', 'class': AssetClass.COMMODITY, 'name': 'Gold (Futures/Spot)'},
        'GC=F': {'av_crypto': None, 'av_stock': 'GC=F', 'yf': 'GC=F', 'class': AssetClass.COMMODITY, 'name': 'Gold (Futures/Spot)'},
        'AAPL': {'av_crypto': None, 'av_stock': 'AAPL', 'yf': 'AAPL', 'class': AssetClass.EQUITY, 'name': 'Apple Inc'},
        'MSFT': {'av_crypto': None, 'av_stock': 'MSFT', 'yf': 'MSFT', 'class': AssetClass.EQUITY, 'name': 'Microsoft Corp'},
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the extractor.
        :param api_key: Alpha Vantage API key (defaults to env or project configuration).
        """
        self.api_key = api_key or os.environ.get('ALPHA_VANTAGE_API_KEY', '5067DE3NDPLWS6G6')
        self._session = requests.Session()
        self._session.headers.update({'User-Agent': 'ValtoFinancialDataExtractor/1.0'})

    def get_asset_class(self, symbol: str) -> AssetClass:
        """Identify asset class for a given symbol."""
        sym = symbol.upper()
        if sym in self.TICKER_MAP:
            return self.TICKER_MAP[sym]['class']
        if sym.endswith('-USD') or sym in ('BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE'):
            return AssetClass.CRYPTO
        return AssetClass.EQUITY

    def validate_and_normalize_dates(
        self,
        symbol: str,
        start_date: Union[str, datetime, date],
        end_date: Union[str, datetime, date],
        strict_crypto_check: bool = True
    ) -> Tuple[str, str, ExtractionStrategy]:
        """
        Validates date ranges and determines the optimal extraction strategy.
        """
        start_str = start_date.strftime('%Y-%m-%d') if isinstance(start_date, (datetime, date)) else str(start_date)
        end_str = end_date.strftime('%Y-%m-%d') if isinstance(end_date, (datetime, date)) else str(end_date)

        if start_str > end_str:
            raise DateRangeInvalidError(f"Start date '{start_str}' cannot be greater than end date '{end_str}'.")

        asset_class = self.get_asset_class(symbol)
        start_dt = datetime.strptime(start_str, '%Y-%m-%d')

        # Cryptocurrency 2015 historical check
        if asset_class == AssetClass.CRYPTO:
            if start_dt.year < self.CRYPTO_MIN_START_YEAR:
                if strict_crypto_check:
                    raise CryptoHistoryUnavailableError(symbol, start_str, self.CRYPTO_MIN_START_YEAR)
                else:
                    logger.warning(
                        f"⚠️ [Crypto Constraint] '{symbol}' data requested starting {start_str}. "
                        f"Cryptocurrency historical data begins in {self.CRYPTO_MIN_START_YEAR}. "
                        f"Clamping start date to '{self.CRYPTO_MIN_START_YEAR}-01-01'."
                    )
                    start_str = f"{self.CRYPTO_MIN_START_YEAR}-01-01"

        # Determine strategy based on boundaries
        if start_str >= self.AV_START_DATE and end_str <= self.AV_END_DATE:
            strategy = ExtractionStrategy.ALPHA_VANTAGE_ONLY
        elif end_str < self.AV_START_DATE or start_str > self.AV_END_DATE:
            strategy = ExtractionStrategy.YFINANCE_ONLY
        else:
            strategy = ExtractionStrategy.HYBRID_MERGE

        logger.info(
            f"📊 Asset: '{symbol}' ({asset_class.value}) | Range: {start_str} → {end_str} | Strategy: {strategy.value}"
        )
        return start_str, end_str, strategy

    def fetch_from_yfinance(
        self,
        symbol: str,
        start_date: str,
        end_date: str
    ) -> pd.DataFrame:
        """
        Extract normalized OHLCV data from yfinance (or direct Yahoo Finance API fallback).
        Ensures exact schema consistency with Alpha Vantage.
        """
        yf_symbol = self.TICKER_MAP.get(symbol.upper(), {}).get('yf', symbol)
        logger.info(f"⬇️  [yfinance] Fetching {symbol} (Ticker: {yf_symbol}) for {start_date} → {end_date}")

        df = pd.DataFrame()

        # Method A: Try yfinance package if available
        if YFINANCE_AVAILABLE:
            try:
                # Add 1 day to end_date for yfinance inclusive fetch
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                yf_end_str = (end_dt + pd.Timedelta(days=1)).strftime('%Y-%m-%d')
                
                ticker_obj = yf.Ticker(yf_symbol)
                raw_df = ticker_obj.history(start=start_date, end=yf_end_str, auto_adjust=False)
                
                if raw_df is not None and not raw_df.empty:
                    # Reset timezone to tz-naive
                    if raw_df.index.tz is not None:
                        raw_df.index = raw_df.index.tz_localize(None)
                    
                    df = raw_df[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
            except Exception as e:
                logger.warning(f"⚠️  [yfinance Library Warning] {e}. Falling back to direct Yahoo Finance query API.")

        # Method B: Direct Yahoo Finance Query API fallback
        if df.empty:
            try:
                p1 = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
                p2 = int(datetime.strptime(end_date, '%Y-%m-%d').timestamp()) + 86400
                url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}?period1={p1}&period2={p2}&interval=1d"
                
                res = self._session.get(url, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    chart_result = data.get('chart', {}).get('result', [])
                    if chart_result:
                        res_item = chart_result[0]
                        timestamps = res_item.get('timestamp', [])
                        quote = res_item.get('indicators', {}).get('quote', [{}])[0]
                        
                        dates = [datetime.fromtimestamp(ts, timezone.utc).strftime('%Y-%m-%d') for ts in timestamps]
                        df = pd.DataFrame({
                            'Date': pd.to_datetime(dates),
                            'Open': quote.get('open', []),
                            'High': quote.get('high', []),
                            'Low': quote.get('low', []),
                            'Close': quote.get('close', []),
                            'Volume': quote.get('volume', [])
                        })
                        df.set_index('Date', inplace=True)
            except Exception as ex:
                logger.error(f"❌ [yfinance Fallback Error] Failed to fetch {symbol} via Yahoo Query: {ex}")

        # Post-Processing & Filtering
        if df.empty:
            logger.warning(f"⚠️  No data returned from yfinance for {symbol} in {start_date} → {end_date}")
            return self._create_empty_dataframe()

        # Format and Clean
        df = df[self.STANDARD_COLUMNS].copy()
        df = df.dropna(subset=['Close'])
        df = df[(df.index >= pd.to_datetime(start_date)) & (df.index <= pd.to_datetime(end_date))]
        df = df[~df.index.duplicated(keep='first')]
        df.sort_index(inplace=True)
        df.index.name = 'Date'

        # Type conversion & rounding
        for col in ['Open', 'High', 'Low', 'Close']:
            df[col] = df[col].astype(float).round(2)
        df['Volume'] = df['Volume'].fillna(0).astype(np.int64)

        logger.info(f"✅ [yfinance] Successfully extracted {len(df)} rows for {symbol} ({start_date} to {end_date})")
        return df

    def fetch_from_alpha_vantage(
        self,
        symbol: str,
        start_date: str,
        end_date: str
    ) -> pd.DataFrame:
        """
        Extract normalized OHLCV data from Alpha Vantage API.
        Falls back seamlessly to yfinance if rate limits or network issues occur.
        """
        asset_class = self.get_asset_class(symbol)
        logger.info(f"⬇️  [Alpha Vantage] Fetching {symbol} ({asset_class.value}) for {start_date} → {end_date}")

        df = pd.DataFrame()
        av_stock = self.TICKER_MAP.get(symbol.upper(), {}).get('av_stock')
        av_crypto = self.TICKER_MAP.get(symbol.upper(), {}).get('av_crypto')

        try:
            if asset_class == AssetClass.CRYPTO:
                crypto_sym = av_crypto or symbol.replace('-USD', '')
                url = (
                    f"https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY"
                    f"&symbol={crypto_sym}&market=USD&apikey={self.api_key}"
                )
                res = self._session.get(url, timeout=12)
                data = res.json()
                ts_key = "Time Series (Digital Currency Daily)"
                if ts_key in data:
                    records = []
                    for dt_str, v in data[ts_key].items():
                        records.append({
                            'Date': pd.to_datetime(dt_str),
                            'Open': float(v.get('1a. open (USD)', v.get('1. open', 0))),
                            'High': float(v.get('2a. high (USD)', v.get('2. high', 0))),
                            'Low': float(v.get('3a. low (USD)', v.get('3. low', 0))),
                            'Close': float(v.get('4a. close (USD)', v.get('4. close', 0))),
                            'Volume': float(v.get('5. volume', 0))
                        })
                    if records:
                        df = pd.DataFrame(records).set_index('Date')
            else:
                stock_sym = av_stock or symbol
                url = (
                    f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY"
                    f"&symbol={stock_sym}&outputsize=full&apikey={self.api_key}"
                )
                res = self._session.get(url, timeout=12)
                data = res.json()
                ts_key = "Time Series (Daily)"
                if ts_key in data:
                    records = []
                    for dt_str, v in data[ts_key].items():
                        records.append({
                            'Date': pd.to_datetime(dt_str),
                            'Open': float(v.get('1. open', 0)),
                            'High': float(v.get('2. high', 0)),
                            'Low': float(v.get('3. low', 0)),
                            'Close': float(v.get('4. close', 0)),
                            'Volume': float(v.get('5. volume', 0))
                        })
                    if records:
                        df = pd.DataFrame(records).set_index('Date')
        except Exception as e:
            logger.warning(f"⚠️  [Alpha Vantage API Error] {e}. Invoking automatic yfinance fallback.")

        # If Alpha Vantage rate-limited or failed, fallback to yfinance for this window
        if df.empty:
            logger.warning(f"⚠️  [Alpha Vantage] Rate-limited or empty. Seamlessly routing to yfinance fallback.")
            return self.fetch_from_yfinance(symbol, start_date, end_date)

        # Clean, filter, format
        df = df[self.STANDARD_COLUMNS].copy()
        df = df.dropna(subset=['Close'])
        df = df[(df.index >= pd.to_datetime(start_date)) & (df.index <= pd.to_datetime(end_date))]
        df = df[~df.index.duplicated(keep='first')]
        df.sort_index(inplace=True)
        df.index.name = 'Date'

        for col in ['Open', 'High', 'Low', 'Close']:
            df[col] = df[col].astype(float).round(2)
        df['Volume'] = df['Volume'].fillna(0).astype(np.int64)

        logger.info(f"✅ [Alpha Vantage] Successfully extracted {len(df)} rows for {symbol} ({start_date} to {end_date})")
        return df

    def extract_data(
        self,
        symbol: str,
        start_date: Union[str, datetime, date] = "2021-01-01",
        end_date: Union[str, datetime, date] = "2024-12-31",
        strict_crypto_check: bool = True
    ) -> pd.DataFrame:
        """
        Unified extraction method implementing automatic routing:
          - Validates date boundaries and crypto 2015 constraints
          - Routes to Alpha Vantage only, yfinance only, or hybrid merge
          - Combines slices seamlessly without duplicates or gaps
          - Returns standardized DataFrame with identical schema
        """
        start_str, end_str, strategy = self.validate_and_normalize_dates(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            strict_crypto_check=strict_crypto_check
        )

        if strategy == ExtractionStrategy.ALPHA_VANTAGE_ONLY:
            # 2021-2025 single provider fetch
            df = self.fetch_from_alpha_vantage(symbol, start_str, end_str)

        elif strategy == ExtractionStrategy.YFINANCE_ONLY:
            # Entirely pre-2021 single provider fetch
            df = self.fetch_from_yfinance(symbol, start_str, end_str)

        elif strategy == ExtractionStrategy.HYBRID_MERGE:
            # Spans across 2021 boundary:
            # Slice 1: yfinance for [start_str -> 2020-12-31]
            # Slice 2: Alpha Vantage for [2021-01-01 -> end_str]
            split_boundary = "2020-12-31"
            av_start = "2021-01-01"

            logger.info(f"🔄 [Hybrid Merge] Slicing {symbol}: Part 1 (yfinance) -> {start_str} to {split_boundary}")
            df_pre = self.fetch_from_yfinance(symbol, start_str, split_boundary)

            logger.info(f"🔄 [Hybrid Merge] Slicing {symbol}: Part 2 (Alpha Vantage) -> {av_start} to {end_str}")
            df_post = self.fetch_from_alpha_vantage(symbol, av_start, end_str)

            # Combine slices
            if not df_pre.empty and not df_post.empty:
                df = pd.concat([df_pre, df_post])
            elif not df_pre.empty:
                df = df_pre
            else:
                df = df_post

            # Remove any boundary overlap and sort chronologically
            df = df[~df.index.duplicated(keep='last')]
            df.sort_index(inplace=True)
            df.index.name = 'Date'
            logger.info(f"✨ [Hybrid Merge] Successfully merged {len(df_pre)} pre-2021 rows + {len(df_post)} post-2021 rows = {len(df)} total rows.")

        else:
            df = self._create_empty_dataframe()

        return df

    def extract_universe(
        self,
        symbols: List[str],
        start_date: Union[str, datetime, date] = "2021-01-01",
        end_date: Union[str, datetime, date] = "2024-12-31",
        strict_crypto_check: bool = False
    ) -> Dict[str, pd.DataFrame]:
        """
        Extract financial data for a portfolio universe of multiple symbols.
        """
        universe_data = {}
        for sym in symbols:
            try:
                df = self.extract_data(sym, start_date, end_date, strict_crypto_check=strict_crypto_check)
                universe_data[sym] = df
            except Exception as e:
                logger.error(f"❌ Failed to extract {sym}: {e}")
                universe_data[sym] = self._create_empty_dataframe()
        return universe_data

    def to_json_candles(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Converts DataFrame to standard JSON candle records matching Valto platform schema.
        """
        if df.empty:
            return []
        candles = []
        for dt, row in df.iterrows():
            candles.append({
                'date': dt.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })
        return candles

    def _create_empty_dataframe(self) -> pd.DataFrame:
        """Create empty standardized DataFrame."""
        df = pd.DataFrame(columns=self.STANDARD_COLUMNS)
        df.index.name = 'Date'
        return df


# ----------------------------------------------------------------------
# CLI Helper Execution
# ----------------------------------------------------------------------
if __name__ == "__main__":
    extractor = FinancialDataExtractor()

    print("\n" + "="*70)
    print(" FINANCIAL DATA EXTRACTION SYSTEM (Alpha Vantage + yfinance)")
    print("="*70 + "\n")

    # Demo 1: Hybrid extraction across 2021 boundary for Bitcoin (2018 -> 2024)
    print(">>> 1. Testing Hybrid Extraction (BTC: 2018-01-01 -> 2024-12-31)...")
    btc_df = extractor.extract_data('BTC', '2018-01-01', '2024-12-31')
    print(btc_df.head(2))
    print(f"... total rows: {len(btc_df)} | Date range: {btc_df.index.min().date()} to {btc_df.index.max().date()}\n")

    # Demo 2: Crypto pre-2015 constraint test
    print(">>> 2. Testing Crypto 2015 Constraint (BTC requested from 2012)...")
    try:
        extractor.extract_data('BTC', '2012-01-01', '2020-12-31', strict_crypto_check=True)
    except CryptoHistoryUnavailableError as err:
        print(f"Caught Expected Error: {err}\n")

    # Demo 3: Equities pre-2021 extraction (NVDA 2017-2020)
    print(">>> 3. Testing Pre-2021 yfinance Extraction (NVDA: 2017-01-01 -> 2020-12-31)...")
    nvda_df = extractor.extract_data('NVDA', '2017-01-01', '2020-12-31')
    print(nvda_df.head(2))
    print(f"... total rows: {len(nvda_df)} | Date range: {nvda_df.index.min().date()} to {nvda_df.index.max().date()}\n")

    print("="*70)
    print(" System ready for production deployment.")
    print("="*70)
