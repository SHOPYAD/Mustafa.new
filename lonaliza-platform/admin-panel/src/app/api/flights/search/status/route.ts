import { NextRequest, NextResponse } from "next/server";
import { getFlightSearchJob } from "@/lib/server/search-jobs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const jobId = (req.nextUrl.searchParams.get("jobId") || "").trim();
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "missing_job_id" }, { status: 400 });
  }
  const job = await getFlightSearchJob(jobId);
  if (!job) {
    return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  }
  if (job.status === "pending") {
    return NextResponse.json({ ok: true, status: "pending", jobId }, { status: 202 });
  }
  if (job.status === "failed") {
    return NextResponse.json(
      { ok: false, status: "failed", jobId, errorCode: job.errorCode || "search_failed" },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, status: "complete", jobId, ...job.payload });
}
