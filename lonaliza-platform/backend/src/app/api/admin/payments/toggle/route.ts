import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  toggleTenantGateway,
  setTenantActiveGateway,
  getTenantPaymentConfig,
} from "@/lib/server/payment-gateways-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      tenantId?: string;
      kind: string;
      enabled?: boolean;
      makeActive?: boolean;
    };

    const tenantId = body.tenantId || "platform";
    const kind = body.kind || (body as Record<string, unknown>).gatewayKind as string;

    if (!kind) {
      return NextResponse.json({ ok: false, error: "kind is required" }, { status: 400 });
    }

    if (body.enabled !== undefined) {
      await toggleTenantGateway(tenantId, kind, body.enabled);
    }

    if (body.makeActive) {
      await setTenantActiveGateway(tenantId, kind);
    }

    const updated = await getTenantPaymentConfig(tenantId);
    return NextResponse.json({
      ok: true,
      tenantId,
      activeGateway: updated.activeGateway,
      config: updated.gateways[kind],
      message: body.makeActive
        ? `تم تعيين البوابة (${kind}) كبوابة دفع رئيسية ونشطة بنجاح`
        : body.enabled
        ? `تم تفعيل البوابة (${kind}) بنجاح`
        : `تم تعطيل البوابة (${kind}) بنجاح`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle gateway";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
