import { NextResponse } from 'next/server';
import { getMultipleYahooQuotes, convertYahooToStock } from '@/lib/api/yahooFinance';
import { Stock } from '@/types/stock';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        console.log('Fetching NASDAQ tickers...');
        const nasdaqRes = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_full_tickers.json');
        const nasdaqList = await nasdaqRes.json();
        
        console.log('Fetching NYSE tickers...');
        const nyseRes = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nyse/nyse_full_tickers.json');
        const nyseList = await nyseRes.json();

        const allSymbols = [
            ...nasdaqList.map((item: any) => item.symbol),
            ...nyseList.map((item: any) => item.symbol)
        ].filter(Boolean);

        // Deduplicate and take top 5000
        const uniqueSymbols = Array.from(new Set(allSymbols)).slice(0, 5000);
        console.log(`Prepared ${uniqueSymbols.length} unique symbols for fetching.`);

        const BATCH_SIZE = 500;
        let allStocks: Stock[] = [];

        for (let i = 0; i < uniqueSymbols.length; i += BATCH_SIZE) {
            const batch = uniqueSymbols.slice(i, i + BATCH_SIZE);
            console.log(`Fetching batch ${i / BATCH_SIZE + 1} of ${Math.ceil(uniqueSymbols.length / BATCH_SIZE)}...`);
            
            try {
                const quotes = await getMultipleYahooQuotes(batch);
                const mappedStocks = quotes
                    .map(convertYahooToStock)
                    .filter((s): s is Stock => s !== null);
                
                allStocks = [...allStocks, ...mappedStocks];
            } catch (err) {
                console.error(`Error fetching batch ${i / BATCH_SIZE + 1}:`, err);
            }
            
            // Wait a small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`Successfully fetched and mapped ${allStocks.length} stocks.`);

        // Save to public directory as static cache
        const cachePath = path.join(process.cwd(), 'public', 'market_data_cache.json');
        fs.writeFileSync(cachePath, JSON.stringify(allStocks));

        return NextResponse.json({ 
            success: true, 
            message: `Successfully cached ${allStocks.length} stocks.`,
            updatedAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Failed to update cache:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
