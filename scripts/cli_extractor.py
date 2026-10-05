#!/usr/bin/env python3
"""
================================================================================
Valto Financial Data Extractor - CLI Utility
================================================================================
Command-line interface to extract financial data using hybrid Alpha Vantage & yfinance
fallback routing.

Usage Examples:
    # Single Asset Hybrid Extract (BTC spanning 2018 to 2024)
    python scripts/cli_extractor.py --symbol BTC --start 2018-01-01 --end 2024-12-31 --output btc_data.json

    # Pre-2021 yfinance extraction for NVIDIA
    python scripts/cli_extractor.py --symbol NVDA --start 2016-01-01 --end 2020-12-31 --format csv --output nvda_historical.csv

    # Portfolio Universe Extraction
    python scripts/cli_extractor.py --universe BTC,ETH,NVDA,GOLD,SPY --start 2021-01-01 --end 2024-12-31 --output universe.json

    # Strict Crypto Check Demonstration
    python scripts/cli_extractor.py --symbol ETH --start 2012-01-01 --end 2020-12-31 --strict-crypto
================================================================================
"""

import os
import sys
import json
import argparse
from datetime import datetime

# Ensure standard UTF-8 stream output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add script folder to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from financial_data_extractor import (
    FinancialDataExtractor,
    CryptoHistoryUnavailableError,
    DateRangeInvalidError
)


def main():
    parser = argparse.ArgumentParser(
        description="Valto Hybrid Financial Data Extractor (Alpha Vantage 2021-2025 + yfinance Pre-2021 Fallback)"
    )
    parser.add_argument(
        "--symbol", "-s",
        type=str,
        help="Ticker symbol to extract (e.g., BTC, ETH, NVDA, GOLD, SPY, AAPL)"
    )
    parser.add_argument(
        "--universe", "-u",
        type=str,
        help="Comma-separated list of symbols (e.g., 'BTC,ETH,NVDA,GOLD')"
    )
    parser.add_argument(
        "--start",
        type=str,
        default="2021-01-01",
        help="Start date in YYYY-MM-DD format (Cryptos minimum start year is 2015)"
    )
    parser.add_argument(
        "--end",
        type=str,
        default="2024-12-31",
        help="End date in YYYY-MM-DD format"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Optional output file path (.json or .csv)"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["json", "csv"],
        default="json",
        help="Output export format (default: json)"
    )
    parser.add_argument(
        "--strict-crypto",
        action="store_true",
        default=True,
        help="Enforce strict error if crypto requested before 2015 (default: True)"
    )
    parser.add_argument(
        "--no-strict-crypto",
        dest="strict_crypto",
        action="store_false",
        help="Auto-clamp crypto start date to 2015-01-01 instead of raising error"
    )
    parser.add_argument(
        "--api-key",
        type=str,
        help="Alpha Vantage API key override"
    )

    args = parser.parse_args()

    if not args.symbol and not args.universe:
        parser.error("You must specify either --symbol or --universe.")

    extractor = FinancialDataExtractor(api_key=args.api_key)

    try:
        if args.symbol:
            sym = args.symbol.strip().upper()
            print(f"\n=======================================================")
            print(f"🚀 Extracting data for: {sym}")
            print(f"📅 Window: {args.start} → {args.end}")
            print(f"=======================================================\n")

            df = extractor.extract_data(
                symbol=sym,
                start_date=args.start,
                end_date=args.end,
                strict_crypto_check=args.strict_crypto
            )

            if df.empty:
                print(f"⚠️ No data extracted for {sym}.")
                return

            print(f"\n📊 Extraction Summary for {sym}:")
            print(f"  • Total Observations : {len(df)} trading days")
            print(f"  • Date Range         : {df.index.min().strftime('%Y-%m-%d')} to {df.index.max().strftime('%Y-%m-%d')}")
            print(f"  • Columns            : {list(df.columns)}")
            print(f"  • Sample Head:")
            print(df.head(3))
            print(f"  • Sample Tail:")
            print(df.tail(3))

            if args.output:
                if args.format == "csv" or args.output.endswith(".csv"):
                    df.to_csv(args.output)
                    print(f"\n💾 Saved CSV to: {os.path.abspath(args.output)}")
                else:
                    candles = extractor.to_json_candles(df)
                    with open(args.output, "w", encoding="utf-8") as f:
                        json.dump(candles, f, indent=2)
                    print(f"\n💾 Saved JSON candles to: {os.path.abspath(args.output)}")

        elif args.universe:
            symbols = [s.strip().upper() for s in args.universe.split(",") if s.strip()]
            print(f"\n=======================================================")
            print(f"🚀 Extracting portfolio universe: {symbols}")
            print(f"📅 Window: {args.start} → {args.end}")
            print(f"=======================================================\n")

            data_map = extractor.extract_universe(
                symbols=symbols,
                start_date=args.start,
                end_date=args.end,
                strict_crypto_check=args.strict_crypto
            )

            print(f"\n📊 Universe Extraction Summary:")
            for sym, df in data_map.items():
                print(f"  • {sym:8s}: {len(df):4d} rows ({df.index.min().date() if not df.empty else 'N/A'} → {df.index.max().date() if not df.empty else 'N/A'})")

            if args.output:
                json_universe = {sym: extractor.to_json_candles(df) for sym, df in data_map.items()}
                with open(args.output, "w", encoding="utf-8") as f:
                    json.dump(json_universe, f, indent=2)
                print(f"\n💾 Saved universe JSON to: {os.path.abspath(args.output)}")

    except CryptoHistoryUnavailableError as err:
        print(f"\n❌ [Crypto Availability Error]: {err}")
        sys.exit(1)
    except DateRangeInvalidError as err:
        print(f"\n❌ [Date Range Error]: {err}")
        sys.exit(1)
    except Exception as err:
        print(f"\n❌ [Extraction Exception]: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
