export interface GoogleStats {
  peRatio: number | null;
  latestEarnings: number | null;
}

function extract(html: string, label: string): number | null {
  const match = html.match(new RegExp(`>${label}</div><div class="dO6ijd">([^<]*)<`));
  if (!match) return null;
  const value = parseFloat(match[1].replace(/[^0-9.]/g, ""));
  return Number.isNaN(value) ? null : value;
}

export async function fetchGoogleStats(googleSymbol: string): Promise<GoogleStats> {
  try {
    const res = await fetch(`https://www.google.com/finance/quote/${googleSymbol}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return { peRatio: null, latestEarnings: null };
    const html = await res.text();
    return {
      peRatio: extract(html, "P/E ratio"),
      latestEarnings: extract(html, "EPS"),
    };
  } catch {
    return { peRatio: null, latestEarnings: null };
  }
}
