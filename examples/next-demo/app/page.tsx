"use client";

import { useState } from "react";
import {
  CandlestickChart,
  EventCard,
  EventMarketList,
  ExchangeStatusBadge,
  KalshiProvider,
  MarketCard,
  MarketSparkline,
  Orderbook,
  TradeFeed,
  type KalshiTheme,
} from "@kalshi-kit/react";

import { InstallCard } from "./_components/InstallCard";
import { Section } from "./_components/Section";
import { ThemeToggle } from "./_components/ThemeToggle";

/**
 * Hero ticker picker. A diverse mix of sports / esports / crypto so the demo
 * exercises a range of real markets. The first ticker is the default. Picked
 * from `/markets/trades` top-volume scan on the day of authoring; markets
 * close, so the page tolerates 404s gracefully via the kit's error states.
 */
const HERO_TICKERS = [
  { ticker: "KXNFLAFCCHAMP-27-CIN", label: "NFL · AFC Champ · CIN" },
  { ticker: "KXPGATOUR-PGC26-SSCH", label: "PGA · Scheffler" },
  { ticker: "KXMLBGAME-26MAY151910MILMIN-MIL", label: "MLB · MIL @ MIN" },
  { ticker: "KXITFMATCH-26MAY15PRIDEL-DEL", label: "Tennis · Del Pino" },
  { ticker: "KXCS2GAME-26MAY151630VITNAVI-VIT", label: "CS2 · Vitality" },
];

/**
 * Trending grid: 6 tickers covering golf, soccer, racing, crypto-ladder, and
 * politics/news so the MarketSparkline section reads as breadth. The BTC
 * ladder ticker exercises fractional-cent display (e.g. 8.5¢).
 */
const TRENDING_TICKERS = [
  "KXMLBTOTAL-26MAY152040AZCOL-12",
  "KXAPFDDHGAME-26MAY15TRICPO-CPO",
  "KXPGATOUR-PGC26-ASMA",
  "KXNBAGAME-26MAY15DETCLE-CLE",
  "KXNASCARRACE-ECO26-LARI",
  "KXTRUMPMENTIONB-26MAY15-CRYP",
];

/** Multi-outcome event with a clear shared narrative across markets. */
const FEATURED_EVENT = "KXNEWPOPE-70";

const INSTALL_SNIPPETS = [
  {
    title: "1. install",
    language: "bash",
    code: "npm install @kalshi-kit/react @kalshi-kit/next",
  },
  {
    title: "2. wrap your next.config",
    language: "js",
    code: `import { withKalshi } from "@kalshi-kit/next";
export default withKalshi();`,
  },
  {
    title: "3. drop in a component",
    language: "tsx",
    code: `import { MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function Page() {
  return <MarketCard ticker="KXNBA-26MAY15DETCLE" />;
}`,
  },
];

export default function Page() {
  const [theme, setTheme] = useState<KalshiTheme>("system");
  const [ticker, setTicker] = useState(HERO_TICKERS[0]!.ticker);

  return (
    <KalshiProvider theme={theme}>
      <div className="demo-root">
        <header className="demo-nav">
          <div className="demo-nav__brand">
            <span className="demo-nav__logo" aria-hidden>
              ◆
            </span>
            <span className="demo-nav__name">kalshi-kit</span>
            <ExchangeStatusBadge />
          </div>
          <div className="demo-nav__right">
            <a
              className="demo-nav__link"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="demo-nav__link"
              href="https://npmjs.com/package/@kalshi-kit/react"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        </header>

        <main className="demo-main">
          {/* ───── Hero ───── */}
          <section className="demo-hero">
            <span className="demo-hero__eyebrow">v0 · MIT · React 18+</span>
            <h1 className="demo-hero__title">
              Drop-in React components
              <br />
              for prediction markets.
            </h1>
            <p className="demo-hero__lede">
              Production-grade market cards, orderbooks, charts, and feeds
              wired to Kalshi&apos;s live API. SSR-ready. Theme-aware.
              <code className="demo-hero__pkg">
                {" "}
                npm install @kalshi-kit/react
              </code>
            </p>

            <div className="demo-picker">
              {HERO_TICKERS.map((p) => (
                <button
                  key={p.ticker}
                  type="button"
                  onClick={() => setTicker(p.ticker)}
                  className={`demo-pill${ticker === p.ticker ? " demo-pill--active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                spellCheck={false}
                placeholder="any Kalshi ticker"
                className="demo-input"
              />
            </div>

            <div className="demo-hero__grid">
              <div className="demo-hero__col">
                <MarketCard ticker={ticker} />
              </div>
              <div className="demo-hero__col">
                <Orderbook ticker={ticker} depth={6} />
              </div>
            </div>

            <div className="demo-hero__chart">
              <CandlestickChart ticker={ticker} interval={60} height={300} />
            </div>

            <div className="demo-hero__feed">
              <TradeFeed ticker={ticker} limit={10} />
            </div>
          </section>

          {/* ───── Trending markets / sparklines ───── */}
          <Section
            kicker="Sparklines"
            title="Trending markets"
            description="Tiny SVG charts that share one fetch with the surrounding card. Drop into a list and the kit handles polling, layout, and fractional-cent formatting."
          >
            <div className="demo-trending">
              {TRENDING_TICKERS.map((t) => (
                <TrendingCard key={t} ticker={t} />
              ))}
            </div>
          </Section>

          {/* ───── Multi-outcome event ───── */}
          <Section
            kicker="Events"
            title="Multi-outcome markets, one fetch"
            description="EventCard pairs with EventMarketList to render an event header and its child markets as ranked rows. Both consume the same useEvent() hook."
          >
            <div className="demo-event">
              <div className="demo-event__col demo-event__col--card">
                <EventCard eventTicker={FEATURED_EVENT} />
              </div>
              <div className="demo-event__col">
                <EventMarketList eventTicker={FEATURED_EVENT} />
              </div>
            </div>
          </Section>

          {/* ───── Install ───── */}
          <Section
            kicker="Get started"
            title="Three lines and you're rendering live markets"
            description="No API key for public data. The Next.js helper proxies /api/kalshi/* on the server so the browser never crosses origins."
          >
            <div className="demo-install-grid">
              {INSTALL_SNIPPETS.map((s) => (
                <InstallCard
                  key={s.title}
                  title={s.title}
                  language={s.language}
                  code={s.code}
                />
              ))}
            </div>
          </Section>

          <footer className="demo-footer">
            <span>
              Data <code>api.elections.kalshi.com</code> · MIT · v0 preview
            </span>
            <span>
              Built by trading-tools people who didn&apos;t want to rebuild
              this again.
            </span>
          </footer>
        </main>
      </div>
    </KalshiProvider>
  );
}

interface TrendingCardProps {
  ticker: string;
}

/**
 * A compact card showing market title, last price, and a sparkline. We call
 * useMarket via MarketCard? No — we want a single visual unit with the
 * sparkline embedded. So we use MarketCard's `data` prop pattern by inlining
 * a tiny composition: MarketCard with hideFooter, plus a sparkline below.
 *
 * Each TrendingCard issues its own fetch (one per market). For a real app the
 * parent would batch-fetch with the proxy and pass `data={}` — but for the
 * demo we let each card poll independently so the "trending" section
 * genuinely updates.
 */
function TrendingCard({ ticker }: TrendingCardProps) {
  return (
    <div className="demo-trending__card">
      <MarketCard ticker={ticker} hideFooter />
      <div className="demo-trending__spark">
        <MarketSparkline ticker={ticker} interval={60} limit={24} height={36} width={220} />
      </div>
    </div>
  );
}
