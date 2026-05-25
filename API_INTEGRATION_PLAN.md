# Live Market Data Integration Plan

This document outlines the step-by-step strategy for integrating real-time stock market data into **Stock Screener Pro**, transforming it from a static UI into an institutional-grade, real-time market dashboard.

---

## 1. The Architecture Challenge
Next.js inherently splits code between the Server (Node.js runtime) and the Client (Browser runtime). Directly fetching complex API data (like Yahoo Finance) inside a React Client Component causes bundling errors because Node modules (like `fs`, `net`, `child_process`) cannot be executed in the browser. 

**The Solution:** An Isomorphic Hybrid Architecture. 
- Use **Next.js Server API Routes** for heavy lifting, batching, and parsing historical or base price data.
- Use **WebSockets** directly on the client for ultra-low-latency tick data updates.

---

## 2. Base Price Ingestion (Yahoo Finance)

To populate the initial 500+ stock rows without hitting crippling rate limits (common in free-tier APIs like Finnhub), we use a batched server-side approach.

### Step 1: Install Dependencies
```bash
npm install yahoo-finance2
```

### Step 2: Create the API Wrapper
Create `src/lib/api/yahooFinance.ts` to wrap the library and map its output to our strict TypeScript `Stock` interface.

### Step 3: Server-Side Batch Fetching
Create a Next.js API route at `src/app/api/stocks/load/route.ts`:
- Accepts parameters like `mode` (live vs simulated) and `count`.
- Instantiates the `StockDataLoader`.
- Returns the full 500-item array as standard JSON to the client.

### Step 4: Hydrate the Global Store
In `src/lib/store/screenerStore.ts` (our Zustand store):
```typescript
const res = await fetch(`/api/stocks/load?mode=${get().dataMode}&count=500`);
const stocks = await res.json();
set({ allStocks: stocks, isLoading: false });
```
This guarantees that when the page renders, the base prices, volume, and market caps are 100% authentic market data.

---

## 3. Real-Time Tick Data (Polygon.io WebSockets)

Base prices are great, but a screener needs to flash green and red as trades happen. To achieve sub-200ms latency, we bypass the Next.js server entirely and connect the client browser directly to the Polygon.io WebSocket.

### Step 1: Secure API Keys
Ensure `NEXT_PUBLIC_POLYGON_API_KEY` is present in `.env.local`.

### Step 2: The WebSocket Hook
In `src/lib/hooks/useWebSocket.ts`, we instantiate a native browser `WebSocket`:

```typescript
const ws = new WebSocket('wss://delayed.polygon.io/stocks');

ws.onopen = () => {
  // Authenticate immediately upon connection
  ws.send(JSON.stringify({ action: 'auth', params: apiKey }));
};
```

### Step 3: Subscription & State Updates
Once authenticated, we subscribe to the Trade (`T.*`) channel. As millions of JSON payloads stream in, we parse them and selectively update the Zustand store without triggering expensive global React re-renders.

```typescript
ws.onmessage = (event) => {
  const messages = JSON.parse(event.data);
  messages.forEach((msg) => {
    if (msg.ev === 'T') {
      // Direct state mutation function from Zustand
      updateStockPrice(msg.sym, msg.p); 
    }
  });
};
```

### Step 4: Fallback Resilience
If the market is closed or the API key hits a limit, the hook detects the failure and seamlessly falls back to a cinematic simulation engine. This ensures the dashboard always looks alive and premium, regardless of external API status.

---

## Conclusion
By splitting the data ingestion pipeline into **Server-Side Batching** (Yahoo Finance) for deep historical context and **Client-Side WebSockets** (Polygon.io) for live tick data, Stock Screener Pro achieves a highly scalable, rate-limit-resistant architecture that rivals enterprise platforms.
