"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * `useState` with localStorage persistence and cross-tab sync. First render
 * uses `initial` (SSR-safe). After mount, the stored value (if any) takes
 * over. Same key in two pages = shared state across client-side navigation.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // Hydrate from storage after mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* private mode / disabled storage: silently use the in-memory state */
    }
  }, [key]);

  // Stay in sync with other tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        /* ignore malformed payloads */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const setPersisted = useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* quota / disabled storage: state still updates in memory */
      }
    },
    [key],
  );

  return [value, setPersisted];
}
