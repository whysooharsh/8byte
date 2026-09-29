"use client";

import { useEffect, useState } from "react";
import { PortfolioTable } from "@/components/portfolio-table";
import type { SectorSummary } from "@/lib/types";

interface PortfolioResponse {
  sectors: SectorSummary[];
  totalInvestment: number;
}

const REFRESH_INTERVAL_MS = 15000;

export function PortfolioDashboard({ initialData }: { initialData: PortfolioResponse }) {
  const [data, setData] = useState(initialData);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error(res.statusText);
        const next: PortfolioResponse = await res.json();
        setData(next);
        setUpdatedAt(new Date());
        setError(null);
      } catch {
        setError("Live refresh failed, showing last known prices.");
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>Updated {updatedAt.toLocaleTimeString()}</span>
        {error && <span className="text-rose-600 dark:text-rose-400">{error}</span>}
      </div>
      <PortfolioTable sectors={data.sectors} totalInvestment={data.totalInvestment} />
    </div>
  );
}
