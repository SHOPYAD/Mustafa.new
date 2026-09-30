"use client";

export type HudArticleSnapshot = {
  slug: string;
  destination: string;
  status: string;
  detail: string;
};

let current: HudArticleSnapshot = {
  slug: "NO_ARTICLE",
  destination: "AWAITING_DIRECTIVE",
  status: "IDLE",
  detail: "NO_TREND_DATA",
};

export function setHudArticleSnapshot(next: HudArticleSnapshot): void {
  current = next;
}

export function getHudArticleSnapshot(): HudArticleSnapshot {
  return current;
}
