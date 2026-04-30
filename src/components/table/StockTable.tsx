'use client';
// src/components/table/StockTable.tsx
import { useMemo, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { Stock } from '@/types/stock';
import { useFormatters } from '@/lib/hooks/useWebSocket';
import { ChevronUp, ChevronDown, Star, Bell } from 'lucide-react';
import MiniChart from '@/components/charts/MiniChart';

const RATING_COLORS: Record<string, string> = {
  'Strong Buy': '#00ff88',
  'Buy': '#00d4ff',
  'Hold': '#ffd700',
  'Sell': '#ff6b35',
  'Strong Sell': '#ff3366',
};

const helper = createColumnHelper<Stock>();

export default function StockTable() {
  const { filteredStocks, selectStock, selectedStock, toggleWatchlist, toggleAlert, watchlist, alerts, setSort } = useScreenerStore();
  const { formatPrice, formatMarketCap, formatVolume, formatPct, formatNum } = useFormatters();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'marketCap', desc: true }]);
  const parentRef = useRef<HTMLDivElement>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const columns = useMemo(() => [
    helper.display({
      id: 'actions',
      size: 60,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); toggleWatchlist(row.original.symbol); }}
            className="transition-colors"
            style={{ color: watchlist.has(row.original.symbol) ? '#ffd700' : 'rgba(255,255,255,0.2)' }}
          >
            <Star size={11} fill={watchlist.has(row.original.symbol) ? '#ffd700' : 'none'} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); toggleAlert(row.original.symbol); }}
            className="transition-colors"
            style={{ color: alerts.has(row.original.symbol) ? '#00d4ff' : 'rgba(255,255,255,0.2)' }}
          >
            <Bell size={11} />
          </button>
        </div>
      ),
    }),
    helper.accessor('symbol', {
      size: 90,
      header: 'SYMBOL',
      cell: info => (
        <div>
          <div className="font-mono font-bold text-white text-sm">{info.getValue()}</div>
          <div className="font-mono text-white/30 text-xs">{info.row.original.exchange}</div>
        </div>
      ),
    }),
    helper.accessor('name', {
      size: 160,
      header: 'NAME',
      cell: info => (
        <div className="text-xs text-white/60 truncate max-w-[150px]">{info.getValue()}</div>
      ),
    }),
    helper.accessor('price', {
      size: 100,
      header: 'PRICE',
      cell: info => (
        <div className="font-mono font-bold text-white text-sm">{formatPrice(info.getValue())}</div>
      ),
    }),
    helper.accessor('changePct', {
      size: 90,
      header: 'CHANGE %',
      cell: info => {
        const v = info.getValue();
        const color = v > 0 ? '#00ff88' : v < 0 ? '#ff3366' : '#ffffff60';
        return (
          <div className="font-mono font-bold text-sm" style={{ color }}>
            {v > 0 ? '+' : ''}{v.toFixed(2)}%
          </div>
        );
      },
    }),
    helper.accessor('change', {
      size: 80,
      header: 'CHANGE $',
      cell: info => {
        const v = info.getValue();
        const color = v > 0 ? '#00ff88' : v < 0 ? '#ff3366' : '#ffffff60';
        return <div className="font-mono text-xs" style={{ color }}>{v > 0 ? '+' : ''}{formatPrice(v)}</div>;
      },
    }),
    helper.accessor('volume', {
      size: 90,
      header: 'VOLUME',
      cell: info => (
        <div className="font-mono text-xs text-white/70">{formatVolume(info.getValue())}</div>
      ),
    }),
    helper.accessor('volumeRatio', {
      size: 80,
      header: 'VOL RATIO',
      cell: info => {
        const v = info.getValue();
        const color = v > 2 ? '#ff6b35' : v > 1.5 ? '#ffd700' : 'rgba(255,255,255,0.5)';
        return <div className="font-mono text-xs font-bold" style={{ color }}>{v.toFixed(2)}x</div>;
      },
    }),
    helper.accessor('marketCap', {
      size: 100,
      header: 'MKT CAP',
      cell: info => (
        <div className="font-mono text-xs text-white/70">{formatMarketCap(info.getValue())}</div>
      ),
    }),
    helper.accessor('peRatio', {
      size: 70,
      header: 'P/E',
      cell: info => {
        const v = info.getValue();
        return <div className="font-mono text-xs text-white/60">{v === null ? '—' : v.toFixed(1)}</div>;
      },
    }),
    helper.accessor('rsi', {
      size: 70,
      header: 'RSI',
      cell: info => {
        const v = info.getValue();
        const color = v > 70 ? '#ff3366' : v < 30 ? '#00ff88' : 'rgba(255,255,255,0.6)';
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-1 bg-abyss rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
            </div>
            <span className="font-mono text-xs" style={{ color }}>{v.toFixed(0)}</span>
          </div>
        );
      },
    }),
    helper.accessor('analystRating', {
      size: 100,
      header: 'ANALYST',
      cell: info => {
        const v = info.getValue();
        const color = RATING_COLORS[v] || '#ffffff60';
        return (
          <div className="text-xs font-mono font-bold" style={{ color }}>
            {v}
          </div>
        );
      },
    }),
    helper.accessor('sector', {
      size: 150,
      header: 'SECTOR',
      cell: info => (
        <div className="text-xs text-white/50 font-mono">{info.getValue()}</div>
      ),
    }),
    helper.display({
      id: 'minichart',
      header: 'TREND',
      size: 100,
      cell: ({ row }) => (
        <MiniChart
          data={row.original.candleData}
          positive={row.original.changePct >= 0}
        />
      ),
    }),
  ], [formatPrice, formatMarketCap, formatVolume, watchlist, alerts, toggleWatchlist, toggleAlert]);

  const table = useReactTable({
    data: filteredStocks,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      if (next.length > 0) {
        setSort({ key: next[0].id as keyof Stock, direction: next[0].desc ? 'desc' : 'asc' });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom = items.length > 0 ? totalSize - items[items.length - 1].end : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Table header */}
      <div className="flex-shrink-0 bg-abyss/80 border-b border-white/5">
        {table.getHeaderGroups().map(headerGroup => (
          <div key={headerGroup.id} className="flex items-center px-4 py-2">
            {headerGroup.headers.map(header => (
              <div
                key={header.id}
                style={{ width: header.column.getSize(), minWidth: header.column.getSize() }}
                className="flex-shrink-0"
              >
                {header.isPlaceholder ? null : (
                  <button
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center gap-1 text-xs font-mono tracking-widest text-white/30 hover:text-white/60 transition-colors w-full"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && <ChevronUp size={10} className="text-plasma" />}
                    {header.column.getIsSorted() === 'desc' && <ChevronDown size={10} className="text-plasma" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: totalSize }}>
          {paddingTop > 0 && <div style={{ height: paddingTop }} />}
          {items.map(virtualRow => {
            const row = rows[virtualRow.index];
            const isSelected = selectedStock?.id === row.original.id;
            const isHovered = hoveredRow === row.original.id;
            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                onClick={() => selectStock(isSelected ? null : row.original)}
                onMouseEnter={() => setHoveredRow(row.original.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="flex items-center px-4 border-b border-white/3 cursor-pointer transition-all duration-150"
                style={{
                  height: virtualRow.size,
                  background: isSelected
                    ? 'rgba(0,212,255,0.08)'
                    : isHovered
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                  borderLeft: isSelected ? '2px solid #00d4ff' : '2px solid transparent',
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                    className="flex-shrink-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
          {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-white/5 bg-abyss/50 flex items-center justify-between">
        <span className="text-xs font-mono text-white/30">
          Showing {filteredStocks.length.toLocaleString()} stocks • {rows.length.toLocaleString()} rendered
        </span>
        <span className="text-xs font-mono" style={{ color: '#ffd700' }}>
          ⚡ Sub-200ms filtering engine
        </span>
      </div>
    </div>
  );
}
