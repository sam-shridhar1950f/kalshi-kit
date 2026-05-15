/**
 * Kalshi has been migrating from integer-cent fields (yes_bid: 66) to
 * string fixed-point fields (yes_bid_dollars: "0.66", volume_fp: "1233254.43").
 * As of May 2026 most market endpoints return only the new shape.
 *
 * The components in this package work in cents (0–100) and whole contracts;
 * these helpers absorb the shape difference so the components stay simple.
 */

import type {
  Candlestick,
  Market,
  OrderbookData,
  OrderbookLevel,
  Trade,
} from "./types";

function num(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function dollarsToCents(value: unknown): number {
  return Math.round(num(value) * 100);
}

function pickPrice(
  rawCents: unknown,
  rawDollars: unknown,
): number {
  if (rawDollars !== undefined && rawDollars !== null) {
    return dollarsToCents(rawDollars);
  }
  return Math.round(num(rawCents));
}

function pickVolume(rawInt: unknown, rawFp: unknown): number {
  if (rawFp !== undefined && rawFp !== null) {
    return Math.round(num(rawFp));
  }
  return Math.round(num(rawInt));
}

export function normalizeMarket(raw: Record<string, unknown>): Market {
  return {
    ticker: String(raw.ticker ?? ""),
    event_ticker: String(raw.event_ticker ?? ""),
    title: String(raw.title ?? ""),
    subtitle: raw.subtitle as string | undefined,
    yes_sub_title: raw.yes_sub_title as string | undefined,
    no_sub_title: raw.no_sub_title as string | undefined,
    status: String(raw.status ?? "unknown"),
    yes_bid: pickPrice(raw.yes_bid, raw.yes_bid_dollars),
    yes_ask: pickPrice(raw.yes_ask, raw.yes_ask_dollars),
    no_bid: pickPrice(raw.no_bid, raw.no_bid_dollars),
    no_ask: pickPrice(raw.no_ask, raw.no_ask_dollars),
    last_price: pickPrice(raw.last_price, raw.last_price_dollars),
    previous_yes_bid: raw.previous_yes_bid_dollars
      ? dollarsToCents(raw.previous_yes_bid_dollars)
      : (raw.previous_yes_bid as number | undefined),
    previous_yes_ask: raw.previous_yes_ask_dollars
      ? dollarsToCents(raw.previous_yes_ask_dollars)
      : (raw.previous_yes_ask as number | undefined),
    previous_price: raw.previous_price_dollars
      ? dollarsToCents(raw.previous_price_dollars)
      : (raw.previous_price as number | undefined),
    volume: pickVolume(raw.volume, raw.volume_fp),
    volume_24h: pickVolume(raw.volume_24h, raw.volume_24h_fp),
    liquidity: pickVolume(raw.liquidity, raw.liquidity_fp),
    open_interest: pickVolume(raw.open_interest, raw.open_interest_fp),
    close_time: String(raw.close_time ?? ""),
    expiration_time: String(raw.expiration_time ?? ""),
    result: (raw.result as string) || undefined,
    can_close_early: Boolean(raw.can_close_early),
    category: raw.category as string | undefined,
  };
}

/**
 * Live Kalshi orderbook arrives sorted ascending by price. The "best" bid on
 * each side is the highest price (closest to 100¢), so the trader-facing view
 * reverses each side so best is at the top.
 */
function normalizeSide(
  rows: unknown,
  depth: number,
): OrderbookLevel[] {
  if (!Array.isArray(rows)) return [];
  const levels: OrderbookLevel[] = rows.map((row) => {
    if (!Array.isArray(row)) return { price: 0, size: 0 };
    return {
      price: dollarsToCents(row[0]),
      size: Math.round(num(row[1])),
    };
  });
  // descending by price → best bid first
  levels.sort((a, b) => b.price - a.price);
  return levels.slice(0, depth);
}

export function normalizeOrderbook(
  raw: Record<string, unknown>,
  depth: number,
): OrderbookData {
  // New shape: { orderbook_fp: { yes_dollars: [[price, size], …], no_dollars: [...] } }
  // Legacy shape: { orderbook: { yes: [[priceCents, size], …], no: [...] } }
  const fp = raw.orderbook_fp as
    | { yes_dollars?: unknown; no_dollars?: unknown }
    | undefined;
  const legacy = raw.orderbook as
    | { yes?: unknown; no?: unknown }
    | undefined;

  return {
    yes: normalizeSide(fp?.yes_dollars ?? legacy?.yes, depth),
    no: normalizeSide(fp?.no_dollars ?? legacy?.no, depth),
  };
}

/**
 * Live shape returns candles with `end_period_ts` and nested `price.{open,close,high,low}_dollars`.
 * lightweight-charts wants `time` at the START of the candle, so we shift by `periodSeconds`.
 * The synthetic prepended candle (returned when `include_latest_before_start=true`)
 * has all OHLC null — we drop those.
 */
export function normalizeCandlesticks(
  raw: unknown,
  periodSeconds: number,
): Candlestick[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { candlesticks?: unknown[] }).candlesticks;
  if (!Array.isArray(list)) return [];

  const out: Candlestick[] = [];
  for (const c of list) {
    if (!c || typeof c !== "object") continue;
    const entry = c as {
      end_period_ts?: number;
      volume_fp?: unknown;
      price?: {
        open_dollars?: unknown;
        high_dollars?: unknown;
        low_dollars?: unknown;
        close_dollars?: unknown;
      };
    };
    const endTs = num(entry.end_period_ts);
    if (!endTs || !entry.price) continue;

    const open = entry.price.open_dollars;
    const high = entry.price.high_dollars;
    const low = entry.price.low_dollars;
    const close = entry.price.close_dollars;
    if (open == null || high == null || low == null || close == null) continue;

    out.push({
      time: endTs - periodSeconds,
      open: dollarsToCents(open),
      high: dollarsToCents(high),
      low: dollarsToCents(low),
      close: dollarsToCents(close),
      volume: Math.round(num(entry.volume_fp)),
    });
  }
  // Ensure strictly ascending time for lightweight-charts.
  out.sort((a, b) => a.time - b.time);
  return out;
}

export function normalizeTrades(raw: unknown): Trade[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { trades?: unknown[] }).trades;
  if (!Array.isArray(list)) return [];

  const out: Trade[] = [];
  for (const t of list) {
    if (!t || typeof t !== "object") continue;
    const entry = t as Record<string, unknown>;
    out.push({
      id: String(entry.trade_id ?? ""),
      ticker: String(entry.ticker ?? ""),
      createdAt: String(entry.created_time ?? ""),
      count: Math.round(num(entry.count_fp ?? entry.count)),
      yesPrice: dollarsToCents(entry.yes_price_dollars ?? entry.yes_price),
      noPrice: dollarsToCents(entry.no_price_dollars ?? entry.no_price),
      takerSide: entry.taker_outcome_side === "no" ? "no" : "yes",
      takerBookSide: entry.taker_book_side === "ask" ? "ask" : "bid",
    });
  }
  return out;
}
