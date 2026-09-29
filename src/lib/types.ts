export interface Holding {
	particulars: string;
	purchasePrice: number;
	qty: number;
	exchange: "NSE" | "BSE";
	symbol: string;
	googleSymbol: string;
	sector: string;
}

export interface EnrichedHolding extends Holding {
	investment: number;
	portfolioPercent: number;
	cmp: number | null;
	presentValue: number | null;
	gainLoss: number | null;
	peRatio: number | null;
	latestEarnings: number | null;
}

export interface SectorSummary {
	sector: string;
	totalInvestment: number;
	totalPresentValue: number;
	totalGainLoss: number;
	holdings: EnrichedHolding[];
}
