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
      const byId = new Map<string, HolidayPackage>();
      for (const pkg of data.packages) {
        if (!pkg?.id || !isPublicPackage(pkg)) continue;
        byId.set(pkg.id, pkg);
      }
      if (typeof window !== "undefined") {
        for (const pkg of getPackages()) {
          if (!pkg?.id || !isPublicPackage(pkg) || byId.has(pkg.id)) continue;
          byId.set(pkg.id, pkg);
        }
      }
      return sortPackagesNewestFirst(Array.from(byId.values()));
    }
  } catch {
    /* use local catalog */
  }
  return sortPackagesNewestFirst(getPackages().filter(isPublicPackage));
}
