import { NextResponse } from "next/server";
import { HOLDINGS } from "@/lib/portfolio-data";
import type { EnrichedHolding, SectorSummary } from "@/lib/types";

export async function GET() {
  const totalInvestment = HOLDINGS.reduce((sum, h) => sum + h.purchasePrice * h.qty, 0);

  const enriched: EnrichedHolding[] = HOLDINGS.map((h) => {
    const investment = h.purchasePrice * h.qty;
    return {
      ...h,
      investment,
      portfolioPercent: investment / totalInvestment,
      cmp: null,
      presentValue: null,
      gainLoss: null,
      peRatio: null,
      latestEarnings: null,
    };
  });

  const sectors = new Map<string, EnrichedHolding[]>();
  for (const h of enriched) {
    const list = sectors.get(h.sector) ?? [];
    list.push(h);
    sectors.set(h.sector, list);
  }

  const summary: SectorSummary[] = [...sectors.entries()].map(([sector, holdings]) => ({
    sector,
    totalInvestment: holdings.reduce((sum, h) => sum + h.investment, 0),
    totalPresentValue: holdings.reduce((sum, h) => sum + (h.presentValue ?? 0), 0),
    totalGainLoss: holdings.reduce((sum, h) => sum + (h.gainLoss ?? 0), 0),
    holdings,
  }));

  return NextResponse.json({ sectors: summary, totalInvestment });
}
