/* Agent E: settings panel + card design */

import type { CSSProperties } from "react";
import type { HomepageSectionType, SectionStyles } from "./schema";

export const SERVICE_CARD_SECTION_TYPES: readonly HomepageSectionType[] = [
  "categories",
  "destinations",
  "packages",
  "hotels",
  "cars",
  "transfers",
  "visa",
  "flightDeals",
  "vipTours",
  "flashDeals",
];

export function isServiceCardSection(type: HomepageSectionType | null | undefined): boolean {
  return Boolean(type && (SERVICE_CARD_SECTION_TYPES as readonly string[]).includes(type));
}

export const CARD_STYLE_KEYS = [
  "cardWidth",
  "cardMinHeight",
  "cardBorderWidth",
  "cardBorderColor",
  "cardBorderStyle",
  "cardRadius",
  "cardPadding",
  "cardShadow",
  "cardBackground",
  "cardImageHeight",
  "cardTitleSize",
  "cardDescSize",
  "cardPriceSize",
  "cardColumns",
  "buttonRadius",
  "buttonPadding",
  "buttonBg",
  "buttonColor",
  "buttonBorder",
  "buttonHoverBg",
] as const;

export type CardStyleKey = (typeof CARD_STYLE_KEYS)[number];

const VAR_BY_KEY: Record<CardStyleKey, string> = {
  cardWidth: "--sc-card-width",
  cardMinHeight: "--sc-card-min-height",
  cardBorderWidth: "--sc-card-border-width",
  cardBorderColor: "--sc-card-border-color",
  cardBorderStyle: "--sc-card-border-style",
  cardRadius: "--sc-card-radius",
  cardPadding: "--sc-card-padding",
  cardShadow: "--sc-card-shadow",
  cardBackground: "--sc-card-bg",
  cardImageHeight: "--sc-card-image-height",
  cardTitleSize: "--sc-card-title-size",
  cardDescSize: "--sc-card-desc-size",
  cardPriceSize: "--sc-card-price-size",
  cardColumns: "--sc-card-columns",
  buttonRadius: "--sc-btn-radius",
  buttonPadding: "--sc-btn-padding",
  buttonBg: "--sc-btn-bg",
  buttonColor: "--sc-btn-color",
  buttonBorder: "--sc-btn-border",
  buttonHoverBg: "--sc-btn-hover-bg",
};

export function serviceCardCssVars(styles?: Partial<SectionStyles> | null): CSSProperties {
  const next: Record<string, string> = {};
  if (!styles) return next as CSSProperties;
  for (const key of CARD_STYLE_KEYS) {
    const value = styles[key];
    if (typeof value === "string" && value.trim()) {
      next[VAR_BY_KEY[key]] = value.trim();
    }
  }
  return next as CSSProperties;
}
