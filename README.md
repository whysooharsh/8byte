# Portfolio Dashboard

A live portfolio dashboard built with Next.js, TypeScript and Tailwind CSS. Holdings come from the provided Excel sheet, prices from Yahoo Finance, and P/E and earnings from Google Finance.

## Features

- Holdings table with Particulars, Purchase Price, Qty, Investment, Portfolio %, NSE/BSE code, CMP, Present Value, Gain/Loss, P/E and Latest Earnings
- Grouped by sector with total investment, present value and gain/loss per sector
- CMP, Present Value and Gain/Loss refresh every 15 seconds
- Gains in green and losses in red, with arrows so it doesn't rely on color alone
- Missing data shows as `—` with a notice instead of breaking the page

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables or API keys are needed.

```bash
npm run build
npm start
```

## API

`GET /api/portfolio` returns the sectors, their holdings and totals as JSON. The page renders the first load on the server and then polls this endpoint.

## Project layout

```
src/
  app/
    page.tsx                    server page, loads initial data
    api/portfolio/route.ts      JSON endpoint
  components/
    portfolio-dashboard.tsx     15s polling, notices
    portfolio-table.tsx         table and sector summaries
  lib/
    portfolio-data.ts           holdings from the Excel sheet
    get-portfolio.ts            fetches prices and builds the sector summary
    google-finance.ts           Google Finance scraper with cache
    types.ts
```

## Changing holdings

Edit `src/lib/portfolio-data.ts`. Each holding needs two symbols:

- `symbol` for Yahoo Finance, for example `HDFCBANK.NS` or `ICICIBANK.BO`
- `googleSymbol` for Google Finance, for example `HDFCBANK:NSE` or `532174:BOM` (BSE stocks use the numeric code)

## Deploying

Import the repo in Vercel and deploy with the defaults.

## Known limitations

- Yahoo and Google Finance have no official API, so these are unofficial sources. They can be delayed, inaccurate or break without notice.
- Some stocks have no data, for example Savani Financials is not on Yahoo Finance.
- The Google Finance cache lives in server memory, so on serverless hosting each instance keeps its own copy.
