// src/lib/api/alphaVantage.ts
// Alpha Vantage API integration for stock data (free tier)

import axios from 'axios';
import { Stock } from '@/types/stock';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
    '03. latest trading day': string;
  };
}

export async function getAlphaVantageQuote(
  symbol: string
): Promise<AlphaVantageGlobalQuote | null> {
  try {
    if (!API_KEY) {
      console.error('ALPHA_VANTAGE_API_KEY not configured');
      return null;
    }

    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
      timeout: 5000,
    });

    if (response.data['Note']) {
      console.warn('Alpha Vantage rate limit exceeded');
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching Alpha Vantage quote for ${symbol}:`, error);
    return null;
  }
}

export async function convertAlphaVantageToStock(
  symbol: string,
  data: AlphaVantageGlobalQuote
): Promise<Stock | null> {
  const quote = data['Global Quote'];
  if (!quote || !quote['05. price']) {
    return null;
  }

  const price = parseFloat(quote['05. price']);
  const prevClose = parseFloat(quote['08. previous close']);
  const change = parseFloat(quote['09. change']);
  const changePct = parseFloat(quote['10. change percent']);

  return {
    id: `stock-${symbol}`,
    symbol: quote['01. symbol'],
    name: symbol,
    sector: 'Unknown',
    industry: 'Unknown',
    exchange: 'UNKNOWN',
    price,
    prevClose,
    change,
    changePct,
    volume: 0,
    avgVolume: 0,
    volumeRatio: 0,
    marketCap: 0,
    peRatio: null,
    pbRatio: null,
    psRatio: null,
    eps: null,
    revenue: 0,
    revenueGrowth: 0,
    grossMargin: 0,
    netMargin: 0,
    roe: 0,
    roa: 0,
    debtToEquity: 0,
    currentRatio: 0,
    beta: 0,
    week52High: 0,
    week52Low: 0,
    week52HighPct: 0,
    week52LowPct: 0,
    sma20: 0,
    sma50: 0,
    sma200: 0,
    rsi: 0,
    macd: 0,
    atr: 0,
    dividendYield: null,
    payoutRatio: null,
    shortFloat: 0,
    institutionalOwnership: 0,
    insiderOwnership: 0,
    analystRating: 'Hold',
    priceTarget: null,
    priceTargetUpside: null,
    country: 'Unknown',
    employees: 0,
    founded: 0,
    description: '',
    tags: [],
    alert: false,
    watchlisted: false,
    candleData: [],
    lastUpdated: Date.now(),
  };
}
