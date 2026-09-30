"use client";

import { memo, useMemo } from "react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getGroupedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { EnrichedHolding, SectorSummary } from "@/lib/types";

const inr = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0,
});

const muted = "text-zinc-600 dark:text-zinc-400";
const left = new Set(["particulars", "code"]);

function gainColor(value: number) {
	return value >= 0
		? "text-emerald-600 dark:text-emerald-400"
		: "text-rose-600 dark:text-rose-400";
}

function Dash() {
	return (
		<span
			className="text-zinc-400 dark:text-zinc-500"
			title="Unavailable from data source"
		>
			—
		</span>
	);
}

function Money({
	value,
	className,
}: {
	value: number | null;
	className?: string;
}) {
	return value === null ? (
		<Dash />
	) : (
		<span className={className}>{inr.format(value)}</span>
	);
}

function Gain({ value }: { value: number | null }) {
	if (value === null) return <Dash />;
	return (
		<span className={gainColor(value)}>
			{value >= 0 ? "▲" : "▼"} {inr.format(Math.abs(value))}
		</span>
	);
}

const col = createColumnHelper<EnrichedHolding>();

const columns = [
	col.accessor("sector", {}),
	col.accessor("particulars", {
		header: "Particulars",
		cell: (c) => (
			<span className="font-medium text-zinc-900 dark:text-zinc-50">
				{c.getValue()}
			</span>
		),
	}),
	col.accessor("purchasePrice", {
		header: "Purchase Price",
		cell: (c) => <Money value={c.getValue()} className={muted} />,
	}),
	col.accessor("qty", {
		header: "Qty",
		cell: (c) => <span className={muted}>{c.getValue()}</span>,
	}),
	col.accessor("investment", {
		header: "Investment",
		aggregationFn: "sum",
		cell: (c) => <Money value={c.getValue()} className={muted} />,
	}),
	col.accessor("portfolioPercent", {
		header: "Portfolio %",
		aggregationFn: "sum",
		cell: (c) => (
			<span className="text-zinc-500">
				{(c.getValue() * 100).toFixed(1)}%
			</span>
		),
	}),
	col.accessor((h) => h.googleSymbol.split(":")[0], {
		id: "code",
		header: "NSE/BSE",
		cell: (c) => <span className="text-zinc-500">{c.getValue()}</span>,
	}),
	col.accessor("cmp", {
		header: "CMP",
		cell: (c) => <Money value={c.getValue()} />,
	}),
	col.accessor("presentValue", {
		header: "Present Value",
		aggregationFn: "sum",
		cell: (c) => <Money value={c.getValue()} className={muted} />,
	}),
	col.accessor("gainLoss", {
		header: "Gain/Loss",
		aggregationFn: "sum",
		cell: (c) => <Gain value={c.getValue()} />,
	}),
	col.accessor("peRatio", {
		header: "P/E",
		cell: (c) => (
			<span className="text-zinc-500">{c.getValue() ?? <Dash />}</span>
		),
	}),
	col.accessor("latestEarnings", {
		header: "Latest Earnings",
		cell: (c) => <Money value={c.getValue()} className="text-zinc-500" />,
	}),
];

const state = {
	grouping: ["sector"],
	expanded: true as const,
	columnVisibility: { sector: false },
};

function Table({
	sectors,
	totalInvestment,
}: {
	sectors: SectorSummary[];
	totalInvestment: number;
}) {
	const data = useMemo(() => sectors.flatMap((s) => s.holdings), [sectors]);
	const totalPresentValue = sectors.reduce(
		(sum, s) => sum + s.totalPresentValue,
		0,
	);
	const totalGainLoss = sectors.reduce((sum, s) => sum + s.totalGainLoss, 0);

	const table = useReactTable({
		data,
		columns,
		state,
		getCoreRowModel: getCoreRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	});

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
						{table.getHeaderGroups().map((group) => (
							<tr
								key={group.id}
								className="border-b border-zinc-200 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
							>
								{group.headers.map((header) => (
									<th
										key={header.id}
										scope="col"
										className={`px-4 py-2.5 font-medium ${left.has(header.column.id) ? "text-left" : "text-right"}`}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) =>
							row.getIsGrouped() ? (
								<tr
									key={row.id}
									className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold dark:border-zinc-900 dark:bg-zinc-900/40"
								>
									{row.getVisibleCells().map((cell, i) =>
										i === 0 ? (
											<th
												key={cell.id}
												scope="rowgroup"
												className="px-4 py-2 text-left text-zinc-700 dark:text-zinc-300"
											>
												{row.groupingValue as string}
											</th>
										) : (
											<td
												key={cell.id}
												className="px-4 py-2 text-right font-mono tabular-nums"
											>
												{cell.getIsAggregated() &&
												cell.column.columnDef
													.aggregationFn
													? flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)
													: null}
											</td>
										),
									)}
								</tr>
							) : (
								<tr
									key={row.id}
									className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/60"
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className={`px-4 py-2.5 ${left.has(cell.column.id) ? "text-left" : "text-right font-mono tabular-nums"}`}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							),
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export const PortfolioTable = memo(Table);
