import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { ensureEmailCollections } from "@/lib/server/email/collections";
import {
  getMailAuthDnsReport,
  readLastDelivery,
  requestHostHeader,
} from "@/lib/server/email/delivery";
import { getAdminTestEmail, getSmtpPublicStatus, savePocketBaseMailSettings } from "@/lib/server/email/smtp";
import { isMaskedPlaceholder } from "@/lib/server/env-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [smtp, collections, adminEmail, lastDelivery, dns] = await Promise.all([
    getSmtpPublicStatus(),
    ensureEmailCollections(),
    getAdminTestEmail(),
    readLastDelivery(),
    getMailAuthDnsReport({ requestHost: requestHostHeader(req) }),
  ]);
  return NextResponse.json({
    ok: true,
    smtp,
    collections,
    adminEmail,
    lastDelivery,
    dns,
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      enabled?: boolean;
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      authMethod?: string;
      tlsMode?: string;
      localName?: string;
      senderName?: string;
      senderAddress?: string;
    };
    const password = isMaskedPlaceholder(String(body.password || ""))
      ? undefined
      : body.password;
    const smtp = await savePocketBaseMailSettings({ ...body, password });
    return NextResponse.json({ ok: true, smtp });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر حفظ SMTP" },
      { status: 500 }
    );
  }
}
