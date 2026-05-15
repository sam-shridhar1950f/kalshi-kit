import { useEffect, useRef, useState } from "react";

export interface ShareCardProps {
  ticker: string;
  /** Optional title to include in the share text. */
  title?: string;
  /** Override the share URL. Default kalshi.com/markets/{ticker}. */
  url?: string;
  /** Override the tweet text. Default uses `title` + url. */
  tweetText?: string;
  className?: string;
  /** Hide the inline copy of the URL (just shows buttons). */
  hideUrl?: boolean;
}

const COPY_LABEL_RESET_MS = 1500;

function defaultUrl(ticker: string): string {
  return `https://kalshi.com/markets/${encodeURIComponent(ticker)}`;
}

function buildTweetIntent(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function ShareCard({
  ticker,
  title,
  url,
  tweetText,
  className,
  hideUrl = false,
}: ShareCardProps) {
  const shareUrl = url ?? defaultUrl(ticker);
  const tweet =
    tweetText ?? (title ? `${title} ${shareUrl}` : shareUrl);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, COPY_LABEL_RESET_MS);
    } catch {
      // Permission denied / unsupported — leave label untouched.
    }
  }

  function handleTweet() {
    if (typeof window === "undefined") return;
    window.open(buildTweetIntent(tweet), "_blank", "noopener,noreferrer");
  }

  const rootClass = ["kk", "kk-share", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {!hideUrl ? (
        <span className="kk-share__url" title={shareUrl}>
          {shareUrl}
        </span>
      ) : null}
      <div className="kk-share__actions">
        <button
          type="button"
          className="kk-share__btn"
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          className="kk-share__btn kk-share__btn--primary"
          onClick={handleTweet}
        >
          Tweet
        </button>
      </div>
    </div>
  );
}
