export interface Property {
  id: string;
  address: string;
  type: string;
  region: string;
  askingPrice: number;
  estimatedMarketValue: number;
  monthlyRent: number;
  annualServiceCharge: number;
  annualMaintenance: number;
  vacancyRisk: 'Low' | 'Medium' | 'High';
  condition: string;
  titleStatus: string;
  flags: string[];
  notes: string;
  rowId?: string; // database row id
  own?: boolean; // true for records the visitor added
}

export interface CalculatedProperty extends Property {
  grossAnnualRent: number;
  grossYield: number;
  annualCosts: number;
  netAnnualProfit: number;
  netYield: number;
  priceDiff: number; // asking - market
  annualInterest: number; // mortgage interest (interest-only) in the what-if view; 0 for a cash purchase
  monthlyCashFlow: number; // net annual profit / 12
  roi: number; // net annual profit / cash invested (deposit when financed, price when cash)
  score: 'GREEN' | 'YELLOW' | 'RED';
  rank: number;
  advisorRecommendation: string;
}
