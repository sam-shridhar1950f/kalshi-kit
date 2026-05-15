import { useEffect, useRef, useState } from "react";
import {
  useCandlesticks,
  type CandlestickInterval,
} from "../hooks/useCandlesticks";

export interface CandlestickChartProps {
  ticker: string;
  className?: string;
  /** Candle period in minutes. 1, 60 (default), or 1440. */
  interval?: CandlestickInterval;
  /** Number of candles to load. Default 100. */
  limit?: number;
  /** Chart height in px. Default 320. */
  height?: number;
  /** Optional series ticker override. */
  seriesTicker?: string;
}

interface ChartHandles {
  remove: () => void;
  setData: (rows: { time: number; open: number; high: number; low: number; close: number }[]) => void;
  fitContent: () => void;
}

/**
 * Dynamically loads lightweight-charts so the package builds without it
 * when consumers haven't installed the peer dep yet.
 */
async function createChartInstance(
  container: HTMLDivElement,
  height: number,
  isDark: boolean,
): Promise<ChartHandles | null> {
  try {
    const mod: typeof import("lightweight-charts") = await import(
      "lightweight-charts"
    );
    const chart = mod.createChart(container, {
      autoSize: true,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#71717a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? "#1f1f23" : "#f4f4f5" },
        horzLines: { color: isDark ? "#1f1f23" : "#f4f4f5" },
      },
      rightPriceScale: { borderColor: isDark ? "#27272a" : "#e4e4e7" },
      timeScale: {
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    });

    const series = chart.addCandlestickSeries({
      upColor: isDark ? "#4ade80" : "#16a34a",
      downColor: isDark ? "#f87171" : "#dc2626",
      borderUpColor: isDark ? "#4ade80" : "#16a34a",
      borderDownColor: isDark ? "#f87171" : "#dc2626",
      wickUpColor: isDark ? "#4ade80" : "#16a34a",
      wickDownColor: isDark ? "#f87171" : "#dc2626",
    });

    return {
      remove: () => chart.remove(),
      setData: (rows) =>
        series.setData(
          rows.map((r) => ({
            time: r.time as unknown as import("lightweight-charts").UTCTimestamp,
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close,
          })),
        ),
      fitContent: () => chart.timeScale().fitContent(),
    };
  } catch {
    return null;
  }
}

export function CandlestickChart({
  ticker,
  className,
  interval = 60,
  limit = 100,
  height = 320,
  seriesTicker,
}: CandlestickChartProps) {
  const { candles, isLoading, error } = useCandlesticks(ticker, {
    interval,
    limit,
    seriesTicker,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const handlesRef = useRef<ChartHandles | null>(null);
  const [chartError, setChartError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;
    const isDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;

    createChartInstance(containerRef.current, height, isDark).then(
      (handles) => {
        if (!mounted) {
          handles?.remove();
          return;
        }
        if (!handles) {
          setChartError(
            new Error(
              "lightweight-charts is required for <CandlestickChart>. Install it as a dependency.",
            ),
          );
          return;
        }
        handlesRef.current = handles;
      },
    );

    return () => {
      mounted = false;
      handlesRef.current?.remove();
      handlesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!handlesRef.current || candles.length === 0) return;
    handlesRef.current.setData(candles);
    handlesRef.current.fitContent();
  }, [candles]);

  const rootClass = ["kk-chart", className].filter(Boolean).join(" ");
  const displayError = error ?? chartError;

  return (
    <div className={rootClass} style={{ height }}>
      {displayError ? (
        <div className="kk-chart__overlay" role="alert">
          <p className="kk-card__error-text">{displayError.message}</p>
        </div>
      ) : null}
      {isLoading && candles.length === 0 && !displayError ? (
        <div className="kk-skeleton kk-chart__overlay" />
      ) : null}
      <div
        ref={containerRef}
        className="kk-chart__canvas"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
