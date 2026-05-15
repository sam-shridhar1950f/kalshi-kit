import { useEffect, useState } from "react";
import { useKalshi } from "../provider";
import { normalizeCandlesticks } from "../normalize";
import type { Candlestick } from "../types";

export type CandlestickInterval = 1 | 60 | 1440;

export interface UseCandlesticksOptions {
  /** 1 = 1m, 60 = 1h, 1440 = 1d. Default 60. */
  interval?: CandlestickInterval;
  /** Number of candles to request. Default 100. */
  limit?: number;
  /** How often to refresh the data, in ms. Default 30000. */
  pollIntervalMs?: number;
  /** If false, skip fetching. Default true. */
  enabled?: boolean;
  /**
   * Optional series ticker override. If omitted, derived from `ticker`
   * by taking everything before the first hyphen.
   */
  seriesTicker?: string;
}

export interface UseCandlesticksResult {
  candles: Candlestick[];
  isLoading: boolean;
  error: Error | null;
}

function deriveSeriesTicker(ticker: string): string {
  const idx = ticker.indexOf("-");
  return idx === -1 ? ticker : ticker.slice(0, idx);
}

export function useCandlesticks(
  ticker: string,
  options: UseCandlesticksOptions = {},
): UseCandlesticksResult {
  const {
    interval = 60,
    limit = 100,
    pollIntervalMs = 30_000,
    enabled = true,
    seriesTicker: seriesTickerOpt,
  } = options;

  const client = useKalshi();
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !ticker) {
      setIsLoading(false);
      return;
    }

    const seriesTicker = seriesTickerOpt ?? deriveSeriesTicker(ticker);
    if (!seriesTicker) {
      setError(new Error(`Could not derive series ticker from "${ticker}"`));
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const periodSeconds = interval * 60;

    async function tick() {
      try {
        const now = Math.floor(Date.now() / 1000);
        const start = now - limit * periodSeconds;
        const path =
          `/series/${encodeURIComponent(seriesTicker)}` +
          `/markets/${encodeURIComponent(ticker)}/candlesticks` +
          `?period_interval=${interval}` +
          `&start_ts=${start}` +
          `&end_ts=${now}`;

        const response = await client.fetch<Record<string, unknown>>(path);
        if (cancelled) return;
        setCandles(normalizeCandlesticks(response, periodSeconds));
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          if (pollIntervalMs > 0) {
            timer = setTimeout(tick, pollIntervalMs);
          }
        }
      }
    }

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ticker, interval, limit, pollIntervalMs, enabled, seriesTickerOpt, client]);

  return { candles, isLoading, error };
}
