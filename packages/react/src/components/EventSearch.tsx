import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useEventSearch } from "../hooks/useEventSearch";
import { formatCents } from "../format";
import type { Market } from "../types";

export interface EventSearchProps {
  /** Controlled query value. If omitted the component manages its own. */
  value?: string;
  onChange?: (next: string) => void;
  /** Called when the user picks a result. */
  onSelect?: (market: Market) => void;
  placeholder?: string;
  className?: string;
  /** Forwarded to useEventSearch. */
  limit?: number;
  category?: string;
  seriesTicker?: string;
  debounceMs?: number;
  /** Max dropdown height in px. Default 320. */
  maxHeight?: number;
}

export function EventSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search markets…",
  className,
  limit = 20,
  category,
  seriesTicker,
  debounceMs = 250,
  maxHeight = 320,
}: EventSearchProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const query = isControlled ? value : internalValue;

  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { results, isLoading, error } = useEventSearch(query, {
    limit,
    category,
    seriesTicker,
    debounceMs,
  });

  // Reset highlight when the result set changes (new query / category).
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    if (!focused) return;
    function handlePointer(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [focused]);

  const setQuery = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const handleSelect = useCallback(
    (market: Market) => {
      onSelect?.(market);
      setFocused(false);
    },
    [onSelect],
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      const target = results[activeIndex];
      if (target) {
        e.preventDefault();
        handleSelect(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && query.trim().length > 0;

  const rootClass = ["kk", "kk-search", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} ref={rootRef}>
      <div className="kk-search__input-wrap">
        <span className="kk-search__icon" aria-hidden>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="kk-search-listbox"
          className="kk-search__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 ? (
          <button
            type="button"
            className="kk-search__clear"
            aria-label="Clear search"
            onMouseDown={(e) => {
              // Prevent the input from losing focus before we update state.
              e.preventDefault();
            }}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {showDropdown ? (
        <div
          id="kk-search-listbox"
          role="listbox"
          className="kk-search__panel"
          style={{ maxHeight }}
        >
          {error ? (
            <div className="kk-search__error" role="alert">
              {error.message || "Search failed"}
            </div>
          ) : isLoading && results.length === 0 ? (
            <>
              <div className="kk-search__loading-row kk-skeleton" />
              <div className="kk-search__loading-row kk-skeleton" />
              <div className="kk-search__loading-row kk-skeleton" />
            </>
          ) : results.length === 0 ? (
            <div className="kk-search__empty">No matching markets</div>
          ) : (
            results.map((m, i) => {
              const active = i === activeIndex;
              const rowClass = [
                "kk-search__result",
                active ? "kk-search__result--active" : null,
              ]
                .filter(Boolean)
                .join(" ");
              const label = m.title || m.yes_sub_title || m.ticker;
              return (
                <button
                  type="button"
                  key={m.ticker}
                  role="option"
                  aria-selected={active}
                  className={rowClass}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    // Keep focus on the input so click-outside doesn't fire
                    // before we handle the selection.
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(m)}
                >
                  <span className="kk-search__result-label">{label}</span>
                  <span className="kk-search__result-price">
                    {formatCents(m.yes_bid)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
