import { getPackages } from "@/data/packages";
import { isPublicPackage, sortPackagesNewestFirst } from "@/lib/packages-sort";
import type { HolidayPackage } from "@/types/package";

export async function fetchPublishedPackages(): Promise<HolidayPackage[]> {
  try {
    const res = await fetch("/api/packages", { cache: "no-store" });
    const data = (await res.json()) as {
      ok?: boolean;
      packages?: HolidayPackage[];
    };
    if (data.ok && Array.isArray(data.packages) && data.packages.length) {
      return sortPackagesNewestFirst(data.packages.filter((p) => p && isPublicPackage(p)));
    }
  } catch {
    /* fallback on seed catalog if offline */
  }
  return sortPackagesNewestFirst(getPackages().filter(isPublicPackage));
}
