import { useKalshi } from "../provider";
import { normalizeMarket } from "../normalize";
import type { Market } from "../types";
import { usePolledResource } from "./usePolledResource";

export interface UseMarketOptions {
  /** How often to refetch, in milliseconds. Set to 0 to disable polling. Default 5000. */
  pollIntervalMs?: number;
  /** If false, skip fetching entirely. Default true. */
  enabled?: boolean;
}

export interface UseMarketResult {
  market: Market | null;
  isLoading: boolean;
  error: Error | null;
}

interface MarketResponse {
  market: Record<string, unknown>;
}

export function useMarket(
  ticker: string,
  options: UseMarketOptions = {},
): UseMarketResult {
  const { pollIntervalMs = 5000, enabled = true } = options;
  const client = useKalshi();
  const { data, isLoading, error } = usePolledResource<Market>({
    key: ticker,
    pollIntervalMs,
    enabled: enabled && !!ticker,
    fetch: async (signal) => {
      const response = await client.fetch<MarketResponse>(
        `/markets/${encodeURIComponent(ticker)}`,
        { signal },
      );
      return normalizeMarket(response.market);
    },
  });
  return { market: data, isLoading, error };
}
