import { useEffect, useState } from "react";
import { useTrades } from "../hooks/useTrades";
import { formatCents } from "../format";

export interface TradeFeedProps {
  ticker: string;
  className?: string;
  /** How many trades to show. Default 20. */
  limit?: number;
  /** Polling interval in ms. Default 3000. */
  pollIntervalMs?: number;
  /** Override the heading text. Default "RECENT TRADES". */
  heading?: string;
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
}: TradeFeedProps) {
  const { trades, isLoading, error } = useTrades(ticker, {
    limit,
    pollIntervalMs,
  });
  const now = useNow(1000);
  const rootClass = ["kk-feed", className].filter(Boolean).join(" ");

  if (isLoading && trades.length === 0) {
    return (
      <div className={rootClass} aria-busy="true">
        <div className="kk-feed__heading">
          <span className="kk-feed__title">{heading}</span>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="kk-skeleton kk-skeleton--row" />
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
        <div className="kk-feed__empty">no trades yet</div>
      ) : (
        <ol className="kk-feed__list">
          {trades.map((t) => {
            const price = t.takerSide === "yes" ? t.yesPrice : t.noPrice;
            return (
              <li
                key={t.id}
                className={`kk-feed__row kk-feed__row--${t.takerSide}`}
              >
                <span className="kk-feed__side">{t.takerSide.toUpperCase()}</span>
                <span className="kk-feed__price">{formatCents(price)}</span>
                <span className="kk-feed__size">
                  ×{t.count.toLocaleString()}
                </span>
                <span className="kk-feed__time">
                  {formatRelative(t.createdAt, now)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
