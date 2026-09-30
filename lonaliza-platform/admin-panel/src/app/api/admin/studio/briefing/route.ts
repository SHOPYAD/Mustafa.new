import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { listCollections } from "@/lib/studio/server/pb-meta";
import { filterLeads, getLeadsStatistics } from "@/lib/server/gmaps-scraper/reseller-leads-store";
import { listTasks } from "@/lib/studio/agents/task-board.server";
import { inspectPlatformSystems } from "@/lib/swarm/platform-systems-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WATCH: [string, string][] = [
  ["hotel_bookings", "حجوزات الفنادق"],
  ["enquiry_bookings", "طلبات الاستفسار"],
  ["customer_reviews", "تقييمات العملاء"],
  ["financial_transactions", "المعاملات المالية"],
  ["reseller_orders", "طلبات الموزعين"],
  ["site_traffic_logs", "سجل الزيارات"],
  ["articles", "المقالات"],
  ["customers", "العملاء"],
];

const TASK_AR: Record<string, string> = {
  queued: "بانتظار",
  running: "جارية",
  done: "اكتملت",
  failed: "فشلت",
};

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const kind = req.nextUrl.searchParams.get("kind") || "radar";
  const known = await listCollections().catch(() => null);
  const pb = await createAdminPocketBase();
  const counts = await Promise.all(
    WATCH.map(async ([name, label]) => {
      if (known && !known.has(name)) return { name, label, total: null as number | null, state: "غير موجودة" };
      try {
        const row = await pb.collection(name).getList(1, 1, { fields: "id", skipTotal: false });
        return { name, label, total: row.totalItems, state: "حية" };
      } catch {
        return { name, label, total: null as number | null, state: "تعذر القراءة" };
      }
    })
  );
  const { leads, total } = filterLeads({ limit: 12 });
  const stats = getLeadsStatistics();
  const tasks = listTasks(8).map((task) => ({
    agent: task.agentNameAr,
    directive: task.directive,
    status: TASK_AR[task.status] || task.status,
    result: task.result || "",
  }));
  const systems = kind === "readiness" ? await inspectPlatformSystems() : [];
  const gaps = systems.filter((row) => !row.connected);
  return NextResponse.json({
    ok: true,
    kind,
    fetchedAt: new Date().toISOString(),
    counts,
    leads: kind === "radar" ? {
      total,
      whatsapp: stats.totalWithWhatsapp,
      email: stats.totalWithEmail,
      website: stats.totalWithWebsite,
      contacted: stats.totalContacted,
      qualified: stats.totalQualified,
      rows: leads.map((lead) => ({
        title: lead.title,
        city: lead.city || "—",
        phone: lead.whatsappPhone || lead.phone || "—",
        email: lead.email || "—",
        rating: lead.reviewCount ? `${lead.reviewRating} (${lead.reviewCount})` : "—",
      })),
    } : undefined,
    systems: systems.map((row) => ({
      label: row.label,
      state: row.connected ? "موصول" : "غير موصول",
      gap: row.error ? row.error.replace("is not configured", "غير مُعد").replace("not configured", "غير مُعد") : "—",
    })),
    gapCount: gaps.length,
    systemCount: systems.length,
    tasks,
  });
}
