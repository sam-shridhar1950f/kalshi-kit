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

interface EventsResponse {
  events?: Array<{
    event_ticker?: string;
    title?: string;
    sub_title?: string;
    category?: string;
    series_ticker?: string;
    markets?: Array<Record<string, unknown>>;
  }>;
}

const EMPTY: Market[] = [];

/**
 * We search `/events?with_nested_markets=true` rather than `/markets` because:
 *
 * 1. The flat `/markets` listing is *dominated* by auto-generated multivariate
 *    combo markets (`KXMVE…`) whose titles read like
 *    "yes Player A: 4+,yes Player B: 1+,…" — even with `mve_filter=exclude`
 *    the first 200 non-MVE markets are typically state-primary entries; real
 *    user-facing markets ("Will Trump…", "Who will the next Pope be?", NFL
 *    games, etc.) live on `/events`.
 * 2. `/events` returns the canonical user-readable title once per event, and
 *    each event carries its child markets inline when we ask for them.
 *
 * For each matching event we return its first child market — that ticker is
 * what `<MarketCard>`/`<Orderbook>`/etc. will fetch when the demo plugs the
 * selection into the hero. The result type stays `Market[]` so consumers
 * don't have to learn a new shape.
 */
// 200 events covers political/news/world categories well. Sports event-level
// matches (NFL/golf/tennis) live deeper into the paginated index and aren't
// surfaced today — power users can pre-filter by passing `seriesTicker`.
const SERVER_FETCH_CAP = 200;

function matchesEvent(
  event: { event_ticker?: string; title?: string; sub_title?: string },
  needle: string,
): boolean {
  if (!needle) return true;
  const haystack = [event.title ?? "", event.sub_title ?? "", event.event_ticker ?? ""]
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
      params.set("limit", String(SERVER_FETCH_CAP));
      params.set("with_nested_markets", "true");
      if (seriesTicker) params.set("series_ticker", seriesTicker);

      const response = await client.fetch<EventsResponse>(
        `/events?${params.toString()}`,
        { signal },
      );
      const events = Array.isArray(response.events) ? response.events : [];

      const out: Market[] = [];
      for (const event of events) {
        if (!matchesEvent(event, needle)) continue;
        if (
          category &&
          event.category &&
          event.category.toLowerCase() !== category.toLowerCase()
        ) {
          continue;
        }
        const firstMarket = event.markets?.[0];
        if (!firstMarket) continue;
        const market = normalizeMarket(firstMarket);
        // Show the event title in the dropdown — it's the user-readable
        // phrasing, while individual market titles often duplicate it.
        if (event.title) {
          out.push({ ...market, title: event.title });
        } else {
          out.push(market);
        }
        if (out.length >= limit) break;
      }
      return out;
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
