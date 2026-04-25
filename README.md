# StockScreener Pro 📊

A production-grade real-time stock screener with cinematic UI, 5000+ stock records, sub-200ms filtering, and WebSocket price streaming simulation.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 + App Router |
| UI | React 18 + TypeScript |
| State | Zustand with subscribeWithSelector |
| Table | TanStack Table v8 + Virtual |
| 3D Background | Three.js + React Three Fiber |
| Animations | Framer Motion + CSS |
| Charts | Custom Canvas (Candlestick) |
| Styling | Tailwind CSS |

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles + animations
├── components/
│   ├── background/
│   │   └── ParticleBackground.tsx  # Three.js particle system
│   ├── charts/
│   │   ├── CandlestickChart.tsx    # Canvas candlestick + 5 indicators
│   │   └── MiniChart.tsx           # SVG sparkline chart
│   ├── filters/
│   │   └── FilterPanel.tsx         # Advanced multi-criteria filter UI
│   ├── table/
│   │   └── StockTable.tsx          # Virtualized TanStack Table
│   └── ui/
│       ├── CursorTrail.tsx         # Canvas cursor trail effect
│       ├── HeroHeader.tsx          # App header + market stats
│       ├── LoadingScreen.tsx       # Animated loading screen
│       ├── StockDetailPanel.tsx    # Stock detail + chart panel
│       └── TickerTape.tsx          # Scrolling ticker
├── lib/
│   ├── data/
│   │   └── stockGenerator.ts      # Deterministic 5000-stock generator
│   ├── hooks/
│   │   └── useWebSocket.ts        # WS simulation + formatters
│   └── store/
│       └── screenerStore.ts       # Zustand global store
└── types/
    └── stock.ts                   # TypeScript interfaces
```

## ⚡ Performance

- **5,000 stock records** generated deterministically with seeded RNG
- **Sub-200ms filtering** via optimized array operations
- **Virtual scrolling** with TanStack Virtual (only visible rows render)
- **WebSocket simulation** — 10-20 price updates every 500ms
- **Canvas charts** — hardware-accelerated rendering

## 🎨 UI Features

- **Three.js particle background** — 4,000 particles + data nodes
- **Cursor trail effect** — Canvas-based fluid light trail
- **Scan line overlay** — Cinematic CRT effect
- **Flash animations** — Green/red on price update
- **6 quick-screen presets** — Momentum, Value, Growth, Oversold, Breakout, Dividend
- **5 chart indicators** — SMA20, SMA50, SMA200, Bollinger Bands, Volume

## 🔍 Filter Capabilities

- Price range, Market cap range
- % Change range, Volume ratio
- RSI range
- SMA crossover filters (Above SMA20/50/200)
- P/E ratio range
- Revenue growth minimum
- Gross margin minimum
- Debt/Equity maximum
- Sector multi-select
- Exchange multi-select
- Analyst rating filter
- Full-text search (symbol + name)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel
```

### Manual Build
```bash
npm run build
npm start
```

## 📝 Notes

- Stock data is generated client-side with a seeded RNG for consistency
- No external API calls — fully self-contained
- All prices update live via simulated WebSocket
- Built for desktop (responsive down to 1280px wide)
