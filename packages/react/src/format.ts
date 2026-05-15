/**
 * Format a cents price. Integer values render as "9¢"; fractional values
 * render with one decimal as "8.5¢". Kalshi fractional markets use 0.1¢
 * steps, so one decimal is sufficient.
 */
export function formatCents(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  // Treat floating-point noise (e.g. 91.00000001 from 100 - 8.99…) as integer.
  if (Math.abs(value - rounded) < 0.05) return `${rounded}¢`;
  return `${value.toFixed(1)}¢`;
}
