"""
Fetch live OHLCV data from Yahoo Finance and patch authenticData.json up to today.
Run this script whenever you want to refresh the dataset.
"""

import json
import datetime
import yfinance as yf

DATA_PATH = "src/data/authenticData.json"

SYMBOL_MAP = {
    "GOLD": "GLD",
    "BTC":  "BTC-USD",
    "NVDA": "NVDA",
    "ETH":  "ETH-USD",
    "SPY":  "SPY",
}

TODAY = datetime.date.today().isoformat()
NOW   = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

print(f"Current PC time : {NOW}")
print(f"Fetching data up to : {TODAY}\n")

# Load existing data
with open(DATA_PATH, "r") as f:
    data = json.load(f)

for asset_id, ticker in SYMBOL_MAP.items():
    existing = data.get(asset_id, [])
    last_date = existing[-1]["date"] if existing else "2016-01-01"

    # Fetch only the missing range (day after last date → today)
    fetch_start = (datetime.date.fromisoformat(last_date) + datetime.timedelta(days=1)).isoformat()

    if fetch_start > TODAY:
        print(f"  {asset_id:<6} already up to date ({last_date})")
        continue

    print(f"  {asset_id:<6} fetching {fetch_start} -> {TODAY} ...", end=" ")

    try:
        df = yf.download(ticker, start=fetch_start, end=TODAY, progress=False, auto_adjust=True)

        if df.empty:
            print("no new data")
            continue

        new_candles = []
        for date_idx, row in df.iterrows():
            date_str = date_idx.strftime("%Y-%m-%d")
            close = float(row["Close"].iloc[0]) if hasattr(row["Close"], "iloc") else float(row["Close"])
            open_ = float(row["Open"].iloc[0])  if hasattr(row["Open"],  "iloc") else float(row["Open"])
            high  = float(row["High"].iloc[0])  if hasattr(row["High"],  "iloc") else float(row["High"])
            low   = float(row["Low"].iloc[0])   if hasattr(row["Low"],   "iloc") else float(row["Low"])
            vol   = int(row["Volume"].iloc[0])  if hasattr(row["Volume"],"iloc") else int(row["Volume"])

            if close > 0:
                new_candles.append({
                    "date":   date_str,
                    "open":   round(open_, 2),
                    "high":   round(high,  2),
                    "low":    round(low,   2),
                    "close":  round(close, 2),
                    "volume": vol,
                })

        # Merge: deduplicate by date
        existing_dates = {c["date"] for c in existing}
        added = [c for c in new_candles if c["date"] not in existing_dates]
        data[asset_id] = sorted(existing + added, key=lambda x: x["date"])

        print(f"+{len(added)} candles  (now ends {data[asset_id][-1]['date']})")

    except Exception as e:
        print(f"ERROR: {e}")

# Save updated data
with open(DATA_PATH, "w") as f:
    json.dump(data, f, separators=(",", ":"))

print(f"\nDone. authenticData.json updated to {TODAY}")
print("Restart the dev server (npm run dev) to see the latest data.")
