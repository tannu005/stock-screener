// src/lib/api/marketData.ts
// Unified market data service with fallback providers

import { Stock } from '@/types/stock';
import {
  getFinnhubQuote,
  getFinnhubCompanyProfile,
  convertFinnhubToStock,
  getCachedQuote,
  setCachedQuote,
} from './finnhub';
import { getAlphaVantageQuote, convertAlphaVantageToStock } from './alphaVantage';

type DataProvider = 'finnhub' | 'alphaVantage' | 'polygon' | 'iex';

interface MarketDataConfig {
  provider: DataProvider;
  enableCache: boolean;
  cacheDuration: number;
  timeout: number;
  retryAttempts: number;
}

const DEFAULT_CONFIG: MarketDataConfig = {
  provider: 'finnhub',
  enableCache: true,
  cacheDuration: 300000, // 5 minutes
  timeout: 5000,
  retryAttempts: 2,
};

class MarketDataService {
  config: MarketDataConfig;

  constructor(config: Partial<MarketDataConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Fetch real-time stock quote with fallback providers
   */
  async getStockQuote(symbol: string): Promise<Stock | null> {
    // Check cache first
    if (this.config.enableCache) {
      const cached = getCachedQuote(symbol);
      if (cached) return cached;
    }

    let stock: Stock | null = null;

    // Try primary provider
    try {
      if (this.config.provider === 'finnhub') {
        stock = await this.getFinnhubStock(symbol);
      } else if (this.config.provider === 'alphaVantage') {
        stock = await this.getAlphaVantageStock(symbol);
      }
    } catch (error) {
      console.error(`Primary provider (${this.config.provider}) failed:`, error);
    }

    // Fallback to secondary provider if primary fails
    if (!stock) {
      try {
        if (this.config.provider !== 'alphaVantage') {
          stock = await this.getAlphaVantageStock(symbol);
        }
        if (!stock && this.config.provider !== 'finnhub') {
          stock = await this.getFinnhubStock(symbol);
        }
      } catch (error) {
        console.error('Fallback providers failed:', error);
      }
    }

    // Cache the result
    if (stock && this.config.enableCache) {
      setCachedQuote(symbol, stock);
    }

    return stock;
  }

  /**
   * Fetch multiple stocks concurrently
   */
  async getMultipleStocks(symbols: string[]): Promise<Stock[]> {
    const promises = symbols.map(symbol => this.getStockQuote(symbol));
    const results = await Promise.allSettled(promises);

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<Stock | null>).value)
      .filter(stock => stock !== null) as Stock[];
  }

  /**
   * Get Finnhub stock data
   */
  private async getFinnhubStock(symbol: string): Promise<Stock | null> {
    const quote = await getFinnhubQuote(symbol);
    if (!quote) return null;

    const profile = await getFinnhubCompanyProfile(symbol);
    const stock = await convertFinnhubToStock(symbol, quote, profile || undefined);

    return stock;
  }

  /**
   * Get Alpha Vantage stock data
   */
  private async getAlphaVantageStock(symbol: string): Promise<Stock | null> {
    const data = await getAlphaVantageQuote(symbol);
    if (!data) return null;

    const stock = await convertAlphaVantageToStock(symbol, data);
    return stock;
  }

  /**
   * Stream stock data updates (WebSocket)
   */
  watchStock(symbol: string, onUpdate: (stock: Stock) => void): () => void {
    // Implementation depends on provider
    // For now, return a no-op unwatch function
    return () => {
      // Cleanup
    };
  }

  /**
   * Search for stocks by query
   */
  async searchStocks(query: string): Promise<any[]> {
    // Placeholder for search functionality
    console.log(`Searching for: ${query}`);
    return [];
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService({
  provider: (process.env.NEXT_PUBLIC_DATA_MODE === 'live' ? 'finnhub' : 'finnhub') as DataProvider,
});

export default MarketDataService;
