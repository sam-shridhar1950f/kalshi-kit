import { useEvent } from "../hooks/useEvent";
import type { KalshiEvent } from "../types";

export interface EventCardProps {
  /** Event ticker. Required unless `data` is supplied. */
  eventTicker?: string;
  className?: string;
  /**
   * Polling interval in ms. Default 5000. Ignored when `data` is supplied.
   */
  pollIntervalMs?: number;
  /**
   * Pre-fetched normalized event. When supplied, the component renders from
   * this value and does not call `useEvent()`.
   */
  data?: KalshiEvent;
  /** Called when the card is clicked; renders as a `<button>` when supplied. */
  onSelect?: (event: KalshiEvent) => void;
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

export function EventCard({
  eventTicker,
  className,
  pollIntervalMs,
  data,
  onSelect,
}: EventCardProps) {
  // Skip nested markets when the caller only wants the header.
  const hookResult = useEvent(eventTicker ?? "", {
    withNestedMarkets: false,
    pollIntervalMs,
    enabled: !data && !!eventTicker,
  });
  const event = data ?? hookResult.event;
  const isLoading = data ? false : hookResult.isLoading;
  const error = data ? null : hookResult.error;

  const rootClass = ["kk", "kk-card", className].filter(Boolean).join(" ");

  if (isLoading && !event) {
    return (
      <div className={rootClass} aria-busy="true">
        <div className="kk-skeleton kk-skeleton--line" />
        <div className="kk-skeleton kk-skeleton--title" />
        <div className="kk-skeleton kk-skeleton--line" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={`${rootClass} kk-card--error`} role="alert">
        <p className="kk-card__error-text">
          {error?.message ?? `Event ${eventTicker ?? ""} not found`}
        </p>
      </div>
    );
  }

  const content = (
    <>
      {event.category ? (
        <div className="kk-card__eyebrow">{event.category.toLowerCase()}</div>
      ) : null}
      <div className="kk-card__header">
        <h3 className="kk-card__title">{event.title}</h3>
        {event.subtitle ? (
          <p className="kk-card__subtitle">{event.subtitle}</p>
        ) : null}
      </div>
      {(event.status && event.status !== "unknown") || event.closeTime ? (
        <div className="kk-card__footer">
          {event.status && event.status !== "unknown" ? (
            <span className={`kk-status kk-status--${event.status}`}>
              {event.status}
            </span>
          ) : null}
          {event.closeTime ? (
            <span className="kk-card__chip">
              closes {formatCloseTime(event.closeTime)}
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
        onClick={() => onSelect(event)}
      >
        {content}
      </button>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
