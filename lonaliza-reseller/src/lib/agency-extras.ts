import type { Locale } from "@/lib/i18n/types";
import type { AgencyExtraPackage, AgencyExtraService } from "@/types/agency-extra";

export function extraLocalizedTitle(pkg: AgencyExtraPackage, locale: Locale): string {
  switch (locale) {
    case "ar":
      return pkg.titleAr || pkg.titleEn;
    case "tr":
      return pkg.titleTr || pkg.titleEn || pkg.titleAr;
    case "en":
    default:
      return pkg.titleEn || pkg.titleAr;
  }
}

export function extraLocalizedDesc(pkg: AgencyExtraPackage, locale: Locale): string {
  switch (locale) {
    case "ar":
      return pkg.descAr || pkg.descEn;
    case "tr":
      return pkg.descTr || pkg.descEn || pkg.descAr;
    case "en":
    default:
      return pkg.descEn || pkg.descAr;
  }
}

export function extraLineAmount(pkg: AgencyExtraPackage, fareSubtotal: number): number {
  if (pkg.priceType === "percent") {
    return Math.round(fareSubtotal * (Math.max(0, pkg.priceValue) / 100) * 100) / 100;
  }
  return Math.max(0, pkg.priceValue);
}

/** Only selected packages affect the total. Unselected extras stay at 0. */
export function extrasTotal(
  packages: AgencyExtraPackage[],
  selectedIds: string[],
  fareSubtotal: number
): number {
  if (!selectedIds.length) return 0;
  const chosen = new Set(selectedIds);
  return packages.reduce((sum, pkg) => {
    if (!chosen.has(pkg.id) || !pkg.isActive) return sum;
    return sum + extraLineAmount(pkg, fareSubtotal);
  }, 0);
}

export function extrasForService(
  packages: AgencyExtraPackage[],
  service: AgencyExtraService
): AgencyExtraPackage[] {
  return packages
    .filter((pkg) => pkg.isActive && pkg.serviceTypes.includes(service))
    .sort((a, b) => a.sort - b.sort || a.titleEn.localeCompare(b.titleEn));
}

