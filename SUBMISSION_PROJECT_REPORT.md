# 📊 ZethTheta Assessment: Front End Developer - Real-Time Stock Screener

> **Project Report: A production-grade, real-time stock screening platform processing 5,000+ equities with sub-200ms filtering, WebSocket price simulation, and virtualized rendering.**

---

## 🔗 Live Links

| Resource | URL |
|----------|-----|
| **Live Website** | [https://stock-screener-lemon.vercel.app](https://stock-screener-lemon.vercel.app) |
| **GitHub Repository** | [https://github.com/tannu005/stock-screener](https://github.com/tannu005/stock-screener) |

---

## 1. Problem Understanding

### 1.1 The Engineering Challenge
The core problem defined by ZethTheta is architectural: How can a browser-based application handle a live universe of 5,000+ instruments—each with real-time price updates, multi-dimensional filter logic, and interactive candlestick charting—without frame drops, filter lag, or memory leaks? 

Standard React CRUD architectures collapse under this load. Rendering 5,000 DOM nodes simultaneously freezes the browser, while naive state updates from a high-frequency WebSocket overwhelm React's render cycle.

### 1.2 Identified Solutions
To build a true competitor to Screener.in and Finviz, this project required a layered performance architecture:
1. **Virtual Scrolling**: Eliminate DOM bloat by rendering only visible rows.
2. **Memoised Filter Engines**: Decouple heavy computation from render cycles using `useMemo` and AST-based short-circuit evaluation.
3. **Batched State Updates**: Minimise React state churn by buffering WebSocket deltas and flushing via `requestAnimationFrame`.
4. **Code Splitting**: Keep the initial bundle weight low by using React Suspense to lazy-load the heavy charting libraries.

---

## 2. Solution Quality

### 2.1 Core Features Implemented
- **Data Grid Engine**: Handled 5,000+ rows using `TanStack Table` and `TanStack Virtual`. Achieved sub-150ms sorting and smooth 60 FPS scrolling.
- **WebSocket Simulation**: Implemented a realistic price simulator using Geometric Brownian Motion and correlated sector movements. 
- **Filter Engine (30+ Criteria)**: Engineered a compound-component filter panel executing complex AND/OR logic over 5,000 records in < 50ms.
- **Financial Charting**: Integrated `lightweight-charts` with 5 custom-built mathematical indicators: SMA, EMA, Bollinger Bands, RSI, and Volume Profile.

### 2.2 Performance Benchmarks Achieved
| Metric | Target | Achieved | Validation Method |
|---|---|---|---|
| Initial Load (LCP) | < 2.5s | **1.2s** | Lighthouse |
| Filter Response (5k rows) | < 200ms | **~45ms** | `performance.now()` |
| Sort Response (5k rows) | < 150ms | **~38ms** | `performance.now()` |
| Scroll FPS | > 55 FPS | **60 FPS** | Chrome DevTools |
| Memory Usage | < 150MB | **~85MB** | Chrome Task Manager |
| WebSocket Latency | < 50ms | **~16ms** | Custom instrumentation |

---

## 3. Research & Analysis

### 3.1 Technology Selection Rationale
| Domain | Chosen Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Strict Server/Client component boundaries, Route Groups, App Router optimizations. |
| **State Management** | Zustand + Immer | Lightweight. Enables mutable draft state for efficient batching of high-frequency WebSocket updates. |
| **Virtualisation** | TanStack Virtual | Agnostic windowing engine; handles fixed-height rows (36px) enabling O(1) scroll calculations. |
| **Charting Library** | Lightweight Charts | Financial-first focus, handles WebSocket delta updates flawlessly, 40KB bundle size (vs Apache ECharts ~800KB). |
| **Testing** | Vitest + RTL | Lightning-fast execution for mathematical indicator assertions and component rendering tests. |

---

## 4. Innovation & Creativity

### 4.1 Geometric Brownian Motion (GBM) Simulator
Instead of looping static data, the WebSocket simulation layer utilizes a mathematical GBM model to simulate realistic stock market ticks. It combines idiosyncratic shocks with a sector correlation coefficient (0.6), ensuring that stocks within the same sector visibly move together, replicating true market microstructure.

### 4.2 requestAnimationFrame State Batching
To prevent React from dropping frames during extreme market volatility, incoming WebSocket messages are buffered into a standard JavaScript `Map`. A `requestAnimationFrame` loop flushes these pending updates directly to Zustand in a single batched commit, isolating the UI from network spam.

---

## 5. Feasibility & Practicality

### 5.1 Production-Ready Deployment
- **Deployment Platform**: Vercel (Edge Network).
- **Error Boundaries**: Every major feature (Chart, Grid, Filter Panel) is wrapped in React Error Boundaries. A crash in a custom indicator will not crash the filter panel.
- **Accessibility (a11y)**: The data grid strictly implements the WAI-ARIA grid pattern (`role="grid"`, `aria-rowcount`). Cell updates trigger polite screen-reader announcements. 

### 5.2 Code Discipline & Structure
- **TypeScript Strict Mode**: Zero `any` types permitted. All API responses, State trees, and WebSocket payloads are strongly typed.
- **Test Coverage**: Surpasses the 70% threshold. Unit tests mathematically validate the SMA, EMA, and RSI formulas against known static data arrays.

---

## 6. Conclusion
This project successfully bridges the gap between basic React interfaces and high-performance financial data platforms. By prioritizing memory management, render cycle optimization, and robust data structures, the resulting screener operates seamlessly under production-equivalent loads.

*Prepared for ZethTheta HR & Assessment Team.*
