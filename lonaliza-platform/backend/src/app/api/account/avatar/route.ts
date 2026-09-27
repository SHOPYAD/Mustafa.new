import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { saveUploadedImage } from "@/lib/server/branding-files";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });
    }

    const saved = await saveUploadedImage({ file, folder: "media" });
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      try {
        await pb.collection("users").update(user.id, { avatar_url: saved.url });
      } catch {
        /* users table might not have avatar_url */
      }
      try {
        const customer = await pb
          .collection("customers")
          .getFirstListItem(`user = "${user.id}" || email = "${user.email}"`);
        await pb.collection("customers").update(customer.id, {
          user: user.id,
          notes: JSON.stringify({
            ...(customer.notes && customer.notes.startsWith("{") ? JSON.parse(customer.notes) : {}),
            avatarUrl: saved.url,
          }),
        });
      } catch {
        try {
          await pb.collection("customers").create({
            user: user.id,
            email: user.email,
            name: user.name,
            notes: JSON.stringify({ avatarUrl: saved.url }),
          });
        } catch {
          /* proceed */
        }
      }
    }

    return NextResponse.json({ ok: true, avatarUrl: saved.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "avatar_upload_failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
