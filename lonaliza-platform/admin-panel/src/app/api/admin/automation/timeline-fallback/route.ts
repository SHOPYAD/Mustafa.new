import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { matchKnownTimelineCategory } from "@/lib/swarm/dynamic-timeline-stages";
import { generateGeminiTimeline } from "@/lib/swarm/dynamic-timeline-gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const directive = String(body.directive || "").trim();
  if (!directive) {
    return NextResponse.json({ ok: false, error: "Missing directive" }, { status: 400 });
  }
  if (matchKnownTimelineCategory(directive)) {
    return NextResponse.json({ ok: false, error: "Directive already has a built-in timeline" }, { status: 400 });
  }
  const timeline = await generateGeminiTimeline(directive);
  return NextResponse.json({ ok: true, timeline });
}
