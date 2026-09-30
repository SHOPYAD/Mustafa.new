import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { GatewayRegistry } from "@/lib/gateways/core/GatewayRegistry";
import {
  readGatewaysStore,
  getGatewaySecretKeys,
} from "@/lib/server/payment-gateways-store";
import { decryptSecrets } from "@/lib/gateways/core/crypto";
import "@/lib/gateways";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const started = Date.now();

  try {
    const body = (await req.json()) as {
      tenantId?: string;
      kind: string;
      credentials?: Record<string, string>;
      testMode?: boolean;
    };

    const kind = body.kind || (body as Record<string, unknown>).gatewayKind as string;
    const tenantId = body.tenantId || "platform";

    if (!kind) {
      return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
    }

    if (!GatewayRegistry.has(kind)) {
      return NextResponse.json(
        { ok: false, error: `Gateway "${kind}" is not registered in the system.` },
        { status: 404 }
      );
    }

    // Resolve credentials: use incoming credentials merged with stored credentials
    const secretKeys = getGatewaySecretKeys(kind);
    const store = await readGatewaysStore();
    const storedConfig = store.tenants[tenantId]?.gateways?.[kind];
    const storedDecrypted = storedConfig?.credentials
      ? (decryptSecrets(storedConfig.credentials, secretKeys) as Record<string, string>)
      : {};

    const incoming = body.credentials || {};
    const effectiveCredentials: Record<string, unknown> = { ...storedDecrypted };

    for (const [k, v] of Object.entries(incoming)) {
      if (typeof v === "string") {
        const trimmed = v.trim();
        // If placeholder '••••', keep stored value
        if (trimmed && trimmed !== "••••" && trimmed !== "••••••••") {
          effectiveCredentials[k] = trimmed;
        }
      }
    }

    const testMode =
      body.testMode !== undefined
        ? body.testMode
        : storedConfig?.testMode ?? true;

    // Instantiate gateway probe
    const gateway = GatewayRegistry.resolve(kind, effectiveCredentials, { testMode });
    if (typeof gateway.testConnection !== "function") {
      return NextResponse.json({ ok: false, error: `اختبار الاتصال غير مدعوم لبوابة ${kind}` }, { status: 400 });
    }
    const result = await gateway.testConnection();

    const latencyMs = Date.now() - started;

    return NextResponse.json({
      ok: result.success,
      kind,
      latencyMs,
      message: result.message || (result.success ? "Connection test successful" : "Connection test failed"),
      testMode,
    });
  } catch (err: unknown) {
    const latencyMs = Date.now() - started;
    const message = err instanceof Error ? err.message : "Connection test encountered an error";
    return NextResponse.json({
      ok: false,
      latencyMs,
      message,
    });
  }
}
