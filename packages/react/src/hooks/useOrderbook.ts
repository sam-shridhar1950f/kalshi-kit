import { useEffect, useState } from "react";
import { useKalshi } from "../provider";
import type { OrderbookData, OrderbookLevel } from "../types";

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

interface OrderbookResponse {
  orderbook: {
    yes: number[][] | null;
    no: number[][] | null;
  };
}

function toLevels(
  rows: number[][] | null | undefined,
  depth: number,
): OrderbookLevel[] {
  if (!rows) return [];
  return rows.slice(0, depth).map((row) => ({
    price: row?.[0] ?? 0,
    size: row?.[1] ?? 0,
  }));
}

export function useOrderbook(
  ticker: string,
  options: UseOrderbookOptions = {},
): UseOrderbookResult {
  const { pollIntervalMs = 1500, depth = 10, enabled = true } = options;
  const client = useKalshi();
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null);
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
        const response = await client.fetch<OrderbookResponse>(
          `/markets/${encodeURIComponent(ticker)}/orderbook`,
        );
        if (cancelled) return;
        setOrderbook({
          yes: toLevels(response.orderbook.yes, depth),
          no: toLevels(response.orderbook.no, depth),
        });
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
  }, [ticker, pollIntervalMs, depth, enabled, client]);

  return { orderbook, isLoading, error };
}
