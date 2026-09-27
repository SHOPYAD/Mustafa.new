import type PocketBase from "pocketbase";
import type { CustomerRecord } from "@/lib/pocketbase/records";

export async function upsertCustomerFromUser(
  admin: PocketBase,
  user: { id: string; email?: string; name?: string }
): Promise<{ created: boolean }> {
  const email = String(user.email || "").trim().toLowerCase();
  const name = String(user.name || "").trim() || email || "Customer";
  if (!email) return { created: false };

  try {
    const existing = await admin
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`email="${email.replace(/"/g, "")}"`);
    const patch: Record<string, string> = {};
    if (!existing.user) patch.user = user.id;
    if (!existing.name && name) patch.name = name;
    if (Object.keys(patch).length) {
      await admin.collection("customers").update(existing.id, patch);
    }
    return { created: false };
  } catch {
    await admin.collection("customers").create({
      user: user.id,
      name,
      email,
      locale: "ar",
    });
    return { created: true };
  }
}
