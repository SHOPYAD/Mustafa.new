import { NextRequest, NextResponse } from "next/server";
import { AUTOMATION_JOB_CATALOG } from "@/lib/automation/catalog";
import { parseAutomationPrompt } from "@/lib/automation/parse-prompt";
import { isAutomationJobType, type AutomationJobInput } from "@/lib/automation/types";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listAutomationJobs, upsertAutomationJob } from "@/lib/server/automation/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const jobs = await listAutomationJobs();
  return NextResponse.json({ ok: true, jobs, catalog: AUTOMATION_JOB_CATALOG });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    let input: AutomationJobInput;
    if (typeof body.fromPrompt === "string" && body.fromPrompt.trim()) {
      input = parseAutomationPrompt(
        body.fromPrompt,
        typeof body.type === "string" ? body.type : undefined
      );
      if (typeof body.name === "string" && body.name.trim()) input.name = body.name.trim();
      if (typeof body.consentSource === "string") input.consentSource = body.consentSource;
      if (typeof body.enabled === "boolean") input.enabled = body.enabled;
      if (typeof body.dryRun === "boolean") input.dryRun = body.dryRun;
      if (typeof body.cron === "string" && body.cron.trim()) input.cron = body.cron.trim();
      if (typeof body.maxPerRun === "number") input.maxPerRun = body.maxPerRun;
      if (typeof body.maxPerDay === "number") input.maxPerDay = body.maxPerDay;
      if (Array.isArray(body.locales)) input.locales = body.locales as AutomationJobInput["locales"];
    } else if (typeof body.name === "string" && isAutomationJobType(body.type)) {
      input = {
        id: typeof body.id === "string" ? body.id : undefined,
        name: body.name,
        type: body.type,
        enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
        cron: typeof body.cron === "string" ? body.cron : undefined,
        timezone: typeof body.timezone === "string" ? body.timezone : undefined,
        maxPerRun: typeof body.maxPerRun === "number" ? body.maxPerRun : undefined,
        maxPerDay: typeof body.maxPerDay === "number" ? body.maxPerDay : undefined,
        locales: Array.isArray(body.locales) ? (body.locales as AutomationJobInput["locales"]) : undefined,
        dryRun: typeof body.dryRun === "boolean" ? body.dryRun : undefined,
        consentSource: typeof body.consentSource === "string" ? body.consentSource : undefined,
        settings:
          body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
            ? (body.settings as Record<string, unknown>)
            : undefined,
      };
    } else {
      return NextResponse.json({ ok: false, error: "name + type أو fromPrompt مطلوب" }, { status: 400 });
    }
    const job = await upsertAutomationJob(input);
    return NextResponse.json({ ok: true, job });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر حفظ الوظيفة" },
      { status: 400 }
    );
  }
}
