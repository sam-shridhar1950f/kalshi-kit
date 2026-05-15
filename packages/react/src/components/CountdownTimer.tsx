import { useEffect, useRef, useState } from "react";

export interface CountdownTimerProps {
  to: string | Date | number;
  /** "long" = "3 hours 42 minutes"; "short" = "3h 42m" (default). */
  format?: "long" | "short";
  /** Hide seconds when over an hour out (default true). */
  hideSecondsAboveHour?: boolean;
  /** Called once when the target is reached. */
  onElapsed?: () => void;
  /** Text to render after the target elapses. Default "Closed". */
  elapsedText?: string;
  className?: string;
}

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function toMillis(t: string | Date | number): number {
  if (typeof t === "number") return t;
  if (t instanceof Date) return t.getTime();
  const parsed = Date.parse(t);
  return Number.isNaN(parsed) ? 0 : parsed;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function splitDiff(ms: number): Parts {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function formatParts(parts: Parts, format: "long" | "short", showSeconds: boolean): string {
  const { days, hours, minutes, seconds } = parts;
  const segs: string[] = [];

  if (format === "short") {
    if (days > 0) segs.push(`${days}d`);
    if (days > 0 || hours > 0) segs.push(`${hours}h`);
    segs.push(`${minutes}m`);
    if (showSeconds) segs.push(`${seconds}s`);
    return segs.join(" ");
  }

  const plural = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (days > 0) segs.push(plural(days, "day"));
  if (days > 0 || hours > 0) segs.push(plural(hours, "hour"));
  segs.push(plural(minutes, "minute"));
  if (showSeconds) segs.push(plural(seconds, "second"));
  return segs.join(" ");
}

export function CountdownTimer({
  to,
  format = "short",
  hideSecondsAboveHour = true,
  onElapsed,
  elapsedText = "Closed",
  className,
}: CountdownTimerProps) {
  const target = toMillis(to);
  const now = useNow(1000);
  const diff = target - now;
  const fired = useRef(false);

  useEffect(() => {
    if (diff <= 0 && !fired.current) {
      fired.current = true;
      onElapsed?.();
    }
    // Reset the latch if the target moves into the future (controlled `to`).
    if (diff > 0 && fired.current) {
      fired.current = false;
    }
  }, [diff, onElapsed]);

  const rootClass = ["kk", "kk-countdown", className].filter(Boolean).join(" ");

  if (diff <= 0) {
    return (
      <span className={`${rootClass} kk-countdown--elapsed`}>{elapsedText}</span>
    );
  }

  const parts = splitDiff(diff);
  const overHour = parts.days > 0 || parts.hours > 0;
  const showSeconds = !(hideSecondsAboveHour && overHour);
  const text = formatParts(parts, format, showSeconds);

  return <span className={rootClass}>{text}</span>;
}
