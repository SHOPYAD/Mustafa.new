import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import {
  getExcludedContacts,
  saveExcludedContact,
  removeExcludedContact,
} from "@/lib/automation/excluded-contacts-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const contacts = getExcludedContacts();
    return NextResponse.json({ ok: true, contacts });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to load excluded contacts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { phone?: string; name?: string; reason?: string };
    if (!body.phone) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف مطلوب" }, { status: 400 });
    }
    const saved = saveExcludedContact({
      phone: body.phone,
      name: body.name,
      reason: body.reason,
    });
    return NextResponse.json({ ok: true, contact: saved });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to save excluded contact" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "معرف الرقم مطلوب" }, { status: 400 });
    }
    const removed = removeExcludedContact(id);
    return NextResponse.json({ ok: true, removed });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to delete excluded contact" },
      { status: 500 }
    );
  }
}
