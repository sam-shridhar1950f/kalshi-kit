import { useEffect, useState } from "react";
import { useTrades } from "../hooks/useTrades";
import { formatCents } from "../format";
import type { Trade } from "../types";

export interface TradeFeedProps {
  /**
   * Market ticker. Required unless `data` is supplied.
   */
  ticker?: string;
  className?: string;
  /** How many trades to show. Default 20. */
  limit?: number;
  /**
   * Polling interval in ms. Default 3000.
   * Ignored when `data` is supplied.
   */
  pollIntervalMs?: number;
  /** Override the heading text. Default "RECENT TRADES". */
  heading?: string;
  /**
   * Pre-fetched trades. When supplied, the component renders from this
   * value and does not call `useTrades()`.
   */
  data?: Trade[];
  /**
   * Called when a trade row is clicked. Wires the row as a `<button>` when
   * supplied. Visual polish lands in Sprint 3.
   */
  onTradeClick?: (trade: Trade) => void;
}

function formatRelative(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function TradeFeed({
  ticker,
  className,
  limit = 20,
  pollIntervalMs,
  heading = "Recent trades",
  data,
  onTradeClick,
}: TradeFeedProps) {
  const hookResult = useTrades(ticker ?? "", {
    limit,
    pollIntervalMs,
    enabled: !data && !!ticker,
  });
  const trades = data ?? hookResult.trades;
  const isLoading = data ? false : hookResult.isLoading;
  const error = data ? null : hookResult.error;

  const now = useNow(1000);
  const rootClass = ["kk", "kk-feed", className].filter(Boolean).join(" ");

  if (isLoading && trades.length === 0) {
    // Render the full heading scaffold (title + column labels) and shimmer
    // rows below at the same row height as real trades. Prevents layout
    // jump on data arrival.
    return (
      <div className={rootClass} aria-busy="true">
        <div className="kk-feed__heading">
          <span className="kk-feed__title">{heading}</span>
          <span className="kk-feed__heading-cols">
            <span>Side</span>
            <span>Price</span>
            <span>Size</span>
            <span>Time</span>
          </span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="kk-skeleton kk-skeleton--feed-row"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${rootClass} kk-feed--error`} role="alert">
        <p className="kk-card__error-text">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="kk-feed__heading">
        <span className="kk-feed__title">{heading}</span>
        <span className="kk-feed__heading-cols">
          <span>Side</span>
          <span>Price</span>
          <span>Size</span>
          <span>Time</span>
        </span>
      </div>
      {trades.length === 0 ? (
        <div className="kk-feed__empty">Waiting for first trade</div>
      ) : (
        <ol className="kk-feed__list">
          {trades.map((t) => {
            const price = t.takerSide === "yes" ? t.yesPrice : t.noPrice;
            const rowClass = `kk-feed__row kk-feed__row--${t.takerSide}`;
            const inner = (
              <>
                <span className="kk-feed__side">
                  {t.takerSide.toUpperCase()}
                </span>
                <span className="kk-feed__price">{formatCents(price)}</span>
                <span className="kk-feed__size">
                  ×{t.count.toLocaleString()}
                </span>
                <span className="kk-feed__time">
                  {formatRelative(t.createdAt, now)}
                </span>
              </>
            );

            if (onTradeClick) {
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={rowClass}
                    onClick={() => onTradeClick(t)}
                  >
                    {inner}
                  </button>
                </li>
              );
            }

            return (
              <li key={t.id} className={rowClass}>
                {inner}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
