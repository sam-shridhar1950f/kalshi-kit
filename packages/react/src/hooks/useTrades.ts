import { useEffect, useState } from "react";
import { useKalshi } from "../provider";
import { normalizeTrades } from "../normalize";
import type { Trade } from "../types";

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

export function useTrades(
  ticker: string,
  options: UseTradesOptions = {},
): UseTradesResult {
  const { limit = 20, pollIntervalMs = 3000, enabled = true } = options;
  const client = useKalshi();
  const [trades, setTrades] = useState<Trade[]>([]);
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
        const path =
          `/markets/trades?ticker=${encodeURIComponent(ticker)}&limit=${limit}`;
        const response = await client.fetch<Record<string, unknown>>(path);
        if (cancelled) return;
        setTrades(normalizeTrades(response));
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
  }, [ticker, limit, pollIntervalMs, enabled, client]);

  return { trades, isLoading, error };
}
