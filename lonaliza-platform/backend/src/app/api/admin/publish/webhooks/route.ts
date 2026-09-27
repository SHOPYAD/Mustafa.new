import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteWebhook, listWebhooks, saveWebhook } from "@/lib/publish/webhooks";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const webhooks = await listWebhooks();
  return NextResponse.json({ ok: true, webhooks });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const webhook = await saveWebhook(await req.json());
    return NextResponse.json({ ok: true, webhook });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر حفظ الويب هوك" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "المعرّف مطلوب" }, { status: 400 });
  const deleted = await deleteWebhook(id);
  return NextResponse.json({ ok: deleted, deleted });
}
