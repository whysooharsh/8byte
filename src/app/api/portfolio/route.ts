import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { HOLDINGS } from "@/lib/portfolio-data";
import { fetchGoogleStats } from "@/lib/google-finance";
import type { EnrichedHolding, SectorSummary } from "@/lib/types";

const yahooFinance = new YahooFinance();

async function fetchCmp(symbol: string): Promise<number | null> {
	try {
		const quote = await yahooFinance.quote(symbol);
		return quote.regularMarketPrice ?? null;
	} catch {
		return null;
	}
}

export async function GET() {
	const totalInvestment = HOLDINGS.reduce(
		(sum, h) => sum + h.purchasePrice * h.qty,
		0,
	);

	const [cmps, googleStats] = await Promise.all([
		Promise.all(HOLDINGS.map((h) => fetchCmp(h.symbol))),
		Promise.all(HOLDINGS.map((h) => fetchGoogleStats(h.googleSymbol))),
	]);

	const enriched: EnrichedHolding[] = HOLDINGS.map((h, i) => {
		const investment = h.purchasePrice * h.qty;
		const cmp = cmps[i];
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

	return NextResponse.json({ sectors: summary, totalInvestment });
}
