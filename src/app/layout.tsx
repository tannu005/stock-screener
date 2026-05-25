// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stock Screener Pro — Real-Time Market Intelligence',
  description: 'Professional stock screener with real-time data, advanced filtering, and cinematic visualization. Sign up for premium market analysis.',
  keywords: 'stock screener, trading, market analysis, real-time quotes, financial data',
  openGraph: {
    title: 'Stock Screener Pro',
    description: 'Professional stock screener with real-time data and advanced filtering',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Preload critical resources */}
      </head>
      <body className="bg-void text-white antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
