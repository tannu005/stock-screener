const fs = require('fs');

async function main() {
    try {
        console.log('Fetching NASDAQ tickers...');
        const nasdaqRes = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_full_tickers.json');
        const nasdaqList = await nasdaqRes.json();
        
        console.log('Fetching NYSE tickers...');
        const nyseRes = await fetch('https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nyse/nyse_full_tickers.json');
        const nyseList = await nyseRes.json();

        const allSymbols = [
            ...nasdaqList.map(item => item.symbol),
            ...nyseList.map(item => item.symbol)
        ].filter(Boolean);

        const uniqueSymbols = Array.from(new Set(allSymbols));
        console.log(`Test mode: Prepared ${uniqueSymbols.length} unique symbols:`, uniqueSymbols.slice(0, 10));
    } catch(err) {
        console.error(err);
    }
}
main();
