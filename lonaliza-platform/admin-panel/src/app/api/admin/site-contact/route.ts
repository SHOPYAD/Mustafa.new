import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getSiteContact, saveSiteContactFile } from "@/lib/server/site-contact-file";
import type { SiteContact } from "@/types/site-contact";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const contact = await getSiteContact();
  return NextResponse.json({ ok: true, contact });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<SiteContact>;
    const contact = await saveSiteContactFile(body as SiteContact);
    return NextResponse.json({ ok: true, contact });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
