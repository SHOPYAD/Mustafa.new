import { NextRequest, NextResponse } from "next/server";
import { getPaymentsPublicConfig } from "@/lib/server/payments-settings";
import {
  getTenantPaymentConfig,
  resolveGatewayForTenant,
} from "@/lib/server/payment-gateways-store";
import { GatewayRegistry } from "@/lib/gateways/core/GatewayRegistry";
import "@/lib/gateways";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const requestedTenant =
      url.searchParams.get("tenant")?.trim() ||
      req.headers.get("x-tenant-id")?.trim() ||
      "platform";

    const baseConfig = await getPaymentsPublicConfig();

    let activeGatewayInfo = {
      kind: "iyzico",
      displayName: "iyzico (Turkey & Global)",
      type: "card",
      testMode: baseConfig.iyzicoMode !== "production",
      isSystemDefault: true,
      logo: "/payment-gateways/iyzico.svg",
    };

    let tenantPaymentActive = baseConfig.iyzicoEnabled;

    try {
      const resolved = await resolveGatewayForTenant(requestedTenant);
      const meta = GatewayRegistry.list().find((g) => g.kind === resolved.kind);

      activeGatewayInfo = {
        kind: resolved.kind,
        displayName: meta?.displayName || resolved.kind,
        type: meta?.type || "card",
        testMode: resolved.testMode,
        isSystemDefault: resolved.kind === "iyzico",
        logo: `/payment-gateways/${resolved.kind}.svg`,
      };

      tenantPaymentActive = true;
    } catch {
      // Fallback to base iyzico configuration
    }

    return NextResponse.json(
      {
        ok: true,
        ...baseConfig,
        iyzicoEnabled: activeGatewayInfo.kind === "iyzico" ? tenantPaymentActive : baseConfig.iyzicoEnabled,
        onlinePaymentEnabled: tenantPaymentActive,
        activeGateway: activeGatewayInfo,
        tenantId: requestedTenant,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    const fallback = await getPaymentsPublicConfig();
    return NextResponse.json(
      { ok: true, ...fallback },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
