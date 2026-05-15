import type { NextConfig } from "next";

const DEFAULT_PREFIX = "/api/kalshi";
const DEFAULT_UPSTREAM = "https://api.elections.kalshi.com/trade-api/v2";

export interface WithKalshiOptions {
  /** Path prefix mounted in your app. Default "/api/kalshi". */
  prefix?: string;
  /**
   * Kalshi upstream base URL.
   * Default: "https://api.elections.kalshi.com/trade-api/v2"
   * Set to "https://demo-api.kalshi.co/trade-api/v2" for the demo environment.
   */
  upstream?: string;
}

/**
 * Wrap your `next.config.{js,mjs,ts}` to transparently proxy Kalshi API
 * requests through your app.
 *
 *   import { withKalshi } from "@kalshi-kit/next";
 *   export default withKalshi();
 *
 * Or wrap an existing config:
 *
 *   export default withKalshi({ reactStrictMode: true });
 */
export function withKalshi(
  config: NextConfig = {},
  options: WithKalshiOptions = {},
): NextConfig {
  const prefix = (options.prefix ?? DEFAULT_PREFIX).replace(/\/+$/, "");
  const upstream = (options.upstream ?? DEFAULT_UPSTREAM).replace(/\/+$/, "");
  const userRewrites = config.rewrites;

  return {
    ...config,
    async rewrites() {
      const existing = userRewrites ? await userRewrites() : [];
      const kalshiRule = {
        source: `${prefix}/:path*`,
        destination: `${upstream}/:path*`,
      };

      if (Array.isArray(existing)) {
        return [kalshiRule, ...existing];
      }
      return {
        ...existing,
        beforeFiles: [kalshiRule, ...(existing.beforeFiles ?? [])],
      };
    },
  };
}

/* --------------------------------------------------------------------- *
 * Route handler — alternative to `withKalshi()` when you'd rather see
 * the proxy as an explicit file in your `app/` tree.
 *
 *   // app/api/kalshi/[...path]/route.ts
 *   import { kalshiRouteHandler } from "@kalshi-kit/next";
 *   export const GET = kalshiRouteHandler;
 *   export const POST = kalshiRouteHandler;
 *   export const PUT = kalshiRouteHandler;
 *   export const DELETE = kalshiRouteHandler;
 * --------------------------------------------------------------------- */

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

export interface KalshiRouteHandlerOptions {
  upstream?: string;
}

export function createKalshiRouteHandler(
  options: KalshiRouteHandlerOptions = {},
) {
  const upstream = (options.upstream ?? DEFAULT_UPSTREAM).replace(/\/+$/, "");

  return async function handler(
    req: Request,
    ctx: { params: Promise<{ path?: string[] }> },
  ): Promise<Response> {
    const { path = [] } = await ctx.params;
    const url = new URL(req.url);
    const target = `${upstream}/${path.join("/")}${url.search}`;

    const forwardedHeaders = new Headers();
    req.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        forwardedHeaders.set(key, value);
      }
    });

    const hasBody = req.method !== "GET" && req.method !== "HEAD";

    const upstreamRes = await fetch(target, {
      method: req.method,
      headers: forwardedHeaders,
      body: hasBody ? await req.arrayBuffer() : undefined,
    });

    const responseHeaders = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  };
}

export const kalshiRouteHandler = createKalshiRouteHandler();
