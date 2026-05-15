import { useState } from "react";
import { useWatchlist } from "../hooks/useWatchlist";

export interface WatchlistButtonProps {
  ticker: string;
  className?: string;
  /** Defaults to true. Set false if you only want to fire onChange. */
  persist?: boolean;
  /** Called after toggle, with the new starred state. */
  onChange?: (starred: boolean) => void;
  /** Override label for screen readers. */
  ariaLabel?: string;
  /** Visual size in px. Default 18. */
  size?: number;
}

export function WatchlistButton({
  ticker,
  className,
  persist = true,
  onChange,
  ariaLabel,
  size = 18,
}: WatchlistButtonProps) {
  // Always run the hook so order is stable; ignore its state when !persist.
  const watchlist = useWatchlist();
  const [localStarred, setLocalStarred] = useState(false);

  const starred = persist ? watchlist.has(ticker) : localStarred;

  function handleClick() {
    let next: boolean;
    if (persist) {
      next = watchlist.toggle(ticker);
    } else {
      next = !localStarred;
      setLocalStarred(next);
    }
    onChange?.(next);
  }

  const rootClass = [
    "kk",
    "kk-watch-btn",
    starred ? "kk-watch-btn--active" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label =
    ariaLabel ??
    (starred ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`);

  return (
    <button
      type="button"
      className={rootClass}
      onClick={handleClick}
      aria-pressed={starred}
      aria-label={label}
      title={label}
      style={{ width: size + 12, height: size + 12 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={starred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
