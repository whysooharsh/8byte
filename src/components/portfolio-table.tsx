import type { SectorSummary } from "@/lib/types";

const inr = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0,
});

function gainColor(value: number) {
	return value >= 0
		? "text-emerald-600 dark:text-emerald-400"
		: "text-rose-600 dark:text-rose-400";
}

function GainCell({ value }: { value: number | null }) {
	if (value === null) {
		return <span className="text-zinc-400 dark:text-zinc-500">—</span>;
	}
	return (
		<span className={gainColor(value)}>
			{value >= 0 ? "▲" : "▼"} {inr.format(Math.abs(value))}
		</span>
	);
}

const th = "px-4 py-2.5 font-medium text-right";
const td = "px-4 py-2.5 text-right font-mono tabular-nums";

export function PortfolioTable({
	sectors,
	totalInvestment,
}: {
	sectors: SectorSummary[];
	totalInvestment: number;
}) {
	const totalPresentValue = sectors.reduce(
		(sum, s) => sum + s.totalPresentValue,
		0,
	);
	const totalGainLoss = sectors.reduce((sum, s) => sum + s.totalGainLoss, 0);

	return (
		<div className="w-full">
			<div className="flex flex-wrap items-baseline gap-8 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
				<div>
					<div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Investment
					</div>
					<div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
						{inr.format(totalInvestment)}
					</div>
				</div>
				<div>
					<div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Present Value
					</div>
					<div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
						{inr.format(totalPresentValue)}
					</div>
				</div>
				<div>
					<div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Gain / Loss
					</div>
					<div
						className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${gainColor(totalGainLoss)}`}
					>
						{totalGainLoss >= 0 ? "▲" : "▼"}{" "}
						{inr.format(Math.abs(totalGainLoss))}
					</div>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[960px] border-collapse text-sm">
					<thead>
						<tr className="border-b border-zinc-200 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
							<th
								scope="col"
								className="px-4 py-2.5 text-left font-medium"
							>
								Particulars
							</th>
							<th scope="col" className={th}>
								Purchase Price
							</th>
							<th scope="col" className={th}>
								Qty
							</th>
							<th scope="col" className={th}>
								Investment
							</th>
							<th scope="col" className={th}>
								Portfolio %
							</th>
							<th
								scope="col"
								className="px-4 py-2.5 text-left font-medium"
							>
								NSE/BSE
							</th>
							<th scope="col" className={th}>
								CMP
							</th>
							<th scope="col" className={th}>
								Present Value
							</th>
							<th scope="col" className={th}>
								Gain/Loss
							</th>
							<th scope="col" className={th}>
								P/E
							</th>
							<th scope="col" className={th}>
								Latest Earnings
							</th>
						</tr>
					</thead>
					{sectors.map((sector) => (
						<tbody
							key={sector.sector}
							className="[&>tr]:border-b [&>tr]:border-zinc-100 dark:[&>tr]:border-zinc-900"
						>
							<tr className="bg-zinc-50 dark:bg-zinc-900/40">
								<th
									scope="rowgroup"
									colSpan={5}
									className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300"
								>
									{sector.sector}
								</th>
								<td></td>
								<td></td>
								<td className="px-4 py-2 text-right font-mono text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
									{inr.format(sector.totalPresentValue)}
								</td>
								<td
									className={`px-4 py-2 text-right font-mono text-xs font-semibold tabular-nums ${gainColor(sector.totalGainLoss)}`}
								>
									{sector.totalGainLoss >= 0 ? "▲" : "▼"}{" "}
									{inr.format(Math.abs(sector.totalGainLoss))}
								</td>
								<td colSpan={2}></td>
							</tr>
							{sector.holdings.map((h) => (
								<tr
									key={h.symbol}
									className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
								>
									<td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
										{h.particulars}
									</td>
									<td
										className={`${td} text-zinc-600 dark:text-zinc-400`}
									>
										{inr.format(h.purchasePrice)}
									</td>
									<td
										className={`${td} text-zinc-600 dark:text-zinc-400`}
									>
										{h.qty}
									</td>
									<td
										className={`${td} text-zinc-600 dark:text-zinc-400`}
									>
										{inr.format(h.investment)}
									</td>
									<td
										className={`${td} text-zinc-500 dark:text-zinc-500`}
									>
										{(h.portfolioPercent * 100).toFixed(1)}%
									</td>
									<td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-500">
										{h.googleSymbol.split(":")[0]}
									</td>
									<td className={td}>
										{h.cmp !== null ? (
											inr.format(h.cmp)
										) : (
											<span
												className="text-zinc-400 dark:text-zinc-500"
												title="Unavailable from data source"
											>
												—
											</span>
										)}
									</td>
									<td
										className={`${td} text-zinc-600 dark:text-zinc-400`}
									>
										{h.presentValue !== null ? (
											inr.format(h.presentValue)
										) : (
											<span className="text-zinc-400 dark:text-zinc-500">
												—
											</span>
										)}
									</td>
									<td className={td}>
										<GainCell value={h.gainLoss} />
									</td>
									<td
										className={`${td} text-zinc-500 dark:text-zinc-500`}
									>
										{h.peRatio ?? (
											<span
												className="text-zinc-400 dark:text-zinc-500"
												title="Unavailable from data source"
											>
												—
											</span>
										)}
									</td>
									<td
										className={`${td} text-zinc-500 dark:text-zinc-500`}
									>
										{h.latestEarnings !== null ? (
											inr.format(h.latestEarnings)
										) : (
											<span
												className="text-zinc-400 dark:text-zinc-500"
												title="Unavailable from data source"
											>
												—
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					))}
				</table>
			</div>
		</div>
	);
}
