# @kalshi-kit/react

Drop-in React components for [Kalshi](https://kalshi.com) prediction markets.

## Install

```bash
npm install @kalshi-kit/react
```

Pair it with [`@kalshi-kit/next`](https://www.npmjs.com/package/@kalshi-kit/next) so the browser stays inside its own origin. No API key is required for public market data.

## Quick start

```tsx
import { KalshiProvider, MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function Page() {
  return (
    <KalshiProvider theme="dark">
      <MarketCard ticker="KXNBA-26MAY15DETCLE" />
    </KalshiProvider>
  );
}
```

Every component takes an optional `data` prop, so a parent can fetch once and fan the result out to its children.

## Components

| Component | Renders |
| --- | --- |
| `MarketCard` | YES/NO prices, volume, status, close time |
| `Orderbook` | Stacked or split YES/NO levels with size bars |
| `CandlestickChart` | OHLC chart backed by `lightweight-charts` |
| `TradeFeed` | Live trade tape |
| `ProbabilityDial` | Circular gauge for YES probability |
| `CountdownTimer` | Live countdown to market close |
| `TimeRangeSelector` | 1h / 1d / 1w / 1m / All |
| `TradeButton` | Deep-link to kalshi.com with optional builder code |
| `WatchlistButton` | localStorage-backed star toggle |
| `ShareCard` | Copy-link and tweet buttons |
| `EventSearch` | Debounced autocomplete over live events |
| `CategoryFilter` | Category pill row |
| `EventCard` | Header for a multi-outcome event |
| `EventMarketList` | Ranked child markets with probability bars |
| `MarketSparkline` | Inline SVG mini-chart |
| `ExchangeStatusBadge` | Trading status pill |

Matching data hooks: `useMarket`, `useOrderbook`, `useCandlesticks`, `useTrades`, `useExchangeStatus`, `useEvent`, `useEventSearch`, `useWatchlist`, `usePolledResource`.

## Theming

```tsx
import { KalshiProvider } from "@kalshi-kit/react";

<KalshiProvider theme="dark">{children}</KalshiProvider>
```

`theme` accepts `"light"`, `"dark"`, or `"system"`. Per-instance color overrides flow through a `colors` prop:

```tsx
<MarketCard ticker="..." colors={{ yes: "#3b82f6", no: "#eab308" }} />
```

## Monorepo

Source, issues, and the live demo live at [github.com/sam-shridhar1950f/kalshi-kit](https://github.com/sam-shridhar1950f/kalshi-kit).

## License

MIT
