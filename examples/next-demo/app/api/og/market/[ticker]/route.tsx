import { ImageResponse } from "next/og";

export const runtime = "edge";

const KALSHI =
  process.env.KALSHI_API_BASE ??
  "https://api.elections.kalshi.com/trade-api/v2";

function num(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function dollarsToCents(value: unknown): number {
  return Math.round(num(value) * 1000) / 10;
}

function formatCents(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.05) return `${rounded}¢`;
  return `${value.toFixed(1)}¢`;
}

function formatVolume(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface Params {
  ticker: string;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await ctx.params;

  let title = ticker;
  let subtitle: string | null = null;
  let yesPrice = 0;
  let noPrice = 0;
  let status = "unknown";
  let volume = 0;
  let errored = false;

  try {
    const response = await fetch(
      `${KALSHI}/markets/${encodeURIComponent(ticker)}`,
      { headers: { accept: "application/json" }, cache: "no-store" },
    );
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const json = (await response.json()) as { market?: Record<string, unknown> };
    const m = json.market ?? {};
    title = String(m.title ?? ticker);
    const rawSub =
      typeof m.yes_sub_title === "string" ? m.yes_sub_title.trim() : "";
    const lowerSub = rawSub.toLowerCase();
    if (
      rawSub.length >= 2 &&
      lowerSub !== "yes" &&
      lowerSub !== "no" &&
      !title.toLowerCase().includes(lowerSub)
    ) {
      subtitle = rawSub;
    }
    yesPrice = dollarsToCents(m.yes_bid_dollars ?? m.yes_bid ?? 0);
    noPrice = Math.max(0, 100 - yesPrice);
    status = String(m.status ?? "unknown");
    volume = Math.round(num(m.volume_fp ?? m.volume));
  } catch {
    errored = true;
  }

  const yesColor = "#34d399";
  const yesBg = "rgba(52, 211, 153, 0.14)";
  const noColor = "#fb7185";
  const noBg = "rgba(251, 113, 133, 0.14)";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#09090b",
          color: "#fafafa",
          padding: "56px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#a1a1aa",
            marginBottom: 24,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: status === "active" ? yesColor : "#a1a1aa",
              }}
            />
            <span>{status}</span>
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 16 }}>
            {ticker}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#fafafa",
              maxWidth: "100%",
            }}
          >
            {title.length > 110 ? `${title.slice(0, 107)}…` : title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "#a1a1aa",
                lineHeight: 1.25,
              }}
            >
              {subtitle.length > 90 ? `${subtitle.slice(0, 87)}…` : subtitle}
            </div>
          ) : null}
        </div>

        {errored ? (
          <div style={{ display: "flex", fontSize: 24, color: "#fb7185" }}>
            Could not load market.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: yesBg,
                color: yesColor,
                padding: "24px 28px",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                YES
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 80,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  marginTop: 6,
                }}
              >
                {formatCents(yesPrice)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: noBg,
                color: noColor,
                padding: "24px 28px",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                NO
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 80,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  marginTop: 6,
                }}
              >
                {formatCents(noPrice)}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#a1a1aa",
            paddingTop: 32,
          }}
        >
          <span>{formatVolume(volume)} contracts traded</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#fafafa", fontWeight: 600 }}>kalshi-kit</span>
            <span style={{ opacity: 0.6 }}>· live from kalshi</span>
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Browser caches for a minute; CDN (GitHub camo) caches for 5 min.
        // Tweak upward if you start hammering Kalshi from a viral README.
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    },
  );
}
