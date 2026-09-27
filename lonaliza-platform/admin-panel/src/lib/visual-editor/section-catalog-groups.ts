import type { Locale } from "@/lib/i18n/types";
import {
  HOMEPAGE_SECTION_CATEGORIES,
  pickCopy,
  sectionCategory,
  sectionCategoryLabel,
  type HomepageSectionCategory,
  type HomepageSectionType,
  type LocalizedCopy,
} from "@/lib/visual-editor/schema";

export type CatalogTypeGroup = {
  key: HomepageSectionCategory;
  category: LocalizedCopy;
  types: HomepageSectionType[];
};

export const CATALOG_CATEGORY_TONE: Record<HomepageSectionCategory, string> = {
  hero: "navy",
  services: "emerald",
  offers: "amber",
  rewards: "emerald",
  destinations: "lime",
  story: "navy",
};

export function catalogCategoryOf(type: HomepageSectionType): LocalizedCopy {
  return sectionCategoryLabel(sectionCategory(type));
}

export function groupCatalogTypes(types: HomepageSectionType[]): CatalogTypeGroup[] {
  const groups = new Map<HomepageSectionCategory, CatalogTypeGroup>();
  for (const type of types) {
    const key = sectionCategory(type);
    const existing = groups.get(key);
    if (existing) {
      existing.types.push(type);
      continue;
    }
    groups.set(key, {
      key,
      category: sectionCategoryLabel(key),
      types: [type],
    });
  }
  return HOMEPAGE_SECTION_CATEGORIES.map((key) => groups.get(key)).filter(
    (group): group is CatalogTypeGroup => Boolean(group)
  );
}

export function catalogGroupLabel(group: CatalogTypeGroup, locale: Locale, fallback: string): string {
  return pickCopy(group.category, locale) || fallback;
}

export function catalogToneForType(type: HomepageSectionType, override?: string): string {
  if (override) return override;
  return CATALOG_CATEGORY_TONE[sectionCategory(type)] || "navy";
}
