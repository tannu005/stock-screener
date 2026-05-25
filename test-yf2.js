const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
yf.quote('AAPL').then(res => console.log(res.symbol, res.regularMarketPrice)).catch(console.error);
