import { promises as fs } from "fs";
import path from "path";
import webpush from "web-push";
import { ensureVapidKeys } from "@/lib/server/vapid";
import type { AdminNotificationRecord } from "@/lib/admin-notifications/types";

type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  updatedAt: string;
};

type StoreFile = {
  subscriptions: StoredSubscription[];
};

const STORE_FILE = path.join(process.cwd(), ".data", "admin-push-subs.json");

async function readStore(): Promise<StoredSubscription[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [];
  } catch {
    return [];
  }
}

async function writeStore(subscriptions: StoredSubscription[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  const payload: StoreFile = { subscriptions };
  await fs.writeFile(STORE_FILE, JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

function asSubscription(raw: unknown): StoredSubscription | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const endpoint = String(row.endpoint || "").trim();
  const keysRaw = row.keys;
  if (!endpoint.startsWith("https://") || !keysRaw || typeof keysRaw !== "object") {
    return null;
  }
  const keys = keysRaw as Record<string, unknown>;
  const p256dh = String(keys.p256dh || "").trim();
  const auth = String(keys.auth || "").trim();
  if (!p256dh || !auth) return null;
  return {
    endpoint,
    keys: { p256dh, auth },
    updatedAt: new Date().toISOString(),
  };
}

export async function saveAdminPushSubscription(raw: unknown): Promise<boolean> {
  const sub = asSubscription(raw);
  if (!sub) return false;
  const current = await readStore();
  const next = current.filter((row) => row.endpoint !== sub.endpoint);
  next.push(sub);
  await writeStore(next.slice(-20));
  return true;
}

export async function removeAdminPushSubscription(endpoint: string): Promise<void> {
  const target = String(endpoint || "").trim();
  if (!target) return;
  const current = await readStore();
  await writeStore(current.filter((row) => row.endpoint !== target));
}

export async function sendAdminPush(
  item: AdminNotificationRecord
): Promise<void> {
  const subs = await readStore();
  if (!subs.length) return;

  const vapid = await ensureVapidKeys();
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = JSON.stringify({
    id: item.id,
    title: item.title_ar,
    body: item.body_ar || "",
    href: item.href || "/admin",
    tag: `admin-${item.id}`,
  });

  const stale: string[] = [];
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload, {
          TTL: 60 * 60,
          urgency: "high",
        });
      } catch (err) {
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;
        if (status === 404 || status === 410) {
          stale.push(sub.endpoint);
        }
      }
    })
  );

  if (stale.length) {
    const keep = (await readStore()).filter((row) => !stale.includes(row.endpoint));
    await writeStore(keep);
  }
}
