import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn, exec } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_PATH = path.join(
  process.cwd(),
  ".data",
  "reseller-leads",
  "live-crawler-status.json"
);

export async function GET() {
  try {
    if (fs.existsSync(STATUS_PATH)) {
      const data = JSON.parse(fs.readFileSync(STATUS_PATH, "utf-8"));
      return NextResponse.json(data);
    }
    return NextResponse.json({
      active: false,
      step: "idle",
      message: "محرك المسح المباشر في وضع الاستعداد",
      totalFound: 0,
      progressPercent: 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading status";
    return NextResponse.json({ active: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const city = (body.city || "إسطنبول").trim();
    const country = (body.country || "تركيا").trim();
    const depth = String(body.depth || 2);
    const keywordsList = Array.isArray(body.keywords)
      ? body.keywords.join(",")
      : body.keywords || "وكالات سياحة وسفر";

    const jobId = `live_job_${Date.now()}`;
    const workerScript = path.join(process.cwd(), "scripts/live-gmaps-worker.mjs");

    // Spawn detached live crawler process
    const child = spawn(
      process.execPath,
      [workerScript, city, country, keywordsList, depth],
      {
        detached: true,
        stdio: "ignore",
        cwd: process.cwd(),
        env: {
          ...process.env,
          DISPLAY: ":99",
        },
      }
    );

    child.unref();

    return NextResponse.json({
      ok: true,
      jobId,
      message: `تم تشغيل محرك المسح المباشر بنجاح على شاشة VNC :99 لمدينة ${city}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start live crawler";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    exec("pkill -9 -f live-gmaps-worker.mjs", () => {});

    // Update status file in both locations
    const statusPaths = [
      STATUS_PATH,
      path.join(process.cwd(), "../database/data/reseller-leads/live-crawler-status.json"),
    ];

    for (const p of statusPaths) {
      if (fs.existsSync(p)) {
        try {
          const current = JSON.parse(fs.readFileSync(p, "utf-8"));
          fs.writeFileSync(
            p,
            JSON.stringify(
              {
                ...current,
                active: false,
                step: "cancelled",
                message: "تم إيقاف عملية المسح من قِبل المدير.",
              },
              null,
              2
            )
          );
        } catch {}
      }
    }

    // Cancel working jobs in jobs.json
    const jobPaths = [
      path.join(process.cwd(), ".data/reseller-leads/jobs.json"),
      path.join(process.cwd(), "../database/data/reseller-leads/jobs.json"),
    ];

    for (const jp of jobPaths) {
      if (fs.existsSync(jp)) {
        try {
          const jobs = JSON.parse(fs.readFileSync(jp, "utf-8"));
          let changed = false;
          for (const j of jobs) {
            if (j.status === "working" || j.status === "running") {
              j.status = "cancelled";
              j.updatedAt = new Date().toISOString();
              changed = true;
            }
          }
          if (changed) {
            fs.writeFileSync(jp, JSON.stringify(jobs, null, 2), "utf-8");
          }
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, message: "تم إيقاف المسح المباشر وتحديث السجلات" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to stop crawler";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
