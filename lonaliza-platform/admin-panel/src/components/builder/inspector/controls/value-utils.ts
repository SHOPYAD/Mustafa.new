/**
 * Tiny string ↔ structured value parsers used by the Inspector controls.
 *
 * CSS lets you write a number with any unit (px, rem, em, %, vh, vw, …)
 * and the inspector controls have to round-trip those values without
 * losing the unit. These helpers keep that conversion in one place so
 * `NumberUnit`, `SpacingBox`, `RadiusBox`, etc. all behave identically.
 */

export type CssUnit =
  | "px"
  | "rem"
  | "em"
  | "%"
  | "vh"
  | "vw"
  | "pt"
  | "deg"
  | "ms"
  | "s"
  | "auto"
  | "none"
  | "inherit"
  | "initial"
  | "";

const NUMBER_UNIT_RE = /^\s*(-?\d+(?:\.\d+)?)\s*([a-z%]*)\s*$/i;

export interface ParsedValue {
  /** Numeric portion, or `null` if the value is purely keyword (e.g. "auto"). */
  num: number | null;
  /** Unit suffix in lower case ("px", "%", …) or "" when the value has none. */
  unit: CssUnit;
  /** True if the original string matched a keyword like "auto" / "none". */
  isKeyword: boolean;
}

/** Parse "16px", "1.5rem", "auto", "0", "" → ParsedValue. */
export function parseValue(raw: string | undefined | null): ParsedValue {
  if (raw == null) return { num: null, unit: "", isKeyword: false };
  const v = String(raw).trim();
  if (!v) return { num: null, unit: "", isKeyword: false };
  if (v === "auto" || v === "none" || v === "inherit" || v === "initial") {
    return { num: null, unit: v as CssUnit, isKeyword: true };
  }
  const m = v.match(NUMBER_UNIT_RE);
  if (!m) return { num: null, unit: "", isKeyword: false };
  return {
    num: parseFloat(m[1]),
    unit: ((m[2] || "px").toLowerCase() as CssUnit) || "px",
    isKeyword: false,
  };
}

/** Render `{num, unit}` back to a CSS string. Empty num → "". */
export function stringifyValue(num: number | null, unit: CssUnit): string {
  if (num == null) {
    if (unit === "auto" || unit === "none" || unit === "inherit") return unit;
    return "";
  }
  if (unit === "auto" || unit === "none" || unit === "" || unit === "inherit") {
    return String(num);
  }
  // Trim trailing zeros so "16.000" doesn't appear in CSS / saved theme.
  const trimmed = Number.isInteger(num) ? String(num) : String(+num.toFixed(3));
  return `${trimmed}${unit}`;
}

/**
 * Sensible slider min/max for a given CSS unit. The range is wide enough
 * to cover real-world UI work without forcing the user to step through
 * thousands of pixels for, say, font-size.
 */
export const UNIT_RANGES: Record<string, { min: number; max: number; step: number }> = {
  px: { min: 0, max: 800, step: 1 },
  rem: { min: 0, max: 32, step: 0.0625 }, // 1px @ 16px root
  em: { min: 0, max: 32, step: 0.0625 },
  "%": { min: 0, max: 200, step: 1 },
  vh: { min: 0, max: 200, step: 1 },
  vw: { min: 0, max: 200, step: 1 },
  pt: { min: 0, max: 200, step: 0.5 },
  deg: { min: -360, max: 360, step: 1 },
  ms: { min: 0, max: 5000, step: 50 },
  s: { min: 0, max: 30, step: 0.1 },
};

export function rangeForUnit(unit: CssUnit): {
  min: number;
  max: number;
  step: number;
} {
  return UNIT_RANGES[unit] || { min: 0, max: 100, step: 1 };
}

/** Normalize a CSS color string for the native <input type=color>. */
export function toHexColor(raw: string | undefined | null): string {
  if (!raw) return "#000000";
  const v = String(raw).trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
    if (v.length === 4) {
      // expand #abc → #aabbcc
      return (
        "#" +
        v
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")
      );
    }
    return v.toLowerCase();
  }
  // rgb()/rgba() → hex (best effort, alpha is dropped because <input type=color>
  // does not support alpha; the alpha slider in ColorControl owns that channel).
  const rgb = v.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgb) {
    const r = Math.max(0, Math.min(255, parseInt(rgb[1], 10)));
    const g = Math.max(0, Math.min(255, parseInt(rgb[2], 10)));
    const b = Math.max(0, Math.min(255, parseInt(rgb[3], 10)));
    return (
      "#" +
      [r, g, b]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return "#000000";
}

/** Extract alpha (0..1) from a CSS color string, defaulting to 1. */
export function colorAlpha(raw: string | undefined | null): number {
  if (!raw) return 1;
  const m = String(raw)
    .trim()
    .match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/i);
  if (m) {
    const a = parseFloat(m[1]);
    if (!Number.isNaN(a)) return Math.max(0, Math.min(1, a));
  }
  return 1;
}

/** Compose a final CSS color value from hex + alpha. */
export function composeColor(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (a >= 1) return hex;
  // hex (#rrggbb) → rgba()
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${+a.toFixed(2)})`;
}
