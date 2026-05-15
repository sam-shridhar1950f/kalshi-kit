/**
 * Kalshi exposes a few overlapping status values across endpoints
 * (e.g. `active`, `open`, `settled`, `finalized`). This type lists the
 * common ones for autocomplete but accepts any string so unknown values
 * don't break the UI.
 */
export type MarketStatus =
  | "unopened"
  | "open"
  | "active"
  | "closed"
  | "settled"
  | "finalized"
  | "determined"
  | (string & {});

export interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle?: string;
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
  liquidity: number;
  open_interest: number;
  close_time: string;
  expiration_time: string;
  result?: string;
  can_close_early: boolean;
  category?: string;
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
