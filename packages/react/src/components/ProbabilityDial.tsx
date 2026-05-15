import { useMarket } from "../hooks/useMarket";
import { colorsToStyle, type KalshiColors } from "../theme";
import type { Market } from "../types";

export interface ProbabilityDialProps {
  ticker?: string;
  /** Pre-fetched market. Skips the hook when supplied. */
  data?: Market;
  /** Override the displayed value (0–100). Wins over data/ticker. */
  value?: number;
  /** Dial diameter in px. Default 120. */
  size?: number;
  /** Stroke width in px. Default 12. */
  strokeWidth?: number;
  className?: string;
  pollIntervalMs?: number;
  /** Override the small label below the percentage. Default: "YES". */
  label?: string;
  colors?: KalshiColors;
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
  label = "YES",
  colors,
}: ProbabilityDialProps) {
  const colorStyle = colorsToStyle(colors);
  // Skip the hook when caller supplied an explicit value or pre-fetched market.
  const hasOverride = value != null || !!data;
  const hookResult = useMarket(ticker ?? "", {
    pollIntervalMs,
    enabled: !hasOverride && !!ticker,
  });
  const market = data ?? hookResult.market;

  const pct = value != null ? clampPct(value) : market ? clampPct(market.yes_bid) : 0;

  const rootClass = ["kk", "kk-dial", className].filter(Boolean).join(" ");

  // Geometry: a single circle whose stroke-dasharray traces the full
  // circumference, and stroke-dashoffset reveals the YES portion. We rotate
  // the SVG -90° so the arc starts at 12 o'clock.
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);
  const center = size / 2;
  const display = Math.round(pct);

  return (
    <div
      className={rootClass}
      style={{ ...colorStyle, width: size, height: size }}
      role="meter"
      aria-valuenow={display}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} probability`}
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
          stroke="var(--kk-yes)"
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
        <span className="kk-dial__label">{label}</span>
      </div>
    </div>
  );
}
