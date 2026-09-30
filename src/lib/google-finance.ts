export interface GoogleStats {
	peRatio: number | null;
	latestEarnings: number | null;
}

const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { stats: GoogleStats; expires: number }>();

function extract(html: string, label: string): number | null {
	const match = html.match(
		new RegExp(`>${label}</div><div class="dO6ijd">([^<]*)<`),
	);
	if (!match) return null;
	const value = parseFloat(match[1].replace(/[^0-9.]/g, ""));
	return Number.isNaN(value) ? null : value;
}

export async function fetchGoogleStats(
	googleSymbol: string,
): Promise<GoogleStats> {
	const hit = cache.get(googleSymbol);
	if (hit && hit.expires > Date.now()) return hit.stats;

	const empty = { peRatio: null, latestEarnings: null };
	try {
		const res = await fetch(
			`https://www.google.com/finance/quote/${googleSymbol}`,
			{
				headers: { "User-Agent": "Mozilla/5.0" },
			},
		);
		if (!res.ok) return empty;
		const html = await res.text();
		const stats = {
			peRatio: extract(html, "P/E ratio"),
			latestEarnings: extract(html, "EPS"),
		};
		if (stats.peRatio !== null || stats.latestEarnings !== null) {
			cache.set(googleSymbol, { stats, expires: Date.now() + TTL_MS });
		}
		return stats;
	} catch {
		return empty;
	}
}
