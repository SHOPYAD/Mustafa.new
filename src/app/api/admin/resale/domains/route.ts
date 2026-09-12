import { resolve4 } from "dns/promises";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getCustomDomainRequests,
  updateCustomDomainStatus,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const requests = await getCustomDomainRequests(status);

  return NextResponse.json({
    ok: true,
    requests,
    domains: requests,
    count: requests.length,
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "approve" | "reject" | "verify_domain" | "reject_domain" | "check_dns";
      requestId?: string;
      domainId?: string;
      domain?: string;
      notes?: string;
    };

    if (body.action === "check_dns" && body.domain) {
      let resolvedIps: string[] = [];
      let ok = false;
      try {
        resolvedIps = await resolve4(body.domain);
        ok = resolvedIps.length > 0;
      } catch {}
      return NextResponse.json({
        ok: true,
        resolved: ok,
        ips: resolvedIps,
      });
    }

    const reqId = body.requestId || body.domainId;
    const isApprove = body.action === "approve" || body.action === "verify_domain";
    const isReject = body.action === "reject" || body.action === "reject_domain";

    if (!reqId || (!isApprove && !isReject)) {
      return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
    }

    const targetStatus: "approved" | "rejected" = isApprove ? "approved" : "rejected";
    const updated = await updateCustomDomainStatus(reqId, targetStatus, body.notes);

    return NextResponse.json({
      ok: true,
      request: updated,
      message: isApprove
        ? "تمت الموافقة على الدومين وتفعيله للمستأجر بنجاح"
        : "تم رفض الطلب",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process domain request";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
