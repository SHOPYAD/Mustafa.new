import { NextResponse } from "next/server";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import {
  checkScraperHealth,
  launchScrapeJob,
} from "@/lib/server/gmaps-scraper/gmaps-scraper-service";
import { getAllJobs, getJobById } from "@/lib/server/gmaps-scraper/reseller-leads-store";
import type { CreateScraperJobInput } from "@/lib/server/gmaps-scraper/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertOriginOnly("Reseller Scraper Jobs API");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const healthy = await checkScraperHealth();

    if (id) {
      const job = getJobById(id);
      return NextResponse.json({ ok: true, job, healthy });
    }

    const jobs = getAllJobs();
    return NextResponse.json({ ok: true, jobs, healthy });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذر جلب المهام" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertOriginOnly("Reseller Scraper Launch API");
    const body = (await req.json()) as CreateScraperJobInput;

    if (!body.city && (!body.keywords || body.keywords.length === 0)) {
      return NextResponse.json(
        { ok: false, error: "يجب تحديد اسم المدينة أو إدخال كلمات مفتاحية للبحث" },
        { status: 400 }
      );
    }

    const result = await launchScrapeJob(body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, job: result.job });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء تشغيل المهمة" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    assertOriginOnly("Reseller Scraper Job Delete API");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const { deleteJob, deleteAllJobs, getJobById } = await import(
      "@/lib/server/gmaps-scraper/reseller-leads-store"
    );

    if (clearAll) {
      deleteAllJobs();
      return NextResponse.json({ ok: true, message: "تم مسح كافة سجلات العمليات السابقة بنجاح" });
    }

    if (id) {
      const job = getJobById(id);
      if (job && (job.status === "working" || job.status === "running")) {
        // Kill background crawler if active
        try {
          const { exec } = await import("child_process");
          exec("pkill -9 -f live-gmaps-worker.mjs", () => {});
        } catch {}
      }
      deleteJob(id);
      return NextResponse.json({ ok: true, message: "تم حذف سجل العملية بنجاح" });
    }

    return NextResponse.json({ ok: false, error: "معرف العملية مطلوب" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذر حذف العملية" },
      { status: 500 }
    );
  }
}

