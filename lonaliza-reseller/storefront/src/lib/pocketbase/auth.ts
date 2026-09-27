import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { getPocketBaseUrl, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const PB_AUTH_COOKIE = "alrayyan_pb_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

export function pbAuthCookieHeader(payload: string, maxAge = COOKIE_MAX_AGE): string {
  return `${PB_AUTH_COOKIE}=${encodeURIComponent(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

export function clearPbAuthCookieHeader(): string {
  return `${PB_AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}

export function serializePbAuth(token: string, model: { id: string; email?: string; name?: string }): string {
  return JSON.stringify({
    token,
    model: {
      id: model.id,
      email: model.email || "",
      name: model.name || "",
    },
  });
}

export function parsePbAuthCookie(raw: string | undefined | null): {
  token: string;
  model: CustomerUser;
} | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as {
      token?: string;
      model?: { id?: string; email?: string; name?: string };
    };
    if (!parsed.token || !parsed.model?.id) return null;
    return {
      token: parsed.token,
      model: {
        id: parsed.model.id,
        email: parsed.model.email || "",
        name: parsed.model.name || "",
      },
    };
  } catch {
    return null;
  }
}

function readCookieHeader(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || "";
  }
  return null;
}

export async function getRequestCustomer(
  req?: Request
): Promise<CustomerUser | null> {
  let raw = "";
  if (req) {
    raw = readCookieHeader(req.headers.get("cookie") || "", PB_AUTH_COOKIE) || "";
  } else {
    const store = await cookies();
    raw = store.get(PB_AUTH_COOKIE)?.value || "";
  }
  const parsed = parsePbAuthCookie(raw);
  if (!parsed) return null;

  try {
    const pbUrl = await getPocketBaseUrl();
    const pb = new PocketBase(pbUrl);
    pb.autoCancellation(false);
    pb.authStore.save(parsed.token, {
      id: parsed.model.id,
      email: parsed.model.email,
      name: parsed.model.name,
      collectionId: "users",
      collectionName: "users",
    });

    const refreshPromise = pb.collection("users").authRefresh();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("auth_timeout")), 1800)
    );

    const auth = await Promise.race([refreshPromise, timeoutPromise]);
    let avatarUrl = String(auth.record.avatar_url || "");
    if (!avatarUrl && auth.record.avatar) {
      avatarUrl = `${pbUrl}/api/files/users/${auth.record.id}/${auth.record.avatar}`;
    }
    return {
      id: auth.record.id,
      email: String(auth.record.email || parsed.model.email),
      name: String(auth.record.name || parsed.model.name || ""),
      avatarUrl: avatarUrl || undefined,
    };
  } catch {
    // Instant resilient fallback from parsed cookie model without blocking
    return {
      id: parsed.model.id,
      email: parsed.model.email,
      name: parsed.model.name || "",
      avatarUrl: undefined,
    };
  }
}

export async function createUserPocketBase(authCookie?: string): Promise<PocketBase> {
  const pb = new PocketBase(await getPocketBaseUrl());
  pb.autoCancellation(false);
  const parsed = parsePbAuthCookie(authCookie);
  if (parsed) {
    pb.authStore.save(parsed.token, {
      id: parsed.model.id,
      email: parsed.model.email,
      name: parsed.model.name,
      collectionId: "users",
      collectionName: "users",
    });
  }
  return pb;
}
