import { useKalshi } from "../provider";
import { normalizeEvent, normalizeMarket } from "../normalize";
import type { KalshiEvent, Market } from "../types";
import { usePolledResource } from "./usePolledResource";

export interface UseEventOptions {
  /**
   * If true, fetches the event with nested markets and returns them on the
   * result. Default true.
   */
  withNestedMarkets?: boolean;
  /** Poll interval in ms. Default 5000. */
  pollIntervalMs?: number;
  /** If false, skip fetching entirely. Default true. */
  enabled?: boolean;
}

export interface UseEventResult {
  event: KalshiEvent | null;
  /**
   * Nested markets normalized via `normalizeMarket`. `undefined` when
   * `withNestedMarkets: false`. Empty array means the fetch succeeded but the
   * event has no markets.
   */
  markets: Market[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface EventResource {
  event: KalshiEvent;
  markets: Market[] | undefined;
}

/**
 * The live `/events/{ticker}` endpoint returns the markets list nested under
 * `event.markets` (not at the top level) when `with_nested_markets=true`.
 * We pluck them from both spots so the kit keeps working if Kalshi moves the
 * field to the documented top-level location.
 */
function extractRawMarkets(
  response: Record<string, unknown>,
): Record<string, unknown>[] | undefined {
  const top = response.markets;
  if (Array.isArray(top) && top.length > 0) {
    return top as Record<string, unknown>[];
  }
  const ev = response.event as Record<string, unknown> | undefined;
  const nested = ev?.markets;
  if (Array.isArray(nested)) {
    return nested as Record<string, unknown>[];
  }
  if (Array.isArray(top)) {
    return top as Record<string, unknown>[];
  }
  return undefined;
}

export function useEvent(
  eventTicker: string,
  options: UseEventOptions = {},
): UseEventResult {
  const {
    withNestedMarkets = true,
    pollIntervalMs = 5000,
    enabled = true,
  } = options;
  const client = useKalshi();

  const key = `${eventTicker}|${withNestedMarkets ? "nested" : "bare"}`;

  const { data, isLoading, error } = usePolledResource<EventResource>({
    key,
    pollIntervalMs,
    enabled: enabled && !!eventTicker,
    fetch: async (signal) => {
      const path =
        `/events/${encodeURIComponent(eventTicker)}` +
        (withNestedMarkets ? "?with_nested_markets=true" : "");
      const response = await client.fetch<Record<string, unknown>>(path, {
        signal,
      });
      const rawEvent = (response.event as Record<string, unknown>) ?? {};
      const rawMarkets = withNestedMarkets
        ? extractRawMarkets(response) ?? []
        : undefined;
      return {
        event: normalizeEvent(rawEvent, rawMarkets),
        markets: rawMarkets?.map((m) => normalizeMarket(m)),
      };
    },
  });

  return {
    event: data?.event ?? null,
    markets: data?.markets,
    isLoading,
    error,
  };
}
