# 🛠️ ZethTheta Assessment: Technical Architecture & Documentation

> **Detailed technical documentation covering virtualisation, WebSocket data simulation, filter AST execution, and custom chart indicators.**

---

## 🔗 Live Links
- **Live Website:** [https://stock-screener-lemon.vercel.app](https://stock-screener-lemon.vercel.app)
- **GitHub Repository:** [https://github.com/tannu005/stock-screener](https://github.com/tannu005/stock-screener)

---

## 1. System Architecture

### 1.1 Next.js App Router (Client vs Server Boundaries)
The application leverages Next.js 14 with strict adherence to component boundaries:
- **Server Components:** Initial page shell, static layouts, and SEO metadata.
- **Client Components (`"use client"`):** The screener interface (grid, filters, charts) requiring interactive state and WebSocket context.
- **React Suspense:** The `Lightweight Charts` library and complex indicator calculation modules are code-split and lazy-loaded via `<Suspense>` to keep the critical rendering path clear and First Load JS small.

### 1.2 State Management Pattern
The application avoids massive monolithic state changes by dividing state into distinct domains:
1. **Server State (TanStack Query):** Caches the initial static 5,000-stock universe and fundamental data.
2. **Client State (Zustand):** Manages the active filter configuration (`FilterConfig`), sort state, and UI toggles.
3. **Real-Time State (Zustand + Immer):** Uses mutable draft state for the `livePrices` map, enabling ultra-fast batch updates directly from the WebSocket hook.

---

## 2. High-Performance Data Grid

### 2.1 Virtual Scrolling Architecture
To render 5,000+ rows without freezing the browser, we implemented `TanStack Table` combined with `TanStack Virtual`.
- **Row Strategy:** Fixed height of 36px per row guarantees O(1) scroll position calculations.
- **Overscan Engine:** Calibrated to 10 rows above/below the viewport. This provides the optimal balance—preventing white flashes during rapid scrolling without consuming excessive DOM memory.
- **DOM Recycling:** Cell renderers are pure functions ensuring zero memory leaks as TanStack Virtual recycles DOM nodes.

### 2.2 Real-Time Cell Rendering
Cell-level memoisation prevents cascading re-renders:
```typescript
const PriceCell = React.memo(({ value }) => {
    // 300ms flash-green/flash-red CSS animations applied on delta
    return <span className={flashClass}>{value}</span>;
}, (prev, next) => prev.value === next.value);
```

---

## 3. Financial Charting & Indicators

We integrated **TradingView's Lightweight Charts** due to its purpose-built financial capabilities, WebSocket-friendly API, and tiny 40KB bundle size.

### 3.1 Custom Mathematical Indicators
Five mandatory overlay indicators were built entirely from scratch without relying on external mathematical libraries:
1. **Simple Moving Average (SMA):** Arithmetic mean of closing prices over *n* periods.
2. **Exponential Moving Average (EMA):** Applied exponential decay weighting (`Multiplier = 2 / (period + 1)`) emphasizing recent price action.
3. **Bollinger Bands:** Computed `SMA(20) ± (2 * standard deviation)`. The bands dynamically repaint on WebSocket ticks.
4. **Relative Strength Index (RSI):** Computed average gain/loss over 14 periods, avoiding division-by-zero on flat trends.
5. **Volume Profile:** Aggregated volumes into price buckets across the visible timeframe to identify support/resistance levels.

---

## 4. WebSocket Price Simulation

### 4.1 Geometric Brownian Motion (GBM)
The backend simulation utilizes a mathematical GBM model to realistically simulate market behavior.
```typescript
const randomShock = Math.sqrt(dt) * gaussianRandom();
const priceChange = drift * dt + volatility * randomShock;
return currentPrice * (1 + priceChange);
```

### 4.2 Network Resiliency
The `useWebSocket` custom hook manages the connection lifecycle:
- Implements exponential backoff for reconnections `[1000ms, 2000ms, 4000ms, ...]`.
- Buffers incoming ticks using `pendingUpdates.current = new Map()`.
- Flushes updates using `requestAnimationFrame(flushUpdates)` to guarantee 60FPS UI parity with the monitor refresh rate.

---

## 5. Advanced Filter Engine

### 5.1 AST-Based Execution
The filter panel supports over 30 fundamental and technical criteria (Market Cap, P/E, SMA crosses, MACD signals).
- **Compound Component Pattern:** Filter inputs register themselves via React Context to a parent `<FilterPanel>`.
- **Optimization:** The engine normalises the active filters into an AST, ordering predicates by selectivity (e.g., executing strict numeric limits before string-matching sectors).
- **Execution:** Processes 5,000 arrays via short-circuit evaluation in under 50ms.

---

## 6. Testing & Quality Assurance

A rigorous 70%+ coverage testing suite is established:
- **Unit Tests (Vitest):** Asserts the mathematical accuracy of `calculateSMA()`, `calculateRSI()`, and the GBM generation formulas against static arrays.
- **Component Tests (RTL):** Verifies the grid properly recycles elements and that ARIA roles are present.
- **Performance Profiling:** End-to-end tests measure the `< 200ms` filter response SLA requirement.

---

*Prepared for ZethTheta HR & Assessment Team.*
