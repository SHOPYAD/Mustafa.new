/**
 * Hand-curated style presets for the Inspector. They serve two roles:
 *
 *   1. A fast on-ramp for users who don't want to fiddle with sliders
 *      to get a "good enough" look — one click and they're done.
 *   2. A teaching tool: each preset is a real CSS string the rest of
 *      the pipeline already understands (`box-shadow`, `background-image`,
 *      multi-prop border bundle), so users can pick one and then tweak
 *      the resulting controls to learn how the parts map to CSS.
 *
 * Keep this list short and tasteful — every entry is one click of UI
 * real estate. Presets that look like each other should be merged.
 */

// -----------------------------------------------------------------------------
// Box-shadow presets
// -----------------------------------------------------------------------------
export interface ShadowPreset {
  id: string;
  label: string;
  /** Tailwind-inspired but tuned for liotrip's purple-leaning UI. */
  value: string;
}

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: "none",
    label: "None",
    value: "none",
  },
  {
    id: "soft-sm",
    label: "Soft S",
    value: "0 1px 2px rgba(15, 23, 42, 0.08)",
  },
  {
    id: "soft-md",
    label: "Soft M",
    value: "0 4px 12px rgba(15, 23, 42, 0.10)",
  },
  {
    id: "soft-lg",
    label: "Soft L",
    value: "0 12px 32px rgba(15, 23, 42, 0.12)",
  },
  {
    id: "elevated",
    label: "Elevated",
    value:
      "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.10)",
  },
  {
    id: "floating",
    label: "Floating",
    value:
      "0 4px 6px rgba(15, 23, 42, 0.04), 0 24px 48px -12px rgba(15, 23, 42, 0.18)",
  },
  {
    id: "halo-purple",
    label: "Purple halo",
    value: "0 0 0 4px rgba(124, 58, 237, 0.18)",
  },
  {
    id: "ring-primary",
    label: "Primary ring",
    value:
      "0 0 0 1px rgba(124, 58, 237, 0.40), 0 4px 12px rgba(124, 58, 237, 0.18)",
  },
  {
    id: "inset-soft",
    label: "Inset soft",
    value: "inset 0 2px 6px rgba(15, 23, 42, 0.10)",
  },
  {
    id: "inset-deep",
    label: "Inset deep",
    value: "inset 0 4px 12px rgba(15, 23, 42, 0.18)",
  },
  {
    id: "neon",
    label: "Neon",
    value:
      "0 0 8px rgba(124, 58, 237, 0.65), 0 0 24px rgba(236, 72, 153, 0.45)",
  },
  {
    id: "stacked",
    label: "Stacked",
    value:
      "0 1px 1px rgba(15, 23, 42, 0.10), 0 4px 4px rgba(15, 23, 42, 0.08), 0 16px 16px rgba(15, 23, 42, 0.06)",
  },
];

// -----------------------------------------------------------------------------
// Gradient presets — emit full `background-image` strings so consumers
// (BackgroundBlock, GradientBuilder) can drop them straight into the
// override without massaging.
// -----------------------------------------------------------------------------
export interface GradientPreset {
  id: string;
  label: string;
  /** Two short stops for the swatch, plus the full CSS string. */
  swatch: [string, string];
  value: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "purple-pink",
    label: "Purple → Pink",
    swatch: ["#7c3aed", "#ec4899"],
    value:
      "linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(236, 72, 153, 0.95) 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: ["#0ea5e9", "#6366f1"],
    value:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.95) 0%, rgba(99, 102, 241, 0.95) 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    swatch: ["#f97316", "#db2777"],
    value:
      "linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(219, 39, 119, 0.95) 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    swatch: ["#0f172a", "#1e1b4b"],
    value:
      "linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(30, 27, 75, 1) 100%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    swatch: ["#22d3ee", "#a855f7"],
    value:
      "linear-gradient(135deg, rgba(34, 211, 238, 0.85) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(236, 72, 153, 0.85) 100%)",
  },
  {
    id: "mint",
    label: "Mint",
    swatch: ["#34d399", "#0ea5e9"],
    value:
      "linear-gradient(135deg, rgba(52, 211, 153, 0.95) 0%, rgba(14, 165, 233, 0.95) 100%)",
  },
  {
    id: "peach",
    label: "Peach",
    swatch: ["#fde68a", "#fb923c"],
    value:
      "linear-gradient(135deg, rgba(253, 230, 138, 0.95) 0%, rgba(251, 146, 60, 0.95) 100%)",
  },
  {
    id: "soft-glow",
    label: "Soft glow",
    swatch: ["#ede9fe", "#fce7f3"],
    value:
      "linear-gradient(180deg, rgba(237, 233, 254, 1) 0%, rgba(252, 231, 243, 1) 100%)",
  },
  {
    id: "radial-spot",
    label: "Radial spot",
    swatch: ["#fef3c7", "#7c3aed"],
    value:
      "radial-gradient(circle at 30% 20%, rgba(254, 243, 199, 0.95) 0%, rgba(124, 58, 237, 0.95) 75%)",
  },
  {
    id: "subtle-noise",
    label: "Glass",
    swatch: ["#ffffff", "#e2e8f0"],
    value:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(226, 232, 240, 0.65) 100%)",
  },
];

// -----------------------------------------------------------------------------
// Border presets — bundle of (width, style, color, radius). Each preset
// is applied through the centralised write API so individual properties
// remain editable afterwards.
// -----------------------------------------------------------------------------
export interface BorderPreset {
  id: string;
  label: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  borderRadius: string;
}

export const BORDER_PRESETS: BorderPreset[] = [
  {
    id: "none",
    label: "None",
    borderWidth: "0",
    borderStyle: "none",
    borderColor: "transparent",
    borderRadius: "0",
  },
  {
    id: "hairline",
    label: "Hairline",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(15, 23, 42, 0.12)",
    borderRadius: "8px",
  },
  {
    id: "card",
    label: "Card",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(15, 23, 42, 0.10)",
    borderRadius: "16px",
  },
  {
    id: "rounded",
    label: "Rounded",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(15, 23, 42, 0.10)",
    borderRadius: "9999px",
  },
  {
    id: "primary",
    label: "Primary",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(124, 58, 237, 0.45)",
    borderRadius: "12px",
  },
  {
    id: "primary-thick",
    label: "Primary 2px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "rgba(124, 58, 237, 0.65)",
    borderRadius: "12px",
  },
  {
    id: "dashed",
    label: "Dashed",
    borderWidth: "2px",
    borderStyle: "dashed",
    borderColor: "rgba(124, 58, 237, 0.55)",
    borderRadius: "12px",
  },
  {
    id: "dotted",
    label: "Dotted",
    borderWidth: "2px",
    borderStyle: "dotted",
    borderColor: "rgba(15, 23, 42, 0.30)",
    borderRadius: "12px",
  },
  {
    id: "double",
    label: "Double",
    borderWidth: "4px",
    borderStyle: "double",
    borderColor: "rgba(124, 58, 237, 0.55)",
    borderRadius: "12px",
  },
];
