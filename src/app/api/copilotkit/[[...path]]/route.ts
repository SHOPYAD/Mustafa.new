import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { BuiltInAgent } from "@copilotkitnext/agent";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveGeminiApiKey, getGeminiPublicConfig } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { buildBuilderAgentSystemPrompt } from "@/lib/server/builder-agent-prompt";
import { parseCopilotScope, type CopilotScope } from "@/lib/builder-agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SINGLE_METHODS = new Set(["info", "agent/run", "agent/connect", "agent/stop", "transcribe"]);

type AgentCfg = {
  apiKey: string;
  model: string;
  systemPrompt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resolveScope(req: NextRequest): CopilotScope {
  return parseCopilotScope(req.headers.get("x-copilot-scope") || req.nextUrl.searchParams.get("scope"));
}

function resolveMode(req: NextRequest): "chat" | "automation" {
  const raw = req.headers.get("x-copilot-mode") || req.nextUrl.searchParams.get("mode");
  return raw === "automation" ? "automation" : "chat";
}

async function resolveCfg(scope: CopilotScope, mode: "chat" | "automation"): Promise<AgentCfg> {
  const [{ apiKey }, config, systemPrompt] = await Promise.all([
    resolveGeminiApiKey(),
    getGeminiPublicConfig(),
    buildBuilderAgentSystemPrompt(scope, mode),
  ]);
  return {
    apiKey: apiKey || "",
    model: normalizeGeminiModelId(config.model),
    systemPrompt,
  };
}

function buildAdapter(cfg: AgentCfg) {
  const client = new OpenAI({
    apiKey: cfg.apiKey || "not-configured",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
  return new OpenAIAdapter({
    openai: client,
    model: cfg.model,
    keepSystemRole: true,
    disableParallelToolCalls: true,
  });
}

/** Native Google AI SDK model. OpenAI-compat `/responses` 404s on Gemini. */
function geminiAgentModel(model: string): string {
  const id = model.replace(/^google\//, "").replace(/^gemini\//, "").trim();
  return `google/${id || "gemini-3.6-flash"}`;
}

function logRunPreview(res: Response, method: string): Response {
  if (method !== "agent/run" || !res.body) return res;
  const [logSide, passSide] = res.body.tee();
  void (async () => {
    try {
      const reader = logSide.getReader();
      const first = await reader.read();
      const chunk = first.value;
      const preview =
        chunk instanceof Uint8Array || Buffer.isBuffer(chunk)
          ? Buffer.from(chunk).toString("utf8").slice(0, 200)
          : "(no-bytes)";
      console.log("[copilotkit] agent/run", res.status, preview.replace(/\s+/g, " ") || "(empty)");
      await reader.cancel();
    } catch (err) {
      console.error("[copilotkit] agent/run preview failed", err instanceof Error ? err.message : err);
    }
  })();
  return new Response(passSide, { status: res.status, headers: res.headers });
}

function singleRouteUrl(req: NextRequest): string {
  return `${req.nextUrl.origin}/api/copilotkit${req.nextUrl.search}`;
}

function jsonRequest(req: NextRequest, body: unknown): Request {
  const headers = new Headers(req.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  return new Request(singleRouteUrl(req), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * CopilotKit 1.54 Next helper is AG-UI single-route (POST { method, params, body }).
 * The 1.54 client defaults to that, but rest paths (/info, /agent/:id/run) still
 * appear if useSingleEndpoint is off. Normalize both into the single-route envelope.
 */
function toSingleRouteRequest(req: NextRequest, parsed: Record<string, unknown> | null, rawText: string): Request {
  const path = req.nextUrl.pathname.replace(/\/+$/, "");
  const restAgent = path.match(/\/api\/copilotkit\/agent\/([^/]+)\/(run|connect|stop)(?:\/([^/]+))?$/);

  if (restAgent) {
    const [, agentId, action, threadId] = restAgent;
    const method = action === "stop" ? "agent/stop" : action === "connect" ? "agent/connect" : "agent/run";
    return jsonRequest(req, {
      method,
      params: { agentId, ...(threadId ? { threadId } : {}) },
      ...(parsed ? { body: parsed } : {}),
    });
  }

  if (path.endsWith("/api/copilotkit/info") || path.endsWith("/copilotkit/info")) {
    return jsonRequest(req, { method: "info" });
  }

  if (parsed && typeof parsed.method === "string" && SINGLE_METHODS.has(parsed.method)) {
    return new Request(singleRouteUrl(req), {
      method: "POST",
      headers: req.headers,
      body: rawText,
    });
  }

  if (parsed && typeof parsed.query === "string") {
    throw new Error("graphql_client_not_supported");
  }

  return new Request(singleRouteUrl(req), {
    method: "POST",
    headers: req.headers,
    body: rawText || JSON.stringify({ method: "info" }),
  });
}

function buildHandler(cfg: AgentCfg) {
  const adapter = buildAdapter(cfg);
  const runtimeInstance = new CopilotRuntime({
    agents: {
      default: new BuiltInAgent({
        model: geminiAgentModel(cfg.model),
        apiKey: cfg.apiKey,
        prompt: cfg.systemPrompt,
        maxSteps: 24,
        temperature: 0.45,
      }),
    },
  });

  return copilotRuntimeNextJSAppRouterEndpoint({
    runtime: runtimeInstance,
    serviceAdapter: adapter,
    endpoint: "/api/copilotkit",
  }).handleRequest;
}

async function healthResponse(req: NextRequest) {
  const scope = resolveScope(req);
  const cfg = await resolveCfg(scope, resolveMode(req));
  return NextResponse.json({
    ok: true,
    protocol: "ag-ui-single-route",
    hasGeminiKey: Boolean(cfg.apiKey),
    model: cfg.model,
    scope,
  });
}

function parseBody(text: string): Record<string, unknown> | null {
  if (!text) return null;
  try {
    return asRecord(JSON.parse(text));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  if (req.nextUrl.searchParams.get("health") === "1") {
    return healthResponse(req);
  }

  const bodyText = await req.text();
  const parsed = parseBody(bodyText);
  const method = typeof parsed?.method === "string" ? parsed.method : "";
  const isMetadata = method === "info" || method === "agent/connect" || method === "agent/stop";
  const cfg = await resolveCfg(resolveScope(req), resolveMode(req));

  if (!cfg.apiKey && !isMetadata && !req.nextUrl.pathname.endsWith("/info")) {
    return NextResponse.json(
      {
        error: "gemini_no_api_key",
        message: "Gemini key is not configured. Save it in AI Settings or set GEMINI_API_KEY.",
      },
      { status: 400 }
    );
  }

  try {
    const normalized = toSingleRouteRequest(req, parsed, bodyText);
    const res = await buildHandler(cfg)(normalized);
    return logRunPreview(res, method);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copilot runtime failed";
    if (message === "graphql_client_not_supported") {
      return NextResponse.json(
        {
          error: "agui_required",
          message:
            "This runtime speaks CopilotKit 1.54 AG-UI (POST { method: info|agent/run }). GraphQL generateCopilotResponse is not served.",
        },
        { status: 400 }
      );
    }
    console.error("[copilotkit]", message);
    return NextResponse.json({ error: "copilot_runtime_failed", message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  if (req.nextUrl.searchParams.get("health") === "1") {
    return healthResponse(req);
  }
  const cfg = await resolveCfg(resolveScope(req), resolveMode(req));
  try {
    const normalized = toSingleRouteRequest(req, { method: "info" }, JSON.stringify({ method: "info" }));
    return await buildHandler(cfg)(normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copilot runtime failed";
    return NextResponse.json({ error: "copilot_runtime_failed", message }, { status: 502 });
  }
}

export async function OPTIONS(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const cfg = await resolveCfg(resolveScope(req), resolveMode(req));
  return buildHandler(cfg)(req);
}
