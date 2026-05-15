import { useEffect, useRef, useState } from "react";
import { useMarket } from "../hooks/useMarket";
import type { Market } from "../types";

export interface MarketCardProps {
  ticker: string;
  /** Override or extend the root element className. */
  className?: string;
  /** Polling interval in ms. Set to 0 to disable. Default 5000. */
  pollIntervalMs?: number;
  /** Called when the card is clicked; renders as a `<button>` when supplied. */
  onSelect?: (market: Market) => void;
  /** Hide the footer row (volume, status, close date). */
  hideFooter?: boolean;
}

function formatVolume(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCloseTime(iso: string | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Briefly returns "up" or "down" when `value` changes so a parent can apply
 * a flash class. Resets to null after 700ms.
 */
function usePriceFlash(value: number): "up" | "down" | null {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef<number>(value);

  useEffect(() => {
    if (value === prev.current) return;
    const direction = value > prev.current ? "up" : "down";
    prev.current = value;
    setFlash(direction);
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [value]);

  return flash;
}

export function MarketCard({
  ticker,
  className,
  pollIntervalMs,
  onSelect,
  hideFooter,
}: MarketCardProps) {
  const { market, isLoading, error } = useMarket(ticker, { pollIntervalMs });
  const rootClass = ["kk-card", className].filter(Boolean).join(" ");

  const yesPrice = market ? Math.round(market.yes_bid) : 0;
  const noPrice = market ? Math.max(0, 100 - yesPrice) : 0;
  const yesFlash = usePriceFlash(yesPrice);
  const noFlash = usePriceFlash(noPrice);

  if (isLoading && !market) {
    return (
      <div className={rootClass} aria-busy="true">
        <div className="kk-skeleton kk-skeleton--title" />
        <div className="kk-prices">
          <div className="kk-skeleton kk-skeleton--pill" />
          <div className="kk-skeleton kk-skeleton--pill" />
        </div>
        {!hideFooter && <div className="kk-skeleton kk-skeleton--line" />}
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className={`${rootClass} kk-card--error`} role="alert">
        <p className="kk-card__error-text">
          {error?.message ?? `Market ${ticker} not found`}
        </p>
      </div>
    );
  }

  const yesClass = `kk-price kk-price--yes${
    yesFlash ? ` kk-price--flash-${yesFlash}` : ""
  }`;
  const noClass = `kk-price kk-price--no${
    noFlash ? ` kk-price--flash-${noFlash}` : ""
  }`;

  const content = (
    <>
      <div className="kk-card__header">
        <h3 className="kk-card__title">{market.title}</h3>
        {market.subtitle ? (
          <p className="kk-card__subtitle">{market.subtitle}</p>
        ) : null}
      </div>
      <div className="kk-prices">
        <div className={yesClass}>
          <span className="kk-price__label">YES</span>
          <span className="kk-price__value">{yesPrice}¢</span>
        </div>
        <div className={noClass}>
          <span className="kk-price__label">NO</span>
          <span className="kk-price__value">{noPrice}¢</span>
        </div>
      </div>
      {!hideFooter ? (
        <div className="kk-card__footer">
          <span className="kk-card__stat">
            {formatVolume(market.volume)} vol
          </span>
          <span className={`kk-status kk-status--${market.status}`}>
            {market.status}
          </span>
          {market.close_time ? (
            <span className="kk-card__stat">
              closes {formatCloseTime(market.close_time)}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`${rootClass} kk-card--interactive`}
        onClick={() => onSelect(market)}
      >
        {content}
      </button>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
