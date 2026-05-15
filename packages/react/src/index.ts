export { createClient, KalshiApiError } from "./client";
export type { KalshiClient, KalshiClientConfig } from "./client";

export { KalshiProvider, useKalshi } from "./provider";
export type { KalshiProviderProps } from "./provider";

export { useMarket } from "./hooks/useMarket";
export type { UseMarketOptions, UseMarketResult } from "./hooks/useMarket";

export { useOrderbook } from "./hooks/useOrderbook";
export type {
  UseOrderbookOptions,
  UseOrderbookResult,
} from "./hooks/useOrderbook";

export type {
  Market,
  MarketStatus,
  OrderbookData,
  OrderbookLevel,
} from "./types";

export { MarketCard } from "./components/MarketCard";
export type { MarketCardProps } from "./components/MarketCard";

export const VERSION = "0.0.1";
