export type MarketStatus = "unopened" | "open" | "closed" | "settled";

export interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  status: MarketStatus;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_yes_bid?: number;
  previous_yes_ask?: number;
  previous_price?: number;
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
  price: number;
  size: number;
}

export interface OrderbookData {
  yes: OrderbookLevel[];
  no: OrderbookLevel[];
}
