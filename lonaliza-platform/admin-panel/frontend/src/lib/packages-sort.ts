import type { HolidayPackage } from "@/types/package";

export function packageRecency(pkg: HolidayPackage): number {
  if (pkg.createdAt) {
    const t = Date.parse(pkg.createdAt);
    if (Number.isFinite(t)) return t;
  }
  if (/^\d{10,13}$/.test(pkg.id)) {
    const n = Number(pkg.id);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function sortPackagesNewestFirst(
  packages: HolidayPackage[]
): HolidayPackage[] {
  return [...packages].sort((a, b) => {
    const recency = packageRecency(b) - packageRecency(a);
    if (recency !== 0) return recency;
    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
  });
}

export function isPublicPackage(pkg: HolidayPackage): boolean {
  return pkg.isPublished !== false;
}

export function normalizeTitleKey(value: string | undefined): string {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function packagesLookSame(
  a: HolidayPackage,
  b: HolidayPackage
): boolean {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.slug && b.slug && a.slug === b.slug) return true;
  const titlesA = [a.title, a.titleAr, a.titleEn]
    .map(normalizeTitleKey)
    .filter(Boolean);
  const titlesB = [b.title, b.titleAr, b.titleEn]
    .map(normalizeTitleKey)
    .filter(Boolean);
  const titleMatch = titlesA.some((t) => titlesB.includes(t));
  if (!titleMatch) return false;
  return Number(a.durationDays) === Number(b.durationDays);
}
