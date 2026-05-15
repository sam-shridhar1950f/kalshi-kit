import { useKalshi } from "../provider";
import { usePolledResource } from "./usePolledResource";

export interface ExchangeStatus {
  exchangeActive: boolean;
  tradingActive: boolean;
  /** Full untouched response so consumers can read fields the kit doesn't surface. */
  raw: Record<string, unknown>;
}

export interface UseExchangeStatusOptions {
  /** Poll interval in ms. Default 30000. Set to 0 to fetch once. */
  pollIntervalMs?: number;
  /** If false, skip fetching entirely. Default true. */
  enabled?: boolean;
}

export interface UseExchangeStatusResult {
  status: ExchangeStatus | null;
  isLoading: boolean;
  error: Error | null;
}

function normalize(raw: Record<string, unknown>): ExchangeStatus {
  return {
    exchangeActive: Boolean(raw.exchange_active),
    tradingActive: Boolean(raw.trading_active),
    raw,
  };
}

export function useExchangeStatus(
  options: UseExchangeStatusOptions = {},
): UseExchangeStatusResult {
  const { pollIntervalMs = 30_000, enabled = true } = options;
  const client = useKalshi();

  const { data, isLoading, error } = usePolledResource<ExchangeStatus>({
    key: "exchange-status",
    pollIntervalMs,
    enabled,
    fetch: async (signal) => {
      const response = await client.fetch<Record<string, unknown>>(
        "/exchange/status",
        { signal },
      );
      return normalize(response);
    },
  });

  return { status: data, isLoading, error };
}
