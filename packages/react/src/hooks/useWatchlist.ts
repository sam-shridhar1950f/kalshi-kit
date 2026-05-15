import { useCallback, useEffect, useState } from "react";

const DEFAULT_STORAGE_KEY = "kalshi-kit:watchlist";

export interface UseWatchlistResult {
  tickers: string[];
  has: (ticker: string) => boolean;
  add: (ticker: string) => void;
  remove: (ticker: string) => void;
  /** Returns the new starred state. */
  toggle: (ticker: string) => boolean;
  clear: () => void;
}

function readStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeStorage(key: string, tickers: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(tickers));
  } catch {
    // Storage quota / private mode — silently skip persistence.
  }
}

export function useWatchlist(opts?: { storageKey?: string }): UseWatchlistResult {
  const key = opts?.storageKey ?? DEFAULT_STORAGE_KEY;
  const [tickers, setTickers] = useState<string[]>(() => readStorage(key));

  // Multi-tab sync: pick up changes from other tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      setTickers(readStorage(key));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const has = useCallback(
    (ticker: string) => tickers.includes(ticker),
    [tickers],
  );

  const add = useCallback(
    (ticker: string) => {
      setTickers((prev) => {
        if (prev.includes(ticker)) return prev;
        const next = [...prev, ticker];
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(
    (ticker: string) => {
      setTickers((prev) => {
        if (!prev.includes(ticker)) return prev;
        const next = prev.filter((t) => t !== ticker);
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );

  const toggle = useCallback(
    (ticker: string) => {
      const willBeStarred = !tickers.includes(ticker);
      if (willBeStarred) add(ticker);
      else remove(ticker);
      return willBeStarred;
    },
    [tickers, add, remove],
  );

  const clear = useCallback(() => {
    setTickers([]);
    writeStorage(key, []);
  }, [key]);

  return { tickers, has, add, remove, toggle, clear };
}
