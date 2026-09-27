import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import {
  filterLeads,
  getLeadsStatistics,
  updateLeadOutreachStatus,
  saveLeads,
  getAllLeads,
} from "@/lib/server/gmaps-scraper/reseller-leads-store";
import type { LeadsFilterOptions, OutreachStatus } from "@/lib/server/gmaps-scraper/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertOriginOnly("Reseller Leads API");
    const { searchParams } = new URL(req.url);

    const filterOptions: LeadsFilterOptions = {
      search: searchParams.get("search") || undefined,
      country: searchParams.get("country") || undefined,
      city: searchParams.get("city") || undefined,
      category: searchParams.get("category") || undefined,
      minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
      hasPhone: searchParams.get("hasPhone") === "true",
      hasWhatsapp: searchParams.get("hasWhatsapp") === "true",
      hasEmail: searchParams.get("hasEmail") === "true",
      hasWebsite: searchParams.get("hasWebsite") === "true",
      hasSocials: searchParams.get("hasSocials") === "true",
      outreachStatus: (searchParams.get("status") as OutreachStatus) || undefined,
      jobId: searchParams.get("jobId") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0,
    };

    const { leads, total } = filterLeads(filterOptions);
    const stats = getLeadsStatistics();

    return NextResponse.json({ ok: true, leads, total, stats });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذر جلب بيانات الشركات" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    assertOriginOnly("Reseller Leads Update API");
    const body = (await req.json()) as {
      leadId?: string;
      leadIds?: string[];
      status: OutreachStatus;
      notes?: string;
    };

    if (body.leadId) {
      const updated = updateLeadOutreachStatus(body.leadId, body.status, body.notes);
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (Array.isArray(body.leadIds) && body.leadIds.length > 0) {
      for (const id of body.leadIds) {
        updateLeadOutreachStatus(id, body.status, body.notes);
      }
      return NextResponse.json({ ok: true, count: body.leadIds.length });
    }

    return NextResponse.json({ ok: false, error: "لم يتم تحديد أي شركة للتحديث" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء تحديث الحالة" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    assertOriginOnly("Reseller Leads Delete API");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    let bodyIds: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.ids)) bodyIds = body.ids;
    } catch {}

    const syncToDatabase = (updatedLeads: unknown[]) => {
      try {
        const dbPath = path.join(process.cwd(), "../database/data/reseller-leads/leads.json");
        if (fs.existsSync(path.dirname(dbPath))) {
          fs.writeFileSync(dbPath, JSON.stringify(updatedLeads, null, 2), "utf-8");
        }
      } catch {}
    };

    if (clearAll) {
      saveLeads([]);
      syncToDatabase([]);
      return NextResponse.json({ ok: true, message: "تم مسح جميع الشركات بنجاح" });
    }

    if (bodyIds.length > 0) {
      const idSet = new Set(bodyIds);
      const all = getAllLeads();
      const filtered = all.filter((l) => !idSet.has(l.id));
      saveLeads(filtered);
      syncToDatabase(filtered);
      return NextResponse.json({
        ok: true,
        count: all.length - filtered.length,
        message: `تم حذف ${all.length - filtered.length} شركة بنجاح`,
      });
    }

    if (id) {
      const all = getAllLeads();
      const filtered = all.filter((l) => l.id !== id);
      saveLeads(filtered);
      syncToDatabase(filtered);
      return NextResponse.json({ ok: true, message: "تم حذف الشركة بنجاح" });
    }

    return NextResponse.json({ ok: false, error: "معرف الشركة أو قائمة المعرفات مطلوبة" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء الحذف" },
      { status: 500 }
    );
  }
}
