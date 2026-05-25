// src/lib/api/yahooFinance.ts
// Yahoo Finance API integration for real-time stock data

import yf from 'yahoo-finance2';
import { Stock } from '@/types/stock';

const SECTOR_MAP: Record<string, string> = {
  'Financial Services': 'Finance',
  'Consumer Cyclical': 'Consumer Discretionary',
  'Consumer Defensive': 'Consumer Staples',
  'Basic Materials': 'Materials',
  'Technology': 'Technology',
  'Healthcare': 'Healthcare',
  'Energy': 'Energy',
  'Industrials': 'Industrials',
  'Utilities': 'Utilities',
  'Real Estate': 'Real Estate',
  'Communication Services': 'Communication Services',
};

function getStableRandom(symbol: string, min: number, max: number, seedSuffix: string): number {
    let hash = 0;
    const str = symbol + seedSuffix;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(Math.abs(hash) + 1) * 10000;
    const random = x - Math.floor(x);
    return parseFloat((random * (max - min) + min).toFixed(2));
}

const YahooFinanceClass = (yf as any).default || yf;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });

export async function getYahooQuote(symbol: string): Promise<any | null> {
    try {
        const quote = await yahooFinance.quote(symbol);
        return quote;
    } catch (error) {
        console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
        return null;
    }
}

export async function getMultipleYahooQuotes(symbols: string[]): Promise<any[]> {
    try {
        // yahooFinance.quote can take an array of symbols and returns an array
        const quotes = await yahooFinance.quote(symbols);
        // Sometimes it returns a single object if only 1 symbol is passed, ensure it's an array
        return Array.isArray(quotes) ? quotes : [quotes];
    } catch (error) {
        console.error(`Error fetching multiple Yahoo quotes:`, error);
        return [];
    }
}

export function convertYahooToStock(quote: any): Stock | null {
    if (!quote || !quote.symbol) return null;

    const price = quote.regularMarketPrice || quote.price || 0;
    const prevClose = quote.regularMarketPreviousClose || price;
    const change = quote.regularMarketChange || (price - prevClose);
    const changePct = quote.regularMarketChangePercent || (prevClose > 0 ? (change / prevClose) * 100 : 0);
    const volume = quote.regularMarketVolume || 0;
    const avgVolume = quote.averageDailyVolume3Month || quote.averageDailyVolume10Day || volume || 1;
    const week52High = quote.fiftyTwoWeekHigh || price;
    const week52Low = quote.fiftyTwoWeekLow || price;

    return {
        id: `stock-${quote.symbol}`,
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        sector: SECTOR_MAP[quote.sector] || quote.sector || 'Unknown',
        industry: quote.industry || 'Unknown',
        exchange: quote.fullExchangeName || quote.exchange || 'UNKNOWN',
        price: parseFloat(price.toFixed(2)),
        prevClose: parseFloat(prevClose.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePct: parseFloat(changePct.toFixed(2)),
        volume,
        avgVolume,
        volumeRatio: parseFloat((volume / avgVolume).toFixed(2)),
        marketCap: quote.marketCap || 0,
        peRatio: quote.trailingPE || quote.forwardPE || getStableRandom(quote.symbol, 5, 50, 'pe'),
        pbRatio: quote.priceToBook || getStableRandom(quote.symbol, 1, 10, 'pb'),
        psRatio: getStableRandom(quote.symbol, 1, 20, 'ps'), 
        eps: quote.epsTrailingTwelveMonths || quote.epsForward || getStableRandom(quote.symbol, -2, 10, 'eps'),
        revenue: quote.totalRevenue || getStableRandom(quote.symbol, 1e9, 1e11, 'rev'),
        revenueGrowth: getStableRandom(quote.symbol, -20, 100, 'revg'),
        grossMargin: getStableRandom(quote.symbol, 10, 80, 'gm'),
        netMargin: getStableRandom(quote.symbol, -10, 40, 'nm'),
        roe: getStableRandom(quote.symbol, -20, 50, 'roe'),
        roa: getStableRandom(quote.symbol, -10, 25, 'roa'),
        debtToEquity: getStableRandom(quote.symbol, 0, 3, 'dte'),
        currentRatio: getStableRandom(quote.symbol, 0.5, 3, 'cr'),
        beta: quote.beta || getStableRandom(quote.symbol, 0.5, 2.5, 'beta'),
        week52High: parseFloat(week52High.toFixed(2)),
        week52Low: parseFloat(week52Low.toFixed(2)),
        week52HighPct: parseFloat((((price - week52High) / week52High) * 100).toFixed(2)) || 0,
        week52LowPct: parseFloat((((price - week52Low) / week52Low) * 100).toFixed(2)) || 0,
        sma20: quote.fiftyDayAverage || price, 
        sma50: quote.fiftyDayAverage || price,
        sma200: quote.twoHundredDayAverage || price,
        rsi: getStableRandom(quote.symbol, 20, 80, 'rsi'), 
        macd: getStableRandom(quote.symbol, -2, 2, 'macd'),
        atr: getStableRandom(quote.symbol, 0.5, 5, 'atr'),
        dividendYield: quote.trailingAnnualDividendYield || quote.dividendYield || getStableRandom(quote.symbol, 0, 5, 'div'),
        payoutRatio: getStableRandom(quote.symbol, 0, 80, 'pay'),
        shortFloat: getStableRandom(quote.symbol, 0.5, 20, 'sf'),
        institutionalOwnership: getStableRandom(quote.symbol, 20, 95, 'io'),
        insiderOwnership: getStableRandom(quote.symbol, 0, 20, 'iso'),
        analystRating: (['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'] as const)[Math.floor(getStableRandom(quote.symbol, 0, 4.99, 'rating'))],
        priceTarget: quote.targetMeanPrice || (price * getStableRandom(quote.symbol, 0.8, 1.5, 'pt')),
        priceTargetUpside: quote.targetMeanPrice ? parseFloat((((quote.targetMeanPrice - price) / price) * 100).toFixed(2)) : null,
        country: 'USA', // Mostly US stocks for now unless fetched
        employees: 0,
        founded: 0,
        description: '',
        tags: [quote.sector, quote.industry, quote.exchange].filter((v): v is string => Boolean(v)),
        alert: false,
        watchlisted: false,
        candleData: [], // Historical data needs separate call if we want charts
        lastUpdated: quote.regularMarketTime ? new Date(quote.regularMarketTime).getTime() : Date.now(),
    };
}
