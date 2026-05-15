# @kalshi-kit/next

One-line Next.js helper that proxies [Kalshi](https://kalshi.com) API requests through your app, so the browser stays inside its own origin. No API key is required for public market data.

## Install

```bash
npm install @kalshi-kit/next
```

## Quick start

Wrap your Next.js config with `withKalshi()`:

```js
// next.config.mjs
import { withKalshi } from "@kalshi-kit/next";

export default withKalshi();
```

That mounts `/api/kalshi/*` and forwards each request to `https://api.elections.kalshi.com/trade-api/v2/*`. Pair it with [`@kalshi-kit/react`](https://www.npmjs.com/package/@kalshi-kit/react) and your components fetch through your own origin automatically.

To override the prefix or point at the demo environment:

```js
export default withKalshi(
  { reactStrictMode: true },
  { prefix: "/api/kalshi", upstream: "https://demo-api.kalshi.co/trade-api/v2" },
);
```

## Features

| Export | What it does |
| --- | --- |
| `withKalshi(config?, options?)` | Wraps your `next.config.{js,mjs,ts}` and adds a rewrite that proxies `/api/kalshi/*` to the Kalshi API. |
| `kalshiRouteHandler` | Drop-in App Router handler if you'd rather see the proxy as an explicit `app/api/kalshi/[...path]/route.ts` file. Re-export it as `GET`, `POST`, `PUT`, and `DELETE`. |

```ts
// app/api/kalshi/[...path]/route.ts
import { kalshiRouteHandler } from "@kalshi-kit/next";

export const GET = kalshiRouteHandler;
export const POST = kalshiRouteHandler;
export const PUT = kalshiRouteHandler;
export const DELETE = kalshiRouteHandler;
```

## Monorepo

Source, issues, and the live demo live at [github.com/sam-shridhar1950f/kalshi-kit](https://github.com/sam-shridhar1950f/kalshi-kit).

## License

MIT
