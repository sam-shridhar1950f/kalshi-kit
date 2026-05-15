import { useEffect, useState } from "react";
import { useKalshi } from "../provider";
import type { Market } from "../types";

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
  market: Market;
}

export function useMarket(
  ticker: string,
  options: UseMarketOptions = {},
): UseMarketResult {
  const { pollIntervalMs = 5000, enabled = true } = options;
  const client = useKalshi();
  const [market, setMarket] = useState<Market | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !ticker) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const response = await client.fetch<MarketResponse>(
          `/markets/${encodeURIComponent(ticker)}`,
        );
        if (cancelled) return;
        setMarket(response.market);
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
  }, [ticker, pollIntervalMs, enabled, client]);

  return { market, isLoading, error };
}
