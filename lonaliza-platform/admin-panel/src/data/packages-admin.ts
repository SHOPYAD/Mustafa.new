import { defaultPackages, getPackages, savePackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import type { HolidayPackage } from "@/types/package";

async function adminJson(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    ...init,
  });
  return (await res.json()) as {
    ok?: boolean;
    error?: string;
    package?: HolidayPackage;
    packages?: HolidayPackage[];
  };
}

export async function persistAdminPackage(
  pkg: Omit<HolidayPackage, "id"> & { id?: string }
): Promise<HolidayPackage> {
  const data = await adminJson("/api/admin/packages", {
    method: pkg.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pkg),
  });
  if (!data.ok || !data.package) {
    throw new Error(data.error || "فشل حفظ البرنامج على الخادم");
  }
  return data.package;
}

export async function deleteAdminPackage(id: string): Promise<void> {
  const data = await adminJson(
    `/api/admin/packages?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!data.ok) {
    throw new Error(data.error || "فشل حذف البرنامج");
  }
}

export async function resetAdminPackages(): Promise<HolidayPackage[]> {
  const data = await adminJson("/api/admin/packages", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset" }),
  });
  if (!data.ok || !Array.isArray(data.packages)) {
    throw new Error(data.error || "فشل إعادة التعيين");
  }
  return data.packages;
}

export async function syncLocalPackagesToServer(): Promise<HolidayPackage[]> {
  const seedIds = new Set(defaultPackages.map((p) => p.id));
  const extras = getPackages().filter((pkg) => pkg?.id && !seedIds.has(pkg.id));
  if (extras.length) {
    await adminJson("/api/admin/packages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", packages: extras }),
    });
  }
  const data = await adminJson("/api/admin/packages");
  if (data.ok && Array.isArray(data.packages) && data.packages.length) {
    savePackages(data.packages);
    return data.packages;
  }
  return fetchPublishedPackages();
}
