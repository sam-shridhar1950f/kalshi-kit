# Theming

`@kalshi-kit/react` is themed entirely through CSS custom properties. Every component carries the `.kk` class on its root, and all design tokens are declared on that class. You can override tokens app-wide, per-subtree, or per-instance.

## Quick start

```tsx
import { KalshiProvider, MarketCard } from "@kalshi-kit/react";
import "@kalshi-kit/react/styles.css";

export default function App() {
  return (
    <KalshiProvider theme="dark">
      <MarketCard
        ticker="KXNBA-26MAY15DETCLE"
        colors={{ yes: "#3b82f6", no: "#eab308" }}
      />
    </KalshiProvider>
  );
}
```

Three knobs:

1. `<KalshiProvider theme="...">` for light / dark / system.
2. `colors` prop on any component for per-instance YES/NO overrides.
3. CSS variables on `.kk` (or an ancestor) for everything else.

## Theme modes

```tsx
<KalshiProvider theme="light">{children}</KalshiProvider>
<KalshiProvider theme="dark">{children}</KalshiProvider>
<KalshiProvider theme="system">{children}</KalshiProvider> {/* default */}
```

How it works: the provider renders `<div class="kk-provider" data-kk-theme={resolved}>`. The `data-kk-theme` attribute on any ancestor of a `.kk` element selects the matching token block in `styles.css`.

```html
<div data-kk-theme="dark">
  <!-- every nested .kk uses dark tokens -->
</div>
```

Hydration note. The provider always renders `data-kk-theme="light"` on first paint and upgrades after mount to avoid SSR/CSR mismatches. If `theme="system"` and the user prefers dark, expect a one-frame light flash. To skip that flash, set `theme="dark"` (or `"light"`) explicitly.

Read the resolved theme inside a component:

```tsx
import { useKalshiTheme } from "@kalshi-kit/react";

function MyHeader() {
  const theme = useKalshiTheme(); // "light" | "dark"
  return <img src={theme === "dark" ? logoDark : logoLight} />;
}
```

Opt out of the wrapping `<div>` (theme detection still works through `prefers-color-scheme`):

```tsx
<KalshiProvider theme="system" unstyled>
  {children}
</KalshiProvider>
```

## YES / NO color overrides

Every component accepts a `colors` prop typed as `KalshiColors`:

```ts
interface KalshiColors {
  yes?: string;      // --kk-yes
  yesBg?: string;    // --kk-yes-bg
  no?: string;       // --kk-no
  noBg?: string;     // --kk-no-bg
  focus?: string;    // --kk-focus
}
```

```tsx
<MarketCard
  ticker="KXNBA-26MAY15DETCLE"
  colors={{
    yes: "#3b82f6",
    yesBg: "rgba(59, 130, 246, 0.12)",
    no: "#eab308",
    noBg: "rgba(234, 179, 8, 0.12)",
  }}
/>
```

When to use `colors` vs CSS variables:

- `colors` prop: one-off branding on a single component, or when colors are dynamic (driven by props or state).
- CSS variables: app-wide or section-wide branding. Cheaper than threading `colors` through every component.

`CandlestickChart` reads `--kk-yes`, `--kk-no`, `--kk-text-muted`, and `--kk-border` from computed style at create time, so both approaches reach into the chart canvas.

## CSS variables reference

All tokens are declared on the `.kk` class. Override them on a parent element to scope changes, or on `:root` / `body` to apply globally.

### Colors

| Variable | Light default | Dark default | Affects |
| --- | --- | --- | --- |
| `--kk-bg` | `#ffffff` | `#09090b` | Card / chart / panel backgrounds |
| `--kk-text` | `#09090b` | `#fafafa` | Primary text |
| `--kk-text-muted` | `#71717a` | `#a1a1aa` | Secondary text, axis labels |
| `--kk-border` | `#e4e4e7` | `#27272a` | Component borders, dividers |
| `--kk-border-hover` | `#d4d4d8` | `#3f3f46` | Hover border state |
| `--kk-yes` | `#10b981` | `#34d399` | YES text, prices, bars |
| `--kk-yes-bg` | `#ecfdf5` | `rgba(52, 211, 153, 0.12)` | YES cell fills |
| `--kk-no` | `#f43f5e` | `#fb7185` | NO text, prices, bars |
| `--kk-no-bg` | `#fff1f2` | `rgba(251, 113, 133, 0.12)` | NO cell fills |
| `--kk-focus` | `#2563eb` | `#60a5fa` | Focus rings, watchlist active, share primary button |

### Shape and elevation

| Variable | Light default | Dark default |
| --- | --- | --- |
| `--kk-radius` | `12px` | (same) |
| `--kk-radius-sm` | `8px` | (same) |
| `--kk-shadow` | `0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.03)` | `0 1px 2px rgba(0,0,0,.4)` |
| `--kk-shadow-hover` | `0 4px 12px rgba(0,0,0,.06)` | `0 4px 12px rgba(0,0,0,.5)` |

### Spacing

| Variable | Value |
| --- | --- |
| `--kk-space-1` | `4px` |
| `--kk-space-2` | `8px` |
| `--kk-space-3` | `12px` |
| `--kk-space-4` | `16px` |
| `--kk-space-5` | `20px` |
| `--kk-space-6` | `24px` |

### Motion and typography

| Variable | Value |
| --- | --- |
| `--kk-duration-fast` | `120ms` |
| `--kk-duration-base` | `200ms` |
| `--kk-duration-slow` | `600ms` |
| `--kk-ease` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--kk-font` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...` |

Motion variables are honored by every transition; `prefers-reduced-motion: reduce` disables the shimmer, flash, and hover transitions automatically.

## Building a brand preset

The simplest path is to set the YES/NO variables on any ancestor of your kit components. The four presets below ship in the live demo.

### Solana

```css
.kk {
  --kk-yes: #14f195;
  --kk-yes-bg: rgba(20, 241, 149, 0.14);
  --kk-no: #9945ff;
  --kk-no-bg: rgba(153, 69, 255, 0.14);
}
```

### Sportsbook

```css
.kk {
  --kk-yes: #2563eb;
  --kk-yes-bg: rgba(37, 99, 235, 0.1);
  --kk-no: #dc2626;
  --kk-no-bg: rgba(220, 38, 38, 0.1);
}
```

### Sunset

```css
.kk {
  --kk-yes: #f97316;
  --kk-yes-bg: rgba(249, 115, 22, 0.12);
  --kk-no: #ec4899;
  --kk-no-bg: rgba(236, 72, 153, 0.12);
}
```

### Mono

```css
.kk {
  --kk-yes: #18181b;
  --kk-yes-bg: #f4f4f5;
  --kk-no: #71717a;
  --kk-no-bg: #fafafa;
}

[data-kk-theme="dark"] .kk {
  --kk-yes: #fafafa;
  --kk-yes-bg: rgba(250, 250, 250, 0.06);
  --kk-no: #71717a;
  --kk-no-bg: rgba(113, 113, 122, 0.12);
}
```

### Scoping a preset

To apply a preset only inside a section, attach the variables to a wrapper:

```css
.brand-section .kk {
  --kk-yes: #14f195;
  --kk-yes-bg: rgba(20, 241, 149, 0.14);
  --kk-no: #9945ff;
  --kk-no-bg: rgba(153, 69, 255, 0.14);
}
```

```tsx
<div className="brand-section">
  <MarketCard ticker="..." />
</div>
```

### Driving presets from JS

Set CSS variables inline via the `style` prop. Keep the type cast for `--kk-*` keys:

```tsx
<KalshiProvider theme="system">
  <div
    style={{
      "--kk-yes": "#14f195",
      "--kk-no": "#9945ff",
    } as React.CSSProperties}
  >
    <MarketCard ticker="..." />
  </div>
</KalshiProvider>
```

## Tailwind and shadcn integration

The kit's CSS is global but namespaced to `.kk` (and its component classes `.kk-card`, `.kk-feed`, `.kk-chart`, etc.). It does not touch your Tailwind base or shadcn tokens.

### Specificity

Most kit rules are single-class (specificity `0,1,0`). Tailwind utility classes are also single-class but win because they appear later in the cascade when authored in your component markup. Add a utility directly to a kit component and it wins:

```tsx
<MarketCard ticker="..." className="rounded-2xl shadow-xl" />
```

For broader overrides, target the kit's class names with your own rule (or in an `@layer` to manage cascade order):

```css
@layer components {
  .kk-card {
    border-radius: 1rem;
    border-width: 2px;
  }
}
```

### Tailwind `important: false`

The kit does not use `!important`, so Tailwind's default `important: false` works correctly. If you set `important: true` in your Tailwind config, your utilities will override the kit even without specificity tricks; this is fine but be aware that the kit's hover and focus transitions still come from kit CSS.

### Opting out of default CSS

If you want to ship your own styles top to bottom:

1. Skip the `import "@kalshi-kit/react/styles.css"` line.
2. Write rules for the `.kk-*` class names yourself; the components emit semantic class names regardless of whether the kit's CSS is loaded.

The component tree, ARIA roles, and class names are stable; only visual styling moves to your stylesheet.

### Shadcn tokens

Map shadcn / Radix tokens onto the kit:

```css
.kk {
  --kk-bg: hsl(var(--background));
  --kk-text: hsl(var(--foreground));
  --kk-text-muted: hsl(var(--muted-foreground));
  --kk-border: hsl(var(--border));
  --kk-focus: hsl(var(--ring));
}
```

YES/NO stay branded; everything else follows your shadcn theme.

## Cheat sheet

```tsx
// 1. App-wide light/dark
<KalshiProvider theme="dark">{children}</KalshiProvider>

// 2. Per-component
<MarketCard ticker="..." colors={{ yes: "#3b82f6", no: "#eab308" }} />

// 3. Section-scoped preset
<div className="brand-section"><Orderbook ticker="..." /></div>
```

```css
.brand-section .kk {
  --kk-yes: #14f195;
  --kk-no: #9945ff;
}
```
