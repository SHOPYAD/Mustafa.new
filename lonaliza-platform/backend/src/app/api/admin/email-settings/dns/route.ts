import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getMailAuthDnsReport,
  requestHostHeader,
} from "@/lib/server/email/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function liveDns(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const dns = await getMailAuthDnsReport({ requestHost: requestHostHeader(req) });
  return NextResponse.json({
    ok: true,
    dns,
    cache: "bypass",
  });
}

export async function GET(req: NextRequest) {
  return liveDns(req);
}

export async function POST(req: NextRequest) {
  return liveDns(req);
}
