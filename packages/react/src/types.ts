/**
 * Kalshi v2 market lifecycle values. The string-fallback keeps unknown values
 * from breaking the UI in case the upstream contract evolves.
 */
export type MarketStatus =
  | "initialized"
  | "inactive"
  | "active"
  | "closed"
  | "determined"
  | "disputed"
  | "amended"
  | "finalized"
  | (string & {});

export interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  status: MarketStatus;
  /** Normalized to cents (0–100). */
  yes_bid: number;
  /** Normalized to cents (0–100). */
  yes_ask: number;
  /** Normalized to cents (0–100). */
  no_bid: number;
  /** Normalized to cents (0–100). */
  no_ask: number;
  /** Normalized to cents (0–100). */
  last_price: number;
  previous_yes_bid?: number;
  previous_yes_ask?: number;
  previous_price?: number;
  /** Normalized to whole contracts. */
  volume: number;
  volume_24h: number;
  open_interest: number;
  close_time: string;
  expiration_time: string;
  result?: string;
  can_close_early: boolean;
}

export interface OrderbookLevel {
  /** Cents, 0–100. */
  price: number;
  size: number;
}

export interface OrderbookData {
  /** Best bid first. */
  yes: OrderbookLevel[];
  /** Best bid first. */
  no: OrderbookLevel[];
}

export interface Candlestick {
  /** Unix timestamp in seconds at the START of the candle period. */
  time: number;
  /** OHLC in cents (0–100). */
  open: number;
  high: number;
  low: number;
  close: number;
  /** Whole contracts traded in the period. */
  volume: number;
}

export interface Trade {
  id: string;
  ticker: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Number of contracts traded. Fractional markets may report sub-contract values. */
  count: number;
  /** Cents, 0–100. */
  yesPrice: number;
  /** Cents, 0–100. */
  noPrice: number;
  /** Which outcome the taker chose. */
  takerSide: "yes" | "no";
  /** Whether the taker hit the bid or lifted the ask. */
  takerBookSide: "bid" | "ask";
}
