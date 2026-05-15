import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@kalshi-kit/react/styles.css";
import "./globals.css";

const TITLE = "kalshi-kit · React components for prediction markets";
const DESCRIPTION =
  "Drop-in React components for Kalshi prediction markets. Market cards, orderbooks, candlestick charts, trade feeds, events — wired to the live API.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://kalshi-kit.dev"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
