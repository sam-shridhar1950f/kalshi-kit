import { useKalshi } from "../provider";
import { normalizeTrades } from "../normalize";
import type { Trade } from "../types";
import { usePolledResource } from "./usePolledResource";

export interface UseTradesOptions {
  /** How many recent trades to keep. Default 20. */
  limit?: number;
  /** How often to refetch, in ms. Default 3000. */
  pollIntervalMs?: number;
  /** If false, skip fetching. Default true. */
  enabled?: boolean;
}

export interface UseTradesResult {
  trades: Trade[];
  isLoading: boolean;
  error: Error | null;
}

const EMPTY: Trade[] = [];

export function useTrades(
  ticker: string,
  options: UseTradesOptions = {},
): UseTradesResult {
  const { limit = 20, pollIntervalMs = 3000, enabled = true } = options;
  const client = useKalshi();
  const key = `${ticker}|${limit}`;

  const { data, isLoading, error } = usePolledResource<Trade[]>({
    key,
    pollIntervalMs,
    enabled: enabled && !!ticker,
    fetch: async (signal) => {
      const path =
        `/markets/trades?ticker=${encodeURIComponent(ticker)}&limit=${limit}`;
      const response = await client.fetch<Record<string, unknown>>(path, {
        signal,
      });
      return normalizeTrades(response);
    },
  });

  return { trades: data ?? EMPTY, isLoading, error };
}
