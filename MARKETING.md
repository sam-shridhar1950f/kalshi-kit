# kalshi-kit · marketing copy

Reference copy for posts, the README, and any external mentions. Tone is
terse and technical — Vercel / Linear, not "🚀 announcement". Keep tweets at
or under their stated limits; the hero is meant to fit even with a screenshot
URL preview.

---

## (a) Hero tweet — 140 chars

```
kalshi-kit: drop-in React components for prediction markets. Market cards, orderbooks, charts, feeds. Live Kalshi data. MIT.
```

(124 chars — leaves room for a link preview.)

---

## (b) Five-tweet thread

**1/5 — opener**

```
shipped kalshi-kit: drop-in React components for prediction markets.

market cards, orderbooks, candlestick charts, trade feeds, multi-outcome events. all wired to Kalshi's live API. MIT.

every prediction-markets team was rebuilding this. now nobody has to.
```

**2/5 — install**

```
one line, one wrap, one component:

  npm install @kalshi-kit/react @kalshi-kit/next

then in next.config.mjs:

  export default withKalshi();

the helper proxies /api/kalshi/* on the server — CORS is a non-issue, no API key needed for read-only data.
```

**3/5 — what it looks like**

```
<MarketCard ticker="KXNBA-26MAY15DETCLE" />

that's the whole API. yes/no prices, volume, status, close time — polled, flash-animated, theme-aware. SSR-safe by default.

every component takes a `data` prop too, so you can do one fetch and fan out to a list.
```

**4/5 — theming + composition**

```
<KalshiProvider theme="dark"> flips every nested component. data-kk-theme on the wrapper drives every token via CSS custom properties — no JS runtime overhead.

useMarket, useOrderbook, useEvent, useCandlesticks, useTrades — same hooks the components use. roll your own UI when you need to.
```

**5/5 — roadmap**

```
shipping next:
 — websocket subscriptions (live orderbook deltas, no polling)
 — Remix + SvelteKit + Hono adapters
 — position cards + portfolio primitives once trading is gated

today it's read-only, type-safe, and battle-tested against the live exchange. v0 is out.

  github.com/kalshi-kit/kalshi-kit
```

---

## (c) README hero paragraph

> `kalshi-kit` is a drop-in React UI kit for the [Kalshi](https://kalshi.com)
> prediction-market exchange. Ship market cards, orderbooks, candlestick
> charts, trade feeds, and multi-outcome event views in minutes — fully
> typed, SSR-ready, theme-aware, and wired straight to Kalshi's public API.
> Built by trading-tools people who got tired of rebuilding the same
> primitives on every new project.

---

## (d) Copy-pasteable snippets

### Install

```bash
npm install @kalshi-kit/react @kalshi-kit/next
```

### Basic use

```tsx
import { MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function Page() {
  return <MarketCard ticker="KXNBA-26MAY15DETCLE" />;
}
```

### Theming

```tsx
import { KalshiProvider, Orderbook, TradeFeed } from "@kalshi-kit/react";

export default function App() {
  return (
    <KalshiProvider theme="dark">
      <Orderbook ticker="KXNBA-26MAY15DETCLE" depth={6} />
      <TradeFeed ticker="KXNBA-26MAY15DETCLE" limit={20} />
    </KalshiProvider>
  );
}
```
