import { NextResponse } from "next/server";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import {
  getAllLeads,
  filterLeads,
  generateLeadsCsv,
  generateLeadsMarkdown,
  generateLeadsPrintableHtml,
} from "@/lib/server/gmaps-scraper/reseller-leads-store";
import type { LeadsFilterOptions, ScrapedBusinessLead } from "@/lib/server/gmaps-scraper/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    assertOriginOnly("Reseller Leads Export API");
    const body = (await req.json()) as {
      format: "csv" | "markdown" | "pdf_html";
      selectedIds?: string[];
      filters?: LeadsFilterOptions;
    };

    let targetLeads: ScrapedBusinessLead[] = [];

    if (Array.isArray(body.selectedIds) && body.selectedIds.length > 0) {
      const all = getAllLeads();
      targetLeads = all.filter((l) => body.selectedIds!.includes(l.id));
    } else if (body.filters) {
      const { leads } = filterLeads({ ...body.filters, limit: 10000 });
      targetLeads = leads;
    } else {
      targetLeads = getAllLeads();
    }

    if (targetLeads.length === 0) {
      return NextResponse.json({ ok: false, error: "لا توجد شركات مطابقة للتصدير" }, { status: 400 });
    }

    if (body.format === "csv") {
      const csv = generateLeadsCsv(targetLeads);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="lonaliza_b2b_leads_${Date.now()}.csv"`,
        },
      });
    }

    if (body.format === "markdown") {
      const md = generateLeadsMarkdown(targetLeads);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="lonaliza_b2b_leads_${Date.now()}.md"`,
        },
      });
    }

    // Default: Printable HTML for PDF
    const html = generateLeadsPrintableHtml(targetLeads);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء إنشاء ملف التصدير" },
      { status: 500 }
    );
  }
}
