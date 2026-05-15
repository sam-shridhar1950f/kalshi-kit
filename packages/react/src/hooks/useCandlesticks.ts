import { useKalshi } from "../provider";
import { normalizeCandlesticks } from "../normalize";
import type { Candlestick } from "../types";
import { usePolledResource } from "./usePolledResource";

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

const EMPTY: Candlestick[] = [];

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
  const seriesTicker = seriesTickerOpt ?? deriveSeriesTicker(ticker);
  const periodSeconds = interval * 60;
  // Fold every input into the key so changes reset state cleanly.
  const key = `${ticker}|${seriesTicker}|${interval}|${limit}`;

  const { data, isLoading, error } = usePolledResource<Candlestick[]>({
    key,
    pollIntervalMs,
    enabled: enabled && !!ticker && !!seriesTicker,
    fetch: async (signal) => {
      const now = Math.floor(Date.now() / 1000);
      const start = now - limit * periodSeconds;
      const path =
        `/series/${encodeURIComponent(seriesTicker)}` +
        `/markets/${encodeURIComponent(ticker)}/candlesticks` +
        `?period_interval=${interval}` +
        `&start_ts=${start}` +
        `&end_ts=${now}`;
      const response = await client.fetch<Record<string, unknown>>(path, {
        signal,
      });
      return normalizeCandlesticks(response, periodSeconds);
    },
  });

  return { candles: data ?? EMPTY, isLoading, error };
}
