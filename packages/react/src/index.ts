export { createClient, KalshiApiError } from "./client";
export { formatCents } from "./format";
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

export { useCandlesticks } from "./hooks/useCandlesticks";
export type {
  CandlestickInterval,
  UseCandlesticksOptions,
  UseCandlesticksResult,
} from "./hooks/useCandlesticks";

export { useTrades } from "./hooks/useTrades";
export type { UseTradesOptions, UseTradesResult } from "./hooks/useTrades";

export { usePolledResource } from "./hooks/usePolledResource";
export type {
  PolledResource,
  UsePolledResourceOptions,
} from "./hooks/usePolledResource";

export type {
  Candlestick,
  Market,
  MarketStatus,
  OrderbookData,
  OrderbookLevel,
  Trade,
} from "./types";

export { MarketCard } from "./components/MarketCard";
export type { MarketCardProps } from "./components/MarketCard";

export { Orderbook } from "./components/Orderbook";
export type { OrderbookProps } from "./components/Orderbook";

export { CandlestickChart } from "./components/CandlestickChart";
export type { CandlestickChartProps } from "./components/CandlestickChart";

export { TradeFeed } from "./components/TradeFeed";
export type { TradeFeedProps } from "./components/TradeFeed";

export const VERSION = "0.0.1";
