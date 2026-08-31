/* Agent C: copilot pipeline */

import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  copilotFsAllowList,
  runCopilotFs,
  type CopilotFsAction,
  type CopilotFsRequest,
  type CopilotPatchOp,
} from "@/lib/server/copilot-fs";

export const runtime = "nodejs";
export const maxDuration = 60;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parsePatches(raw: unknown): CopilotPatchOp[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const rec = asRecord(item);
    if (!rec || typeof rec.path !== "string") return [];
    const action =
      rec.action === "write" || rec.action === "delete" || rec.action === "search_replace"
        ? rec.action
        : "search_replace";
    return [
      {
        path: rec.path,
        action,
        oldString: typeof rec.oldString === "string" ? rec.oldString : undefined,
        newString: typeof rec.newString === "string" ? rec.newString : undefined,
        content: typeof rec.content === "string" ? rec.content : undefined,
        confirm: rec.confirm === true,
      },
    ];
  });
}

function parseAction(value: unknown): CopilotFsAction | null {
  if (
    value === "list" ||
    value === "read" ||
    value === "search" ||
    value === "apply_patch" ||
    value === "resolve" ||
    value === "create_section"
  ) {
    return value;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const action = parseAction(req.nextUrl.searchParams.get("action") || "list") || "list";
  const result = await runCopilotFs({
    action,
    path: req.nextUrl.searchParams.get("path") || undefined,
    query: req.nextUrl.searchParams.get("query") || undefined,
    glob: req.nextUrl.searchParams.get("glob") || undefined,
  });
  return NextResponse.json({ ...result, allowList: copilotFsAllowList() });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = asRecord(await req.json());
    const action = parseAction(body?.action);
    if (!action) {
      return NextResponse.json({ ok: false, error: "action required" }, { status: 400 });
    }
    const payload: CopilotFsRequest = {
      action,
      path: typeof body?.path === "string" ? body.path : undefined,
      query: typeof body?.query === "string" ? body.query : undefined,
      glob: typeof body?.glob === "string" ? body.glob : undefined,
      patches: parsePatches(body?.patches),
      confirm: body?.confirm === true,
      slug: typeof body?.slug === "string" ? body.slug : undefined,
      titleAr: typeof body?.titleAr === "string" ? body.titleAr : undefined,
      titleEn: typeof body?.titleEn === "string" ? body.titleEn : undefined,
      titleTr: typeof body?.titleTr === "string" ? body.titleTr : undefined,
      tsx: typeof body?.tsx === "string" ? body.tsx : undefined,
      css: typeof body?.css === "string" ? body.css : undefined,
      html: typeof body?.html === "string" ? body.html : undefined,
    };
    const result = await runCopilotFs(payload);
    return NextResponse.json({ ...result, allowList: copilotFsAllowList() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "copilot-fs failed" },
      { status: 500 }
    );
  }
}
