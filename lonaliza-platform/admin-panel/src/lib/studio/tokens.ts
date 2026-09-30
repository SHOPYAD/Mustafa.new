import type React from "react";

/** هوية الاستوديو السيبراني الموحدة. أي لون أو حافة في نافذة يُقرأ من هنا. */

export type Tone = "gold" | "cyan" | "magenta" | "green" | "violet";

export const TONES: Record<Tone, { line: string; core: string; halo: string; title: string }> = {
  gold: { line: "#ff9f2a", core: "#ffd9a0", halo: "rgba(255,150,40,1)", title: "#ffbf4d" },
  cyan: { line: "#35e3ff", core: "#d8fbff", halo: "rgba(53,227,255,1)", title: "#4fe6ff" },
  magenta: { line: "#d65cff", core: "#f6dcff", halo: "rgba(214,92,255,1)", title: "#e27cff" },
  green: { line: "#3cf0a8", core: "#cbffe8", halo: "rgba(60,240,168,1)", title: "#5cf5b8" },
  violet: { line: "#9a7bff", core: "#e4dcff", halo: "rgba(154,123,255,1)", title: "#b59cff" },
};

export const FONT = "'Noto Sans Arabic', 'IBM Plex Sans Arabic', Tahoma, sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
export const FONT_HREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";

export const UI = {
  bg: "#01050b",
  panel: "rgba(5,19,33,0.92)",
  panelSolid: "rgba(4,16,28,0.97)",
  border: "rgba(64,214,245,0.62)",
  borderSoft: "rgba(64,214,245,0.22)",
  glow: "0 0 22px rgba(64,214,245,0.16)",
  text: "#e8f2f6",
  textDim: "#93a8b3",
  textFaint: "#6f8490",
  accent: "#4fe6ff",
  danger: "#ff6b7d",
  warn: "#ffb84a",
  ok: "#35f0a0",
  radius: 12,
  barH: 32,
} as const;

/** مقاس التصميم المرجعي. وحدات عالم وليست إطارًا. */
export const DESIGN = { w: 1672, h: 941, headerH: 79, dockH: 82 } as const;

/** يثبت متغيرات ثيم لوحة الإدارة داخل الاستوديو كي لا تفرض قواعد الوضع الفاتح (!important) خلفيات بيضاء. */
export const ADMIN_THEME_OVERRIDES = {
  "--admin-bg-surface": "rgba(2,10,18,0.85)",
  "--admin-bg-surface-2": "rgba(4,16,28,0.97)",
  "--admin-border-base": "rgba(64,214,245,0.22)",
  "--admin-border-subtle": "rgba(64,214,245,0.12)",
  "--admin-accent": "#4fe6ff",
  "--admin-accent-border": "rgba(64,214,245,0.62)",
  "--admin-accent-soft": "rgba(64,214,245,0.12)",
  "--admin-btn-primary-bg": "rgba(64,214,245,0.1)",
  "--admin-btn-primary-fg": "#4fe6ff",
  "--admin-shadow-sm": "none",
  colorScheme: "dark",
} as React.CSSProperties;
