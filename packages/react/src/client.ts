export interface KalshiClientConfig {
  /**
   * Base URL to call. Defaults to "/api/kalshi" — the path that
   * `@kalshi-kit/next` exposes when you wrap your config with `withKalshi()`.
   *
   * For local-only dev you can point this at Kalshi directly:
   *   `https://api.elections.kalshi.com/trade-api/v2`
   * (localhost is on Kalshi's CORS allowlist).
   */
  baseUrl?: string;

  /**
   * Optional `fetch` override (e.g. for SSR caching or instrumentation).
   * Defaults to the global `fetch`.
   */
  fetchFn?: typeof fetch;
}

export interface KalshiClient {
  baseUrl: string;
  fetch: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const DEFAULT_BASE_URL = "/api/kalshi";

export class KalshiApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string, message?: string) {
    super(message ?? `Kalshi API ${status}: ${body || "(empty body)"}`);
    this.name = "KalshiApiError";
    this.status = status;
    this.body = body;
  }
}

export function createClient(config: KalshiClientConfig = {}): KalshiClient {
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const fetchFn = config.fetchFn ?? fetch;

  return {
    baseUrl,
    async fetch<T>(path: string, init?: RequestInit): Promise<T> {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const url = `${baseUrl}${normalizedPath}`;
      const response = await fetchFn(url, {
        ...init,
        headers: {
          accept: "application/json",
          ...init?.headers,
        },
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new KalshiApiError(response.status, body);
      }
      return (await response.json()) as T;
    },
  };
}
