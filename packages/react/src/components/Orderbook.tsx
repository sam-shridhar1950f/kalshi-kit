import { useOrderbook } from "../hooks/useOrderbook";
import { formatCents } from "../format";
import { colorsToStyle, type KalshiColors } from "../theme";
import type { OrderbookData, OrderbookLevel } from "../types";

export interface OrderbookProps {
  /**
   * Market ticker. Required unless `data` is supplied. When `data` is
   * supplied the component skips fetching entirely and renders from `data`.
   */
  ticker?: string;
  className?: string;
  /**
   * Polling interval in ms. Default 1500.
   * Ignored when `data` is supplied.
   */
  pollIntervalMs?: number;
  /** Number of price levels per side. Default 6. */
  depth?: number;
  /** Layout. "stacked" puts YES above NO; "split" places them side-by-side. Default "stacked". */
  layout?: "stacked" | "split";
  /**
   * Pre-fetched orderbook. When supplied, the component renders from this
   * value and does not call `useOrderbook()`.
   */
  data?: OrderbookData;
  /**
   * Called when a row is clicked. Wires the row as a `<button>` instead of
   * a `<li>` when supplied. Styling of the button rows is kept neutral here;
   * Sprint 3 polishes the interaction visuals.
   */
  onLevelClick?: (level: OrderbookLevel, side: "yes" | "no") => void;
  /** Override YES/NO colors for this orderbook only. */
  colors?: KalshiColors;
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
  onLevelClick?: (level: OrderbookLevel, side: "yes" | "no") => void;
}

function Side({ side, levels, ceiling, onLevelClick }: SideProps) {
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
          <li className="kk-book__empty">Waiting for first quote</li>
        ) : (
          levels.map((level, i) => {
            const barWidth = `${Math.min(
              100,
              (level.size / Math.max(1, ceiling)) * 100,
            )}%`;
            const rowKey = `${side}-${i}-${level.price}`;
            const rowClass = `kk-book__row kk-book__row--${side}`;
            const inner = (
              <>
                <span
                  className="kk-book__row-bar"
                  style={{ width: barWidth }}
                  aria-hidden
                />
                <span className="kk-book__row-price">
                  {formatCents(level.price)}
                </span>
                <span className="kk-book__row-size">
                  {level.size.toLocaleString()}
                </span>
              </>
            );

            if (onLevelClick) {
              return (
                <li key={rowKey}>
                  <button
                    type="button"
                    className={rowClass}
                    onClick={() => onLevelClick(level, side)}
                  >
                    {inner}
                  </button>
                </li>
              );
            }

            return (
              <li key={rowKey} className={rowClass}>
                {inner}
              </li>
            );
          })
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
  data,
  onLevelClick,
  colors,
}: OrderbookProps) {
  const colorStyle = colorsToStyle(colors);
  const hookResult = useOrderbook(ticker ?? "", {
    pollIntervalMs,
    depth,
    enabled: !data && !!ticker,
  });
  const orderbook = data ?? hookResult.orderbook;
  const isLoading = data ? false : hookResult.isLoading;
  const error = data ? null : hookResult.error;

  const rootClass = ["kk", "kk-book", `kk-book--${layout}`, className]
    .filter(Boolean)
    .join(" ");

  if (isLoading && !orderbook) {
    // Render the full YES/NO heading scaffold (same as the real layout)
    // and shimmer the rows below. Keeps row heights identical to the
    // hydrated state so the layout doesn't jump on data arrival.
    const skeletonSide = (side: "yes" | "no") => (
      <div
        key={side}
        className={`kk-book__side kk-book__side--${side}`}
      >
        <header className="kk-book__heading">
          <span className="kk-book__label">{side.toUpperCase()}</span>
          <span className="kk-book__heading-cols">
            <span>Price</span>
            <span>Size</span>
          </span>
        </header>
        <ol className="kk-book__rows">
          {Array.from({ length: depth }).map((_, i) => (
            <li
              key={i}
              className="kk-skeleton kk-skeleton--row"
              aria-hidden
            />
          ))}
        </ol>
      </div>
    );

    return (
      <div className={rootClass} style={colorStyle} aria-busy="true">
        {skeletonSide("yes")}
        {skeletonSide("no")}
      </div>
    );
  }

  if (error || !orderbook) {
    return (
      <div
        className={`${rootClass} kk-book--error`}
        style={colorStyle}
        role="alert"
      >
        <p className="kk-card__error-text">
          {error?.message ?? `Could not load orderbook for ${ticker ?? ""}`}
        </p>
      </div>
    );
  }

  const yesCeiling = maxSize(orderbook.yes);
  const noCeiling = maxSize(orderbook.no);

  return (
    <div className={rootClass} style={colorStyle}>
      <Side
        side="yes"
        levels={orderbook.yes}
        ceiling={yesCeiling}
        onLevelClick={onLevelClick}
      />
      <Side
        side="no"
        levels={orderbook.no}
        ceiling={noCeiling}
        onLevelClick={onLevelClick}
      />
    </div>
  );
}
