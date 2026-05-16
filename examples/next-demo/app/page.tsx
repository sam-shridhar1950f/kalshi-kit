"use client";

import { useCallback, useRef, useState } from "react";
import {
  CandlestickChart,
  CategoryFilter,
  CountdownTimer,
  EventCard,
  EventMarketList,
  EventSearch,
  KalshiProvider,
  MarketCard,
  MarketSparkline,
  Orderbook,
  ProbabilityDial,
  ShareCard,
  TimeRangeSelector,
  TradeButton,
  TradeFeed,
  WatchlistButton,
  rangeToCandleParams,
  useMarket,
  type KalshiTheme,
  type TimeRange,
} from "@kalshi-kit/react";

import { AppNav } from "./_components/AppNav";
import { InstallCard } from "./_components/InstallCard";
import { type PresetName } from "./_components/PresetSelector";
import { Section } from "./_components/Section";
import { usePersistedState } from "./_components/usePersistedState";

const HERO_TICKERS = [
  { ticker: "KXNFLAFCCHAMP-27-CIN", label: "NFL · AFC · CIN" },
  { ticker: "KXPGATOUR-PGC26-SSCH", label: "PGA · Scheffler" },
  { ticker: "KXUFCFIGHT-26MAY16DIAPER-PER", label: "MMA · Diaz v Perry" },
  { ticker: "KXNEWOUTBREAKHANTA-26", label: "Outbreak · Hantavirus" },
  { ticker: "KXIPOSPACEX-26JUN01", label: "Economics · SpaceX IPO" },
];

const TRENDING_TICKERS = [
  "KXMLBTOTAL-26MAY152040AZCOL-12",
  "KXAPFDDHGAME-26MAY15TRICPO-CPO",
  "KXPGATOUR-PGC26-ASMA",
  "KXNBAGAME-26MAY15DETCLE-CLE",
  "KXNASCARRACE-ECO26-LARI",
  "KXTRUMPMENTIONB-26MAY15-CRYP",
];

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
  const [theme, setTheme] = usePersistedState<KalshiTheme>(
    "kalshi-kit-demo:theme",
    "system",
  );
  const [preset, setPreset] = usePersistedState<PresetName>(
    "kalshi-kit-demo:preset",
    "default",
  );
  const [ticker, setTicker] = useState(HERO_TICKERS[0]!.ticker);
  const [range, setRange] = useState<TimeRange>("1d");
  const [category, setCategory] = useState<string | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);

  const { interval, limit } = rangeToCandleParams(range);

  // When a market is picked from search or the trending grid, the hero may be
  // off-screen. Smooth-scroll it back into view so the user actually sees the
  // re-render they triggered.
  const focusHero = useCallback((nextTicker: string) => {
    setTicker(nextTicker);
    if (typeof window !== "undefined") {
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <KalshiProvider theme={theme}>
      <div className="demo-root" data-preset={preset}>
        <AppNav
          theme={theme}
          setTheme={setTheme}
          preset={preset}
          setPreset={setPreset}
        />

        <main className="demo-main">
          {/* ───── Hero ───── */}
          <section className="demo-hero" ref={heroRef}>
            <span className="demo-hero__eyebrow">v0.1.0 · MIT · React 18+</span>
            <h1 className="demo-hero__title">
              Drop-in React components
              <br />
              for prediction markets.
            </h1>
            <p className="demo-hero__lede">
              Market cards, orderbooks, charts, and feeds wired to
              Kalshi&apos;s live API. SSR-ready. Theme-aware.
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

            {/* Top row: probability dial + market card */}
            <div className="demo-hero__top">
              <div className="demo-hero__dial-col">
                <ProbabilityDial ticker={ticker} size={160} strokeWidth={14} />
                <DialCountdown ticker={ticker} />
                <div className="demo-hero__cta-row">
                  <TradeButton ticker={ticker} side="yes" />
                  <TradeButton ticker={ticker} side="no" variant="ghost" />
                </div>
              </div>
              <div className="demo-hero__card-col">
                <MarketCard ticker={ticker} />
              </div>
            </div>

            {/* Full-width orderbook */}
            <Orderbook ticker={ticker} depth={6} layout="split" />

            {/* Chart with time-range selector */}
            <div className="demo-hero__chart-wrap">
              <TimeRangeSelector value={range} onChange={setRange} />
              <CandlestickChart
                key={`${ticker}-${preset}-${range}`}
                ticker={ticker}
                interval={interval}
                limit={limit}
                height={320}
              />
            </div>

            <TradeFeed ticker={ticker} limit={10} />
          </section>

          {/* ───── Discover ───── */}
          <Section
            kicker="Discover"
            title="Search and filter live markets"
            description="MarketSearch debounces input and queries /markets. CategoryFilter is a controlled pill row. Pick a result and the hero re-renders to it."
          >
            <div className="demo-discover">
              <CategoryFilter value={category} onChange={setCategory} />
              <EventSearch
                category={category ?? undefined}
                placeholder={`Search ${category ?? "all"} markets…`}
                onSelect={(m) => focusHero(m.ticker)}
                limit={8}
              />
            </div>
            <div className="demo-trending">
              {TRENDING_TICKERS.map((t) => (
                <TrendingCard key={t} ticker={t} onSelect={focusHero} />
              ))}
            </div>
          </Section>

          {/* ───── Multi-outcome event ───── */}
          <Section
            kicker="Events"
            title="Multi-outcome markets, one fetch"
            description="Some markets have many possible outcomes. Render the event header and a ranked list of every option, side by side, from a single fetch."
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
            <div className="demo-share">
              <ShareCard
                ticker={ticker}
                title="Live demo of @kalshi-kit/react"
              />
            </div>
          </Section>

          <footer className="demo-footer">
            <span>
              Data <code>api.elections.kalshi.com</code> · MIT · v0 preview
            </span>
            <span>
              Built by trading-tools people who didn&apos;t want to rebuild this
              again.
            </span>
          </footer>
        </main>
      </div>
    </KalshiProvider>
  );
}

interface DialCountdownProps {
  ticker: string;
}

function DialCountdown({ ticker }: DialCountdownProps) {
  // Hooked in via useMarket so the countdown reads the same close_time the
  // dial is showing. When the market is missing or already closed, we render
  // nothing rather than blocking the layout.
  const { market } = useMarket(ticker);
  if (!market?.close_time) return null;
  return (
    <div className="demo-countdown">
      <span className="demo-countdown__label">closes in</span>
      <CountdownTimer to={market.close_time} elapsedText="Closed" />
    </div>
  );
}

interface TrendingCardProps {
  ticker: string;
  onSelect: (ticker: string) => void;
}

function TrendingCard({ ticker, onSelect }: TrendingCardProps) {
  return (
    <div
      className="demo-trending__card"
      onClick={() => onSelect(ticker)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(ticker);
        }
      }}
    >
      <div className="demo-trending__top">
        <WatchlistButton ticker={ticker} size={16} />
      </div>
      <MarketCard ticker={ticker} hideFooter />
      <div className="demo-trending__spark">
        <MarketSparkline
          ticker={ticker}
          interval={60}
          limit={24}
          height={36}
          width={220}
        />
      </div>
    </div>
  );
}
