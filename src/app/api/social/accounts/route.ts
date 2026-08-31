import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listSocialDashboard } from "@/lib/social/accounts";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const dashboard = await listSocialDashboard(req);
  return NextResponse.json({
    ok: true,
    accounts: dashboard.accounts,
    credentials: dashboard.credentials,
  });
}
