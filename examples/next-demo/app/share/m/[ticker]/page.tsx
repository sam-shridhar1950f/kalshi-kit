import type { Metadata } from "next";
import Link from "next/link";
import {
  KalshiProvider,
  MarketCard,
  TradeButton,
} from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

/**
 * Share landing page. The point of this route is the `<meta>` tags emitted
 * by `generateMetadata` — Twitter, Slack, iMessage, Discord, LinkedIn all
 * unfurl `og:image` + `twitter:image` into a rich card. The body is just a
 * pleasant landing for the human who clicks through after seeing the card.
 */

const KALSHI =
  process.env.KALSHI_API_BASE ??
  "https://api.elections.kalshi.com/trade-api/v2";

const SITE = "https://kalshi-kit.dev";

interface Params {
  ticker: string;
}

interface MarketShape {
  title?: string;
  yes_bid_dollars?: string;
  yes_bid?: number;
  yes_sub_title?: string;
}

function dollarsToCents(value: unknown): number {
  if (typeof value === "number") return Math.round(value * 100);
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }
  return 0;
}

function meaningfulSubtitle(title: string, sub?: string): string | null {
  if (!sub) return null;
  const trimmed = sub.trim();
  if (trimmed.length < 2) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "yes" || lower === "no") return null;
  if (title.toLowerCase().includes(lower)) return null;
  return trimmed;
}

async function fetchMarket(ticker: string): Promise<MarketShape | null> {
  try {
    const r = await fetch(`${KALSHI}/markets/${encodeURIComponent(ticker)}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!r.ok) return null;
    const json = (await r.json()) as { market?: MarketShape };
    return json.market ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const market = await fetchMarket(ticker);

  const title = market?.title ?? ticker;
  const yes = dollarsToCents(market?.yes_bid_dollars ?? market?.yes_bid ?? 0);
  const no = Math.max(0, 100 - yes);
  const sub = meaningfulSubtitle(title, market?.yes_sub_title);
  const description = sub
    ? `${sub} · YES ${yes}¢ · NO ${no}¢ · live on Kalshi`
    : `YES ${yes}¢ · NO ${no}¢ · live on Kalshi`;

  const ogImage = `${SITE}/api/og/market/${encodeURIComponent(ticker)}`;
  const pageUrl = `${SITE}/share/m/${encodeURIComponent(ticker)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: "kalshi-kit",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { ticker } = await params;
  const market = await fetchMarket(ticker);
  const title = market?.title ?? ticker;

  return (
    <KalshiProvider theme="system">
      <main className="share-root">
        <header className="share-eyebrow">
          <span className="share-dot" />
          shared from kalshi-kit
        </header>

        <h1 className="share-title">{title}</h1>

        <div className="share-card">
          <MarketCard ticker={ticker} />
        </div>

        <div className="share-cta">
          <TradeButton ticker={ticker} side="yes" />
          <TradeButton ticker={ticker} side="no" variant="ghost" />
        </div>

        <p className="share-footer">
          Built with{" "}
          <Link href="/" className="share-link">
            kalshi-kit
          </Link>
          {" · "}
          drop-in React components for prediction markets.
        </p>
      </main>
    </KalshiProvider>
  );
}
