export { createClient, KalshiApiError } from "./client";
export { formatCents } from "./format";
export type { KalshiClient, KalshiClientConfig } from "./client";

export { KalshiProvider, useKalshi, useKalshiTheme } from "./provider";
export type {
  KalshiProviderProps,
  KalshiTheme,
  ResolvedKalshiTheme,
} from "./provider";

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

export { useExchangeStatus } from "./hooks/useExchangeStatus";
export type {
  ExchangeStatus,
  UseExchangeStatusOptions,
  UseExchangeStatusResult,
} from "./hooks/useExchangeStatus";

export { useEvent } from "./hooks/useEvent";
export type { UseEventOptions, UseEventResult } from "./hooks/useEvent";

export { usePolledResource } from "./hooks/usePolledResource";
export type {
  PolledResource,
  UsePolledResourceOptions,
} from "./hooks/usePolledResource";

export {
  normalizeMarket,
  normalizeOrderbook,
  normalizeCandlesticks,
  normalizeEvent,
  normalizeTrades,
} from "./normalize";

export type {
  Candlestick,
  KalshiEvent,
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
export type {
  CandlestickChartHandle,
  CandlestickChartProps,
} from "./components/CandlestickChart";

export { TradeFeed } from "./components/TradeFeed";
export type { TradeFeedProps } from "./components/TradeFeed";

export { ExchangeStatusBadge } from "./components/ExchangeStatusBadge";
export type { ExchangeStatusBadgeProps } from "./components/ExchangeStatusBadge";

export { EventCard } from "./components/EventCard";
export type { EventCardProps } from "./components/EventCard";

export { EventMarketList } from "./components/EventMarketList";
export type { EventMarketListProps } from "./components/EventMarketList";

export { MarketSparkline } from "./components/MarketSparkline";
export type { MarketSparklineProps } from "./components/MarketSparkline";

export { ProbabilityDial } from "./components/ProbabilityDial";
export type { ProbabilityDialProps } from "./components/ProbabilityDial";

export { CountdownTimer } from "./components/CountdownTimer";
export type { CountdownTimerProps } from "./components/CountdownTimer";

export {
  TimeRangeSelector,
  rangeToCandleParams,
} from "./components/TimeRangeSelector";
export type {
  TimeRange,
  TimeRangeSelectorProps,
} from "./components/TimeRangeSelector";

export const VERSION = "0.0.1";
