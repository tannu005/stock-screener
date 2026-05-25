const yf = require('yahoo-finance2').default;
console.log(typeof yf, Object.keys(yf));
if (typeof yf.quote === 'function') {
  yf.quote('AAPL').then(console.log).catch(console.error);
} else {
  console.log("no quote function");
}
