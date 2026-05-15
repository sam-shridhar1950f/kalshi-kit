import { useEffect, useRef, useState } from "react";

export interface PolledResource<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UsePolledResourceOptions<T> {
  /** Stable identifier for the resource. State clears whenever this changes. */
  key: string;
  /** Fetcher that returns the parsed/normalized resource. Receives an AbortSignal. */
  fetch: (signal: AbortSignal) => Promise<T>;
  /** Base poll interval in ms. Set to 0 to fetch once. */
  pollIntervalMs?: number;
  /** Random ±jitter applied each tick. Default 0.1 (±10%). Set to 0 to disable. */
  jitter?: number;
  /** If false, skip fetching entirely. */
  enabled?: boolean;
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === "AbortError"
  ) ||
    (err instanceof Error && err.name === "AbortError");
}

/**
 * Shared polling primitive that powers the resource hooks in this package.
 *
 * - Resets state and aborts in-flight requests whenever `key` changes.
 * - Forwards an `AbortSignal` to the fetcher so cancellation propagates all
 *   the way down to `KalshiClient.fetch`.
 * - Applies symmetric random jitter to the poll interval to avoid multiple
 *   components hitting the API in lockstep.
 */
export function usePolledResource<T>(
  opts: UsePolledResourceOptions<T>,
): PolledResource<T> {
  const {
    key,
    fetch: fetchFn,
    pollIntervalMs = 0,
    jitter = 0.1,
    enabled = true,
  } = opts;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep the latest fetcher in a ref so a fresh closure each render doesn't
  // tear down the effect (and abort an otherwise-fine in-flight request).
  const fetchRef = useRef(fetchFn);
  useEffect(() => {
    fetchRef.current = fetchFn;
  });

  useEffect(() => {
    // Reset state synchronously on key/enabled changes so stale data doesn't
    // flash while the next fetch is in flight.
    setData(null);
    setError(null);

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    let unmounted = false;
    let controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      controller = new AbortController();
      const { signal } = controller;
      try {
        const next = await fetchRef.current(signal);
        if (unmounted || signal.aborted) return;
        setData(next);
        setError(null);
      } catch (e) {
        if (unmounted || signal.aborted || isAbortError(e)) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!unmounted && !signal.aborted) {
          setIsLoading(false);
          if (pollIntervalMs > 0) {
            const spread = jitter > 0
              ? 1 + (Math.random() * 2 - 1) * jitter
              : 1;
            timer = setTimeout(tick, pollIntervalMs * spread);
          }
        }
      }
    }

    tick();

    return () => {
      unmounted = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [key, pollIntervalMs, jitter, enabled]);

  return { data, isLoading, error };
}
