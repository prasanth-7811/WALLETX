import urllib.request
import json
from datetime import datetime, timezone
import os

tickers = {
    'GOLD': 'GC=F',
    'BTC': 'BTC-USD',
    'NVDA': 'NVDA',
    'ETH': 'ETH-USD',
    'SPY': 'SPY'
}

all_candles = {}

# Timestamps for 2021-01-01 (1609459200) to 2025-01-01 (1735689600)
p1 = 1609459200
p2 = 1735776000

for asset_id, ticker in tickers.items():
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?period1={p1}&period2={p2}&interval=1d'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())['chart']['result'][0]
            timestamps = result['timestamp']
            quote = result['indicators']['quote'][0]
            opens = quote.get('open', [])
            highs = quote.get('high', [])
            lows = quote.get('low', [])
            closes = quote.get('close', [])
            volumes = quote.get('volume', [])

            candles = []
            for i in range(len(timestamps)):
                c = closes[i] if i < len(closes) else None
                o = opens[i] if i < len(opens) else None
                h = highs[i] if i < len(highs) else None
                l = lows[i] if i < len(lows) else None
                if c is None or o is None or h is None or l is None:
                    continue
                dt = datetime.fromtimestamp(timestamps[i], timezone.utc).strftime('%Y-%m-%d')
                if dt < '2021-01-01' or dt > '2025-01-01':
                    continue
                candles.append({
                    'date': dt,
                    'open': round(float(o), 2),
                    'high': round(float(h), 2),
                    'low': round(float(l), 2),
                    'close': round(float(c), 2),
                    'volume': int(volumes[i]) if volumes[i] is not None else 0
                })
            all_candles[asset_id] = candles
            print(f'Fetched {asset_id} ({ticker}): {len(candles)} candles | Start: {candles[0]["date"]} (${candles[0]["close"]}) | End: {candles[-1]["date"]} (${candles[-1]["close"]})')
    except Exception as e:
        print(f'Error fetching {asset_id}:', e)

os.makedirs('src/data', exist_ok=True)
with open('src/data/authenticData.json', 'w') as f:
    json.dump(all_candles, f, indent=2)
print('Successfully saved complete 2021-2025 authentic historical data to src/data/authenticData.json')
