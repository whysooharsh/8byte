"use client";

import { useEffect, useState } from "react";
import { PortfolioTable } from "@/components/portfolio-table";
import type { SectorSummary } from "@/lib/types";

interface PortfolioResponse {
	sectors: SectorSummary[];
	totalInvestment: number;
}

const REFRESH_INTERVAL_MS = 15000;

export function PortfolioDashboard({
	initialData,
}: {
	initialData: PortfolioResponse;
}) {
	const [data, setData] = useState(initialData);
	const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const id = setInterval(async () => {
			try {
				const res = await fetch("/api/portfolio");
				if (!res.ok) throw new Error(res.statusText);
				const next: PortfolioResponse = await res.json();
				setData((prev) =>
					JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
				);
				setUpdatedAt(new Date());
				setError(null);
			} catch {
				setError("Live refresh failed, showing last known prices.");
			}
		}, REFRESH_INTERVAL_MS);

		return () => clearInterval(id);
	}, []);

	const holdings = data.sectors.flatMap((s) => s.holdings);
	const missing = holdings.filter((h) => h.cmp === null).length;
	const notice =
		error ??
		(missing > 0
			? `Live price unavailable for ${missing} of ${holdings.length} stocks.`
			: null);

	return (
		<div>
			<div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
				<span>
					{updatedAt
						? `Updated ${updatedAt.toLocaleTimeString()}`
						: "Refreshes every 15s"}
				</span>
				{notice && (
					<span
						role="status"
						className="text-rose-600 dark:text-rose-400"
					>
						{notice}
					</span>
				)}
			</div>
			<PortfolioTable
				sectors={data.sectors}
				totalInvestment={data.totalInvestment}
			/>
			<p className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
				Prices from Yahoo Finance, P/E and EPS from Google Finance. Both
				are unofficial sources and may be delayed or inaccurate.
			</p>
		</div>
	);
}
