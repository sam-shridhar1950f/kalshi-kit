import { useKalshi } from "../provider";
import { normalizeOrderbook } from "../normalize";
import type { OrderbookData } from "../types";
import { usePolledResource } from "./usePolledResource";

export interface UseOrderbookOptions {
  /** How often to refetch, in milliseconds. Default 1500. */
  pollIntervalMs?: number;
  /** Maximum number of price levels to keep per side. Default 10. */
  depth?: number;
  /** If false, skip fetching entirely. Default true. */
  enabled?: boolean;
}

export interface UseOrderbookResult {
  orderbook: OrderbookData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useOrderbook(
  ticker: string,
  options: UseOrderbookOptions = {},
): UseOrderbookResult {
  const { pollIntervalMs = 1500, depth = 10, enabled = true } = options;
  const client = useKalshi();
  // Server caps `depth` at 100; clamp to avoid wasted bytes.
  const serverDepth = Math.min(Math.max(depth, 1), 100);
  // Fold depth into the key so changes reset state cleanly.
  const key = `${ticker}|${depth}`;
  const { data, isLoading, error } = usePolledResource<OrderbookData>({
    key,
    pollIntervalMs,
    enabled: enabled && !!ticker,
    fetch: async (signal) => {
      const response = await client.fetch<Record<string, unknown>>(
        `/markets/${encodeURIComponent(ticker)}/orderbook?depth=${serverDepth}`,
        { signal },
      );
      return normalizeOrderbook(response, depth);
    },
  });
  return { orderbook: data, isLoading, error };
}
