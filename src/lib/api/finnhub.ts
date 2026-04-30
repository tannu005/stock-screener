// src/lib/api/finnhub.ts
// Finnhub.io API integration for real-time stock data

import axios from 'axios';
import { Stock } from '@/types/stock';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

interface FinnhubQuote {
    c: number; // Current price
    h: number; // High price of the day
    l: number; // Low price of the day
    o: number; // Open price of the day
    pc: number; // Previous close price
    t: number; // Timestamp
}

interface FinnhubCompanyProfile {
    country: string;
    currency: string;
    exchange: string;
    industry: string;
    sector: string;
    name: string;
    phone: string;
    weburl: string;
    logo: string;
    marketCapitalization: number;
    employees: number;
}

export async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
        if (!API_KEY) {
            console.error('FINNHUB_API_KEY not configured');
            return null;
        }

        const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
            params: {
                symbol: symbol.toUpperCase(),
                token: API_KEY,
            },
            timeout: 5000,
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching Finnhub quote for ${symbol}:`, error);
        return null;
    }
}

export async function getFinnhubCompanyProfile(
    symbol: string
): Promise<FinnhubCompanyProfile | null> {
    try {
        if (!API_KEY) return null;

        const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
            params: {
                symbol: symbol.toUpperCase(),
                token: API_KEY,
            },
            timeout: 5000,
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching Finnhub profile for ${symbol}:`, error);
        return null;
    }
}

export async function convertFinnhubToStock(
    symbol: string,
    quote: FinnhubQuote,
    profile?: FinnhubCompanyProfile
): Promise<Stock | null> {
    const price = quote.c;
    const prevClose = quote.pc;
    const change = parseFloat((price - prevClose).toFixed(2));
    const changePct = parseFloat(((change / prevClose) * 100).toFixed(2));

    return {
        id: `stock-${symbol}`,
        symbol,
        name: profile?.name || symbol,
        sector: profile?.sector || 'Unknown',
        industry: profile?.industry || 'Unknown',
        exchange: profile?.exchange || 'UNKNOWN',
        price,
        prevClose,
        change,
        changePct,
        volume: 0, // Finnhub free tier doesn't include volume in quote
        avgVolume: 0,
        volumeRatio: 0,
        marketCap: (profile?.marketCapitalization || 0) * 1000000,
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
        week52High: quote.h,
        week52Low: quote.l,
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
        country: profile?.country || 'Unknown',
        employees: profile?.employees || 0,
        founded: 0,
        description: profile?.weburl || '',
        tags: [profile?.sector, profile?.industry, profile?.exchange].filter(
            (value): value is string => Boolean(value)
        ),
        alert: false,
        watchlisted: false,
        candleData: [],
        lastUpdated: Date.now(),
    };
}

// Rate limiting helper
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export function getCachedQuote(symbol: string): any | null {
    const cached = requestCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

export function setCachedQuote(symbol: string, data: any): void {
    requestCache.set(symbol, { data, timestamp: Date.now() });
}
