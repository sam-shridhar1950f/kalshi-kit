import {
  useExchangeStatus,
  type ExchangeStatus,
} from "../hooks/useExchangeStatus";

export interface ExchangeStatusBadgeProps {
  className?: string;
  /**
   * Polling interval in ms. Default 30000. Ignored when `data` is supplied.
   */
  pollIntervalMs?: number;
  /**
   * Pre-fetched exchange status. When supplied, the component renders from
   * this value and does not call `useExchangeStatus()`.
   */
  data?: ExchangeStatus;
}

interface Variant {
  cls: "active" | "paused" | "closed";
  label: string;
}

function deriveVariant(s: ExchangeStatus | null): Variant {
  if (!s) return { cls: "closed", label: "Exchange closed" };
  if (s.exchangeActive && s.tradingActive) {
    return { cls: "active", label: "Trading active" };
  }
  if (s.exchangeActive) {
    return { cls: "paused", label: "Exchange paused" };
  }
  return { cls: "closed", label: "Exchange closed" };
}

export function ExchangeStatusBadge({
  className,
  pollIntervalMs,
  data,
}: ExchangeStatusBadgeProps) {
  const hookResult = useExchangeStatus({
    pollIntervalMs,
    enabled: !data,
  });
  const status = data ?? hookResult.status;
  const isLoading = data ? false : hookResult.isLoading;

  // Show a neutral skeleton until the first response — keeps width stable.
  if (isLoading && !status) {
    return (
      <span
        className={[
          "kk",
          "kk-status-badge",
          "kk-status-badge--loading",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-busy="true"
      >
        <span className="kk-status-badge__dot" />
        <span className="kk-status-badge__label">Checking…</span>
      </span>
    );
  }

  const variant = deriveVariant(status);
  const cls = [
    "kk",
    "kk-status-badge",
    `kk-status-badge--${variant.cls}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} role="status">
      <span className="kk-status-badge__dot" aria-hidden />
      <span className="kk-status-badge__label">{variant.label}</span>
    </span>
  );
}
