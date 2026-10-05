import React from 'react';
import { QuantProvider, useQuant } from './context/QuantContext';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { MarketsPage } from './pages/MarketsPage';
import { QuantAnalysisPage } from './pages/QuantAnalysisPage';
import { StrategyLabPage } from './pages/StrategyLabPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { RobustnessPage } from './pages/RobustnessPage';
import { MarketRegimesPage } from './pages/MarketRegimesPage';
import { AIResearchPage } from './pages/AIResearchPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useQuant();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'markets':
        return <MarketsPage />;
      case 'quant':
        return <QuantAnalysisPage />;
      case 'strategy':
        return <StrategyLabPage />;
      case 'backtest':
        return <BacktestingPage />;
      case 'robustness':
        return <RobustnessPage />;
      case 'regimes':
        return <MarketRegimesPage />;
      case 'ai':
        return <AIResearchPage />;
      case 'data_quality':
        return <DataQualityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#F5E6C8] selection:bg-[#D4AF37]/30 selection:text-[#FFD700]">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Global Multi-Asset Header */}
        <GlobalHeader />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QuantProvider>
      <AppContent />
    </QuantProvider>
  );
};

export default App;
