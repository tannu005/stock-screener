// src/types/stock.ts
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  marketCap: number;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  eps: number | null;
  revenue: number;
  revenueGrowth: number;
  grossMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  beta: number;
  week52High: number;
  week52Low: number;
  week52HighPct: number;
  week52LowPct: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi: number;
  macd: number;
  atr: number;
  dividendYield: number | null;
  payoutRatio: number | null;
  shortFloat: number;
  institutionalOwnership: number;
  insiderOwnership: number;
  analystRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  priceTarget: number | null;
  priceTargetUpside: number | null;
  country: string;
  employees: number;
  founded: number;
  description: string;
  tags: string[];
  alert?: boolean;
  watchlisted?: boolean;
  candleData: CandleData[];
  lastUpdated: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FilterCriteria {
  // Price
  priceMin?: number;
  priceMax?: number;
  // Market Cap
  marketCapMin?: number;
  marketCapMax?: number;
  // Performance
  changeMin?: number;
  changeMax?: number;
  // Volume
  volumeRatioMin?: number;
  // Valuation
  peRatioMax?: number;
  peRatioMin?: number;
  // Technical
  rsiMin?: number;
  rsiMax?: number;
  aboveSma20?: boolean;
  aboveSma50?: boolean;
  aboveSma200?: boolean;
  // Sector/Exchange
  sectors?: string[];
  exchanges?: string[];
  countries?: string[];
  // Fundamentals
  revenueGrowthMin?: number;
  grossMarginMin?: number;
  debtToEquityMax?: number;
  // Analyst
  analystRatings?: string[];
  // Text search
  search?: string;
}

export interface ScreenerPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: FilterCriteria;
  color: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: keyof Stock;
  direction: SortDirection;
}

export interface WebSocketMessage {
  type: 'price_update' | 'volume_spike' | 'alert';
  symbol: string;
  data: Partial<Stock>;
  timestamp: number;
}
