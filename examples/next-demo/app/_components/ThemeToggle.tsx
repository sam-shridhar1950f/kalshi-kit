"use client";

import type { KalshiTheme } from "@kalshi-kit/react";

interface ThemeToggleProps {
  theme: KalshiTheme;
  onChange: (next: KalshiTheme) => void;
}

const ORDER: KalshiTheme[] = ["system", "light", "dark"];

const LABEL: Record<KalshiTheme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/**
 * Small icon-only button that cycles theme: system → light → dark → system.
 * Inline SVGs only — no icon dep.
 */
export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  return (
    <button
      type="button"
      className="demo-theme-toggle"
      aria-label={`Theme: ${LABEL[theme]}. Click to switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[theme]}`}
      onClick={() => onChange(next)}
    >
      {theme === "light" ? <SunIcon /> : theme === "dark" ? <MoonIcon /> : <AutoIcon />}
      <span className="demo-theme-toggle__label">{LABEL[theme]}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
    </svg>
  );
}
