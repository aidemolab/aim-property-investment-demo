import { Property, CalculatedProperty } from './types';

export const rawProperties: Property[] = [
  {
    id: 'P001',
    address: '14 Hartley Road, Manchester',
    type: 'Residential Terraced',
    region: 'North West',
    askingPrice: 185000,
    estimatedMarketValue: 195000,
    monthlyRent: 1050,
    annualServiceCharge: 0,
    annualMaintenance: 1800,
    vacancyRisk: 'Low',
    condition: 'Good',
    titleStatus: 'Freehold',
    flags: [],
    notes: 'Below market value. Strong rental demand in area. No service charge. Freehold title. Long-term tenant in situ.'
  },
  {
    id: 'P002',
    address: 'Apt 7 Riverside Court, Leeds',
    type: 'Residential Apartment',
    region: 'Yorkshire',
    askingPrice: 162000,
    estimatedMarketValue: 158000,
    monthlyRent: 900,
    annualServiceCharge: 2400,
    annualMaintenance: 1200,
    vacancyRisk: 'Low',
    condition: 'Very Good',
    titleStatus: 'Leasehold',
    flags: ['Above asking vs market'],
    notes: 'Above market value asking price. High service charge reduces net yield. Popular area with strong tenant demand.'
  },
  {
    id: 'P003',
    address: 'Unit 4 Parkside Business Centre, Birmingham',
    type: 'Commercial Unit',
    region: 'West Midlands',
    askingPrice: 275000,
    estimatedMarketValue: 290000,
    monthlyRent: 2100,
    annualServiceCharge: 3600,
    annualMaintenance: 2400,
    vacancyRisk: 'Medium',
    condition: 'Good',
    titleStatus: 'Freehold',
    flags: [],
    notes: 'Below market value. Strong commercial tenant on 3-year lease. Higher maintenance but solid yield. Freehold title.'
  },
  {
    id: 'P004',
    address: '22 Elmwood Avenue, Bristol',
    type: 'Residential Terraced',
    region: 'South West',
    askingPrice: 220000,
    estimatedMarketValue: 215000,
    monthlyRent: 1100,
    annualServiceCharge: 0,
    annualMaintenance: 2200,
    vacancyRisk: 'Low',
    condition: 'Average',
    titleStatus: 'Freehold',
    flags: ['Above asking vs market', 'Requires refurbishment'],
    notes: 'Slightly above market value. Requires kitchen and bathroom refurbishment estimated at GBP 18,000. Freehold but margin is tight after works.'
  },
  {
    id: 'P005',
    address: 'Flat 12 The Grange, London',
    type: 'Residential Apartment',
    region: 'London',
    askingPrice: 485000,
    estimatedMarketValue: 470000,
    monthlyRent: 2200,
    annualServiceCharge: 6000,
    annualMaintenance: 1800,
    vacancyRisk: 'Medium',
    condition: 'Good',
    titleStatus: 'Leasehold',
    flags: ['Above asking vs market', 'High service charge', 'Short lease'],
    notes: 'Above market value. Service charge is very high. Lease has only 74 years remaining — requires extension which could cost GBP 25,000 to GBP 40,000. Significant risk.'
  },
  {
    id: 'P006',
    address: '8 Station Road, Newcastle',
    type: 'Residential Terraced',
    region: 'North East',
    askingPrice: 128000,
    estimatedMarketValue: 138000,
    monthlyRent: 780,
    annualServiceCharge: 0,
    annualMaintenance: 1400,
    vacancyRisk: 'Low',
    condition: 'Good',
    titleStatus: 'Freehold',
    flags: [],
    notes: 'Significantly below market value. Strong rental yield. Freehold. Low maintenance costs. High demand area near university.'
  }
];

const getAdvisorRecommendation = (id: string): string => {
  switch (id) {
    case 'P001':
      return 'This property represents an exceptionally strong residential investment opportunity. Priced at £10,000 below its estimated market value of £195,000, it offers immediate equity on acquisition. Operating with a low vacancy risk and no annual service charge due to its freehold title, the property generates a solid 6.81% gross yield and 5.84% net yield, translating into £10,800 of clean net annual profit. Given the long-term tenant already in situ and strong local rental demand in Manchester, this is a highly stable, low-risk addition to the portfolio. We recommend proceeding immediately with the purchase to secure this stable income-generating asset.';
    case 'P002':
      return 'This property requires a cautious approach before proceeding. While it is located in a highly popular area of Leeds with strong tenant demand and holds a very good property condition, the asking price is £4,000 above its estimated market value. More importantly, the high annual service charge of £2,400 severely dampens the net yield to 4.44% and limits net annual profit to £7,200. Although the vacancy risk is low, the leasehold status and ongoing service charge overheads constrain profit margins. Investors should negotiate a price reduction to at least £155,000 to offset the service charge impact or seek properties with lower recurring service overheads.';
    case 'P003':
      return 'This commercial unit is an outstanding high-yield investment. It is listed at £15,000 below its estimated market value of £290,000, providing excellent built-in equity. Although commercial properties carry higher maintenance (£2,400) and service costs (£3,600), this is heavily compensated for by the substantial monthly rent of £2,100, resulting in a stellar gross yield of 9.16% and a net yield of 6.98%. The presence of a strong commercial tenant secured on a 3-year lease mitigates the medium vacancy risk. The freehold title adds further security. We strongly advise proceeding with this acquisition as it represents the highest net income-generating asset in this analysis.';
    case 'P004':
      return 'This residential terraced house should be approached with significant care. The asking price is £5,000 above its estimated market value, and the property is in average condition, requiring an estimated £18,000 for kitchen and bathroom refurbishments. While the nominal net annual profit is calculated at £11,000 (yielding 5.00% net), this margin will be entirely eroded in the first year by the required refurbishment works. Although it has a freehold title and low vacancy risk, the tight margins after capital expenditure make it a marginal opportunity. Investors should only proceed if the asking price can be renegotiated down by at least £20,000 to absorb the renovation costs.';
    case 'P005':
      return 'This property is classified as high-risk and we strongly recommend avoiding it under current terms. It is priced at £15,000 above its estimated market value, and is burdened by a critically short lease of only 74 years remaining. Extending this lease will incur a substantial capital outlay estimated between £25,000 and £40,000, which is not reflected in the £485,000 asking price. Furthermore, a very high annual service charge of £6,000 combined with a medium vacancy risk depresses the net yield to an unsatisfactory 3.84%. The combination of overvaluation, lease extension liabilities, and high ongoing operational costs presents a severe threat of capital loss and poor cash flow.';
    case 'P006':
      return 'This property is a premier residential investment opportunity with highly attractive fundamentals. Listed significantly below its estimated market value by £10,000, it offers immediate equity and boasts a robust gross yield of 7.31% and a net yield of 6.22% with no service charge overheads. Located in a high-demand area near the university, tenant acquisition costs will be minimal, and vacancy risk is low. With low maintenance requirements and a freehold title, the property secures a reliable £7,960 in net annual profit. We recommend immediate acquisition to capitalize on the high rental demand and strong yield profile.';
    default:
      return '';
  }
};

const getPropertyScore = (p: Property, grossYield: number, netAnnualProfit: number): 'GREEN' | 'YELLOW' | 'RED' => {
  // RED condition checks
  if (
    p.askingPrice > p.estimatedMarketValue * 1.05 || // significantly above market value (above 5% is a good threshold)
    grossYield < 4.0 ||
    p.flags.length >= 3 || // multiple serious flags
    netAnnualProfit <= 0
  ) {
    return 'RED';
  }

  // GREEN condition checks
  if (
    p.askingPrice <= p.estimatedMarketValue &&
    grossYield >= 5.5 &&
    p.vacancyRisk === 'Low' &&
    p.flags.length === 0 &&
    (p.titleStatus === 'Freehold' || p.titleStatus === 'Clean Leasehold') && // note: P001/P003/P006 are freehold, P002 is leasehold, P005 short lease
    netAnnualProfit > 5000
  ) {
    return 'GREEN';
  }

  // Fallback to YELLOW (or specifically if it meets yellow criteria)
  return 'YELLOW';
};

export const getCalculatedProperties = (): CalculatedProperty[] => {
  const calculated = rawProperties.map((p) => {
    const grossAnnualRent = p.monthlyRent * 12;
    const grossYield = Math.round((grossAnnualRent / p.askingPrice) * 10000) / 100;
    const annualCosts = p.annualServiceCharge + p.annualMaintenance;
    const netAnnualProfit = Math.round(grossAnnualRent - annualCosts);
    const netYield = Math.round((netAnnualProfit / p.askingPrice) * 10000) / 100;
    const priceDiff = p.askingPrice - p.estimatedMarketValue;
    const score = getPropertyScore(p, grossYield, netAnnualProfit);
    const advisorRecommendation = getAdvisorRecommendation(p.id);

    return {
      ...p,
      grossAnnualRent,
      grossYield,
      annualCosts,
      netAnnualProfit,
      netYield,
      priceDiff,
      score,
      advisorRecommendation,
      rank: 0 // Will be set after sorting
    };
  });

  // Ranking rule:
  // Rank based on: score (GREEN first, then YELLOW, then RED),
  // then net yield (highest first),
  // then price vs market value (furthest below market first, i.e., priceDiff is smallest/most negative).
  const scoreValue = { GREEN: 3, YELLOW: 2, RED: 1 };

  const sorted = [...calculated].sort((a, b) => {
    // 1. Score (descending)
    if (scoreValue[a.score] !== scoreValue[b.score]) {
      return scoreValue[b.score] - scoreValue[a.score];
    }
    // 2. Net Yield (descending)
    if (b.netYield !== a.netYield) {
      return b.netYield - a.netYield;
    }
    // 3. Price vs Market Value (furthest below first, meaning lower/more negative priceDiff first)
    return a.priceDiff - b.priceDiff;
  });

  // Assign ranks based on sorted position (1-indexed)
  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1
  }));
};
