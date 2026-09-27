/* Agent L2: live inspector bind */

import type { Locale } from "@/lib/i18n/types";
import { pickCopy, type HomepageSectionInstance, type LocalizedCopy } from "./schema";
import type { SearchTabKey } from "@/data/search-tabs";

export const SEARCH_TAB_TO_ICON_SETTING: Record<string, string> = {
  flight: "iconFlight",
  hotel: "iconHotel",
  holiday: "iconHoliday",
  tours: "iconTours",
  transfers: "iconTransfers",
  cars: "iconCars",
  insurance: "iconInsurance",
  visa: "iconVisa",
  offers: "iconOffers",
};

export const SEARCH_TAB_TO_LABEL_FIELD: Record<string, string> = {
  flight: "tab.flight",
  hotel: "tab.hotel",
  holiday: "tab.holiday",
  tours: "tab.tours",
  transfers: "tab.transfers",
  cars: "tab.cars",
  insurance: "tab.insurance",
  visa: "tab.visa",
  offers: "tab.offers",
};

const IMAGE_FIELD_RE = /image|photo|heroImage|thumbnail|banner|logo|background|src/i;

/** Strip `url('…')` so inspector values can be used as `<img src>`. */
export function unwrapCssUrl(value: string | undefined | null): string {
  if (!value) return "";
  const v = String(value).trim();
  const wrapped = v.match(/^url\(\s*['"]?([^)'"]+)['"]?\s*\)$/i);
  if (wrapped?.[1]) return wrapped[1].trim();
  return v;
}

export function looksLikeUrl(value: string | undefined | null): boolean {
  const v = unwrapCssUrl(value);
  if (!v) return false;
  return (
    v.startsWith("/") ||
    v.startsWith("data:") ||
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("blob:")
  );
}

export function isIconClassValue(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^(isax|fa-|fab |fas |far |fal |fad |bi |bx |ti |ph )/i.test(value.trim());
}

export function isEmojiGlyph(value: string | undefined | null): boolean {
  if (!value) return false;
  const s = value.trim();
  if (!s || looksLikeUrl(s) || isIconClassValue(s)) return false;
  if (s.includes(" ")) return false;
  return /\p{Extended_Pictographic}/u.test(s) || s.length <= 4;
}

export function withCacheBust(url: string): string {
  const trimmed = unwrapCssUrl(url);
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  const stamp = String(Date.now());
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://lonaliza.com";
    const parsed = new URL(trimmed, base);
    parsed.searchParams.set("v", stamp);
    if (/^https?:/i.test(trimmed)) return parsed.toString();
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const join = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${join}v=${stamp}`;
  }
}

export function inferFieldFromBuilderId(id: string, instanceId: string): string | undefined {
  if (!id) return undefined;
  if (instanceId && id.startsWith(`${instanceId}.`)) return id.slice(instanceId.length + 1);
  if (id.startsWith("search.tab.")) return id;
  if (id.startsWith("footer.")) return id;
  const dot = id.lastIndexOf(".");
  if (dot > 0 && !id.endsWith("-default")) return id.slice(dot + 1);
  return undefined;
}

export function normalizeSearchTabField(field: string | undefined): string | undefined {
  if (!field) return undefined;
  const m = field.match(/^(?:search\.)?tab\.(.+)$/);
  if (!m?.[1]) return field;
  return `tab.${m[1]}`;
}

export function searchTabKeyFromField(field: string | undefined): SearchTabKey | null {
  if (!field) return null;
  const raw = field.replace(/^search\.tab\./, "").replace(/^tab\./, "");
  if (raw in SEARCH_TAB_TO_ICON_SETTING) return raw as SearchTabKey;
  return null;
}

export function iconSettingKeyForField(field: string | undefined): string | null {
  const tab = searchTabKeyFromField(field);
  if (tab) return SEARCH_TAB_TO_ICON_SETTING[tab] || null;
  if (!field) return null;
  if (/^icon/i.test(field)) return field;
  return `icon.${field}`;
}

export function imageSettingKeyForField(field: string | undefined, tagName?: string): string {
  const tag = (tagName || "").toLowerCase();
  if (!field || field === "image" || field === "src") return "image";
  if (tag === "img" && IMAGE_FIELD_RE.test(field)) return field.startsWith("image.") ? field : `image.${field}`;
  if (IMAGE_FIELD_RE.test(field)) return field.startsWith("image.") ? field : `image.${field}`;
  return `image.${field}`;
}

export function looksLikeImageBinding(field: string | undefined, tagName?: string, src?: string): boolean {
  const tag = (tagName || "").toLowerCase();
  if (tag === "img" || tag === "picture" || tag === "video") return true;
  if (src && looksLikeUrl(src)) return true;
  return IMAGE_FIELD_RE.test(field || "");
}

export function resolveBoundImage(
  instance: HomepageSectionInstance,
  field: string | undefined,
  fallback: string
): string {
  const specific = Boolean(field && field !== "image" && field !== "src");
  const keys = [
    field && field !== "image" ? `image.${field}` : "",
    field || "",
    specific ? "" : "image",
  ].filter(Boolean);
  for (const key of keys) {
    const setting = instance.settings[key];
    if (typeof setting === "string" && unwrapCssUrl(setting)) return unwrapCssUrl(setting);
  }
  if (field) {
    const copy = instance.texts[field];
    const fromText = pickCopy(copy, "en") || pickCopy(copy, "ar") || pickCopy(copy, "tr");
    if (looksLikeUrl(fromText)) return unwrapCssUrl(fromText);
  }
  if (!specific) {
    const imageCopy = instance.texts.image;
    const imageText = pickCopy(imageCopy, "en") || pickCopy(imageCopy, "ar") || pickCopy(imageCopy, "tr");
    if (looksLikeUrl(imageText)) return unwrapCssUrl(imageText);
  }
  return unwrapCssUrl(fallback);
}

export function resolveBoundText(
  instance: HomepageSectionInstance | undefined,
  field: string | undefined,
  locale: Locale,
  fallback = ""
): string {
  if (!instance || !field) return fallback;
  const normalized = normalizeSearchTabField(field) || field;
  const copy = instance.texts[normalized] || instance.texts[field];
  return pickCopy(copy, locale) || fallback;
}

export function nearestTextField(
  instance: HomepageSectionInstance | undefined,
  clickedText: string | undefined,
  locale: Locale
): string | undefined {
  if (!instance) return undefined;
  const keys = Object.keys(instance.texts);
  if (!keys.length) return undefined;
  const needle = (clickedText || "").replace(/\s+/g, " ").trim();
  if (needle) {
    const hit = keys.find((key) => {
      const value = pickCopy(instance.texts[key], locale).replace(/\s+/g, " ").trim();
      return value && (value === needle || needle.includes(value) || value.includes(needle.slice(0, 48)));
    });
    if (hit) return hit;
  }
  const preferred = ["title", "subtitle", "eyebrow", "button", "cta"];
  return preferred.find((key) => instance.texts[key]) || keys[0];
}

export function readDomField(el: HTMLElement): string | undefined {
  return (
    el.getAttribute("data-field") ||
    el.getAttribute("data-builder-field") ||
    undefined
  );
}

export function applyBoundText(el: HTMLElement, value: string): void {
  if (el.children.length === 0) {
    el.textContent = value;
    return;
  }
  const marked = el.querySelector("[data-builder-text]") as HTMLElement | null;
  if (marked) {
    marked.textContent = value;
    return;
  }
  if (el.children.length === 1 && el.children[0]?.children.length === 0) {
    el.children[0].textContent = value;
  }
}

export function applyBoundSrc(el: HTMLElement, value: string): void {
  const next = unwrapCssUrl(value);
  const img =
    el instanceof HTMLImageElement
      ? el
      : (el.querySelector("img") as HTMLImageElement | null);
  if (img) {
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src = next;
    img.setAttribute("src", next);
    img.dataset.builderSrc = next;
    return;
  }
  const current = el.style.backgroundImage || "";
  const gradient = current
    .replace(/url\(\s*['"]?[^)'"]+['"]?\s*\)/g, "")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
  el.style.backgroundImage = gradient
    ? `${gradient}, url('${next.replace(/'/g, "%27")}')`
    : `url('${next.replace(/'/g, "%27")}')`;
}

export function applyBoundIcon(el: HTMLElement, value: string): void {
  const slot = el.querySelector("[data-builder-icon]") as HTMLElement | null;
  const target = slot || el;
  if (!value) {
    if (slot) slot.innerHTML = "";
    return;
  }
  if (looksLikeUrl(value)) {
    target.innerHTML = `<img src="${value.replace(/"/g, "")}" alt="" />`;
    return;
  }
  if (isIconClassValue(value)) {
    target.innerHTML = `<i class="${value.replace(/"/g, "")}"></i>`;
    return;
  }
  target.textContent = value;
}

export function applyBoundProp(el: HTMLElement, prop: string, value: string): void {
  if (prop === "content") {
    applyBoundText(el, value);
    return;
  }
  if (prop === "src") {
    applyBoundSrc(el, value);
    return;
  }
  if (prop === "icon" || prop === "iconClass") {
    applyBoundIcon(el, value);
    return;
  }
  if (prop === "placeholder" && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    el.placeholder = value;
    return;
  }
  if (prop === "className") {
    if (isIconClassValue(value) && el.querySelector("[data-builder-icon]")) {
      applyBoundIcon(el, value);
      return;
    }
    if (value) el.setAttribute("class", value);
    return;
  }
  if (prop === "customCss") {
    el.setAttribute("style", `${el.getAttribute("style") || ""};${value}`);
    return;
  }
  const cssProp = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  el.style.setProperty(cssProp, value);
}

export function applyElementOverridesToDocument(
  doc: Document,
  overrides: Record<string, Record<string, unknown>> | undefined
): void {
  if (!overrides) return;
  for (const [id, bag] of Object.entries(overrides)) {
    if (!id || !bag || typeof bag !== "object") continue;
    let el: HTMLElement | null = null;
    try {
      el = doc.querySelector(`[data-builder-id="${CSS.escape(id)}"]`) as HTMLElement | null;
    } catch {
      el = doc.querySelector(`[data-builder-id="${id}"]`) as HTMLElement | null;
    }
    if (!el) continue;
    for (const [prop, value] of Object.entries(bag)) {
      if (prop === "responsive") continue;
      applyBoundProp(el, prop, String(value ?? ""));
    }
  }
}

export function collectSearchTabLabels(
  texts: Record<string, LocalizedCopy> | undefined,
  locale: Locale
): Partial<Record<SearchTabKey, string>> {
  const out: Partial<Record<SearchTabKey, string>> = {};
  if (!texts) return out;
  for (const [tab, field] of Object.entries(SEARCH_TAB_TO_LABEL_FIELD)) {
    const alt = `search.tab.${tab}`;
    const value = pickCopy(texts[field], locale) || pickCopy(texts[alt], locale);
    if (value) out[tab as SearchTabKey] = value;
  }
  return out;
}
