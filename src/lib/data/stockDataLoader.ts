// src/lib/data/stockDataLoader.ts
// Hybrid loader: fetch real data or fallback to simulated data

import { Stock } from '@/types/stock';
import { generateStocks } from './stockGenerator';
import { marketDataService } from '@/lib/api/marketData';

export type DataSourceMode = 'live' | 'simulated' | 'hybrid';

interface StockDataLoaderOptions {
  mode?: DataSourceMode;
  maxRetries?: number;
  timeout?: number;
  fallbackToSimulated?: boolean;
}

const DEFAULT_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'META', 'NVDA', 'JPM', 'V', 'WMT',
  'GOOG', 'BA', 'INTC', 'AMD', 'NFLX',
  'CSCO', 'PEP', 'COST', 'DELL', 'IBM',
];

class StockDataLoader {
  private mode: DataSourceMode;
  private maxRetries: number;
  private timeout: number;
  private fallbackToSimulated: boolean;

  constructor(options: StockDataLoaderOptions = {}) {
    this.mode = options.mode || 'simulated';
    this.maxRetries = options.maxRetries || 2;
    this.timeout = options.timeout || 5000;
    this.fallbackToSimulated = options.fallbackToSimulated !== false;
  }

  public setMode(mode: DataSourceMode) {
    this.mode = mode;
  }

  /**
   * Load stocks based on configured mode
   */
  async loadStocks(count: number = 5000): Promise<Stock[]> {
    console.log(`Loading ${count} stocks in ${this.mode} mode...`);

    switch (this.mode) {
      case 'live':
        return await this.loadLiveStocks(count);
      case 'hybrid':
        return await this.loadHybridStocks(count);
      case 'simulated':
      default:
        return this.loadSimulatedStocks(count);
    }
  }

  /**
   * Load real-time stock data from live APIs
   */
  private async loadLiveStocks(count: number): Promise<Stock[]> {
    try {
      // Start with default symbols, then expand if needed
      const symbolsToFetch = DEFAULT_SYMBOLS.slice(0, Math.min(count, 20));

      console.log(`Fetching ${symbolsToFetch.length} live stocks from API...`);
      const stocks = await marketDataService.getMultipleStocks(symbolsToFetch);

      console.log(`Successfully loaded ${stocks.length} live stocks`);

      // If we need more stocks and fallback is enabled, generate simulated ones
      if (stocks.length < count && this.fallbackToSimulated) {
        const remaining = count - stocks.length;
        console.log(
          `Only fetched ${stocks.length} stocks, generating ${remaining} simulated stocks for padding...`
        );
        const simulatedStocks = this.loadSimulatedStocks(remaining);
        return [...stocks, ...simulatedStocks];
      }

      return stocks;
    } catch (error) {
      console.error('Error loading live stocks:', error);

      if (this.fallbackToSimulated) {
        console.log('Falling back to simulated data...');
        return this.loadSimulatedStocks(count);
      }

      throw error;
    }
  }

  /**
   * Load hybrid data: live for popular stocks, simulated for the rest
   */
  private async loadHybridStocks(count: number): Promise<Stock[]> {
    try {
      // Fetch live data for top 20 stocks
      const liveSymbols = DEFAULT_SYMBOLS.slice(0, 20);
      const liveStocks = await marketDataService.getMultipleStocks(liveSymbols);

      console.log(`Loaded ${liveStocks.length} live stocks (hybrid mode)`);

      // Generate simulated data for the rest
      const remaining = Math.max(0, count - liveStocks.length);
      if (remaining > 0) {
        const simulatedStocks = this.loadSimulatedStocks(remaining);
        return [...liveStocks, ...simulatedStocks];
      }

      return liveStocks;
    } catch (error) {
      console.error('Error in hybrid mode:', error);
      console.log('Falling back to simulated data...');
      return this.loadSimulatedStocks(count);
    }
  }

  /**
   * Generate simulated stock data (fast, no API required)
   */
  private loadSimulatedStocks(count: number): Stock[] {
    return generateStocks(count);
  }

  /**
   * Update a single stock's real-time data
   */
  async updateStock(stock: Stock): Promise<Stock | null> {
    if (this.mode === 'simulated') {
      return stock; // No updates in simulated mode
    }

    try {
      const updated = await marketDataService.getStockQuote(stock.symbol);
      return updated || stock;
    } catch (error) {
      console.error(`Error updating stock ${stock.symbol}:`, error);
      return stock;
    }
  }

  /**
   * Watch a stock for real-time updates via WebSocket
   */
  watchStock(symbol: string, onUpdate: (stock: Stock) => void): () => void {
    if (this.mode === 'simulated') {
      // Simulate updates in simulated mode
      const interval = setInterval(() => {
        // Could emit simulated updates here
      }, 5000);

      return () => clearInterval(interval);
    }

    return marketDataService.watchStock(symbol, onUpdate);
  }
}

// Export singleton instance
export const stockDataLoader = new StockDataLoader({
  mode: (process.env.NEXT_PUBLIC_DATA_MODE as DataSourceMode) || 'simulated',
  fallbackToSimulated: true,
});

export default StockDataLoader;