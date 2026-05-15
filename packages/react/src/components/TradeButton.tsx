import { colorsToStyle, type KalshiColors } from "../theme";

export interface TradeButtonProps {
  ticker: string;
  /** Defaults to "yes" if omitted. */
  side?: "yes" | "no";
  /** Override the label. Default: "Trade YES" / "Trade NO". */
  label?: string;
  /** Builder code to attach for affiliate attribution. */
  builderCode?: string;
  className?: string;
  colors?: KalshiColors;
  /** Override the destination root. Default "https://kalshi.com". */
  kalshiBaseUrl?: string;
  /** Hide the small ↗ arrow icon. Default false. */
  hideArrow?: boolean;
  /** Variant. "solid" = filled side-color button (default); "ghost" = outline only. */
  variant?: "solid" | "ghost";
}

function buildHref(
  baseUrl: string,
  ticker: string,
  side: "yes" | "no",
  builderCode?: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  const encodedTicker = encodeURIComponent(ticker);
  const params = `?side=${side}${
    builderCode ? `&builder_code=${encodeURIComponent(builderCode)}` : ""
  }`;
  return `${root}/markets/${encodedTicker}${params}`;
}

export function TradeButton({
  ticker,
  side = "yes",
  label,
  builderCode,
  className,
  colors,
  kalshiBaseUrl = "https://kalshi.com",
  hideArrow = false,
  variant = "solid",
}: TradeButtonProps) {
  const colorStyle = colorsToStyle(colors);
  const href = buildHref(kalshiBaseUrl, ticker, side, builderCode);
  const defaultLabel = side === "yes" ? "Trade YES" : "Trade NO";
  const rootClass = [
    "kk",
    "kk-trade-btn",
    `kk-trade-btn--${side}`,
    `kk-trade-btn--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={rootClass}
      style={colorStyle}
    >
      <span className="kk-trade-btn__label">{label ?? defaultLabel}</span>
      {!hideArrow ? (
        <svg
          className="kk-trade-btn__arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M3.5 8.5L8.5 3.5M8.5 3.5H4M8.5 3.5V8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </a>
  );
}
