# 🛠️ Stock Screener Pro — Technical Deep Dive

> **Comprehensive technical documentation covering architecture decisions, data engineering, performance optimisation, and system design.**

---

## 🔗 Live Links

| Resource | URL |
|----------|-----|
| **Live Website** | [https://stock-screener-lemon.vercel.app](https://stock-screener-lemon.vercel.app) |
| **GitHub Repository** | [https://github.com/tannu005/stock-screener](https://github.com/tannu005/stock-screener) |

---

## 1. System Architecture

### 1.1 High-Level Data Flow

```mermaid
graph TD
    A[GitHub Ticker Lists] -->|NYSE + NASDAQ| B[Symbol Deduplication]
    B -->|5,000 unique symbols| C[Batch Fetcher]
    C -->|500 symbols/batch × 10 batches| D[Yahoo Finance API]
    D -->|Raw Quotes| E[convertYahooToStock]
    E -->|4,868 Stock objects| F[market_data_cache.json]
    F -->|Served via API| G[/api/stocks/load]
    G -->|JSON Response| H[Zustand Store]
    H -->|filteredStocks| I[StockTable - Virtualised]
    H -->|filteredStocks| J[StockCardGroups]
    H -->|filteredStocks| K[TopMoversSection]
    L[Vercel Cron - Daily] -->|GET| M[/api/stocks/update-cache]
    M -->|Refreshes| F
```

### 1.2 Component Architecture

```
<RootLayout>
├── <FloatingNavbar />              # Sticky glass nav with auth
├── <LoadingScreen />               # Animated splash screen
├── <MagneticCursor />              # Custom cursor with magnetic snap
├── <PageTransition />              # Framer Motion page wrappers
│
├── <HeroSection>                   # Landing hero
│   ├── <ThreeBackground />         # WebGL particle field
│   ├── <ProceduralGrid />          # Animated grid overlay
│   ├── <SentimentParticles />      # Market sentiment visualiser
│   ├── <HeroHeader />              # Animated typography (Splitting.js)
│   └── <TickerTape />              # Scrolling live prices
│
├── <TopMoversSection />            # Top 10 movers with GSAP animation
├── <StockCardGroups>               # Market Highlights
│   └── <TiltCard />                # 3D perspective tilt wrapper
│
├── <DetailedDataView>              # Full Data Explorer (expandable)
│   ├── <FilterPanel />             # 25+ filter controls
│   └── <StockTable />              # TanStack Table + Virtual
│       └── <StockDetailPanel />    # Slide-out detail view
│
├── <ThreeChartSection />           # 3D candlestick visualisation
├── <MarketSentimentPanel />        # Sector heatmap + sentiment
├── <TrustSignalsSection />         # Enterprise metrics + testimonials
├── <PricingSection />              # Basic / Pro / Enterprise tiers
└── <AuthModal />                   # Sign-in / Sign-up modal
```

---

## 2. Data Engineering

### 2.1 Data Source: Yahoo Finance

The `yahoo-finance2` npm package provides a Node.js wrapper around Yahoo Finance's internal API. Our integration lives in `src/lib/api/yahooFinance.ts`.

**Key Functions:**

| Function | Purpose |
|---|---|
| `getYahooQuote(symbol)` | Fetch a single stock quote |
| `getMultipleYahooQuotes(symbols[])` | Batch-fetch up to 500 symbols in one call |
| `convertYahooToStock(quote)` | Transform raw Yahoo response → our `Stock` TypeScript interface |

**Data Fields Extracted (per stock):**

| Category | Fields |
|---|---|
| **Identity** | symbol, shortName, sector, industry, exchange |
| **Price** | regularMarketPrice, regularMarketPreviousClose, regularMarketChange, regularMarketChangePercent |
| **Volume** | regularMarketVolume, averageDailyVolume3Month |
| **Valuation** | marketCap, trailingPE, forwardPE, priceToBook |
| **Technical** | fiftyDayAverage, twoHundredDayAverage, fiftyTwoWeekHigh, fiftyTwoWeekLow |
| **Fundamental** | epsTrailingTwelveMonths, trailingAnnualDividendYield |
| **Analyst** | targetMeanPrice |

**Fallback Strategy:** For fields Yahoo doesn't provide (P/S ratio, RSI, MACD, ATR, etc.), a deterministic pseudo-random generator `getStableRandom(symbol, min, max, seedSuffix)` produces consistent values per symbol using a hash-based seed:

```typescript
function getStableRandom(symbol: string, min: number, max: number, seedSuffix: string): number {
    let hash = 0;
    const str = symbol + seedSuffix;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(Math.abs(hash) + 1) * 10000;
    const random = x - Math.floor(x);
    return parseFloat((random * (max - min) + min).toFixed(2));
}
```

This ensures AAPL always shows the same fallback RSI value across page loads.

### 2.2 Daily Data Refresh Pipeline

**Endpoint:** `GET /api/stocks/update-cache`

```
Step 1: Fetch NASDAQ ticker list from GitHub (rreichel3/US-Stock-Symbols)
Step 2: Fetch NYSE ticker list from GitHub
Step 3: Deduplicate → Take top 5,000 unique symbols
Step 4: Batch into 10 groups of 500
Step 5: For each batch:
   → Call getMultipleYahooQuotes(batch)
   → Map each quote through convertYahooToStock()
   → Wait 500ms (rate limit protection)
Step 6: Write all stocks to public/market_data_cache.json
Step 7: Return success response with count + timestamp
```

**Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/stocks/update-cache",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 2.3 Stock Data Schema

```typescript
interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  marketCap: number;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number;
  eps: number | null;
  revenue: number;
  revenueGrowth: number;
  grossMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  beta: number;
  week52High: number;
  week52Low: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi: number;
  macd: number;
  atr: number;
  dividendYield: number | null;
  analystRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  priceTarget: number | null;
  // ... 35+ fields total
}
```

---

## 3. Frontend Performance Engineering

### 3.1 Table Virtualisation

The core challenge: rendering 5,000 rows in a scrollable table without freezing the browser.

**Solution:** `@tanstack/react-virtual` (windowed rendering)

- Only ~20 DOM rows exist at any time (the visible window)
- Scroll offset calculations determine which rows to render
- Overscan of 5 rows above/below for smooth scrolling
- Total scroll height is calculated from `rowCount × estimatedRowSize`

```typescript
const virtualizer = useVirtualizer({
  count: filteredStocks.length,  // 4,868
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,        // 48px per row
  overscan: 5,
});
```

**Result:** Constant ~20 DOM nodes regardless of dataset size.

### 3.2 State Management with Zustand

**Why Zustand over Redux/Context:**
- 2 kB bundle (vs Redux Toolkit's 12 kB)
- No Provider wrapper needed
- `subscribeWithSelector` middleware for granular re-renders
- Direct mutation syntax (no action types, reducers, dispatchers)

**Store Structure:**
```typescript
{
  allStocks: Stock[],          // Full 5,000 dataset
  filteredStocks: Stock[],     // After filters applied
  filters: FilterCriteria,     // Active filter state
  sort: SortConfig,            // { key, direction }
  viewMode: 'today' | 'yesterday',
  isExplorerExpanded: boolean,
  watchlist: Set<string>,
  alerts: Set<string>,
  // ... 20+ state fields
}
```

### 3.3 Filter Engine

The `applyFilters()` function runs entirely client-side — no API calls needed:

```typescript
export function applyFilters(stocks: Stock[], criteria: FilterCriteria): Stock[] {
  return stocks.filter(stock => {
    if (criteria.priceMin !== undefined && stock.price < criteria.priceMin) return false;
    if (criteria.priceMax !== undefined && stock.price > criteria.priceMax) return false;
    if (criteria.sectors?.length && !criteria.sectors.includes(stock.sector)) return false;
    if (criteria.rsiMin !== undefined && stock.rsi < criteria.rsiMin) return false;
    // ... 25+ filter conditions
    return true;
  });
}
```

**Performance:** O(n) linear scan — filters 5,000 stocks in < 50ms.

### 3.4 Animation Architecture

**GSAP Context Pattern** (React 18 Strict Mode compatible):

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(elements,
      { opacity: 0, y: 30 },       // FROM state
      { opacity: 1, y: 0, ... }    // TO state
    );
  }, sectionRef);

  return () => ctx.revert();  // Cleanup on unmount
}, []);
```

This pattern prevents the common bug where React Strict Mode double-mounts cause `gsap.from()` animations to permanently hide elements.

---

## 4. API Design

### 4.1 Endpoints

| Endpoint | Method | Parameters | Response |
|---|---|---|---|
| `/api/stocks/load` | GET | `mode`, `count` | Array of Stock objects |
| `/api/stocks/search` | GET | `q` (query string) | Filtered stocks matching search |
| `/api/stocks/quote` | GET | `symbol` | Single stock detail |
| `/api/stocks/update-cache` | GET | — | Cache refresh status |

### 4.2 Data Loading Strategy

```
Page Load
    │
    ├── SSR renders shell immediately
    │
    └── Client hydrates → useEffect → initialize()
          │
          ├── fetch('/api/stocks/load?mode=hybrid&count=500')
          │     │
          │     ├── Reads market_data_cache.json (4.85 MB)
          │     └── Returns parsed JSON array
          │
          └── On success → set({ allStocks, filteredStocks })
              On failure → generateStocks(500) // Client-side fallback
```

---

## 5. WebGL & 3D Rendering

### 5.1 Three.js Scene Graph

```
<Canvas>
├── <ambientLight />
├── <pointLight />
├── <ProceduralGrid>           # Animated wireframe grid
│   └── <instancedMesh />     # GPU-instanced for performance
├── <SentimentParticles>       # 1,000 particles reflecting market mood
│   └── <points />            # Point cloud with custom shader
├── <ThreeStockCard>           # 3D stock cards with depth
│   └── <meshStandardMaterial />
└── <OrbitControls />          # Camera interaction
```

### 5.2 WebGL Performance

- **Instanced Rendering**: Grid cells use `InstancedMesh` — one draw call for 500+ cells
- **Point Clouds**: Particles use `THREE.Points` — single draw call for 1,000 particles
- **Lazy Loading**: 3D scenes only mount after initial data load completes
- **Fallback**: Graceful degradation to 2D if WebGL is not supported

---

## 6. Security & Best Practices

| Concern | Mitigation |
|---|---|
| **XSS** | React's JSX auto-escapes all rendered strings |
| **API Abuse** | Yahoo Finance batching with 500ms delays to respect rate limits |
| **Secrets** | API keys in `.env.local`, excluded from Git via `.gitignore` |
| **TypeScript** | Strict mode enabled — catches type errors at compile time |
| **Bundle Size** | Tree-shaking via Next.js + dynamic imports for heavy components |

---

## 7. Testing & Validation

### 7.1 Data Validation

- Ran a validation script confirming **0 NaN values** across all 4,868 stock entries
- All numeric fields (`price`, `change`, `changePct`, `volume`, `marketCap`) confirmed as valid numbers
- Cache file integrity verified: 4.85 MB, valid JSON

### 7.2 Build Validation

```bash
$ npm run build

✓ Compiled successfully
✓ Generating static pages (9/9)
✓ Finalizing page optimization

Route                              Size     First Load JS
┌ ○ /                              8.66 kB  196 kB
├ ○ /api/stocks/load               0 B      0 B
├ ƒ /api/stocks/quote              0 B      0 B
├ ƒ /api/stocks/search             0 B      0 B
├ ○ /api/stocks/update-cache       0 B      0 B
└ ○ /dashboard                     1.57 kB  189 kB
```

### 7.3 Functional Tests

| Test Case | Result |
|---|---|
| Filter by sector "Technology" | ✅ Returns ~800 stocks |
| Filter by price > $500 | ✅ Returns ~150 stocks |
| Sort by Market Cap descending | ✅ AAPL, MSFT, GOOG at top |
| Toggle Yesterday mode | ✅ Table re-sorts with prevClose data |
| Export CSV | ✅ Downloads valid CSV with headers |
| View All Gainers button | ✅ Expands explorer + scrolls + filters |
| Mobile responsive | ✅ All breakpoints render correctly |

---

## 8. Deployment Configuration

### 8.1 Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "crons": [
    {
      "path": "/api/stocks/update-cache",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 8.2 Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `hybrid` — use cache first, live API for individual quotes |
| `MONGODB_URI` | Database connection for auth (optional) |
| `JWT_SECRET` | Token signing for user authentication |

---

*This document serves as the complete technical reference for the Stock Screener Pro system.*
