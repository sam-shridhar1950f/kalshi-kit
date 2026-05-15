"use client";

import { useEffect, useRef, useState } from "react";

export type PresetName =
  | "default"
  | "solana"
  | "sportsbook"
  | "sunset"
  | "mono";

interface PresetMeta {
  name: PresetName;
  label: string;
  swatchA: string;
  swatchB: string;
}

const PRESETS: PresetMeta[] = [
  { name: "default", label: "Default", swatchA: "#10b981", swatchB: "#f43f5e" },
  { name: "solana", label: "Solana", swatchA: "#14f195", swatchB: "#9945ff" },
  {
    name: "sportsbook",
    label: "Sportsbook",
    swatchA: "#2563eb",
    swatchB: "#dc2626",
  },
  { name: "sunset", label: "Sunset", swatchA: "#f97316", swatchB: "#ec4899" },
  { name: "mono", label: "Mono", swatchA: "#27272a", swatchB: "#a1a1aa" },
];

interface PresetSelectorProps {
  value: PresetName;
  onChange: (next: PresetName) => void;
}

export function PresetSelector({ value, onChange }: PresetSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const active = PRESETS.find((p) => p.name === value) ?? PRESETS[0]!;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="demo-preset">
      <button
        type="button"
        className="demo-preset__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Swatch a={active.swatchA} b={active.swatchB} />
        <span className="demo-preset__label">{active.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul role="listbox" className="demo-preset__menu">
          {PRESETS.map((p) => {
            const isActive = p.name === value;
            return (
              <li
                key={p.name}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                className={`demo-preset__item${
                  isActive ? " demo-preset__item--active" : ""
                }`}
                onClick={() => {
                  onChange(p.name);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(p.name);
                    setOpen(false);
                  }
                }}
              >
                <Swatch a={p.swatchA} b={p.swatchB} />
                <span>{p.label}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Swatch({ a, b }: { a: string; b: string }) {
  return (
    <span
      className="demo-preset__swatch"
      style={{ background: `linear-gradient(90deg, ${a} 50%, ${b} 50%)` }}
      aria-hidden
    />
  );
}
