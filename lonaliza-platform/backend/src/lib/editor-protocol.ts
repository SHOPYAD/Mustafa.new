/** postMessage protocol between public homepage (iframe) and Visual AI Editor (admin). */

export const EDITOR_SELECT_MESSAGE = "liotrip-select-section" as const;
export const EDITOR_REFRESH_MESSAGE = "liotrip-refresh-preview" as const;
export const EDITOR_CMS_SYNC_MESSAGE = "liotrip-cms-synced" as const;

/** Previous OKTRAVEL postMessage types — still accepted from cached iframes. */
export const LEGACY_EDITOR_SELECT_MESSAGE = "oktravel-select-section" as const;
export const LEGACY_EDITOR_REFRESH_MESSAGE = "oktravel-refresh-preview" as const;
export const LEGACY_EDITOR_CMS_SYNC_MESSAGE = "oktravel-cms-synced" as const;

export const EDITOR_SECTION_SELECTED_EVENT = "liotrip:editor-section-selected";
export const LEGACY_EDITOR_SECTION_SELECTED_EVENT =
  "oktravel:editor-section-selected";

export type EditorSectionType =
  | "hero"
  | "search"
  | "destinations"
  | "flashDeals"
  | "extraSection"
  | "stats"
  | "features"
  | "visa"
  | "packages"
  | "testimonials"
  | "trust"
  | "partners"
  | "blog"
  | "cta";

export type EditorSectionSelection = {
  type: typeof EDITOR_SELECT_MESSAGE;
  sectionId: string;
  sectionType: EditorSectionType;
  labelAr: string;
  labelEn: string;
  itemId?: string;
  itemLabelAr?: string;
  itemLabelEn?: string;
};

export type EditorRefreshMessage = {
  type: typeof EDITOR_REFRESH_MESSAGE;
};

export type EditorCmsSyncMessage = {
  type: typeof EDITOR_CMS_SYNC_MESSAGE;
};

export type EditorParentMessage =
  | EditorSectionSelection
  | EditorRefreshMessage
  | EditorCmsSyncMessage;

export const EDITOR_SECTIONS: Record<
  EditorSectionType,
  { id: string; labelAr: string; labelEn: string }
> = {
  hero: { id: "hero", labelAr: "الهيرو", labelEn: "Hero" },
  search: { id: "search", labelAr: "بحث الرحلات", labelEn: "Search" },
  destinations: {
    id: "destinations",
    labelAr: "الوجهات",
    labelEn: "Destinations",
  },
  flashDeals: {
    id: "flash-deals",
    labelAr: "عروض سريعة",
    labelEn: "Flash Deals",
  },
  extraSection: {
    id: "extra-section",
    labelAr: "قسم إضافي",
    labelEn: "Extra Section",
  },
  stats: { id: "stats", labelAr: "الإحصائيات", labelEn: "Stats" },
  features: { id: "features", labelAr: "لماذا تختارنا", labelEn: "Features" },
  visa: { id: "visa", labelAr: "التأشيرات", labelEn: "Visa" },
  packages: {
    id: "packages",
    labelAr: "الباقات المميزة",
    labelEn: "Featured Packages",
  },
  testimonials: {
    id: "testimonials",
    labelAr: "آراء العملاء",
    labelEn: "Testimonials",
  },
  trust: { id: "trust", labelAr: "شارات الثقة", labelEn: "Trust Badges" },
  partners: { id: "partners", labelAr: "الشركاء", labelEn: "Partners" },
  blog: { id: "blog", labelAr: "المدونة", labelEn: "Blog" },
  cta: { id: "cta", labelAr: "دعوة للعمل", labelEn: "CTA" },
};

export function isEditorSelection(
  data: unknown
): data is EditorSectionSelection {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    (d.type === EDITOR_SELECT_MESSAGE ||
      d.type === LEGACY_EDITOR_SELECT_MESSAGE) &&
    typeof d.sectionId === "string" &&
    typeof d.sectionType === "string" &&
    typeof d.labelAr === "string"
  );
}

export function isEditorRefreshType(type: unknown): boolean {
  return type === EDITOR_REFRESH_MESSAGE || type === LEGACY_EDITOR_REFRESH_MESSAGE;
}

export function isEditorCmsSyncType(type: unknown): boolean {
  return type === EDITOR_CMS_SYNC_MESSAGE || type === LEGACY_EDITOR_CMS_SYNC_MESSAGE;
}

export function postSectionSelection(
  payload: Omit<EditorSectionSelection, "type">
) {
  if (typeof window === "undefined") return;
  const message: EditorSectionSelection = {
    type: EDITOR_SELECT_MESSAGE,
    ...payload,
  };
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
}
