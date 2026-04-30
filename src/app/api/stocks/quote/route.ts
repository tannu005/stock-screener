// src/app/api/stocks/quote/route.ts
// Next.js API route for fetching stock quotes

import { marketDataService } from '@/lib/api/marketData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');
        const symbols = searchParams.get('symbols')?.split(',') || [];

        if (!symbol && symbols.length === 0) {
            return NextResponse.json(
                { error: 'symbol or symbols parameter required' },
                { status: 400 }
            );
        }

        let stocks;

        if (symbol) {
            // Single stock quote
            const stock = await marketDataService.getStockQuote(symbol);
            if (!stock) {
                return NextResponse.json(
                    { error: `Stock not found: ${symbol}` },
                    { status: 404 }
                );
            }
            stocks = [stock];
        } else {
            // Multiple stocks
            stocks = await marketDataService.getMultipleStocks(symbols);
        }

        return NextResponse.json(
            { data: stocks },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        console.error('Quote API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
