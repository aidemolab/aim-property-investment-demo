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
}

export interface CalculatedProperty extends Property {
  grossAnnualRent: number;
  grossYield: number;
  annualCosts: number;
  netAnnualProfit: number;
  netYield: number;
  priceDiff: number; // asking - market
  score: 'GREEN' | 'YELLOW' | 'RED';
  rank: number;
  advisorRecommendation: string;
}
