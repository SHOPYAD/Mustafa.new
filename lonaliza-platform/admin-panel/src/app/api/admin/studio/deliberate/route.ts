import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  deliberateWithPythonBrain,
  checkPythonBrainHealth,
  searchBrainMemory,
  addBrainMemory,
} from "@/lib/server/python-brain-client";

export const runtime = "nodejs";

export async function GET() {
  const health = await checkPythonBrainHealth();
  return NextResponse.json({
    ok: Boolean(health),
    health: health || {
      status: "fallback",
      service: "lonaliza-python-brain",
      telemetry: { mode: "standalone_fallback" },
    },
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      query: string;
      userId?: string;
      conversationId?: string;
      context?: Record<string, unknown>;
      action?: "deliberate" | "search_memory" | "add_memory";
      memoryContent?: string;
      memoryType?: "episodic" | "semantic" | "procedural";
    };

    if (body.action === "search_memory") {
      const memRes = await searchBrainMemory(body.query || "", body.userId);
      return NextResponse.json({ ok: true, results: memRes.results });
    }

    if (body.action === "add_memory" && body.userId && body.memoryContent) {
      const addRes = await addBrainMemory(
        body.userId,
        body.memoryContent,
        body.memoryType || "semantic",
        body.context
      );
      return NextResponse.json({ ok: addRes.ok, memory: addRes.memory });
    }

    if (!body.query?.trim()) {
      return NextResponse.json({ ok: false, error: "Query is required" }, { status: 400 });
    }

    const result = await deliberateWithPythonBrain(body.query.trim(), {
      userId: body.userId || "admin_supervisor",
      conversationId: body.conversationId,
      context: body.context,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
