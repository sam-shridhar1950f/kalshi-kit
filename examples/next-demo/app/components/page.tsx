"use client";

import { useState } from "react";
import {
  CandlestickChart,
  CategoryFilter,
  CountdownTimer,
  EventCard,
  EventMarketList,
  EventSearch,
  ExchangeStatusBadge,
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
  type KalshiTheme,
  type TimeRange,
} from "@kalshi-kit/react";

import { AppNav } from "../_components/AppNav";
import { Showcase } from "../_components/Showcase";
import { type PresetName } from "../_components/PresetSelector";

const TICKER = "KXNFLAFCCHAMP-27-CIN";
const EVENT = "KXNEWPOPE-70";

export default function ComponentsPage() {
  const [theme, setTheme] = useState<KalshiTheme>("system");
  const [preset, setPreset] = useState<PresetName>("default");

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
          <header className="demo-hero" style={{ gap: 8 }}>
            <span className="demo-hero__eyebrow">v0.1.0 · Component gallery</span>
            <h1
              className="demo-hero__title"
              style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
            >
              Every component, live.
            </h1>
            <p className="demo-hero__lede">
              Each card renders against the live Kalshi API. Copy any snippet
              and drop it into your app.
            </p>
          </header>

          <div className="demo-show-list">
            <Showcase
              name="MarketCard"
              description="YES/NO prices, volume, status, close time. Flash-animates on tick."
              code={`<MarketCard ticker="${TICKER}" />`}
            >
              <MarketCard ticker={TICKER} />
            </Showcase>

            <Showcase
              name="ProbabilityDial"
              description="Circular SVG gauge for the YES probability."
              code={`<ProbabilityDial ticker="${TICKER}" size={140} />`}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ProbabilityDial ticker={TICKER} size={140} />
              </div>
            </Showcase>

            <Showcase
              name="Orderbook"
              wide
              description='Live YES/NO depth. Layout "stacked" or "split".'
              code={`<Orderbook ticker="${TICKER}" depth={6} layout="split" />`}
            >
              <Orderbook ticker={TICKER} depth={6} layout="split" />
            </Showcase>

            <Showcase
              name="CandlestickChart"
              wide
              description="OHLC chart backed by lightweight-charts."
              code={`<CandlestickChart ticker="${TICKER}" interval={60} height={240} />`}
            >
              <CandlestickChart ticker={TICKER} interval={60} height={240} />
            </Showcase>

            <Showcase
              name="TradeFeed"
              wide
              description="Live trade tape with side, price, size, time."
              code={`<TradeFeed ticker="${TICKER}" limit={6} />`}
            >
              <TradeFeed ticker={TICKER} limit={6} />
            </Showcase>

            <Showcase
              name="CountdownTimer"
              description="Live countdown to a target time. Updates every second."
              code={`<CountdownTimer to="2027-01-30T00:00:00Z" />`}
            >
              <CountdownTimer to="2027-01-30T00:00:00Z" />
            </Showcase>

            <Showcase
              name="TimeRangeSelector"
              description="Controlled pill row. Pair with useCandlesticks."
              code={`const [range, setRange] = useState<TimeRange>("1d");
<TimeRangeSelector value={range} onChange={setRange} />`}
            >
              <TimeRangeSelectorDemo />
            </Showcase>

            <Showcase
              name="TradeButton"
              description="Deep-link to kalshi.com with optional builder code."
              code={`<TradeButton ticker="${TICKER}" side="yes" />
<TradeButton ticker="${TICKER}" side="no" variant="ghost" />`}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <TradeButton ticker={TICKER} side="yes" />
                <TradeButton ticker={TICKER} side="no" variant="ghost" />
              </div>
            </Showcase>

            <Showcase
              name="WatchlistButton"
              description="Star toggle backed by localStorage. Drop into any card."
              code={`<WatchlistButton ticker="${TICKER}" />`}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <WatchlistButton ticker={TICKER} size={24} />
              </div>
            </Showcase>

            <Showcase
              name="ShareCard"
              wide
              description="Copy-link and tweet buttons that build a clean URL."
              code={`<ShareCard ticker="${TICKER}" title="Will Cincinnati win the AFC?" />`}
            >
              <ShareCard ticker={TICKER} title="Will Cincinnati win the AFC?" />
            </Showcase>

            <Showcase
              name="MarketSparkline"
              description="Tiny SVG trendline. Pairs with cards and tables."
              code={`<MarketSparkline ticker="${TICKER}" width={220} height={48} />`}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MarketSparkline
                  ticker={TICKER}
                  width={220}
                  height={48}
                />
              </div>
            </Showcase>

            <Showcase
              name="EventSearch"
              wide
              description="Debounced autocomplete across live events. Pick a result to fire onSelect."
              code={`<EventSearch onSelect={(market) => navigate(market.ticker)} />`}
            >
              <EventSearch
                placeholder="Try 'trump', 'pope', 'mars'…"
                onSelect={() => {}}
                limit={6}
              />
            </Showcase>

            <Showcase
              name="CategoryFilter"
              wide
              description="Controlled category pill row. Drives MarketSearch / EventSearch."
              code={`const [category, setCategory] = useState<string | null>(null);
<CategoryFilter value={category} onChange={setCategory} />`}
            >
              <CategoryFilterDemo />
            </Showcase>

            <Showcase
              name="EventCard"
              description="Header for a multi-outcome event."
              code={`<EventCard eventTicker="${EVENT}" />`}
            >
              <EventCard eventTicker={EVENT} />
            </Showcase>

            <Showcase
              name="EventMarketList"
              wide
              description="Ranked child markets under an event, with probability bars."
              code={`<EventMarketList eventTicker="${EVENT}" />`}
            >
              <EventMarketList eventTicker={EVENT} />
            </Showcase>

            <Showcase
              name="ExchangeStatusBadge"
              description="Trading status pill. Polls /exchange/status every 30s."
              code={`<ExchangeStatusBadge />`}
            >
              <ExchangeStatusBadge />
            </Showcase>
          </div>

          <footer className="demo-footer">
            <span>
              Data <code>api.elections.kalshi.com</code> · MIT · v0.1.0
            </span>
            <span>
              <a
                className="demo-nav__link"
                href="https://www.npmjs.com/package/@kalshi-kit/react"
                target="_blank"
                rel="noreferrer"
              >
                npm install @kalshi-kit/react
              </a>
            </span>
          </footer>
        </main>
      </div>
    </KalshiProvider>
  );
}

function TimeRangeSelectorDemo() {
  const [range, setRange] = useState<TimeRange>("1d");
  return <TimeRangeSelector value={range} onChange={setRange} />;
}

function CategoryFilterDemo() {
  const [category, setCategory] = useState<string | null>(null);
  return <CategoryFilter value={category} onChange={setCategory} />;
}
