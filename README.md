# WALLETX — Multi-Asset Quantitative Research Platform

WALLETX is a browser-native quantitative research platform for analyzing financial
assets, evaluating trading strategies, performing backtests, and exploring
risk and market regimes through dynamically computed metrics.

The platform supports Gold, Bitcoin, NVIDIA, Ethereum, and S&P 500, with
analysis dynamically recomputed based on the selected assets and date range.

**Repository:** https://github.com/prasanth-7811/WALLETX

---

## 🚀 What WALLETX Does

WALLETX provides a complete quantitative research workflow through an
interactive dashboard.

| Module             | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Overview**       | Side-by-side KPIs including return, volatility, Sharpe, Sortino, drawdown, and win rate |
| **Markets**        | Interactive price charts with SMA and EMA overlays                                      |
| **Quant Analysis** | Rolling returns, return distributions, and Calmar ratio                                 |
| **Strategy Lab**   | Configure SMA Crossover, EMA Trend, Momentum, and Mean Reversion strategies             |
| **Backtesting**    | Perform single-asset and weighted-portfolio backtests                                   |
| **Robustness**     | 2D parameter sensitivity analysis across multiple configurations                        |
| **Market Regimes** | Rule-based and HMM ML-based Bull, Bear, High-Volatility, and Low-Volatility classification |
| **AI Research**    | Natural-language explanations generated using Featherless AI                            |
| **Data Quality**   | Validation and inspection of the underlying historical dataset                          |

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### State Management

- Zustand
- React Context

### Data Visualization

- Recharts

### Quantitative Engine

- Custom TypeScript quantitative engines
- Browser-based financial calculations

### ML Model

- Gaussian HMM (hmmlearn) for market regime classification
- Trained on log returns, 20-day rolling volatility, 20-day momentum

### AI

- Featherless AI
- Qwen/Qwen2.5-7B-Instruct

### Data

- Yahoo Finance live data (via yfinance)
- Alpha Vantage for optional live data sync
- Data updated to today via `scripts/update_data.py`

### Development Tools

- Node.js
- npm
- Python 3.12
- Git
- GitHub

---

## 🏗 Architecture

```text
                    WALLETX
                       |
                       v
             Browser Application
              React + TypeScript
                       |
        .--------------+--------------.
        v              v              v
    UI Layer       State Layer    Engine Layer
        |              |              |
   10 Pages       Zustand +       Quant Math
   11 Charts      Quant Context    Backtesting
                                  Regime Engine (Rule + HMM)
                                  Robustness
                                  AI Engine
                                        |
                                        v
                                  Data Layer
                                        |
                              authenticData.json
                              Live OHLCV (Yahoo Finance)
                                        |
                         .-------------+--------------.
                         v                             v
                  Featherless AI                Alpha Vantage
                  AI explanations                Optional live data
```

---

## ⚡ Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

---

## 🔄 Refresh Live Data

```bash
cd "C:\Users\hp\OneDrive\Desktop\WALLETX\WALLETX"
python scripts/update_data.py
python scripts/hmm_regime_classifier.py
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```
VITE_FEATHERLESS_API_KEY=your_key_here
VITE_ALPHAVANTAGE_API_KEY=your_key_here
```
