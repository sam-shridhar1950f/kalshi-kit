import type { CandlestickInterval } from "../hooks/useCandlesticks";

export type TimeRange = "1h" | "1d" | "1w" | "1m" | "all";

export interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (next: TimeRange) => void;
  /** Override which ranges to show. Default ["1h", "1d", "1w", "1m", "all"]. */
  ranges?: TimeRange[];
  className?: string;
}

const DEFAULT_RANGES: TimeRange[] = ["1h", "1d", "1w", "1m", "all"];

const RANGE_LABELS: Record<TimeRange, string> = {
  "1h": "1H",
  "1d": "1D",
  "1w": "1W",
  "1m": "1M",
  all: "ALL",
};

const RANGE_PARAMS: Record<
  TimeRange,
  { interval: CandlestickInterval; limit: number }
> = {
  "1h": { interval: 1, limit: 60 },
  "1d": { interval: 60, limit: 24 },
  "1w": { interval: 60, limit: 168 },
  "1m": { interval: 1440, limit: 30 },
  all: { interval: 1440, limit: 365 },
};

export function rangeToCandleParams(
  range: TimeRange,
): { interval: CandlestickInterval; limit: number } {
  return RANGE_PARAMS[range];
}

export function TimeRangeSelector({
  value,
  onChange,
  ranges = DEFAULT_RANGES,
  className,
}: TimeRangeSelectorProps) {
  const rootClass = ["kk", "kk-range-row", className].filter(Boolean).join(" ");
  return (
    <div className={rootClass} role="group" aria-label="time range">
      {ranges.map((r) => {
        const active = r === value;
        const pillClass = `kk-range-pill${active ? " kk-range-pill--active" : ""}`;
        return (
          <button
            key={r}
            type="button"
            className={pillClass}
            data-active={active ? "true" : undefined}
            aria-pressed={active}
            onClick={() => onChange(r)}
          >
            {RANGE_LABELS[r]}
          </button>
        );
      })}
    </div>
  );
}
