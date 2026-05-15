import { useEvent } from "../hooks/useEvent";
import { formatCents } from "../format";
import type { Market } from "../types";

export interface EventMarketListProps {
  /** Event ticker. Required unless `data` is supplied. */
  eventTicker?: string;
  className?: string;
  /**
   * Polling interval in ms. Default 5000. Ignored when `data` is supplied.
   */
  pollIntervalMs?: number;
  /**
   * Pre-fetched markets. When supplied, the component renders from this list
   * and does not call `useEvent()`. Pass the `markets` value off `useEvent()`
   * to share a single fetch with neighbouring components.
   */
  data?: Market[];
}

function rowLabel(m: Market): string {
  // Multi-outcome events frequently share the same `title` across every
  // market and differentiate via `yes_sub_title` (one option per row).
  if (m.yes_sub_title) return m.yes_sub_title;
  if (m.title) return m.title;
  if (m.no_sub_title) return m.no_sub_title;
  return m.ticker;
}

export function EventMarketList({
  eventTicker,
  className,
  pollIntervalMs,
  data,
}: EventMarketListProps) {
  const hookResult = useEvent(eventTicker ?? "", {
    withNestedMarkets: true,
    pollIntervalMs,
    enabled: !data && !!eventTicker,
  });
  const markets = data ?? hookResult.markets ?? [];
  const isLoading = data ? false : hookResult.isLoading;
  const error = data ? null : hookResult.error;

  const rootClass = ["kk", "kk-event-list", className]
    .filter(Boolean)
    .join(" ");

  if (isLoading && markets.length === 0) {
    return (
      <div className={rootClass} aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
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
      <div className={`${rootClass} kk-card--error`} role="alert">
        <p className="kk-card__error-text">{error.message}</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className={rootClass}>
        <div className="kk-feed__empty">No markets</div>
      </div>
    );
  }

  // Leader first. Sort a copy — never mutate caller-supplied arrays.
  const sorted = [...markets].sort((a, b) => b.yes_bid - a.yes_bid);

  return (
    <div className={rootClass}>
      {sorted.map((m) => {
        const pct = Math.max(0, Math.min(100, m.yes_bid));
        return (
          <div key={m.ticker} className="kk-event-list__row">
            <div
              className="kk-event-list__bar"
              style={{ width: `${pct}%` }}
              aria-hidden
            />
            <span className="kk-event-list__label">{rowLabel(m)}</span>
            <span className="kk-event-list__price">
              {formatCents(m.yes_bid)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
