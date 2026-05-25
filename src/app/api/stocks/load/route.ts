import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const cachePath = path.join(process.cwd(), 'public', 'market_data_cache.json');
    
    if (fs.existsSync(cachePath)) {
        const fileData = fs.readFileSync(cachePath, 'utf8');
        const stocks = JSON.parse(fileData);
        return NextResponse.json(stocks);
    } else {
        // Fallback if cache not built yet
        const { stockDataLoader } = await import('@/lib/data/stockDataLoader');
        const stocks = await stockDataLoader.loadStocks(100);
        return NextResponse.json(stocks);
    }
  } catch (error) {
    console.error('API /stocks/load Error:', error);
    return NextResponse.json({ error: 'Failed to load stocks' }, { status: 500 });
  }
}
