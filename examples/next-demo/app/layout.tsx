import type { ReactNode } from "react";
import "@kalshi-kit/react/styles.css";
import "./globals.css";

export const metadata = {
  title: "kalshi-kit demo",
  description:
    "Live demo of @kalshi-kit/react components against the Kalshi API.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
