'use client';
// src/components/filters/FilterPanel.tsx
import { useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { SCREENER_PRESETS } from '@/lib/data/stockGenerator';
import { FilterCriteria } from '@/types/stock';
import { Search, X, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Discretionary', 'Industrials', 'Materials', 'Utilities', 'Real Estate', 'Communication Services', 'Consumer Staples'];
const EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX', 'OTC'];
const ANALYST_RATINGS = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <span className="text-xs font-mono tracking-widest text-white/50">{title}</span>
        {open ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

interface RangeInputProps {
  label: string;
  minKey: keyof FilterCriteria;
  maxKey: keyof FilterCriteria;
  filters: FilterCriteria;
  onChange: (k: keyof FilterCriteria, v: number | undefined) => void;
  step?: number;
  prefix?: string;
  suffix?: string;
}

function RangeInput({ label, minKey, maxKey, filters, onChange, step = 1, prefix = '', suffix = '' }: RangeInputProps) {
  return (
    <div>
      <label className="text-xs text-white/40 font-mono mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          step={step}
          value={(filters[minKey] as number) ?? ''}
          onChange={e => onChange(minKey, e.target.value ? Number(e.target.value) : undefined)}
          className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
        />
        <span className="text-white/20 text-xs">—</span>
        <input
          type="number"
          placeholder="Max"
          step={step}
          value={(filters[maxKey] as number) ?? ''}
          onChange={e => onChange(maxKey, e.target.value ? Number(e.target.value) : undefined)}
          className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
        />
      </div>
    </div>
  );
}

function ToggleFilter({ label, filterKey, filters, onChange }: {
  label: string;
  filterKey: keyof FilterCriteria;
  filters: FilterCriteria;
  onChange: (k: keyof FilterCriteria, v: boolean | undefined) => void;
}) {
  const active = filters[filterKey] as boolean | undefined;
  return (
    <button
      onClick={() => onChange(filterKey, active ? undefined : true)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
        active
          ? 'bg-plasma/20 border border-plasma/50 text-plasma'
          : 'bg-abyss border border-white/10 text-white/40 hover:border-white/20'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-plasma' : 'bg-white/20'}`} />
      {label}
    </button>
  );
}

function MultiSelect({ label, options, filterKey, filters, onChange, color = '#00d4ff' }: {
  label: string;
  options: string[];
  filterKey: 'sectors' | 'exchanges' | 'analystRatings';
  filters: FilterCriteria;
  onChange: (k: keyof FilterCriteria, v: string[] | undefined) => void;
  color?: string;
}) {
  const selected = (filters[filterKey] as string[] | undefined) || [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(filterKey, next.length ? next : undefined);
  };

  return (
    <div>
      <label className="text-xs text-white/40 font-mono mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="px-2 py-1 rounded text-xs font-mono transition-all"
              style={{
                background: active ? `${color}22` : 'rgba(10,16,32,0.8)',
                border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
                color: active ? color : 'rgba(255,255,255,0.4)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel() {
  const { filters, setFilters, resetFilters, applyPreset, filteredStocks, allStocks, lastFilterTime } = useScreenerStore();
  const activeFilterCount = Object.keys(filters).filter(k => filters[k as keyof FilterCriteria] !== undefined).length;

  const handleChange = (key: keyof FilterCriteria, value: unknown) => {
    setFilters({ [key]: value } as Partial<FilterCriteria>);
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-obsidian/90 backdrop-blur-sm border-r border-white/5 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-abyss/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-widest text-white">FILTERS</span>
            {activeFilterCount > 0 && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: '#00d4ff22', color: '#00d4ff', border: '1px solid #00d4ff44' }}>
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-white/30 hover:text-crimson transition-colors font-mono">
              <X size={10} />
              CLEAR
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={(filters.search as string) || ''}
            onChange={e => handleChange('search', e.target.value || undefined)}
            className="w-full bg-abyss border border-white/10 rounded pl-8 pr-3 py-2 text-xs font-mono text-white/80 placeholder-white/20 focus:outline-none focus:border-plasma transition-colors"
          />
        </div>

        {/* Results counter */}
        <div className="mt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-white/30">{filteredStocks.length.toLocaleString()} / {allStocks.length.toLocaleString()} stocks</span>
          {lastFilterTime > 0 && <span style={{ color: '#ffd700' }}>{lastFilterTime.toFixed(1)}ms</span>}
        </div>
      </div>

      {/* Presets */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={12} style={{ color: '#ffd700' }} />
          <span className="text-xs font-mono tracking-widest text-white/50">QUICK SCREENS</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SCREENER_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.criteria)}
              className="text-left p-2 rounded border transition-all group"
              style={{ background: `${preset.color}0a`, borderColor: `${preset.color}33` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = preset.color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${preset.color}33`; }}
            >
              <div className="text-base mb-0.5">{preset.icon}</div>
              <div className="text-xs font-mono font-bold" style={{ color: preset.color }}>{preset.name}</div>
              <div className="text-xs text-white/30 mt-0.5 leading-tight">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter sections */}
      <Section title="PRICE & MARKET CAP" defaultOpen>
        <RangeInput label="Price ($)" minKey="priceMin" maxKey="priceMax" filters={filters} onChange={handleChange} step={0.01} />
        <RangeInput label="Market Cap ($)" minKey="marketCapMin" maxKey="marketCapMax" filters={filters} onChange={handleChange} step={1000000} />
      </Section>

      <Section title="PERFORMANCE" defaultOpen>
        <RangeInput label="Change (%)" minKey="changeMin" maxKey="changeMax" filters={filters} onChange={handleChange} step={0.1} />
        <div>
          <label className="text-xs text-white/40 font-mono mb-1.5 block">Min Volume Ratio</label>
          <input
            type="number"
            placeholder="e.g. 1.5x avg"
            step={0.1}
            value={(filters.volumeRatioMin as number) ?? ''}
            onChange={e => handleChange('volumeRatioMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
          />
        </div>
      </Section>

      <Section title="TECHNICAL">
        <RangeInput label="RSI" minKey="rsiMin" maxKey="rsiMax" filters={filters} onChange={handleChange} step={1} />
        <div>
          <label className="text-xs text-white/40 font-mono mb-2 block">Moving Averages</label>
          <div className="flex flex-wrap gap-2">
            <ToggleFilter label="Above SMA20" filterKey="aboveSma20" filters={filters} onChange={handleChange} />
            <ToggleFilter label="Above SMA50" filterKey="aboveSma50" filters={filters} onChange={handleChange} />
            <ToggleFilter label="Above SMA200" filterKey="aboveSma200" filters={filters} onChange={handleChange} />
          </div>
        </div>
      </Section>

      <Section title="VALUATION">
        <RangeInput label="P/E Ratio" minKey="peRatioMin" maxKey="peRatioMax" filters={filters} onChange={handleChange} step={0.1} />
      </Section>

      <Section title="FUNDAMENTALS">
        <div>
          <label className="text-xs text-white/40 font-mono mb-1.5 block">Min Revenue Growth (%)</label>
          <input
            type="number"
            placeholder="e.g. 20"
            step={1}
            value={(filters.revenueGrowthMin as number) ?? ''}
            onChange={e => handleChange('revenueGrowthMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 font-mono mb-1.5 block">Min Gross Margin (%)</label>
          <input
            type="number"
            placeholder="e.g. 40"
            step={1}
            value={(filters.grossMarginMin as number) ?? ''}
            onChange={e => handleChange('grossMarginMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 font-mono mb-1.5 block">Max Debt/Equity</label>
          <input
            type="number"
            placeholder="e.g. 1.0"
            step={0.1}
            value={(filters.debtToEquityMax as number) ?? ''}
            onChange={e => handleChange('debtToEquityMax', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-abyss border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white/80 focus:outline-none focus:border-plasma transition-colors"
          />
        </div>
      </Section>

      <Section title="SECTOR & EXCHANGE">
        <MultiSelect label="Sectors" options={SECTORS} filterKey="sectors" filters={filters} onChange={handleChange} color="#00d4ff" />
        <MultiSelect label="Exchanges" options={EXCHANGES} filterKey="exchanges" filters={filters} onChange={handleChange} color="#8b5cf6" />
      </Section>

      <Section title="ANALYST RATINGS">
        <MultiSelect
          label="Ratings"
          options={ANALYST_RATINGS}
          filterKey="analystRatings"
          filters={filters}
          onChange={handleChange}
          color="#ffd700"
        />
      </Section>
    </aside>
  );
}
