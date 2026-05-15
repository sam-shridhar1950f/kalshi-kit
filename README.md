# kalshi-kit

Drop-in React components for [Kalshi](https://kalshi.com) prediction markets.

`kalshi-kit` is a React UI kit for the Kalshi prediction-market exchange. Ship market cards, orderbooks, candlestick charts, trade feeds, and multi-outcome event views in minutes. Fully typed, SSR-ready, theme-aware, wired straight to Kalshi's public API.

## Install

```bash
npm install @kalshi-kit/react @kalshi-kit/next
```

## Use

```js
// next.config.mjs
import { withKalshi } from "@kalshi-kit/next";
export default withKalshi();
```

```tsx
// app/page.tsx
import { MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function Page() {
  return <MarketCard ticker="KXNBA-26MAY15DETCLE" />;
}
```

The Next.js helper transparently proxies `/api/kalshi/*` to Kalshi's API on the server. The browser stays inside its own origin and CORS is a non-issue. Read-only components work without an API key.

## What's in the kit

| Component | What it shows |
| --- | --- |
| `MarketCard` | YES/NO prices, volume, status, close time. Flash-animates on tick. |
| `Orderbook` | Stacked or split YES/NO levels with size bars. |
| `CandlestickChart` | OHLC chart backed by `lightweight-charts`. |
| `TradeFeed` | Live trade tape with side, price, size, time. |
| `ProbabilityDial` | Circular gauge for YES probability. |
| `CountdownTimer` | Live countdown to market close. |
| `TimeRangeSelector` | 1h / 1d / 1w / 1m / All pill row. |
| `TradeButton` | Deep-links to kalshi.com with optional builder code. |
| `WatchlistButton` | Star toggle backed by localStorage. |
| `ShareCard` | Copy-link and tweet buttons for a market URL. |
| `MarketSearch` | Debounced autocomplete over open events. |
| `CategoryFilter` | Sports / Politics / Crypto / Economics / World / Entertainment pills. |
| `EventCard` | Header for a multi-outcome event. |
| `EventMarketList` | Ranked child markets under an event, with probability bars. |
| `MarketSparkline` | Inline mini-chart for grids and tables. |
| `ExchangeStatusBadge` | Trading active / paused / closed pill. |

Every component takes an optional `data` prop. A parent can do one fetch and fan it out across a list, no double fetching.

## Hooks

The same hooks the components use, exposed for custom UI:

`useMarket`, `useOrderbook`, `useCandlesticks`, `useTrades`, `useExchangeStatus`, `useEvent`, `useMarketSearch`, `useWatchlist`, `usePolledResource`.

## Theming

```tsx
import { KalshiProvider } from "@kalshi-kit/react";

<KalshiProvider theme="dark">{children}</KalshiProvider>;
```

`theme` accepts `"light"`, `"dark"`, or `"system"`. Themes are driven by CSS custom properties on a `data-kk-theme` attribute. Overridable per instance, no JS runtime overhead.

Every YES/NO component also takes a `colors` prop for per-instance color overrides:

```tsx
<MarketCard
  ticker="KXNFL-..."
  colors={{ yes: "#3b82f6", no: "#eab308" }}
/>
```

## Live demo

`examples/next-demo` is a full showcase of every component against the live Kalshi exchange. Run it locally:

```bash
pnpm install
pnpm --filter next-demo dev
```

Then open [localhost:3000](http://localhost:3000).

## Packages

- [`@kalshi-kit/react`](./packages/react) is the components.
- [`@kalshi-kit/next`](./packages/next) is the one-line Next.js helper.

Adapters for Remix, SvelteKit, Express, and Hono are planned.

## Why this exists

Every team building on top of Kalshi rebuilds the same primitives: market cards, orderbook views, charts. `kalshi-kit` is the open-source standard so they don't have to.

## Status

v0.1.0 is the first published release. The API surface is intentionally narrow and battle-tested against the live exchange. Treat the type surface as stable but not yet frozen until v1.

## License

MIT
