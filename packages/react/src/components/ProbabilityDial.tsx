import { useState } from "react";
import { useMarket } from "../hooks/useMarket";
import { colorsToStyle, type KalshiColors } from "../theme";
import type { Market } from "../types";

export type DialSide = "yes" | "no";

export interface ProbabilityDialProps {
  ticker?: string;
  /** Pre-fetched market. Skips the hook when supplied. */
  data?: Market;
  /** Override the displayed value (0–100). Wins over data/ticker. Interpreted as the YES side; the dial flips it for "no". */
  value?: number;
  /** Dial diameter in px. Default 120. */
  size?: number;
  /** Stroke width in px. Default 12. */
  strokeWidth?: number;
  className?: string;
  pollIntervalMs?: number;
  /** Override the small label below the percentage. Defaults to the active side ("YES" / "NO"). */
  label?: string;
  colors?: KalshiColors;
  /** Controlled active side. */
  side?: DialSide;
  /** Uncontrolled initial active side. Default "yes". */
  defaultSide?: DialSide;
  /** Fires when the user toggles via the segmented control. */
  onSideChange?: (side: DialSide) => void;
  /** Render the YES/NO segmented control below the dial. Default true. */
  showToggle?: boolean;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function ProbabilityDial({
  ticker,
  data,
  value,
  size = 120,
  strokeWidth = 12,
  className,
  pollIntervalMs,
  label,
  colors,
  side,
  defaultSide = "yes",
  onSideChange,
  showToggle = true,
}: ProbabilityDialProps) {
  const colorStyle = colorsToStyle(colors);

  const isControlled = side !== undefined;
  const [internalSide, setInternalSide] = useState<DialSide>(defaultSide);
  const activeSide: DialSide = isControlled ? side : internalSide;

  const setActive = (next: DialSide) => {
    if (!isControlled) setInternalSide(next);
    onSideChange?.(next);
  };

  // Skip the hook when caller supplied an explicit value or pre-fetched market.
  const hasOverride = value != null || !!data;
  const hookResult = useMarket(ticker ?? "", {
    pollIntervalMs,
    enabled: !hasOverride && !!ticker,
  });
  const market = data ?? hookResult.market;

  const yesPct =
    value != null ? clampPct(value) : market ? clampPct(market.yes_bid) : 0;
  const pct = activeSide === "yes" ? yesPct : Math.max(0, 100 - yesPct);

  const rootClass = [
    "kk",
    "kk-dial",
    `kk-dial--${activeSide}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);
  const center = size / 2;
  const display = Math.round(pct);
  const resolvedLabel = label ?? activeSide.toUpperCase();
  const arcColor = activeSide === "yes" ? "var(--kk-yes)" : "var(--kk-no)";

  return (
    <div className={rootClass} style={colorStyle}>
      <div
        className="kk-dial__face"
        style={{ width: size, height: size }}
        role="meter"
        aria-valuenow={display}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${resolvedLabel} probability`}
      >
        <svg
          className="kk-dial__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            className="kk-dial__track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--kk-border)"
            strokeWidth={strokeWidth}
          />
          <circle
            className="kk-dial__arc"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="kk-dial__center">
          <span className="kk-dial__value">
            {display}
            <span className="kk-dial__unit">¢</span>
          </span>
          <span className="kk-dial__label">{resolvedLabel}</span>
        </div>
      </div>
      {showToggle ? (
        <div
          className="kk-dial__toggle"
          role="tablist"
          aria-label="Show YES or NO probability"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSide === "yes"}
            className={`kk-dial__toggle-btn kk-dial__toggle-btn--yes${
              activeSide === "yes" ? " kk-dial__toggle-btn--active" : ""
            }`}
            onClick={() => setActive("yes")}
          >
            YES
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSide === "no"}
            className={`kk-dial__toggle-btn kk-dial__toggle-btn--no${
              activeSide === "no" ? " kk-dial__toggle-btn--active" : ""
            }`}
            onClick={() => setActive("no")}
          >
            NO
          </button>
        </div>
      ) : null}
    </div>
  );
}
