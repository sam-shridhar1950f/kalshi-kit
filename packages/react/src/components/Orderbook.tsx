import { useOrderbook } from "../hooks/useOrderbook";
import type { OrderbookLevel } from "../types";

export interface OrderbookProps {
  ticker: string;
  className?: string;
  /** Polling interval in ms. Default 1500. */
  pollIntervalMs?: number;
  /** Number of price levels per side. Default 6. */
  depth?: number;
  /** Layout. "stacked" puts YES above NO; "split" places them side-by-side. Default "stacked". */
  layout?: "stacked" | "split";
}

function maxSize(levels: OrderbookLevel[]): number {
  let m = 0;
  for (const l of levels) if (l.size > m) m = l.size;
  return m;
}

interface SideProps {
  side: "yes" | "no";
  levels: OrderbookLevel[];
  ceiling: number;
}

function Side({ side, levels, ceiling }: SideProps) {
  return (
    <div className={`kk-book__side kk-book__side--${side}`}>
      <header className="kk-book__heading">
        <span className="kk-book__label">{side.toUpperCase()}</span>
        <span className="kk-book__heading-cols">
          <span>Price</span>
          <span>Size</span>
        </span>
      </header>
      <ol className="kk-book__rows">
        {levels.length === 0 ? (
          <li className="kk-book__empty">no bids</li>
        ) : (
          levels.map((level, i) => (
            <li
              key={`${side}-${i}-${level.price}`}
              className={`kk-book__row kk-book__row--${side}`}
            >
              <span
                className="kk-book__row-bar"
                style={{
                  width: `${Math.min(100, (level.size / Math.max(1, ceiling)) * 100)}%`,
                }}
                aria-hidden
              />
              <span className="kk-book__row-price">{level.price}¢</span>
              <span className="kk-book__row-size">
                {level.size.toLocaleString()}
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

export function Orderbook({
  ticker,
  className,
  pollIntervalMs,
  depth = 6,
  layout = "stacked",
}: OrderbookProps) {
  const { orderbook, isLoading, error } = useOrderbook(ticker, {
    pollIntervalMs,
    depth,
  });

  const rootClass = ["kk-book", `kk-book--${layout}`, className]
    .filter(Boolean)
    .join(" ");

  if (isLoading && !orderbook) {
    return (
      <div className={rootClass} aria-busy="true">
        {Array.from({ length: depth * 2 }).map((_, i) => (
          <div key={i} className="kk-skeleton kk-skeleton--row" />
        ))}
      </div>
    );
  }

  if (error || !orderbook) {
    return (
      <div className={`${rootClass} kk-book--error`} role="alert">
        <p className="kk-card__error-text">
          {error?.message ?? `Could not load orderbook for ${ticker}`}
        </p>
      </div>
    );
  }

  const yesCeiling = maxSize(orderbook.yes);
  const noCeiling = maxSize(orderbook.no);

  return (
    <div className={rootClass}>
      <Side side="yes" levels={orderbook.yes} ceiling={yesCeiling} />
      <Side side="no" levels={orderbook.no} ceiling={noCeiling} />
    </div>
  );
}
