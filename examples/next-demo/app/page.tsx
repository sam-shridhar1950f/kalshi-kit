"use client";

import { useState } from "react";
import { MarketCard, Orderbook } from "@kalshi-kit/react";

const PRESETS = [
  { ticker: "KXNBAGAME-26MAY15SASMIN-SAS", label: "NBA · SAS @ MIN" },
  { ticker: "KXBTCD-26MAY1515-T79199.99", label: "BTC daily" },
  { ticker: "KXEPLTOTAL-26MAY17AVLLFC-2", label: "EPL · Total" },
];

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "48px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 32,
};

export default function Page() {
  const [ticker, setTicker] = useState(PRESETS[0]!.ticker);

  return (
    <main style={containerStyle}>
      <header>
        <h1
          style={{
            fontSize: 28,
            margin: 0,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          kalshi-kit · live demo
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#71717a", fontSize: 14 }}>
          Components consume the live Kalshi API via the{" "}
          <code>withKalshi()</code> proxy. Try any ticker.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {PRESETS.map((p) => (
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
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <MarketCard ticker={ticker} />
        <Orderbook ticker={ticker} depth={6} />
      </div>

      <details>
        <summary
          style={{
            cursor: "pointer",
            fontSize: 13,
            color: "#71717a",
            userSelect: "none",
          }}
        >
          Split layout
        </summary>
        <div style={{ marginTop: 12 }}>
          <Orderbook ticker={ticker} depth={6} layout="split" />
        </div>
      </details>

      <footer style={{ color: "#a1a1aa", fontSize: 12, marginTop: 16 }}>
        Data: <code>api.elections.kalshi.com</code>. No API key required for
        public market data.
      </footer>
    </main>
  );
}
