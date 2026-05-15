# kalshi-kit

Drop-in React components for [Kalshi](https://kalshi.com) prediction markets.

> Status: pre-v0, scaffolding only. APIs will change.

## What this is

A React UI kit for the Kalshi exchange. Market cards, orderbook viewers, candlestick charts, position cards — the components every Kalshi app needs, ready to drop in.

Built on top of Kalshi's public REST + WebSocket APIs.

## The three-step pitch

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

That's it. The Next.js helper transparently proxies `/api/kalshi/*` to Kalshi's API on the server, so the browser stays inside its own origin and CORS is a non-issue. Read-only components work without an API key.

## Packages

- [`@kalshi-kit/react`](./packages/react) — the components
- [`@kalshi-kit/next`](./packages/next) — the one-line Next.js helper

Adapters for Remix, SvelteKit, Express, and Hono are planned.

## Why this exists

Every team building on top of Kalshi rebuilds the same primitives: market cards, orderbook views, charts. `kalshi-kit` is the open-source standard so they don't have to.

## License

MIT
