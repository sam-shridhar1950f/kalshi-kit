import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  CandlestickSeriesPartialOptions,
  ChartOptions,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
} from "lightweight-charts";
import { KalshiApiError } from "../client";

function friendlyErrorMessage(err: Error): string {
  if (err instanceof KalshiApiError) {
    if (err.status === 429) return "Rate limited by Kalshi — backing off.";
    if (err.status >= 500) return "Kalshi API is having a moment. Retrying.";
    if (err.status === 404) return "Market not found.";
  }
  return err.message;
}
import {
  useCandlesticks,
  type CandlestickInterval,
} from "../hooks/useCandlesticks";
import { useKalshiTheme } from "../provider";
import type { Candlestick } from "../types";

export interface CandlestickChartHandle {
  /** Underlying chart instance. `null` until the dynamic import resolves. */
  chart: IChartApi | null;
  /** Underlying candlestick series. `null` until the dynamic import resolves. */
  series: ISeriesApi<"Candlestick"> | null;
  /** Convenience wrapper around `chart.timeScale().fitContent()`. */
  fitContent: () => void;
}

export interface CandlestickChartProps {
  /** Market ticker. Required unless `data` is supplied. */
  ticker?: string;
  className?: string;
  /** Candle period in minutes. 1, 60 (default), or 1440. */
  interval?: CandlestickInterval;
  /** Number of candles to load. Default 100. */
  limit?: number;
  /** Chart height in px. Default 320. */
  height?: number;
  /** Optional series ticker override. */
  seriesTicker?: string;
  /**
   * Pre-fetched candles. When supplied, the component renders from this value
   * and does not call `useCandlesticks()`.
   */
  data?: Candlestick[];
  /**
   * Merged over the kit's default chart options at create-time. Use this to
   * tweak grid, time scale, layout, etc. without forking the component.
   */
  chartOptions?: DeepPartial<ChartOptions>;
  /**
   * Merged over the kit's default candlestick series options at create-time.
   * Use this to override colors or `priceFormat`.
   */
  seriesOptions?: CandlestickSeriesPartialOptions;
  /**
   * Called whenever the crosshair moves over the chart. Wired through
   * `chart.subscribeCrosshairMove`; the subscription is torn down on unmount
   * or when the chart is re-created (e.g. on theme change).
   */
  onCrosshairMove?: (param: MouseEventParams) => void;
}

interface ChartHandles {
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  remove: () => void;
  setData: (rows: Candlestick[]) => void;
  fitContent: () => void;
}

function readVar(
  container: HTMLElement,
  name: string,
  fallback: string,
): string {
  const value = getComputedStyle(container).getPropertyValue(name).trim();
  return value || fallback;
}

function mergeChartOptions(
  base: DeepPartial<ChartOptions>,
  override: DeepPartial<ChartOptions> | undefined,
): DeepPartial<ChartOptions> {
  if (!override) return base;
  // Shallow merge per top-level group — good enough for `layout`, `grid`,
  // `timeScale`, etc. without pulling in a deep-merge dependency. Consumers
  // that need to override a nested sub-property can pass the full sub-object.
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = {
        ...((base as Record<string, unknown>)[key] as object | undefined),
        ...(value as object),
      };
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as DeepPartial<ChartOptions>;
}

/**
 * Dynamically loads lightweight-charts so the package builds without it
 * when consumers haven't installed the peer dep yet.
 */
async function createChartInstance(
  container: HTMLDivElement,
  isDark: boolean,
  chartOptions: DeepPartial<ChartOptions> | undefined,
  seriesOptions: CandlestickSeriesPartialOptions | undefined,
): Promise<ChartHandles | null> {
  try {
    const mod: typeof import("lightweight-charts") = await import(
      "lightweight-charts"
    );

    // Source colors from CSS variables so consumer overrides flow into the
    // chart without prop wiring. Fallback to the kit's hex defaults for
    // SSR/jsdom (where computed values are empty).
    const yesColor = readVar(
      container,
      "--kk-yes",
      isDark ? "#4ade80" : "#16a34a",
    );
    const noColor = readVar(
      container,
      "--kk-no",
      isDark ? "#f87171" : "#dc2626",
    );
    const textColor = readVar(
      container,
      "--kk-text-muted",
      isDark ? "#a1a1aa" : "#71717a",
    );
    const borderColor = readVar(
      container,
      "--kk-border",
      isDark ? "#27272a" : "#e4e4e7",
    );
    const gridColor = isDark ? "#1f1f23" : "#f4f4f5";

    const defaultChartOptions: DeepPartial<ChartOptions> = {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: { borderColor },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
    };

    const chart = mod.createChart(
      container,
      mergeChartOptions(defaultChartOptions, chartOptions),
    );

    const defaultSeriesOptions: CandlestickSeriesPartialOptions = {
      upColor: yesColor,
      downColor: noColor,
      borderUpColor: yesColor,
      borderDownColor: noColor,
      wickUpColor: yesColor,
      wickDownColor: noColor,
    };

    const series = chart.addCandlestickSeries({
      ...defaultSeriesOptions,
      ...(seriesOptions ?? {}),
    });

    return {
      chart,
      series,
      remove: () => chart.remove(),
      setData: (rows) => {
        series.setData(
          rows.map((r) => ({
            time: r.time as unknown as import("lightweight-charts").UTCTimestamp,
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close,
          })),
        );
        // Force the price scale to recompute against the new data range.
        // Toggling autoScale off→on is the v4 workaround for setData not
        // always rescaling when the new data sits in a different range.
        const ps = series.priceScale();
        ps.applyOptions({ autoScale: false });
        ps.applyOptions({ autoScale: true });
      },
      fitContent: () => chart.timeScale().fitContent(),
    };
  } catch {
    return null;
  }
}

export const CandlestickChart = forwardRef<
  CandlestickChartHandle,
  CandlestickChartProps
>(function CandlestickChart(
  {
    ticker,
    className,
    interval = 60,
    limit = 100,
    height = 320,
    seriesTicker,
    data,
    chartOptions,
    seriesOptions,
    onCrosshairMove,
  },
  ref,
) {
  const hookResult = useCandlesticks(ticker ?? "", {
    interval,
    limit,
    seriesTicker,
    enabled: !data && !!ticker,
  });
  const candles = data ?? hookResult.candles;
  const error = data ? null : hookResult.error;
  const isLoading = data ? false : hookResult.isLoading;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const handlesRef = useRef<ChartHandles | null>(null);
  const [chartError, setChartError] = useState<Error | null>(null);

  const theme = useKalshiTheme();
  const isDark = theme === "dark";

  // Stash the crosshair callback in a ref so updating it doesn't tear down
  // the chart (which would flicker and lose user interaction state).
  const crosshairRef = useRef(onCrosshairMove);
  useEffect(() => {
    crosshairRef.current = onCrosshairMove;
  }, [onCrosshairMove]);

  useImperativeHandle(
    ref,
    () => ({
      get chart() {
        return handlesRef.current?.chart ?? null;
      },
      get series() {
        return handlesRef.current?.series ?? null;
      },
      fitContent: () => {
        handlesRef.current?.fitContent();
      },
    }),
    [],
  );

  // Re-create the chart when theme or user-supplied options change. Option
  // identity matters: pass `useMemo`'d options from the parent if you don't
  // want the chart re-built on every render.
  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;
    let unsubscribeCrosshair: (() => void) | null = null;

    createChartInstance(
      containerRef.current,
      isDark,
      chartOptions,
      seriesOptions,
    ).then((handles) => {
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
      const fn = (param: MouseEventParams) => {
        crosshairRef.current?.(param);
      };
      handles.chart.subscribeCrosshairMove(fn);
      unsubscribeCrosshair = () => handles.chart.unsubscribeCrosshairMove(fn);
    });

    return () => {
      mounted = false;
      unsubscribeCrosshair?.();
      handlesRef.current?.remove();
      handlesRef.current = null;
    };
  }, [isDark, chartOptions, seriesOptions]);

  useEffect(() => {
    if (!handlesRef.current) return;
    // Always call setData — passing [] clears the chart when the ticker
    // changes and the hook hasn't fetched fresh candles yet.
    handlesRef.current.setData(candles);
    if (candles.length > 0) {
      handlesRef.current.fitContent();
    }
  }, [candles]);

  const rootClass = ["kk", "kk-chart", className].filter(Boolean).join(" ");
  const displayError = error ?? chartError;

  return (
    <div className={rootClass} style={{ height }}>
      {displayError ? (
        <div className="kk-chart__overlay" role="alert">
          <p className="kk-card__error-text">{friendlyErrorMessage(displayError)}</p>
        </div>
      ) : null}
      {isLoading && candles.length === 0 && !displayError ? (
        <div className="kk-skeleton kk-chart__overlay" />
      ) : null}
      {!isLoading && candles.length === 0 && !displayError ? (
        <div className="kk-chart__overlay kk-chart__overlay--empty">
          <p className="kk-chart__empty-text">No price history yet</p>
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="kk-chart__canvas"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});
