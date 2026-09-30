import YahooFinance from "yahoo-finance2";
import { HOLDINGS } from "@/lib/portfolio-data";
import { fetchGoogleStats } from "@/lib/google-finance";
import type { EnrichedHolding, SectorSummary } from "@/lib/types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

async function fetchCmps(symbols: string[]): Promise<Map<string, number>> {
	try {
		const quotes = await yahooFinance.quote(symbols);
		return new Map(
			quotes.flatMap((q) =>
				q.regularMarketPrice !== undefined
					? [[q.symbol, q.regularMarketPrice] as [string, number]]
					: [],
			),
		);
	} catch {
		return new Map();
	}
}

export async function getPortfolio() {
	const totalInvestment = HOLDINGS.reduce(
		(sum, h) => sum + h.purchasePrice * h.qty,
		0,
	);

	const [cmpBySymbol, googleStats] = await Promise.all([
		fetchCmps(HOLDINGS.map((h) => h.symbol)),
		Promise.all(HOLDINGS.map((h) => fetchGoogleStats(h.googleSymbol))),
	]);

	const enriched: EnrichedHolding[] = HOLDINGS.map((h, i) => {
		const investment = h.purchasePrice * h.qty;
		const cmp = cmpBySymbol.get(h.symbol) ?? null;
		const presentValue = cmp !== null ? cmp * h.qty : null;
		return {
			...h,
			investment,
			portfolioPercent: investment / totalInvestment,
			cmp,
			presentValue,
			gainLoss: presentValue !== null ? presentValue - investment : null,
			peRatio: googleStats[i].peRatio,
			latestEarnings: googleStats[i].latestEarnings,
		};
	});

	const sectors = new Map<string, EnrichedHolding[]>();
	for (const h of enriched) {
		const list = sectors.get(h.sector) ?? [];
		list.push(h);
		sectors.set(h.sector, list);
	}

	const summary: SectorSummary[] = [...sectors.entries()].map(
		([sector, holdings]) => ({
			sector,
			totalInvestment: holdings.reduce((sum, h) => sum + h.investment, 0),
			totalPresentValue: holdings.reduce(
				(sum, h) => sum + (h.presentValue ?? 0),
				0,
			),
			totalGainLoss: holdings.reduce(
				(sum, h) => sum + (h.gainLoss ?? 0),
				0,
			),
			holdings,
		}),
	);

	return { sectors: summary, totalInvestment };
}
