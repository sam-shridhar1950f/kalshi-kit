"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExchangeStatusBadge,
  type KalshiTheme,
} from "@kalshi-kit/react";
import { PresetSelector, type PresetName } from "./PresetSelector";
import { ThemeToggle } from "./ThemeToggle";

interface AppNavProps {
  theme: KalshiTheme;
  setTheme: (theme: KalshiTheme) => void;
  preset: PresetName;
  setPreset: (preset: PresetName) => void;
}

const NAV_LINKS = [
  { href: "/", label: "Demo" },
  { href: "/components", label: "Components" },
];

export function AppNav({ theme, setTheme, preset, setPreset }: AppNavProps) {
  const pathname = usePathname();

  return (
    <header className="demo-nav">
      <div className="demo-nav__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/" className="demo-nav__logo-link" aria-label="kalshi-kit home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="kalshi-kit" className="demo-nav__logo-img" />
        </Link>
        <ExchangeStatusBadge />
      </div>
      <nav className="demo-nav__center">
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`demo-nav__tab${active ? " demo-nav__tab--active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="demo-nav__right">
        <a
          className="demo-nav__link"
          href="https://github.com/sam-shridhar1950f/kalshi-kit"
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
        <PresetSelector value={preset} onChange={setPreset} />
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>
    </header>
  );
}
