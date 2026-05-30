# 📈 Stock Screener Pro

> A production-grade, real-time stock screening platform capable of processing 5,000+ equities with sub-200ms filtering, 3D WebGL visualizations, and dynamic financial charting.

![React](https://img.shields.io/badge/React-18-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue) ![Zustand](https://img.shields.io/badge/State-Zustand-orange) ![Three.js](https://img.shields.io/badge/3D-Three.js-green)

---

## 🔗 Live Demo
**[Launch Stock Screener Pro](https://stock-screener-lemon.vercel.app/)**

---

## 🚀 Key Features

- **Massive Dataset Handling:** Seamlessly manages a universe of 5,000+ stock records without frame drops or browser freezing.
- **Lightning-Fast Filter Engine:** A custom AST-based filter engine supporting 30+ fundamental and technical criteria (Market Cap, P/E, SMA crosses) executing in `< 50ms`.
- **Virtualised DOM Rendering:** Integrates `TanStack Virtual` to render only visible rows, guaranteeing O(1) render complexity and 60 FPS scrolling.
- **Immersive 3D Visualisations:** Leverages `React Three Fiber` and WebGL to create procedural grid layouts and particle systems representing market sentiment.
- **Interactive Financial Charting:** Incorporates `lightweight-charts` with custom-built mathematical indicators including SMA, EMA, RSI, Bollinger Bands, and Volume Profiles.
- **WebSocket Price Simulation:** A highly performant real-time simulation layer using Geometric Brownian Motion (GBM) to mimic correlated sector shocks and tick-level price updates.
- **Glassmorphism UI:** A sleek, modern user interface built with Tailwind CSS, Framer Motion, and GSAP scroll triggers.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Core Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **State Management** | Zustand (with `immer` for mutable draft updates) |
| **Data Grid & Virtualization**| TanStack Table v8, TanStack Virtual v3 |
| **3D Rendering** | Three.js, React Three Fiber, Drei |
| **Animations** | GSAP, Framer Motion, Splitting.js |
| **Charting Engine** | Lightweight Charts (TradingView) |
| **Styling** | Tailwind CSS 3 |
| **Deployment** | Vercel (Edge Network) |

---

## 🏗️ Architecture Highlights

### 1. High-Performance State Batching
To prevent React reconciliation bottlenecks during high-frequency WebSocket updates, incoming price ticks are buffered in memory and flushed directly to the UI using a `requestAnimationFrame` loop. This isolates network spam from the render cycle.

### 2. Compound Component Pattern
The complex filter panel utilizes the Compound Component pattern to cleanly manage shared state across dozens of numeric sliders, dropdowns, and boolean toggles without prop drilling.

### 3. Strict Component Boundaries
- **Server Components:** Utilized for static layouts, SEO metadata, and initial shell loading.
- **Client Components:** Safely encapsulate highly interactive state, WebGL canvases, and WebSocket connections.
- **React Suspense:** Heavy charting libraries and mathematical indicator modules are code-split and lazy-loaded.

---

## 💻 Running Locally

### Prerequisites
- Node.js 18.x or later
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tannu005/stock-screener.git
cd stock-screener
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
This project is licensed under the MIT License.
