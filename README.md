# kalshi-kit

**Drop-in React components for [Kalshi](https://kalshi.com) prediction markets.**

`kalshi-kit` is a drop-in React UI kit for the Kalshi prediction-market
exchange. Ship market cards, orderbooks, candlestick charts, trade feeds, and
multi-outcome event views in minutes — fully typed, SSR-ready, theme-aware,
and wired straight to Kalshi's public API. Built by trading-tools people who
got tired of rebuilding the same primitives on every new project.

## Three steps and you're rendering live markets

```bash
npm install @kalshi-kit/react @kalshi-kit/next
```

```js
// next.config.mjs
import { withKalshi } from "@kalshi-kit/next";
export default withKalshi();
```

```tsx
import { MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function Page() {
  return <MarketCard ticker="KXNBA-26MAY15DETCLE" />;
}
```

The Next.js helper transparently proxies `/api/kalshi/*` to Kalshi's API on
the server — the browser stays inside its own origin and CORS is a non-issue.
Read-only components work without an API key.

## What's in the kit

| Component             | What it shows                                                  |
| --------------------- | -------------------------------------------------------------- |
| `MarketCard`          | YES/NO prices, volume, status, close time. Flash-animates.     |
| `Orderbook`           | Stacked or split YES/NO levels with size bars.                 |
| `CandlestickChart`    | OHLC chart backed by `lightweight-charts`.                     |
| `TradeFeed`           | Live trade tape with side/price/size/time.                     |
| `EventCard`           | Header for a multi-outcome event.                              |
| `EventMarketList`     | Ranked child markets under an event, with probability bars.    |
| `MarketSparkline`     | Inline mini-chart for grids and tables.                        |
| `ExchangeStatusBadge` | "Trading active" / "paused" / "closed" pill for headers.       |

Every component takes an optional `data` prop, so a parent can do one fetch
and fan it out across a list — no double-fetching.

## Hooks

The same hooks the components use, exposed for custom UI:

`useMarket`, `useOrderbook`, `useCandlesticks`, `useTrades`,
`useExchangeStatus`, `useEvent`, `usePolledResource`.

## Theming

```tsx
import { KalshiProvider } from "@kalshi-kit/react";

<KalshiProvider theme="dark">{children}</KalshiProvider>;
```

`theme` accepts `"light"`, `"dark"`, or `"system"`. Themes are driven by CSS
custom properties on a `data-kk-theme` attribute — overridable per-instance,
no JS runtime overhead.

## Live demo

`examples/next-demo` is a full showcase of every component against the live
Kalshi exchange. Run it locally:

```bash
pnpm install
pnpm --filter next-demo dev
```

## Packages

- [`@kalshi-kit/react`](./packages/react) — the components
- [`@kalshi-kit/next`](./packages/next) — the one-line Next.js helper

Adapters for Remix, SvelteKit, Express, and Hono are planned.

## Why this exists

Every team building on top of Kalshi rebuilds the same primitives: market
cards, orderbook views, charts. `kalshi-kit` is the open-source standard so
they don't have to.

## Status

Pre-v0. APIs may shift before the first tagged release. Components are
exercised against the live exchange and are safe to use; treat the type
surface as not-yet-frozen.

## License

MIT
