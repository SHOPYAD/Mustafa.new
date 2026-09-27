/**
 * Admin auth — server-minted HttpOnly signed cookie via /api/admin/session.
 */

import { unsubscribeAdminPush } from "@/lib/admin-notifications/client";

export async function checkAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => ({}))) as { authenticated?: boolean };
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

/** @deprecated Use checkAuthenticated(). Sync localStorage gate is gone. */
export function isAuthenticated(): boolean {
  return false;
}

export async function login(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) {
      return { ok: true };
    }
    if (res.status === 429) {
      return { ok: false, error: "تم حظر المحاولات مؤقتاً لكثرتها. يرجى الانتظار دقيقتين والمحاولة مجدداً." };
    }
    return { ok: false, error: data.error || "اسم المستخدم أو كلمة المرور غير صحيحة" };
  } catch {
    return { ok: false, error: "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً" };
  }
}

export async function logout(): Promise<void> {
  try {
    await unsubscribeAdminPush();
  } catch {
    /* ignore */
  }
  try {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch {
    /* ignore */
  }
}
