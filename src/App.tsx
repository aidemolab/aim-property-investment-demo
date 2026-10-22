import { useState, useMemo, useEffect, Fragment } from 'react';
import { 
  getCalculatedProperties, 
  rawProperties, 
  DEFAULT_PROPERTY_SCENARIO, 
  isDefaultPropertyScenario, 
  PropertyScenario 
} from './data';
import { CalculatedProperty, Property } from './types';
import { 
  Building, 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Percent, 
  Coins, 
  Award,
  Info,
  Sliders,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDemoRows, type Row } from './demoApi';
import { AnimatedNumber, ResultTile, ScenarioPanel, SliderField, type Preset } from './Scenario';
import { DemoNote, DemoToolbar, RecordModal, ConfirmModal, OwnRowActions, OwnTag, type FieldDef } from './DemoUI';

// ---- Live data: rows come from the database; the bundled sample rows are the offline fallback ----

const FALLBACK_ROWS: Row[] = rawProperties.map((p) => ({
  id: p.id, session_id: null, seed_key: p.id, created_at: '',
  address: p.address, type: p.type, region: p.region, asking_price: p.askingPrice, estimated_market_value: p.estimatedMarketValue,
  monthly_rent: p.monthlyRent, annual_service_charge: p.annualServiceCharge, annual_maintenance: p.annualMaintenance,
  vacancy_risk: p.vacancyRisk, condition: p.condition, title_status: p.titleStatus, flags: p.flags, notes: p.notes,
}));

function propertyFromRow(r: Row): Property {
  return {
    id: r.seed_key ?? r.id, rowId: r.id, own: r.session_id !== null,
    address: r.address, type: r.type, region: r.region, askingPrice: Number(r.asking_price), estimatedMarketValue: Number(r.estimated_market_value),
    monthlyRent: Number(r.monthly_rent), annualServiceCharge: Number(r.annual_service_charge), annualMaintenance: Number(r.annual_maintenance),
    vacancyRisk: r.vacancy_risk, condition: r.condition, titleStatus: r.title_status, flags: r.flags ?? [], notes: r.notes ?? '',
  };
}

const PROPERTY_FLAG_OPTIONS = ['Above asking vs market', 'Requires refurbishment', 'High service charge', 'Short lease'];

const PROPERTY_FIELDS: FieldDef[] = [
  { key: 'address', label: 'Address (fictional)', type: 'text', maxLength: 80, wide: true, help: 'Use a made-up address, not a real property.' },
  { key: 'type', label: 'Property type', type: 'select', options: ['Residential Terraced', 'Residential Apartment', 'Commercial Unit'] },
  { key: 'region', label: 'Region', type: 'text', maxLength: 40 },
  { key: 'asking_price', label: 'Asking price (£)', type: 'int', min: 1, max: 100000000 },
  { key: 'estimated_market_value', label: 'Estimated market value (£)', type: 'int', min: 1, max: 100000000 },
  { key: 'monthly_rent', label: 'Monthly rent (£)', type: 'int', min: 0, max: 1000000 },
  { key: 'annual_service_charge', label: 'Annual service charge (£)', type: 'int', min: 0, max: 1000000 },
  { key: 'annual_maintenance', label: 'Annual maintenance (£)', type: 'int', min: 0, max: 1000000 },
  { key: 'vacancy_risk', label: 'Vacancy risk', type: 'select', options: ['Low', 'Medium', 'High'] },
  { key: 'condition', label: 'Condition', type: 'select', options: ['Very Good', 'Good', 'Average', 'Poor'] },
  { key: 'title_status', label: 'Title status', type: 'select', options: ['Freehold', 'Leasehold', 'Clean Leasehold', 'Short Lease'] },
  { key: 'h_flags', label: 'Warnings (tick any that apply)', type: 'heading' },
  ...PROPERTY_FLAG_OPTIONS.map((f): FieldDef => ({ key: 'flag:' + f, label: f, type: 'check' })),
  { key: 'notes', label: 'Notes (optional)', type: 'textarea', maxLength: 400, required: false },
];

type FormState = { mode: 'add' } | { mode: 'edit'; property: CalculatedProperty } | { mode: 'delete'; property: CalculatedProperty } | null;

// ---- What-if scenario (view only; never saved) ----
const SCN_PRESETS: (Preset & { scn: PropertyScenario })[] = [
  { id: 'rates-up', label: 'Interest rates +2%', hint: 'A 25% deposit mortgage at 7%', scn: { financed: true, rate: 7, deposit: 25, rentChange: 0, emptyMonths: 0 } },
  { id: 'aggressive-growth', label: 'Aggressive growth', hint: 'Cheap money, a 20% deposit and rents up 12%', scn: { financed: true, rate: 3.5, deposit: 20, rentChange: 12, emptyMonths: 0 } },
  { id: 'rent-downturn', label: 'Rent downturn', hint: 'Rents down 15% and three empty months, on a 50% deposit', scn: { financed: true, rate: 4.5, deposit: 50, rentChange: -15, emptyMonths: 3 } },
];

export default function App() {
  // Load calculated property data
  const demo = useDemoRows('properties', FALLBACK_ROWS);
  const [scn, setScn] = useState<PropertyScenario>(DEFAULT_PROPERTY_SCENARIO);
  const [preset, setPreset] = useState<string | null>(null);
  const scnActive = !isDefaultPropertyScenario(scn);
  const initialProperties = useMemo(() => getCalculatedProperties(demo.rows.map(propertyFromRow), scn), [demo.rows, scn]);
  const baseline = useMemo(() => getCalculatedProperties(demo.rows.map(propertyFromRow)), [demo.rows]);
  const baseRank = useMemo(() => new Map(baseline.map((b) => [b.id, b.rank])), [baseline]);
  const total = (list: CalculatedProperty[], f: (x: CalculatedProperty) => number) => list.reduce((a, x) => a + f(x), 0);
  const monthlyNow = total(initialProperties, (x) => x.monthlyCashFlow);
  const monthlyBase = total(baseline, (x) => x.monthlyCashFlow);
  const roiNow = initialProperties.length ? total(initialProperties, (x) => x.roi) / initialProperties.length : 0;
  const roiBase = baseline.length ? total(baseline, (x) => x.roi) / baseline.length : 0;
  const greenNow = initialProperties.filter((x) => x.score === 'GREEN').length;
  const greenBase = baseline.filter((x) => x.score === 'GREEN').length;
  const redNow = initialProperties.filter((x) => x.score === 'RED').length;
  const redBase = baseline.filter((x) => x.score === 'RED').length;
  const setScenario = (next: PropertyScenario, presetId: string | null = null) => { setScn(next); setPreset(presetId); };
  const [form, setForm] = useState<FormState>(null);

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
  
  // Expanded row ID
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Interactive Scenario Modelling States
  const [customOffer, setCustomOffer] = useState<number>(0);
  const [customRent, setCustomRent] = useState<number>(0);

  // When expanding a row, initialize the simulation states
  const handleRowClick = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      const prop = initialProperties.find(p => p.id === id);
      if (prop) {
        setCustomOffer(prop.askingPrice);
        setCustomRent(prop.monthlyRent);
      }
      setExpandedId(id);
    }
  };

  // Filter logic
  const filteredProperties = useMemo(() => {
    if (selectedFilter === 'ALL') return initialProperties;
    return initialProperties.filter(p => p.score === selectedFilter);
  }, [selectedFilter, initialProperties]);

  // Counts for KPI Summary Card
  const counts = useMemo(() => {
    return {
      total: initialProperties.length,
      green: initialProperties.filter(p => p.score === 'GREEN').length,
      yellow: initialProperties.filter(p => p.score === 'YELLOW').length,
      red: initialProperties.filter(p => p.score === 'RED').length,
    };
  }, [initialProperties]);

  // Top Opportunities (Top 3 Green properties)
  const topOpportunities = useMemo(() => {
    return initialProperties
      .filter(p => p.score === 'GREEN')
      .slice(0, 3);
  }, [initialProperties]);

  // Selected property for custom modeling
  const expandedProperty = useMemo(() => {
    if (!expandedId) return null;
    return initialProperties.find(p => p.id === expandedId) || null;
  }, [expandedId, initialProperties]);

  // Dynamic calculations for scenario modeler
  const scenarioResults = useMemo(() => {
    if (!expandedProperty) return null;
    
    const grossAnnualRent = customRent * 12;
    const grossYield = (grossAnnualRent / customOffer) * 100;
    const annualCosts = expandedProperty.annualServiceCharge + expandedProperty.annualMaintenance;
    const netAnnualProfit = grossAnnualRent - annualCosts;
    const netYield = (netAnnualProfit / customOffer) * 100;
    const priceDiff = customOffer - expandedProperty.estimatedMarketValue;
    
    return {
      grossAnnualRent,
      grossYield,
      netAnnualProfit,
      netYield,
      priceDiff
    };
  }, [expandedProperty, customOffer, customRent]);

  // Address Shortener Helper: "14 Specimen Road, Manchester" -> "Specimen Road, Manchester"
  const getShortenedAddress = (address: string) => {
    return address.replace(/^(?:\d+\s+|Apt\s+\d+\s+|Unit\s+\d+\s+|Flat\s+\d+\s+)/i, '');
  };

  // Formatting Helpers
  const formatGBP = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return val.toFixed(2) + '%';
  };

  // Custom static Advisor summary for the Top 3 cards
  const getTopAdvisorSummary = (id: string) => {
    switch (id) {
      case 'P003':
        return 'Outstanding commercial asset yielding a robust 9.16% gross rate, fully backed by a 3-year leased tenant and immediate £15,000 equity.';
      case 'P006':
        return 'High-demand Newcastle student-corridor asset securing a clean 6.22% net yield with zero service charge overheads.';
      case 'P001':
        return 'Highly stable, tenant-occupied Manchester asset offering a £10,000 below-market discount and low-maintenance profile.';
      default:
        return '';
    }
  };

  return (
    <div id="property-analysis-dashboard" className="bg-white text-[#0B1F33] font-sans antialiased">
      <DemoNote status={demo.status} />
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header id="dashboard-header" className="mb-8 border-b border-[#e2e8f0] pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-[#0B1F33]">
                Property Investment Analysis Dashboard
              </h1>
              <p id="dashboard-subtitle" className="text-sm text-[#6b7280] mt-1">
                Rule-based portfolio scoring, dynamic yield modeler and opportunity ranking
              </p>
            </div>
          </div>

          {/* Summary KPI Panel - 4 Cards in Row */}
          <div id="summary-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            
            {/* Total Properties Analysed */}
            <div id="kpi-total-properties" className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Portfolio Analysed
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#0B1F33] mt-1">
                  <AnimatedNumber value={counts.total} />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">Mixed Residential/Commercial</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f0]">
                <Building className="w-5 h-5 text-[#2563EB]" />
              </div>
            </div>

            {/* Strong Opportunities (GREEN) */}
            <div id="kpi-green-opportunities" className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Strong (Green)
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#166534] mt-1 flex items-baseline gap-2">
                  <AnimatedNumber value={counts.green} />
                  <span className="text-xs font-normal text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                    Buy signal
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">Highest yield, zero complications</p>
              </div>
              <div className="bg-[#dcfce7] p-2.5 rounded-lg border border-[#86efac]">
                <CheckCircle2 className="w-5 h-5 text-[#166534]" />
              </div>
            </div>

            {/* Caution (YELLOW) */}
            <div id="kpi-yellow-caution" className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Caution (Yellow)
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#854d0e] mt-1 flex items-baseline gap-2">
                  <AnimatedNumber value={counts.yellow} />
                  <span className="text-xs font-normal text-[#854d0e] bg-[#fef9c3] px-2 py-0.5 rounded-full border border-[#fde047]">
                    Hold/Negotiate
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">Moderate overheads/capex</p>
              </div>
              <div className="bg-[#fef9c3] p-2.5 rounded-lg border border-[#fde047]">
                <AlertTriangle className="w-5 h-5 text-[#854d0e]" />
              </div>
            </div>

            {/* Avoid (RED) */}
            <div id="kpi-red-avoid" className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Avoid (Red)
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#991b1b] mt-1 flex items-baseline gap-2">
                  <AnimatedNumber value={counts.red} />
                  <span className="text-xs font-normal text-[#991b1b] bg-[#fee2e2] px-2 py-0.5 rounded-full border border-[#fca5a5]">
                    High Risk
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">Short lease/excessive costs</p>
              </div>
              <div className="bg-[#fee2e2] p-2.5 rounded-lg border border-[#fca5a5]">
                <XCircle className="w-5 h-5 text-[#991b1b]" />
              </div>
            </div>

          </div>
        </header>

        <div className="mb-6">
          <ScenarioPanel
            title="Run the numbers"
            subtitle="Finance the portfolio with a mortgage, move rents and add empty months. Cash flow, yield, ROI and every property's Green, Yellow or Red rating recompute instantly."
            presets={SCN_PRESETS} activePreset={preset}
            onPreset={(id) => { const p = SCN_PRESETS.find((x) => x.id === id); if (p) setScenario(p.scn, id); }}
            onReset={() => setScenario(DEFAULT_PROPERTY_SCENARIO)} changed={scnActive}
            note="How it works: the mortgage is interest-only, so annual interest = price x (1 - deposit) x rate, and ROI = annual cash flow / the deposit you put in (or the full price for a cash purchase). Empty months remove rent. The existing Green, Yellow and Red rules then run on these figures. Illustrative only, with fictional properties. Not investment advice."
            results={<>
              <ResultTile testId="tile-cashflow" label="Portfolio cash flow per month" value={monthlyNow} format={formatGBP} delta={monthlyNow - monthlyBase} goodWhen="up" tone="navy" />
              <ResultTile testId="tile-roi" label="Average ROI" value={roiNow} format={(n) => n.toFixed(1) + '%'} delta={roiNow - roiBase} deltaFormat={(n) => n.toFixed(1) + ' pts'} goodWhen="up" tone="amber" />
              <ResultTile testId="tile-green" label="Green properties" value={greenNow} format={(n) => String(Math.round(n))} delta={greenNow - greenBase} deltaFormat={(n) => String(Math.round(n))} goodWhen="up" tone="green" />
              <ResultTile testId="tile-red" label="Red properties" value={redNow} format={(n) => String(Math.round(n))} delta={redNow - redBase} deltaFormat={(n) => String(Math.round(n))} goodWhen="down" tone="red" />
            </>}
          >
            <div className="scn-body two">
              <div className="scn-group">
                <h3>Finance</h3>
                <label className="scn-toggle" htmlFor="financed">
                  <input id="financed" type="checkbox" checked={scn.financed} onChange={(e) => setScenario({ ...scn, financed: e.target.checked })} />
                  <span>Buy with an interest-only mortgage (off = cash purchase)</span>
                </label>
                <SliderField id="rate" label="Mortgage rate" value={scn.rate} min={2} max={9} step={0.1} format={(v) => `${v.toFixed(1)}%`} onChange={(v) => setScenario({ ...scn, financed: true, rate: v })} />
                <SliderField id="deposit" label="Deposit" value={scn.deposit} min={10} max={50} step={1} format={(v) => `${v}%`} onChange={(v) => setScenario({ ...scn, financed: true, deposit: v })} />
              </div>
              <div className="scn-group">
                <h3>Income</h3>
                <SliderField id="rentChange" label="Rent change" value={scn.rentChange} min={-20} max={20} step={1} format={(v) => `${v > 0 ? '+' : ''}${v}%`} onChange={(v) => setScenario({ ...scn, rentChange: v })} />
                <SliderField id="empty" label="Empty months per year" value={scn.emptyMonths} min={0} max={6} step={0.5} format={(v) => `${v} months`} onChange={(v) => setScenario({ ...scn, emptyMonths: v })} />
              </div>
            </div>
          </ScenarioPanel>
        </div>

        <div className="mb-6">
          <DemoToolbar
            addLabel="Add property"
            onAdd={() => { demo.clearError(); setForm({ mode: 'add' }); }}
            onReset={async () => { await demo.reset(); setExpandedId(null); }}
            busy={demo.busy} canWrite={demo.canWrite} ownCount={demo.ownCount}
            error={form ? '' : demo.error} onDismissError={demo.clearError}
          />
        </div>

        {form && form.mode !== 'delete' && (
          <RecordModal
            title={form.mode === 'add' ? 'Add a property' : 'Edit property'}
            submitLabel={form.mode === 'add' ? 'Add property' : 'Save changes'}
            fields={PROPERTY_FIELDS}
            initial={form.mode === 'edit'
              ? { address: form.property.address, type: form.property.type, region: form.property.region, asking_price: form.property.askingPrice, estimated_market_value: form.property.estimatedMarketValue, monthly_rent: form.property.monthlyRent, annual_service_charge: form.property.annualServiceCharge, annual_maintenance: form.property.annualMaintenance, vacancy_risk: form.property.vacancyRisk, condition: form.property.condition, title_status: form.property.titleStatus, notes: form.property.notes, ...Object.fromEntries(PROPERTY_FLAG_OPTIONS.map((f) => ['flag:' + f, form.property.flags.includes(f)])) }
              : { address: '', type: 'Residential Terraced', region: 'North West', asking_price: 150000, estimated_market_value: 155000, monthly_rent: 900, annual_service_charge: 0, annual_maintenance: 1200, vacancy_risk: 'Low', condition: 'Good', title_status: 'Freehold', notes: '' }}
            busy={demo.busy} error={demo.error}
            onClose={() => { demo.clearError(); setForm(null); }}
            onSubmit={async (v) => {
              const flags = PROPERTY_FLAG_OPTIONS.filter((f) => v['flag:' + f] === true);
              const record: Record<string, unknown> = Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('flag:')));
              record.flags = flags;
              const saved = form.mode === 'edit' ? await demo.update(form.property.rowId!, record) : await demo.add(record);
              if (saved) {
                if (form.mode === 'add') { setExpandedId(saved.id); setCustomOffer(Number(saved.asking_price)); setCustomRent(Number(saved.monthly_rent)); }
                else { setCustomOffer(Number(saved.asking_price)); setCustomRent(Number(saved.monthly_rent)); }
                setForm(null);
              }
            }}
          />
        )}
        {form && form.mode === 'delete' && (
          <ConfirmModal
            title="Delete this property?" text={`${form.property.address} will be removed from the demo. It cannot be undone.`} confirmLabel="Delete" busy={demo.busy}
            onCancel={() => { demo.clearError(); setForm(null); }}
            onConfirm={async () => { if (await demo.remove(form.property.rowId!)) { setExpandedId(null); setForm(null); } }}
          />
        )}

        {/* Filter and Control Bar */}
        <section id="filters-section" className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Score Category Filters
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="filter-all"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  selectedFilter === 'ALL'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#0B1F33] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                All Properties ({counts.total})
              </button>
              
              <button
                id="filter-green"
                onClick={() => setSelectedFilter('GREEN')}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  selectedFilter === 'GREEN'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#0B1F33] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#166534] mr-1.5 align-middle"></span>
                Green / Strong Opportunities ({counts.green})
              </button>

              <button
                id="filter-yellow"
                onClick={() => setSelectedFilter('YELLOW')}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  selectedFilter === 'YELLOW'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#0B1F33] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#854d0e] mr-1.5 align-middle"></span>
                Yellow / Caution ({counts.yellow})
              </button>

              <button
                id="filter-red"
                onClick={() => setSelectedFilter('RED')}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  selectedFilter === 'RED'
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#0B1F33] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#991b1b] mr-1.5 align-middle"></span>
                Red / Avoid ({counts.red})
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#6b7280] bg-[#f4f6f9] border border-[#e2e8f0] px-3.5 py-2 rounded-lg self-stretch sm:self-auto flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Click any row to open dynamic cash flow modeler</span>
          </div>
        </section>

        {/* Ranked Property Table */}
        <section id="table-section" className="mb-8 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f4f6f9]">
                  <th className="py-4 px-4 font-mono text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-center w-[60px]">
                    Rank
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold">
                    Address
                  </th>
                  <th className="py-4 px-3 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold w-[120px]">
                    Type
                  </th>
                  <th className="py-4 px-3 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold w-[100px] text-center">
                    Score
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[110px]">
                    Asking Price
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-center w-[150px]">
                    Price vs MV
                  </th>
                  <th className="py-4 px-3 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[100px]">
                    Gross Yield
                  </th>
                  <th className="py-4 px-3 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[100px]">
                    Net Yield
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[120px]">
                    Net Profit
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[120px]">
                    Cash Flow / mo
                  </th>
                  <th className="py-4 px-3 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold text-right w-[90px]">
                    ROI
                  </th>
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold">
                    Risk Flags
                  </th>
                  <th className="py-4 px-3 text-center w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-[#6b7280] font-medium bg-white">
                      No properties found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((p) => {
                    const isExpanded = expandedId === p.id;
                    
                    // Score Colors Configuration
                    let scoreBadgeClass = "";
                    if (p.score === 'GREEN') {
                      scoreBadgeClass = "bg-[#dcfce7] text-[#166534] border-[#86efac]";
                    } else if (p.score === 'YELLOW') {
                      scoreBadgeClass = "bg-[#fef9c3] text-[#854d0e] border-[#fde047]";
                    } else {
                      scoreBadgeClass = "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]";
                    }

                    // Price vs Market Value display calculation
                    const priceDiffAbs = Math.abs(p.priceDiff);
                    const isBelowMarket = p.priceDiff < 0;
                    const isEqualMarket = p.priceDiff === 0;

                    return (
                      <Fragment key={p.id}>
                        {/* Main Row */}
                        <motion.tr layout="position" transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                          key={p.id}
                          onClick={() => handleRowClick(p.id)}
                          className={`hover:bg-[#f0f4ff] transition-all cursor-pointer ${
                            isExpanded ? 'bg-[#f0f4ff]/70 font-medium border-l-4 border-l-[#2563EB]' : 'bg-white'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f4f6f9] text-[#0B1F33] font-semibold text-xs border border-[#e2e8f0]">
                              {p.rank}
                            </span>
                            {scnActive && baseRank.get(p.id) !== undefined && baseRank.get(p.id) !== p.rank && (
                              <span className={`rank-chip ${p.rank < (baseRank.get(p.id) ?? 0) ? 'up' : 'down'}`} title="Rank change versus the baseline">{p.rank < (baseRank.get(p.id) ?? 0) ? '▲' : '▼'}{Math.abs(p.rank - (baseRank.get(p.id) ?? 0))}</span>
                            )}
                          </td>

                          {/* Shortened Address */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[13px] text-[#0B1F33]">
                              {getShortenedAddress(p.address)}<OwnTag own={Boolean(p.own)} />
                            </div>
                            <div className="text-[11px] text-[#6b7280]">
                              {p.region}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-4 px-3 text-[13px] text-[#0B1F33]">
                            <div className="flex items-center gap-1.5">
                              {p.type.includes('Commercial') ? (
                                <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                              ) : (
                                <Home className="w-3.5 h-3.5 text-[#2563EB]" />
                              )}
                              <span>{p.type.split(' ')[0]}</span>
                            </div>
                          </td>

                          {/* Score Badge */}
                          <td className="py-4 px-3 text-center">
                            <span className={`tier-badge inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${scoreBadgeClass}`}>
                              {p.score}
                            </span>
                          </td>

                          {/* Asking Price */}
                          <td className="py-4 px-4 text-right font-semibold text-[13px] text-[#0B1F33]">
                            {formatGBP(p.askingPrice)}
                          </td>

                          {/* Price vs MV */}
                          <td className="py-4 px-4 text-center">
                            {isBelowMarket ? (
                              <div className="text-[#166534] font-medium text-[13px] flex items-center justify-center gap-0.5">
                                <ArrowDownRight className="w-3.5 h-3.5 inline" />
                                <span>Below market ({formatGBP(priceDiffAbs)})</span>
                              </div>
                            ) : isEqualMarket ? (
                              <div className="text-[#6b7280] font-medium text-[13px]">
                                At market value
                              </div>
                            ) : (
                              <div className="text-[#991b1b] font-medium text-[13px] flex items-center justify-center gap-0.5">
                                <ArrowUpRight className="w-3.5 h-3.5 inline" />
                                <span>Above market ({formatGBP(priceDiffAbs)})</span>
                              </div>
                            )}
                          </td>

                          {/* Gross Yield */}
                          <td className="py-4 px-3 text-right font-mono font-medium text-[13px] text-[#0B1F33]">
                            <AnimatedNumber value={p.grossYield} format={formatPercent} duration={0.5} />
                          </td>

                          {/* Net Yield */}
                          <td className="py-4 px-3 text-right font-mono font-medium text-[13px] text-[#0B1F33]">
                            <AnimatedNumber value={p.netYield} format={formatPercent} duration={0.5} />
                          </td>

                          {/* Net Annual Profit */}
                          <td className="py-4 px-4 text-right font-semibold text-[13px] text-[#0B1F33]">
                            <AnimatedNumber value={p.netAnnualProfit} format={formatGBP} duration={0.5} />
                            <span className="text-[10px] text-[#6b7280] font-normal block">/ yr</span>
                          </td>

                          {/* Monthly cash flow (scenario aware) */}
                          <td className={`py-4 px-4 text-right font-semibold text-[13px] ${p.monthlyCashFlow < 0 ? 'text-[#991b1b]' : 'text-[#166534]'}`} data-testid={`cashflow-${p.id}`}>
                            <AnimatedNumber value={p.monthlyCashFlow} format={formatGBP} duration={0.5} />
                            <span className="text-[10px] text-[#6b7280] font-normal block">/ month</span>
                          </td>

                          {/* ROI */}
                          <td className={`py-4 px-3 text-right font-mono font-medium text-[13px] ${p.roi < 0 ? 'text-[#991b1b]' : 'text-[#0B1F33]'}`}>
                            <AnimatedNumber value={p.roi} format={(n) => n.toFixed(1) + '%'} duration={0.5} />
                          </td>

                          {/* Risk Flags */}
                          <td className="py-4 px-4">
                            {p.flags.length === 0 ? (
                              <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium text-[#166534] bg-[#dcfce7] rounded-full border border-[#86efac]">
                                None
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {p.flags.map((flag, idx) => (
                                  <span key={idx} className="inline-block px-2.5 py-0.5 text-[11px] font-medium text-[#991b1b] bg-[#fee2e2] rounded-full border border-[#fca5a5] whitespace-nowrap">
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Toggle Icon */}
                          <td className="py-4 px-3 text-center">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#6b7280]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                            )}
                          </td>
                        </motion.tr>

                        {/* Expandable Detail Panel */}
                        <tr key={`${p.id}-detail`}>
                          <td colSpan={13} className="p-0 border-none">
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden bg-[#f4f6f9] border-t border-b border-[#e2e8f0]"
                                >
                                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-[#0B1F33]">
                                    
                                    {/* Left Panel: Specifications */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#e2e8f0]">
                                      <h3 className="text-sm font-semibold mb-4 text-[#0B1F33] border-b border-[#f4f6f9] pb-2 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-[#2563EB]" />
                                        Property Specifications
                                      </h3>
                                      
                                      <div className="space-y-3.5">
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Full Address</span>
                                          <span className="font-semibold text-right max-w-[180px] truncate" title={p.address}>
                                            {p.address}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">UK Investment Region</span>
                                          <span className="font-semibold">{p.region}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Property Class</span>
                                          <span className="font-semibold">{p.type}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Property Condition</span>
                                          <span className="font-semibold bg-[#f4f6f9] px-2 py-0.5 rounded border border-[#e2e8f0]">
                                            {p.condition}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Title Tenure</span>
                                          <span className="font-semibold">{p.titleStatus}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Vacancy Risk Level</span>
                                          <span className={`font-semibold px-2 py-0.5 rounded border ${
                                            p.vacancyRisk === 'Low' ? 'bg-[#dcfce7] text-[#166534] border-[#86efac]' : 'bg-[#fef9c3] text-[#854d0e] border-[#fde047]'
                                          }`}>
                                            {p.vacancyRisk}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Baseline Financial Indicators */}
                                      <div className="mt-5 pt-4 border-t border-[#f4f6f9] space-y-3">
                                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                                          Contractual Expenses
                                        </h4>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Monthly Rent Received</span>
                                          <span className="font-semibold">{formatGBP(p.monthlyRent)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Annual Service Charge</span>
                                          <span className="font-semibold text-[#991b1b]">{formatGBP(p.annualServiceCharge)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-[#6b7280]">Annual Maintenance Est.</span>
                                          <span className="font-semibold text-[#991b1b]">{formatGBP(p.annualMaintenance)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Middle Panel: Dynamic Modeler */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#e2e8f0]">
                                      <div className="flex justify-between items-center mb-4 border-b border-[#f4f6f9] pb-2">
                                        <h3 className="text-sm font-semibold text-[#0B1F33] flex items-center gap-2">
                                          <Sliders className="w-4 h-4 text-[#2563EB]" />
                                          Dynamic Yield Modeler
                                        </h3>
                                        <button 
                                          title="Reset to defaults"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCustomOffer(p.askingPrice);
                                            setCustomRent(p.monthlyRent);
                                          }}
                                          className="text-[#6b7280] hover:text-[#2563EB] p-1 rounded hover:bg-[#f4f6f9] cursor-pointer"
                                        >
                                          <span className="text-[10px] font-mono font-medium flex items-center gap-1">
                                            RESET
                                          </span>
                                        </button>
                                      </div>

                                      <p className="text-[11px] text-[#6b7280] mb-4">
                                        Simulate a custom purchase offer or rent adjustment to instantly recalculate gross and net yields.
                                      </p>

                                      {/* Custom Offer Price Slider */}
                                      <div className="space-y-4">
                                        <div>
                                          <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-[#6b7280] font-medium">Custom Offer Price</span>
                                            <span className="font-bold text-[#2563EB]">{formatGBP(customOffer)}</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min={Math.round(p.askingPrice * 0.7)}
                                            max={Math.round(p.askingPrice * 1.3)}
                                            step={1000}
                                            value={customOffer}
                                            onChange={(e) => setCustomOffer(Number(e.target.value))}
                                            className="w-full accent-[#2563EB] h-1.5 bg-[#e2e8f0] rounded-lg cursor-pointer"
                                          />
                                          <div className="flex justify-between text-[9px] text-[#6b7280] font-mono mt-1">
                                            <span>Min: {formatGBP(p.askingPrice * 0.7)}</span>
                                            <span>Max: {formatGBP(p.askingPrice * 1.3)}</span>
                                          </div>
                                        </div>

                                        {/* Custom Monthly Rent Slider */}
                                        <div>
                                          <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-[#6b7280] font-medium">Custom Monthly Rent</span>
                                            <span className="font-bold text-[#2563EB]">{formatGBP(customRent)}</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min={Math.round(p.monthlyRent * 0.6)}
                                            max={Math.round(p.monthlyRent * 1.5)}
                                            step={20}
                                            value={customRent}
                                            onChange={(e) => setCustomRent(Number(e.target.value))}
                                            className="w-full accent-[#2563EB] h-1.5 bg-[#e2e8f0] rounded-lg cursor-pointer"
                                          />
                                          <div className="flex justify-between text-[9px] text-[#6b7280] font-mono mt-1">
                                            <span>Min: {formatGBP(p.monthlyRent * 0.6)}</span>
                                            <span>Max: {formatGBP(p.monthlyRent * 1.5)}</span>
                                          </div>
                                        </div>

                                        {/* Recalculated Output Box */}
                                        {scenarioResults && (
                                          <div className="bg-[#f4f6f9] p-3.5 rounded-lg border border-[#e2e8f0] grid grid-cols-3 gap-2 mt-2">
                                            <div className="text-center">
                                              <span className="text-[10px] text-[#6b7280] uppercase tracking-wide block font-medium">
                                                Net Profit
                                              </span>
                                              <span className="text-xs font-bold text-[#0B1F33]">
                                                {formatGBP(scenarioResults.netAnnualProfit)}
                                              </span>
                                            </div>
                                            <div className="text-center border-l border-[#e2e8f0]">
                                              <span className="text-[10px] text-[#6b7280] uppercase tracking-wide block font-medium">
                                                Gross Yield
                                              </span>
                                              <span className="text-xs font-mono font-bold text-[#0B1F33]">
                                                {formatPercent(scenarioResults.grossYield)}
                                              </span>
                                            </div>
                                            <div className="text-center border-l border-[#e2e8f0]">
                                              <span className="text-[10px] text-[#6b7280] uppercase tracking-wide block font-medium">
                                                Net Yield
                                              </span>
                                              <span className="text-xs font-mono font-bold text-[#2563EB]">
                                                {formatPercent(scenarioResults.netYield)}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right Panel: Risk Flags & Recommendations */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#e2e8f0] flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-sm font-semibold mb-3.5 text-[#0B1F33] border-b border-[#f4f6f9] pb-2 flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-[#2563EB]" />
                                          Advisor Recommendation
                                        </h3>
                                        
                                        {/* Score Badge Indicator in recommendation */}
                                        <div className="mb-3 flex items-center gap-2">
                                          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${scoreBadgeClass}`}>
                                            {p.score} Status
                                          </span>
                                          <span className="text-[11px] text-[#6b7280] font-medium">
                                            Rank {p.rank} of {counts.total}
                                          </span>
                                        </div>

                                        <p className="text-xs text-[#0B1F33] leading-relaxed italic">
                                          "{p.advisorRecommendation}"
                                        </p>
                                      </div>

                                      <div className="mt-4 pt-3.5 border-t border-[#f4f6f9]">
                                        <OwnRowActions own={Boolean(p.own)} busy={demo.busy}
                                          onEdit={() => { demo.clearError(); setForm({ mode: 'edit', property: p }); }}
                                          onDelete={() => { demo.clearError(); setForm({ mode: 'delete', property: p }); }} />
                                      </div>

                                      {/* Display specific risks explanation */}
                                      <div className="mt-4 pt-3.5 border-t border-[#f4f6f9]">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] block mb-1.5">
                                          Target Warnings & Specific Risks
                                        </span>
                                        
                                        {p.flags.length === 0 ? (
                                          <div className="text-xs text-[#166534] font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
                                            Clean title status. Low maintenance overheads. No purchase flags.
                                          </div>
                                        ) : (
                                          <div className="space-y-1.5">
                                            {p.flags.map((flag, index) => {
                                              let explanation = "";
                                              if (flag === "Above asking vs market") {
                                                explanation = `Overpaid premium of ${formatGBP(Math.abs(p.priceDiff))} reduces acquisition equity margin.`;
                                              } else if (flag === "Requires refurbishment") {
                                                explanation = p.own ? "Budget for upfront refurbishment works before letting." : "Requires upfront CapEx of approx. £18,000 for kitchen/bathroom works.";
                                              } else if (flag === "High service charge") {
                                                explanation = `Service charges of ${formatGBP(p.annualServiceCharge)} heavily tax the net rental income.`;
                                              } else if (flag === "Short lease") {
                                                explanation = p.own ? "A short lease may need an extension, which adds cost." : "Lease has only 74 years remaining. Requires £25k-£40k extension.";
                                              }
                                              return (
                                                <div key={index} className="text-xs text-[#991b1b] flex items-start gap-1.5">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-[#991b1b] mt-1.5 shrink-0"></span>
                                                  <div>
                                                    <strong className="font-semibold">{flag}:</strong> {explanation}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Opportunities Panel - Appears below table */}
        <section id="top-opportunities-panel" className="bg-[#f4f6f9] border border-[#e2e8f0] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-[#e2e8f0] pb-3">
            <Award className="w-5 h-5 text-[#2563EB]" />
            <h2 id="top-opportunities-heading" className="text-lg font-semibold text-[#0B1F33]">
              Strongest Investment Opportunities (Top buy-rated assets)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topOpportunities.map((p) => {
              // Create shortened address: "Unit 4 Example Business Centre Birmingham" -> "Example Business Centre, Birmingham"
              const shortened = getShortenedAddress(p.address);

              return (
                <div 
                  key={p.id}
                  id={`top-opp-card-${p.id}`}
                  onClick={() => handleRowClick(p.id)}
                  className="bg-white p-5 rounded-lg border border-[#e2e8f0] hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Rank Badge & ID */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-semibold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded border border-[#86efac]">
                        RANK {p.rank} • {p.own ? 'YOURS' : p.id}
                      </span>
                      <span className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">
                        {p.type.split(' ')[0]}
                      </span>
                    </div>

                    {/* Address & Region */}
                    <h3 className="font-semibold text-sm text-[#0B1F33] tracking-tight truncate" title={shortened}>
                      {shortened}
                    </h3>
                    <p className="text-[11px] text-[#6b7280]">{p.region}</p>

                    {/* Performance Metrics Row */}
                    <div className="grid grid-cols-2 gap-3 my-4 bg-[#f4f6f9] p-3 rounded-lg border border-[#e2e8f0]">
                      <div>
                        <span className="text-[10px] uppercase text-[#6b7280] block font-medium">Gross Yield</span>
                        <span className="text-sm font-bold font-mono text-[#0B1F33]">{formatPercent(p.grossYield)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#6b7280] block font-medium">Net Profit</span>
                        <span className="text-sm font-bold text-[#166534]">{formatGBP(p.netAnnualProfit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* One-sentence Advisor summary */}
                  <p className="text-[11px] text-[#0B1F33] leading-relaxed italic border-t border-[#f4f6f9] pt-3">
                    "{getTopAdvisorSummary(p.id) || `${p.type} in ${p.region}: ${formatPercent(p.grossYield)} gross yield, ${formatPercent(p.netYield)} net yield.`}"
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
