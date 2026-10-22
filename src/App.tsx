import { useState, useMemo, useEffect } from 'react';
import { 
  getCalculatedProperties 
} from './data';
import { CalculatedProperty } from './types';
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

export default function App() {
  // Load calculated property data
  const initialProperties = useMemo(() => getCalculatedProperties(), []);

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

  // Address Shortener Helper: "14 Hartley Road, Manchester" -> "Hartley Road, Manchester"
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
    <div id="property-analysis-dashboard" className="min-h-screen bg-white text-[#1a1d27] font-sans antialiased">
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header id="dashboard-header" className="mb-8 border-b border-[#e2e8f0] pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-[#1a1d27]">
                Property Investment Analysis Dashboard
              </h1>
              <p id="dashboard-subtitle" className="text-sm text-[#6b7280] mt-1">
                AI-powered portfolio scoring, dynamic yield modeler, and opportunity ranking engine
              </p>
            </div>
            
            {/* Timestamp Badge */}
            <div className="self-start md:self-auto bg-[#f4f6f9] px-3.5 py-1.5 rounded-full border border-[#e2e8f0] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></span>
              <span className="text-[11px] font-mono font-medium text-[#1a1d27]">
                PORTFOLIO ACTIVE • UK REGIONS
              </span>
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
                <div className="text-2xl sm:text-3xl font-bold text-[#1a1d27] mt-1">
                  {counts.total}
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">Mixed Residential/Commercial</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#e2e8f0]">
                <Building className="w-5 h-5 text-[#3b82f6]" />
              </div>
            </div>

            {/* Strong Opportunities (GREEN) */}
            <div id="kpi-green-opportunities" className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Strong (Green)
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#166534] mt-1 flex items-baseline gap-2">
                  {counts.green}
                  <span className="text-xs font-normal text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                    Active Buy
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
                  {counts.yellow}
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
                  {counts.red}
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
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#1a1d27] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                All Properties ({counts.total})
              </button>
              
              <button
                id="filter-green"
                onClick={() => setSelectedFilter('GREEN')}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  selectedFilter === 'GREEN'
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#1a1d27] border-[#e2e8f0] hover:bg-[#e2e8f0]'
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
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#1a1d27] border-[#e2e8f0] hover:bg-[#e2e8f0]'
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
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                    : 'bg-[#f4f6f9] text-[#1a1d27] border-[#e2e8f0] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#991b1b] mr-1.5 align-middle"></span>
                Red / Avoid ({counts.red})
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#6b7280] bg-[#f4f6f9] border border-[#e2e8f0] px-3.5 py-2 rounded-lg self-stretch sm:self-auto flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
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
                  <th className="py-4 px-4 font-sans text-[11px] uppercase tracking-wider text-[#6b7280] font-semibold">
                    Risk Flags
                  </th>
                  <th className="py-4 px-3 text-center w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-[#6b7280] font-medium bg-white">
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
                      <>
                        {/* Main Row */}
                        <tr
                          key={p.id}
                          onClick={() => handleRowClick(p.id)}
                          className={`hover:bg-[#f0f4ff] transition-all cursor-pointer ${
                            isExpanded ? 'bg-[#f0f4ff]/70 font-medium border-l-4 border-l-[#3b82f6]' : 'bg-white'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f4f6f9] text-[#1a1d27] font-semibold text-xs border border-[#e2e8f0]">
                              {p.rank}
                            </span>
                          </td>

                          {/* Shortened Address */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[13px] text-[#1a1d27]">
                              {getShortenedAddress(p.address)}
                            </div>
                            <div className="text-[11px] text-[#6b7280]">
                              {p.region}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-4 px-3 text-[13px] text-[#1a1d27]">
                            <div className="flex items-center gap-1.5">
                              {p.type.includes('Commercial') ? (
                                <Building className="w-3.5 h-3.5 text-[#3b82f6]" />
                              ) : (
                                <Home className="w-3.5 h-3.5 text-[#3b82f6]" />
                              )}
                              <span>{p.type.split(' ')[0]}</span>
                            </div>
                          </td>

                          {/* Score Badge */}
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${scoreBadgeClass}`}>
                              {p.score}
                            </span>
                          </td>

                          {/* Asking Price */}
                          <td className="py-4 px-4 text-right font-semibold text-[13px] text-[#1a1d27]">
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
                          <td className="py-4 px-3 text-right font-mono font-medium text-[13px] text-[#1a1d27]">
                            {formatPercent(p.grossYield)}
                          </td>

                          {/* Net Yield */}
                          <td className="py-4 px-3 text-right font-mono font-medium text-[13px] text-[#1a1d27]">
                            {formatPercent(p.netYield)}
                          </td>

                          {/* Net Annual Profit */}
                          <td className="py-4 px-4 text-right font-semibold text-[13px] text-[#1a1d27]">
                            {formatGBP(p.netAnnualProfit)}
                            <span className="text-[10px] text-[#6b7280] font-normal block">/ yr</span>
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
                        </tr>

                        {/* Expandable Detail Panel */}
                        <tr key={`${p.id}-detail`}>
                          <td colSpan={11} className="p-0 border-none">
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden bg-[#f4f6f9] border-t border-b border-[#e2e8f0]"
                                >
                                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-[#1a1d27]">
                                    
                                    {/* Left Panel: Specifications */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#e2e8f0]">
                                      <h3 className="text-sm font-semibold mb-4 text-[#1a1d27] border-b border-[#f4f6f9] pb-2 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-[#3b82f6]" />
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
                                        <h3 className="text-sm font-semibold text-[#1a1d27] flex items-center gap-2">
                                          <Sliders className="w-4 h-4 text-[#3b82f6]" />
                                          Dynamic Yield Modeler
                                        </h3>
                                        <button 
                                          title="Reset to defaults"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCustomOffer(p.askingPrice);
                                            setCustomRent(p.monthlyRent);
                                          }}
                                          className="text-[#6b7280] hover:text-[#3b82f6] p-1 rounded hover:bg-[#f4f6f9] cursor-pointer"
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
                                            <span className="font-bold text-[#3b82f6]">{formatGBP(customOffer)}</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min={Math.round(p.askingPrice * 0.7)}
                                            max={Math.round(p.askingPrice * 1.3)}
                                            step={1000}
                                            value={customOffer}
                                            onChange={(e) => setCustomOffer(Number(e.target.value))}
                                            className="w-full accent-[#3b82f6] h-1.5 bg-[#e2e8f0] rounded-lg cursor-pointer"
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
                                            <span className="font-bold text-[#3b82f6]">{formatGBP(customRent)}</span>
                                          </div>
                                          <input 
                                            type="range"
                                            min={Math.round(p.monthlyRent * 0.6)}
                                            max={Math.round(p.monthlyRent * 1.5)}
                                            step={20}
                                            value={customRent}
                                            onChange={(e) => setCustomRent(Number(e.target.value))}
                                            className="w-full accent-[#3b82f6] h-1.5 bg-[#e2e8f0] rounded-lg cursor-pointer"
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
                                              <span className="text-xs font-bold text-[#1a1d27]">
                                                {formatGBP(scenarioResults.netAnnualProfit)}
                                              </span>
                                            </div>
                                            <div className="text-center border-l border-[#e2e8f0]">
                                              <span className="text-[10px] text-[#6b7280] uppercase tracking-wide block font-medium">
                                                Gross Yield
                                              </span>
                                              <span className="text-xs font-mono font-bold text-[#1a1d27]">
                                                {formatPercent(scenarioResults.grossYield)}
                                              </span>
                                            </div>
                                            <div className="text-center border-l border-[#e2e8f0]">
                                              <span className="text-[10px] text-[#6b7280] uppercase tracking-wide block font-medium">
                                                Net Yield
                                              </span>
                                              <span className="text-xs font-mono font-bold text-[#3b82f6]">
                                                {formatPercent(scenarioResults.netYield)}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right Panel: Risk Flags & AI Recommendations */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#e2e8f0] flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-sm font-semibold mb-3.5 text-[#1a1d27] border-b border-[#f4f6f9] pb-2 flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-[#3b82f6]" />
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

                                        <p className="text-xs text-[#1a1d27] leading-relaxed italic">
                                          "{p.advisorRecommendation}"
                                        </p>
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
                                                explanation = "Requires upfront CapEx of approx. £18,000 for kitchen/bathroom works.";
                                              } else if (flag === "High service charge") {
                                                explanation = `Service charges of ${formatGBP(p.annualServiceCharge)} heavily tax the net rental income.`;
                                              } else if (flag === "Short lease") {
                                                explanation = "Lease has only 74 years remaining. Requires £25k-£40k extension.";
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
                      </>
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
            <Award className="w-5 h-5 text-[#3b82f6]" />
            <h2 id="top-opportunities-heading" className="text-lg font-semibold text-[#1a1d27]">
              Strongest Investment Opportunities (Top buy-rated assets)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topOpportunities.map((p) => {
              // Create shortened address: "Unit 4 Parkside Business Centre Birmingham" -> "Parkside Business Centre, Birmingham"
              const shortened = getShortenedAddress(p.address);

              return (
                <div 
                  key={p.id}
                  id={`top-opp-card-${p.id}`}
                  onClick={() => handleRowClick(p.id)}
                  className="bg-white p-5 rounded-lg border border-[#e2e8f0] hover:border-[#3b82f6] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Rank Badge & ID */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-semibold bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded border border-[#86efac]">
                        RANK {p.rank} • {p.id}
                      </span>
                      <span className="text-[10px] text-[#6b7280] font-semibold uppercase tracking-wider">
                        {p.type.split(' ')[0]}
                      </span>
                    </div>

                    {/* Address & Region */}
                    <h3 className="font-semibold text-sm text-[#1a1d27] tracking-tight truncate" title={shortened}>
                      {shortened}
                    </h3>
                    <p className="text-[11px] text-[#6b7280]">{p.region}</p>

                    {/* Performance Metrics Row */}
                    <div className="grid grid-cols-2 gap-3 my-4 bg-[#f4f6f9] p-3 rounded-lg border border-[#e2e8f0]">
                      <div>
                        <span className="text-[10px] uppercase text-[#6b7280] block font-medium">Gross Yield</span>
                        <span className="text-sm font-bold font-mono text-[#1a1d27]">{formatPercent(p.grossYield)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#6b7280] block font-medium">Net Profit</span>
                        <span className="text-sm font-bold text-[#166534]">{formatGBP(p.netAnnualProfit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* One-sentence Advisor summary */}
                  <p className="text-[11px] text-[#1a1d27] leading-relaxed italic border-t border-[#f4f6f9] pt-3">
                    "{getTopAdvisorSummary(p.id)}"
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
