import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { importSkillsFromGithub } from "@/lib/server/github-skills";
import { COPILOT_SCOPES, parseCopilotScope } from "@/lib/builder-agent/types";
import {
  addMemoryNote,
  deleteMemoryNote,
  deleteRule,
  deleteSkill,
  getBuilderAgentStore,
  importSkills,
  packOf,
  setRuleEnabled,
  setSkillEnabled,
  upsertRule,
  upsertSkill,
} from "@/lib/server/builder-agent-store";

export const runtime = "nodejs";

type AgentAction =
  | "upsertSkill"
  | "uploadSkill"
  | "toggleSkill"
  | "deleteSkill"
  | "upsertRule"
  | "toggleRule"
  | "deleteRule"
  | "addMemory"
  | "deleteMemory"
  | "importGithub";

function asAction(value: unknown): AgentAction | null {
  switch (value) {
    case "upsertSkill":
    case "uploadSkill":
    case "toggleSkill":
    case "deleteSkill":
    case "upsertRule":
    case "toggleRule":
    case "deleteRule":
    case "addMemory":
    case "deleteMemory":
    case "importGithub":
      return value;
    default:
      return null;
  }
}

function scopedPayload(
  store: Awaited<ReturnType<typeof getBuilderAgentStore>>,
  scope: ReturnType<typeof parseCopilotScope>,
  hasGeminiKey: boolean
) {
  const pack = packOf(store, scope);
  return {
    ok: true,
    hasGeminiKey,
    scope,
    scopes: COPILOT_SCOPES,
    updatedAt: store.updatedAt,
    ...pack,
  };
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const scope = parseCopilotScope(req.nextUrl.searchParams.get("scope"));
  const [{ apiKey }, store] = await Promise.all([resolveGeminiApiKey(), getBuilderAgentStore()]);
  return NextResponse.json(scopedPayload(store, scope, Boolean(apiKey)));
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = asAction(body.action);
    if (!action) {
      return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
    }
    const scope = parseCopilotScope(body.scope);
    const [{ apiKey }] = await Promise.all([resolveGeminiApiKey()]);
    const hasKey = Boolean(apiKey);

    switch (action) {
      case "upsertSkill": {
        const title = String(body.title || "").trim();
        const markdown = String(body.markdown || "");
        if (!title) {
          return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
        }
        const store = await upsertSkill(scope, {
          id: typeof body.id === "string" ? body.id : undefined,
          title,
          markdown,
          enabled: body.enabled !== false,
        });
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "uploadSkill": {
        const rawContent = String(body.content || "").trim();
        const filename = String(body.filename || "skill.md").trim();
        if (!rawContent) {
          return NextResponse.json({ ok: false, error: "محتوى ملف المهارة مطلوب" }, { status: 400 });
        }
        let title = filename.replace(/\.md$/i, "");
        const h1Match = rawContent.match(/^#\s+(.+)$/m);
        if (h1Match && h1Match[1]) {
          title = h1Match[1].trim();
        }
        const store = await upsertSkill(scope, {
          title,
          markdown: rawContent,
          enabled: true,
          source: "manual",
          filePath: filename,
        });
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "toggleSkill": {
        const id = String(body.id || "").trim();
        if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
        const store = await setSkillEnabled(scope, id, Boolean(body.enabled));
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "deleteSkill": {
        const id = String(body.id || "").trim();
        if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
        const store = await deleteSkill(scope, id);
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "upsertRule": {
        const title = String(body.title || "").trim();
        const markdown = String(body.markdown || "");
        if (!title) {
          return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
        }
        const store = await upsertRule(scope, {
          id: typeof body.id === "string" ? body.id : undefined,
          title,
          markdown,
          enabled: body.enabled !== false,
        });
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "toggleRule": {
        const id = String(body.id || "").trim();
        if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
        const store = await setRuleEnabled(scope, id, Boolean(body.enabled));
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "deleteRule": {
        const id = String(body.id || "").trim();
        if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
        const store = await deleteRule(scope, id);
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "addMemory": {
        const note = String(body.note || "").trim();
        if (!note) {
          return NextResponse.json({ ok: false, error: "note required" }, { status: 400 });
        }
        const store = await addMemoryNote(scope, note);
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "deleteMemory": {
        const id = String(body.id || "").trim();
        if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
        const store = await deleteMemoryNote(scope, id);
        return NextResponse.json(scopedPayload(store, scope, hasKey));
      }
      case "importGithub": {
        const url = String(body.url || "").trim();
        if (!url) {
          return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
        }
        const imported = await importSkillsFromGithub(url, scope);
        const store = await importSkills(scope, imported);
        return NextResponse.json({
          ...scopedPayload(store, scope, hasKey),
          imported: imported.length,
        });
      }
      default: {
        const _never: never = action;
        return NextResponse.json({ ok: false, error: String(_never) }, { status: 400 });
      }
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}
