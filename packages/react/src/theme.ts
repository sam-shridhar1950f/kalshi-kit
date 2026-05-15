import type { CSSProperties } from "react";

/**
 * Per-component color overrides. Maps to the kit's CSS variables on the
 * component's root element. Anything you don't supply falls back to the
 * active theme's value.
 *
 *   <MarketCard ticker="..." colors={{ yes: "#3b82f6", no: "#eab308" }} />
 *
 * For app-wide theming, set the same variables on a parent (or wrap with
 * `<KalshiProvider theme="dark">`) instead.
 */
export interface KalshiColors {
  /** YES side text/border color. Maps to `--kk-yes`. */
  yes?: string;
  /** YES side background (cell fill, bar fill). Maps to `--kk-yes-bg`. */
  yesBg?: string;
  /** NO side text/border color. Maps to `--kk-no`. */
  no?: string;
  /** NO side background. Maps to `--kk-no-bg`. */
  noBg?: string;
  /** Focus ring color for interactive components. Maps to `--kk-focus`. */
  focus?: string;
}

/**
 * Convert a `KalshiColors` object to an inline style object that sets the
 * matching CSS variables. Components spread the result onto their root.
 */
export function colorsToStyle(colors?: KalshiColors): CSSProperties {
  if (!colors) return {};
  const style: Record<string, string> = {};
  if (colors.yes) style["--kk-yes"] = colors.yes;
  if (colors.yesBg) style["--kk-yes-bg"] = colors.yesBg;
  if (colors.no) style["--kk-no"] = colors.no;
  if (colors.noBg) style["--kk-no-bg"] = colors.noBg;
  if (colors.focus) style["--kk-focus"] = colors.focus;
  return style as CSSProperties;
}
