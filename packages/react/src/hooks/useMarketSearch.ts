import { useEffect, useState } from "react";
import { useKalshi } from "../provider";
import { normalizeMarket } from "../normalize";
import type { Market } from "../types";
import { usePolledResource } from "./usePolledResource";

export interface UseMarketSearchOptions {
  /** ms to wait after the last keystroke before fetching. Default 250. */
  debounceMs?: number;
  /** Result cap. Default 20. */
  limit?: number;
  /** Optional category filter (single value). */
  category?: string;
  /** Optional series_ticker filter. */
  seriesTicker?: string;
  /** Default true. Set false to skip fetching. */
  enabled?: boolean;
}

export interface UseMarketSearchResult {
  results: Market[];
  isLoading: boolean;
  error: Error | null;
}

interface MarketsResponse {
  markets?: Array<Record<string, unknown>>;
}

const EMPTY: Market[] = [];

/**
 * Kalshi's `/markets` endpoint accepts a `q=` parameter but (as of May 2026)
 * silently ignores it — the response is the same regardless of the term.
 * So we always fetch a wider page of open markets and filter client-side.
 * Cap the server-side page at 200 to keep payload bounded; users still get
 * up to `limit` results via local substring matching.
 */
const SERVER_FETCH_CAP = 200;

function matchesQuery(market: Market, needle: string): boolean {
  if (!needle) return true;
  const haystack = [
    market.ticker,
    market.title,
    market.yes_sub_title ?? "",
    market.no_sub_title ?? "",
    market.event_ticker,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function useMarketSearch(
  query: string,
  options: UseMarketSearchOptions = {},
): UseMarketSearchResult {
  const {
    debounceMs = 250,
    limit = 20,
    category,
    seriesTicker,
    enabled = true,
  } = options;

  const client = useKalshi();

  // Debounce the query — separate state so re-renders from the parent don't
  // restart the timer; we only re-arm when the raw query actually changes.
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    if (query === debouncedQuery) return;
    const t = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(t);
    // We intentionally omit debouncedQuery to avoid resetting the timer when
    // the debounced value updates; we only care about the raw `query` source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs]);

  const trimmed = debouncedQuery.trim();
  const needle = trimmed.toLowerCase();

  const shouldFetch = enabled && trimmed.length > 0;

  const key = `${needle}|${category ?? ""}|${seriesTicker ?? ""}|${limit}`;

  const { data, isLoading, error } = usePolledResource<Market[]>({
    key,
    pollIntervalMs: 0,
    enabled: shouldFetch,
    fetch: async (signal) => {
      const params = new URLSearchParams();
      params.set("status", "open");
      params.set("limit", String(Math.min(SERVER_FETCH_CAP, 200)));
      if (seriesTicker) params.set("series_ticker", seriesTicker);
      // We still pass `q` — harmless if ignored, useful if Kalshi turns it on.
      params.set("q", trimmed);

      const response = await client.fetch<MarketsResponse>(
        `/markets?${params.toString()}`,
        { signal },
      );
      const raw = Array.isArray(response.markets) ? response.markets : [];
      const normalized = raw.map((m) => normalizeMarket(m));

      const filtered = normalized.filter((m) => {
        if (category && (m as Market & { category?: string }).category) {
          const cat = (m as Market & { category?: string }).category;
          if (cat && cat.toLowerCase() !== category.toLowerCase()) return false;
        }
        return matchesQuery(m, needle);
      });

      return filtered.slice(0, limit);
    },
  });

  if (!shouldFetch) {
    return { results: EMPTY, isLoading: false, error: null };
  }

  return {
    results: data ?? EMPTY,
    isLoading,
    error,
  };
}
