"""
HMM Market Regime Classifier for QuantX
Trains a Gaussian HMM on NVDA and BTC data, classifies regimes,
and exports results to JSON for use in the frontend.
"""

import json
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from hmmlearn.hmm import GaussianHMM
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

# ── Config ────────────────────────────────────────────────────────────────────
N_STATES   = 4          # Bull, Bear, High-Vol, Low-Vol
N_ITER     = 2000
RANDOM_STATE = 42
REGIME_LABELS = ["Bull Market", "Bear Market", "High Volatility", "Low Volatility"]

# ── Loaders ───────────────────────────────────────────────────────────────────
def load_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["Date"])
    df.rename(columns=str.lower, inplace=True)
    df.sort_values("date", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df

def load_json(path: str) -> pd.DataFrame:
    with open(path) as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    df["date"] = pd.to_datetime(df["date"])
    df.sort_values("date", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df

# ── Feature Engineering ───────────────────────────────────────────────────────
def build_features(df: pd.DataFrame) -> np.ndarray:
    c = df["close"].values
    ret        = np.diff(np.log(c))                          # log returns
    vol20      = pd.Series(ret).rolling(20).std().bfill().values
    mom20      = np.where(c[20:] > 0, (c[20:] - c[:-20]) / c[:-20], 0.0)
    # align lengths
    n = min(len(ret), len(vol20), len(mom20))
    features = np.column_stack([ret[-n:], vol20[-n:], mom20[-n:]])
    return features

# ── Label mapping ────────────────────────────────────────────────────────────
def map_states_to_regimes(model: GaussianHMM, n_states: int) -> dict:
    mean_returns = model.means_[:, 0]   # log return
    mean_vols    = model.means_[:, 1]   # rolling vol

    vol_median = np.median(mean_vols)
    ret_median = np.median(mean_returns)

    mapping = {}
    used = set()

    # Pass 1: clear high-vol / low-vol extremes
    vol_order = np.argsort(mean_vols)
    highest_vol = vol_order[-1]
    lowest_vol  = vol_order[0]

    mapping[highest_vol] = "High Volatility"
    mapping[lowest_vol]  = "Low Volatility"
    used.update([highest_vol, lowest_vol])

    # Pass 2: remaining two states -> Bull / Bear by return
    remaining = [s for s in range(n_states) if s not in used]
    remaining.sort(key=lambda s: mean_returns[s], reverse=True)
    mapping[remaining[0]] = "Bull Market"
    if len(remaining) > 1:
        mapping[remaining[1]] = "Bear Market"

    return mapping

# ── Train + Predict ───────────────────────────────────────────────────────────
def train_and_predict(df: pd.DataFrame, asset_name: str):
    features = build_features(df)
    scaler   = StandardScaler()
    X        = scaler.fit_transform(features)

    model = GaussianHMM(
        n_components=N_STATES,
        covariance_type="full",
        n_iter=N_ITER,
        random_state=RANDOM_STATE,
    )
    model.fit(X)
    states = model.predict(X)

    state_map = map_states_to_regimes(model, N_STATES)
    regimes   = [state_map[s] for s in states]

    # align dates (features drop first ~20 rows due to rolling)
    offset = len(df) - len(regimes)
    dates  = df["date"].iloc[offset:].dt.strftime("%Y-%m-%d").tolist()
    closes = df["close"].iloc[offset:].tolist()

    # breakdown %
    breakdown = {r: round(regimes.count(r) / len(regimes) * 100, 1) for r in REGIME_LABELS}
    current   = regimes[-1]

    print(f"\n{'='*50}")
    print(f"  {asset_name} — HMM Regime Classification")
    print(f"{'='*50}")
    print(f"  Current Regime : {current}")
    for label, pct in breakdown.items():
        print(f"  {label:<20}: {pct}%")

    return {
        "asset":     asset_name,
        "current":   current,
        "breakdown": breakdown,
        "timeline":  [{"date": d, "regime": r, "close": round(c, 4)}
                      for d, r, c in zip(dates, regimes, closes)],
    }

# ── Plot ──────────────────────────────────────────────────────────────────────
COLORS = {
    "Bull Market":    "#22c55e",
    "Bear Market":    "#ef4444",
    "High Volatility":"#f97316",
    "Low Volatility": "#3b82f6",
}

def plot_regimes(result: dict, out_path: str):
    timeline = result["timeline"]
    dates    = pd.to_datetime([t["date"] for t in timeline])
    closes   = [t["close"] for t in timeline]
    regimes  = [t["regime"] for t in timeline]

    fig, ax = plt.subplots(figsize=(14, 5))
    fig.patch.set_facecolor("#0f172a")
    ax.set_facecolor("#0f172a")

    for spine in ax.spines.values():
        spine.set_edgecolor("#334155")

    # shade regime bands
    prev_regime = regimes[0]
    start_idx   = 0
    for i in range(1, len(regimes)):
        if regimes[i] != prev_regime or i == len(regimes) - 1:
            ax.axvspan(dates[start_idx], dates[i], alpha=0.25,
                       color=COLORS[prev_regime], linewidth=0)
            prev_regime = regimes[i]
            start_idx   = i

    ax.plot(dates, closes, color="#e2e8f0", linewidth=0.8, zorder=5)
    ax.set_title(f"{result['asset']} — HMM Market Regimes",
                 color="#f1f5f9", fontsize=13, pad=10)
    ax.tick_params(colors="#94a3b8")
    ax.yaxis.label.set_color("#94a3b8")

    patches = [mpatches.Patch(color=COLORS[r], label=r) for r in REGIME_LABELS]
    ax.legend(handles=patches, loc="upper left", framealpha=0.3,
              labelcolor="#f1f5f9", facecolor="#1e293b")

    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Chart saved -> {out_path}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    base = "c:/Users/hp/OneDrive/Desktop/Hackhere_T088-main/Hackhere_T088-main"

    nvda_df = load_csv(f"{base}/nvda_historical.csv")
    btc_df  = load_json(f"{base}/btc_data.json")

    nvda_result = train_and_predict(nvda_df, "NVDA")
    btc_result  = train_and_predict(btc_df,  "BTC")

    plot_regimes(nvda_result, f"{base}/scripts/nvda_regimes.png")
    plot_regimes(btc_result,  f"{base}/scripts/btc_regimes.png")

    output = {
        "model":   "GaussianHMM",
        "states":  N_STATES,
        "assets":  {
            "NVDA": {
                "current":   nvda_result["current"],
                "breakdown": nvda_result["breakdown"],
                "timeline":  nvda_result["timeline"],
            },
            "BTC": {
                "current":   btc_result["current"],
                "breakdown": btc_result["breakdown"],
                "timeline":  btc_result["timeline"],
            },
        }
    }

    out_path = f"{base}/src/data/hmm_regimes.json"
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n  JSON exported -> {out_path}")
    print("\nDone.")

if __name__ == "__main__":
    main()
