// src/lib/data/stockGenerator.ts
import { Stock, CandleData, FilterCriteria } from '@/types/stock';

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Discretionary', 'Industrials', 'Materials', 'Utilities', 'Real Estate', 'Communication Services', 'Consumer Staples'];
const EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX', 'OTC'];
const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'Japan', 'China', 'Australia', 'France', 'Switzerland'];
const ANALYST_RATINGS = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'] as const;

const INDUSTRY_MAP: Record<string, string[]> = {
  Technology: ['Semiconductors', 'Software', 'Cloud Computing', 'AI/ML', 'Cybersecurity', 'Hardware', 'Fintech'],
  Healthcare: ['Biotech', 'Pharma', 'Medical Devices', 'Health Insurance', 'Diagnostics'],
  Finance: ['Banks', 'Insurance', 'Asset Management', 'REITs', 'Payments'],
  Energy: ['Oil & Gas', 'Renewables', 'Utilities', 'Nuclear', 'LNG'],
  'Consumer Discretionary': ['Retail', 'Auto', 'Entertainment', 'Travel', 'Luxury Goods'],
  Industrials: ['Aerospace', 'Defense', 'Manufacturing', 'Logistics', 'Construction'],
  Materials: ['Mining', 'Chemicals', 'Steel', 'Packaging', 'Agriculture'],
  Utilities: ['Electric', 'Water', 'Gas', 'Multi-Utility'],
  'Real Estate': ['Commercial', 'Residential', 'Industrial REIT', 'Retail REIT'],
  'Communication Services': ['Telecom', 'Media', 'Social Media', 'Gaming', 'Streaming'],
  'Consumer Staples': ['Food & Beverage', 'Household Products', 'Personal Care', 'Tobacco'],
};

const STOCK_NAMES = [
  'Apex', 'Nova', 'Zenith', 'Vertex', 'Quantum', 'Nexus', 'Horizon', 'Summit', 'Prime',
  'Core', 'Alpha', 'Beta', 'Delta', 'Omega', 'Sigma', 'Titan', 'Vector', 'Matrix', 'Pulse',
  'Forge', 'Craft', 'Logic', 'Axion', 'Prism', 'Orbit', 'Helix', 'Flux', 'Arc', 'Mesh',
  'Node', 'Edge', 'Link', 'Bridge', 'Span', 'Reach', 'Scope', 'Scale', 'Peak', 'Ridge',
];

const SUFFIXES = ['Technologies', 'Systems', 'Solutions', 'Corp', 'Inc', 'Group', 'Holdings', 'Capital', 'Partners', 'Labs', 'Ventures', 'Networks', 'Dynamics', 'Analytics'];

let rng = 42;
function seededRandom(): number {
  rng = (rng * 1664525 + 1013904223) & 0xffffffff;
  return (rng >>> 0) / 0xffffffff;
}

function rand(min: number, max: number, decimals = 2): number {
  return parseFloat((seededRandom() * (max - min) + min).toFixed(decimals));
}

function randInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function generateSymbol(index: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const len = index < 500 ? 4 : index < 2000 ? 3 : randInt(2, 5);
  let symbol = '';
  for (let i = 0; i < len; i++) symbol += chars[randInt(0, 25)];
  return symbol;
}

function generateCandleData(basePrice: number, days = 180): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice * rand(0.7, 1.3);
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const volatility = rand(0.01, 0.04);
    const open = price;
    const change = (seededRandom() - 0.48) * volatility * price;
    const close = Math.max(0.01, price + change);
    const high = Math.max(open, close) * rand(1.0, 1.02);
    const low = Math.min(open, close) * rand(0.98, 1.0);
    const volume = randInt(100000, 10000000);

    candles.push({
      time: now - i * 86400000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    price = close;
  }
  return candles;
}

function computeSMA(candles: CandleData[], period: number): number {
  if (candles.length < period) return candles[candles.length - 1]?.close || 0;
  const slice = candles.slice(-period);
  return slice.reduce((sum, c) => sum + c.close, 0) / period;
}

function computeRSI(candles: CandleData[], period = 14): number {
  if (candles.length < period + 1) return 50;
  const changes = candles.slice(-period - 1).map((c, i, arr) =>
    i === 0 ? 0 : c.close - arr[i - 1].close
  ).slice(1);

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(Math.abs);
  const avgGain = gains.reduce((s, g) => s + g, 0) / period;
  const avgLoss = losses.reduce((s, l) => s + l, 0) / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

export function generateStocks(count = 5000): Stock[] {
  rng = 42; // Reset seed for determinism
  const stocks: Stock[] = [];
  const usedSymbols = new Set<string>();

  for (let i = 0; i < count; i++) {
    let symbol = generateSymbol(i);
    while (usedSymbols.has(symbol)) symbol = symbol + 'X';
    usedSymbols.add(symbol);

    const sector = pick(SECTORS);
    const industries = INDUSTRY_MAP[sector] || ['General'];
    const industry = pick(industries);
    const exchange = pick(EXCHANGES);
    const price = rand(0.5, 2000);
    const prevClose = price * rand(0.9, 1.1);
    const change = parseFloat((price - prevClose).toFixed(2));
    const changePct = parseFloat(((change / prevClose) * 100).toFixed(2));
    const volume = randInt(10000, 50000000);
    const avgVolume = randInt(100000, 20000000);
    const marketCap = price * randInt(1000000, 5000000000);
    const candles = generateCandleData(price);
    const sma20 = computeSMA(candles, 20);
    const sma50 = computeSMA(candles, 50);
    const sma200 = computeSMA(candles, 200);
    const rsi = computeRSI(candles);
    const week52High = Math.max(...candles.slice(-252).map(c => c.high));
    const week52Low = Math.min(...candles.slice(-252).map(c => c.low));
    const nameWord = pick(STOCK_NAMES);
    const suffix = pick(SUFFIXES);

    stocks.push({
      id: `stock-${i}`,
      symbol,
      name: `${nameWord} ${suffix}`,
      sector,
      industry,
      exchange,
      price,
      prevClose,
      change,
      changePct,
      volume,
      avgVolume,
      volumeRatio: parseFloat((volume / avgVolume).toFixed(2)),
      marketCap,
      peRatio: seededRandom() > 0.2 ? rand(5, 150) : null,
      pbRatio: seededRandom() > 0.15 ? rand(0.5, 30) : null,
      psRatio: rand(0.5, 20),
      eps: seededRandom() > 0.2 ? rand(-5, 50) : null,
      revenue: rand(1000000, 500000000000),
      revenueGrowth: rand(-30, 150),
      grossMargin: rand(-10, 90),
      netMargin: rand(-50, 40),
      roe: rand(-20, 60),
      roa: rand(-10, 25),
      debtToEquity: rand(0, 5),
      currentRatio: rand(0.5, 5),
      beta: rand(0.1, 3.5),
      week52High,
      week52Low,
      week52HighPct: parseFloat((((price - week52High) / week52High) * 100).toFixed(2)),
      week52LowPct: parseFloat((((price - week52Low) / week52Low) * 100).toFixed(2)),
      sma20,
      sma50,
      sma200,
      rsi,
      macd: rand(-5, 5),
      atr: rand(0.5, price * 0.05),
      dividendYield: seededRandom() > 0.6 ? rand(0.5, 8) : null,
      payoutRatio: seededRandom() > 0.6 ? rand(10, 90) : null,
      shortFloat: rand(0.5, 30),
      institutionalOwnership: rand(10, 95),
      insiderOwnership: rand(0.5, 30),
      analystRating: pick([...ANALYST_RATINGS]),
      priceTarget: seededRandom() > 0.3 ? price * rand(0.7, 1.8) : null,
      priceTargetUpside: null,
      country: pick(COUNTRIES),
      employees: randInt(10, 500000),
      founded: randInt(1900, 2023),
      description: `${nameWord} ${suffix} is a leading ${industry} company in the ${sector} sector.`,
      tags: [sector, industry, exchange].filter(Boolean),
      alert: seededRandom() > 0.95,
      watchlisted: seededRandom() > 0.9,
      candleData: candles,
      lastUpdated: Date.now(),
    });
  }

  // Compute priceTargetUpside
  stocks.forEach(s => {
    if (s.priceTarget) {
      s.priceTargetUpside = parseFloat((((s.priceTarget - s.price) / s.price) * 100).toFixed(2));
    }
  });

  return stocks;
}

export function applyFilters(stocks: Stock[], criteria: FilterCriteria): Stock[] {
  return stocks.filter(stock => {
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      if (!stock.symbol.toLowerCase().includes(q) && !stock.name.toLowerCase().includes(q)) return false;
    }
    if (criteria.priceMin !== undefined && stock.price < criteria.priceMin) return false;
    if (criteria.priceMax !== undefined && stock.price > criteria.priceMax) return false;
    if (criteria.marketCapMin !== undefined && stock.marketCap < criteria.marketCapMin) return false;
    if (criteria.marketCapMax !== undefined && stock.marketCap > criteria.marketCapMax) return false;
    if (criteria.changeMin !== undefined && stock.changePct < criteria.changeMin) return false;
    if (criteria.changeMax !== undefined && stock.changePct > criteria.changeMax) return false;
    if (criteria.volumeRatioMin !== undefined && stock.volumeRatio < criteria.volumeRatioMin) return false;
    if (criteria.peRatioMin !== undefined && (stock.peRatio === null || stock.peRatio < criteria.peRatioMin)) return false;
    if (criteria.peRatioMax !== undefined && (stock.peRatio === null || stock.peRatio > criteria.peRatioMax)) return false;
    if (criteria.rsiMin !== undefined && stock.rsi < criteria.rsiMin) return false;
    if (criteria.rsiMax !== undefined && stock.rsi > criteria.rsiMax) return false;
    if (criteria.aboveSma20 && stock.price < stock.sma20) return false;
    if (criteria.aboveSma50 && stock.price < stock.sma50) return false;
    if (criteria.aboveSma200 && stock.price < stock.sma200) return false;
    if (criteria.sectors?.length && !criteria.sectors.includes(stock.sector)) return false;
    if (criteria.exchanges?.length && !criteria.exchanges.includes(stock.exchange)) return false;
    if (criteria.countries?.length && !criteria.countries.includes(stock.country)) return false;
    if (criteria.revenueGrowthMin !== undefined && stock.revenueGrowth < criteria.revenueGrowthMin) return false;
    if (criteria.grossMarginMin !== undefined && stock.grossMargin < criteria.grossMarginMin) return false;
    if (criteria.debtToEquityMax !== undefined && stock.debtToEquity > criteria.debtToEquityMax) return false;
    if (criteria.analystRatings?.length && !criteria.analystRatings.includes(stock.analystRating)) return false;
    return true;
  });
}

export const SCREENER_PRESETS = [
  {
    id: 'momentum',
    name: 'Momentum Movers',
    description: 'High relative strength, volume surge, breaking out',
    icon: '⚡',
    color: '#00d4ff',
    criteria: { changeMin: 2, volumeRatioMin: 1.5, aboveSma20: true, aboveSma50: true, rsiMin: 50, rsiMax: 80 },
  },
  {
    id: 'value',
    name: 'Deep Value',
    description: 'Undervalued with strong fundamentals',
    icon: '💎',
    color: '#ffd700',
    criteria: { peRatioMax: 15, peRatioMin: 1, grossMarginMin: 20, debtToEquityMax: 1 },
  },
  {
    id: 'growth',
    name: 'Hypergrowth',
    description: 'Revenue acceleration and expansion',
    icon: '🚀',
    color: '#00ff88',
    criteria: { revenueGrowthMin: 30, grossMarginMin: 50 },
  },
  {
    id: 'oversold',
    name: 'Oversold Bounce',
    description: 'RSI oversold with volume confirmation',
    icon: '📉',
    color: '#ff3366',
    criteria: { rsiMin: 20, rsiMax: 35, volumeRatioMin: 1.2 },
  },
  {
    id: 'breakout',
    name: 'Near 52W High',
    description: 'Trading near yearly highs',
    icon: '📈',
    color: '#8b5cf6',
    criteria: { aboveSma50: true, aboveSma200: true, rsiMin: 55 },
  },
  {
    id: 'dividend',
    name: 'Dividend Kings',
    description: 'High yield with stable payout',
    icon: '👑',
    color: '#ff6b35',
    criteria: { sectors: ['Utilities', 'Finance', 'Consumer Staples'] },
  },
];
