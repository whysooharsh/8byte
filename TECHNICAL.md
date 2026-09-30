# Technical Notes

## Approach

Next.js App Router with TypeScript and Tailwind. The Node backend is a Next.js route handler (`/api/portfolio`) and the first page load is rendered on the server. The browser then polls the same endpoint every 15 seconds with `setInterval`.

Holdings are read from the provided Excel sheet into `src/lib/portfolio-data.ts`. Investment, portfolio weight, present value, gain/loss and the sector totals are all computed in `src/lib/get-portfolio.ts`.

## Challenges and solutions

**1. No official APIs.** Yahoo Finance prices come from the unofficial `yahoo-finance2` library. Google Finance has no library I trusted, so `google-finance.ts` fetches the quote page and reads the P/E ratio and EPS values with a small regex. Both can break if the sources change, which is why every failure falls back to `null` instead of throwing.

**2. Mapping symbols.** The sheet has an NSE ticker for some stocks and a numeric BSE code for the rest. Yahoo does not accept the numeric code, it needs a ticker like `ICICIBANK.BO`. Google is the opposite and only works with the numeric code like `532174:BOM`. Each holding therefore stores both symbols. The NSE/BSE column still shows the code from the sheet.

**3. Rate limiting.** My first version made 26 Yahoo requests and 26 Google requests per refresh, and some of them came back empty. Two fixes:

- Yahoo prices are fetched in one batched call for all symbols.
- Google P/E and EPS are cached in memory for an hour, since they change quarterly. Failed fetches are not cached, so they retry on the next poll.

**4. Stale prices at build time.** Next.js prerendered the page during `next build`, which baked prices into the HTML. The page is now `force-dynamic`.

**5. Missing data.** Some stocks simply have no data. Savani Financials is not on Yahoo, and LTIMindtree rebranded to LTM Limited, so its old ticker returned nothing until I updated it. Google also has no P/E for a few stocks. These cells show `—` and the page shows how many prices are unavailable. If a refresh request fails, the last good data stays on screen with a message.

**6. Unnecessary re-renders.** The table is wrapped in `React.memo`, and the polling code keeps the previous data reference when a response is identical, for example when the market is closed. In that case the table does not re-render.

## Decisions

- "Latest Earnings" is shown as the EPS value Google Finance publishes, since it does not expose a separate earnings field.
- The table uses `@tanstack/react-table` (v8). Sector rows and their totals come from its grouping and `sum` aggregation on the `sector` column, so they are not calculated by hand in the component.
- No charts. `recharts` was optional.
- No secrets exist in this app, so nothing sensitive reaches the client.

## Limitations

- The Google Finance cache is per server instance. On serverless hosting a shared cache would be the next step.
- Datacenter IPs can be throttled harder than home connections, so deployed behavior may differ from local.
- The Google scraper depends on its current page markup.
