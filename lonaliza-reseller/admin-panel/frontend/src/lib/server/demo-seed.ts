import { createAdminPocketBase } from "@/lib/pocketbase/admin";

export type DemoSeedSummary = {
  packages: number;
  tours: number;
  articles: number;
  bookings: number;
  coupons: number;
};

/**
 * Check count of seeded demo items across collections.
 */
export async function getDemoSeedStats(): Promise<DemoSeedSummary> {
  try {
    const pb = await createAdminPocketBase();
    const [packages, tours, articles, bookings, coupons] = await Promise.all([
      pb.collection("packages").getFullList({ filter: "is_demo_seed=true" }).catch(() => []),
      pb.collection("tours").getFullList({ filter: "is_demo_seed=true" }).catch(() => []),
      pb.collection("articles").getFullList({ filter: "is_demo_seed=true" }).catch(() => []),
      pb.collection("bookings").getFullList({ filter: "is_demo_seed=true" }).catch(() => []),
      pb.collection("coupons").getFullList({ filter: "is_demo_seed=true" }).catch(() => []),
    ]);

    return {
      packages: packages.length,
      tours: tours.length,
      articles: articles.length,
      bookings: bookings.length,
      coupons: coupons.length,
    };
  } catch {
    return { packages: 0, tours: 0, articles: 0, bookings: 0, coupons: 0 };
  }
}

/**
 * Bulk delete all demo seed records from client instance collections.
 */
export async function bulkDeleteDemoSeed(): Promise<{ deletedCount: number }> {
  const pb = await createAdminPocketBase();
  let deletedCount = 0;

  const collections = ["packages", "tours", "articles", "bookings", "coupons"];

  for (const colName of collections) {
    try {
      const records = await pb.collection(colName).getFullList({
        filter: "is_demo_seed=true",
      });
      for (const r of records) {
        await pb.collection(colName).delete(r.id);
        deletedCount += 1;
      }
    } catch {
      /* continue */
    }
  }

  return { deletedCount };
}
