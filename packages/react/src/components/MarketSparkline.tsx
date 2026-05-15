import {
  useCandlesticks,
  type CandlestickInterval,
} from "../hooks/useCandlesticks";
import type { Candlestick } from "../types";

export interface MarketSparklineProps {
  /** Market ticker. Required unless `data` is supplied. */
  ticker?: string;
  className?: string;
  /** Candle period in minutes. 1, 60 (default), or 1440. */
  interval?: CandlestickInterval;
  /** Number of candles to load. Default 24. */
  limit?: number;
  /** Height in px. Default 32. */
  height?: number;
  /** Width in px. Default 96. */
  width?: number;
  /** Pre-fetched candles. When supplied, the hook is skipped. */
  data?: Candlestick[];
  /** When true, render only the path (no baseline, no end marker). */
  hideAxis?: boolean;
}

const PAD = 2;

function buildPath(
  candles: Candlestick[],
  width: number,
  height: number,
): { path: string; fill: string; baselineY: number; lastX: number; lastY: number } | null {
  if (candles.length < 2) return null;

  const closes = candles.map((c) => c.close);
  const first = closes[0]!;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const usableW = width - PAD * 2;
  const usableH = height - PAD * 2;
  const stepX = usableW / (closes.length - 1);
  // Invert Y so higher values render at the top.
  const yFor = (v: number) => PAD + (1 - (v - min) / range) * usableH;

  const points = closes.map((v, i) => ({ x: PAD + i * stepX, y: yFor(v) }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const baselineY = yFor(first);
  const last = points[points.length - 1]!;
  const fill =
    `M${PAD.toFixed(2)},${(height - PAD).toFixed(2)} ` +
    points
      .map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ") +
    ` L${last.x.toFixed(2)},${(height - PAD).toFixed(2)} Z`;

  return { path, fill, baselineY, lastX: last.x, lastY: last.y };
}

export function MarketSparkline({
  ticker,
  className,
  interval = 60,
  limit = 24,
  height = 32,
  width = 96,
  data,
  hideAxis,
}: MarketSparklineProps) {
  const hookResult = useCandlesticks(ticker ?? "", {
    interval,
    limit,
    enabled: !data && !!ticker,
  });
  const candles = data ?? hookResult.candles;

  const rootClass = ["kk", "kk-sparkline", className]
    .filter(Boolean)
    .join(" ");
  const viewBox = `0 0 ${width} ${height}`;

  const closes = candles.map((c) => c.close);
  const trendUp =
    closes.length >= 2 && (closes[closes.length - 1] ?? 0) >= (closes[0] ?? 0);
  const stroke = trendUp ? "var(--kk-yes)" : "var(--kk-no)";

  const geom = buildPath(candles, width, height);

  return (
    <svg
      className={rootClass}
      viewBox={viewBox}
      width={width}
      height={height}
      role="img"
      aria-label="price trend"
      preserveAspectRatio="none"
    >
      {geom ? (
        <>
          {!hideAxis ? (
            <line
              x1={PAD}
              x2={width - PAD}
              y1={geom.baselineY}
              y2={geom.baselineY}
              stroke="var(--kk-border)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          ) : null}
          <path d={geom.fill} fill={stroke} fillOpacity={0.15} />
          <path
            d={geom.path}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {!hideAxis ? (
            <circle cx={geom.lastX} cy={geom.lastY} r={1.75} fill={stroke} />
          ) : null}
        </>
      ) : null}
    </svg>
  );
}
