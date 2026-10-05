# QuantX — Multi-Asset Quantitative Research Platform

QuantX is a browser-native quantitative research platform for analyzing financial
assets, evaluating trading strategies, performing backtests, and exploring
risk and market regimes through dynamically computed metrics.

The platform supports Gold, Bitcoin, NVIDIA, Ethereum, and S&P 500, with
analysis dynamically recomputed based on the selected assets and date range.

**Repository:** https://github.com/Priyasri07/Hackhere_T088

---

## 🚀 What QuantX Does

QuantX provides a complete quantitative research workflow through an
interactive dashboard.

| Module             | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Overview**       | Side-by-side KPIs including return, volatility, Sharpe, Sortino, drawdown, and win rate |
| **Markets**        | Interactive price charts with SMA and EMA overlays                                      |
| **Quant Analysis** | Rolling returns, return distributions, and Calmar ratio                                 |
| **Strategy Lab**   | Configure SMA Crossover, EMA Trend, Momentum, and Mean Reversion strategies             |
| **Backtesting**    | Perform single-asset and weighted-portfolio backtests                                   |
| **Robustness**     | 2D parameter sensitivity analysis across multiple configurations                        |
| **Market Regimes** | Rule-based Bull, Bear, High-Volatility, and Low-Volatility classification               |
| **AI Research**    | Natural-language explanations generated using Featherless AI                            |
| **Data Quality**   | Validation and inspection of the underlying historical dataset                          |

---

## 🛠️ Tech Stack

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

### AI

- Featherless AI
- Qwen

### Data

- Yahoo Finance historical data
- Alpha Vantage for optional live data

### Development Tools

- Node.js
- npm
- Git
- GitHub

---

## 🏗️ Architecture

```text
                    QuantX
                       │
                       ▼
             Browser Application
              React + TypeScript
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    UI Layer       State Layer    Engine Layer
        │              │              │
   10 Pages       Zustand +       Quant Math
   11 Charts      Quant Context    Backtesting
                                  Regime Engine
                                  Robustness
                                  AI Engine
                                        │
                                        ▼
                                  Data Layer
                                        │
                              authenticData.json
                              Historical OHLCV
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                  Featherless AI                Alpha Vantage
                  AI explanations                Optional live data
```
