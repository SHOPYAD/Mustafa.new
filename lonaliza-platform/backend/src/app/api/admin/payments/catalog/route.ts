import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getCatalogForTenant,
  getAvailableTenants,
  getTenantPaymentConfig,
} from "@/lib/server/payment-gateways-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "platform";

    const catalog = await getCatalogForTenant(tenantId);
    const tenants = await getAvailableTenants();
    const config = await getTenantPaymentConfig(tenantId);

    return NextResponse.json({
      ok: true,
      catalog,
      tenants,
      tenantId,
      activeGateway: config.activeGateway || "iyzico",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load catalog";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
