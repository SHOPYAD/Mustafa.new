import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { sendAdminPush } from "@/lib/server/admin-push";
import {
  hrefForType,
  isAdminNotificationType,
  titleArForType,
  type AdminNotificationRecord,
  type AdminNotificationType,
} from "@/lib/admin-notifications/types";

function asRecord(row: Record<string, unknown>): AdminNotificationRecord | null {
  const type = String(row.type || "");
  if (!isAdminNotificationType(type)) return null;
  const metaRaw = row.meta;
  return {
    id: String(row.id || ""),
    type,
    title_ar: String(row.title_ar || titleArForType(type)),
    body_ar: String(row.body_ar || ""),
    href: String(row.href || hrefForType(type)),
    meta:
      metaRaw && typeof metaRaw === "object" && !Array.isArray(metaRaw)
        ? (metaRaw as Record<string, unknown>)
        : {},
    read: Boolean(row.read),
    created: String(row.created || ""),
  };
}

export async function createAdminNotification(opts: {
  type: AdminNotificationType;
  body_ar: string;
  title_ar?: string;
  href?: string;
  meta?: Record<string, unknown>;
}): Promise<AdminNotificationRecord | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const created = await pb.collection("admin_notifications").create({
      type: opts.type,
      title_ar: opts.title_ar || titleArForType(opts.type),
      body_ar: String(opts.body_ar || "").slice(0, 400),
      href: opts.href ?? hrefForType(opts.type),
      meta: opts.meta || {},
      read: false,
    });
    const record = asRecord(created as unknown as Record<string, unknown>);
    if (record) {
      void sendAdminPush(record).catch(() => undefined);
    }
    return record;
  } catch {
    return null;
  }
}

export async function listAdminNotifications(limit = 40): Promise<{
  items: AdminNotificationRecord[];
  unread: number;
}> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { items: [], unread: 0 };
  try {
    const page = await pb.collection("admin_notifications").getList(1, limit, {
      sort: "-created",
    });
    const items = page.items
      .map((row) => asRecord(row as unknown as Record<string, unknown>))
      .filter((row): row is AdminNotificationRecord => Boolean(row));
    const unreadPage = await pb.collection("admin_notifications").getList(1, 1, {
      filter: "read = false",
    });
    return { items, unread: unreadPage.totalItems };
  } catch {
    return { items: [], unread: 0 };
  }
}

export async function markAdminNotificationsRead(opts: {
  ids?: string[];
  all?: boolean;
}): Promise<number> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return 0;
  try {
    if (opts.all) {
      const unread = await pb.collection("admin_notifications").getFullList({
        filter: "read = false",
        fields: "id",
      });
      await Promise.all(
        unread.map((row) =>
          pb.collection("admin_notifications").update(row.id, { read: true })
        )
      );
      return unread.length;
    }
    const ids = (opts.ids || []).map((id) => String(id).trim()).filter(Boolean);
    await Promise.all(
      ids.map((id) =>
        pb.collection("admin_notifications").update(id, { read: true })
      )
    );
    return ids.length;
  } catch {
    return 0;
  }
}

export async function findRecentVisitNotifications(): Promise<
  AdminNotificationRecord[]
> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  try {
    const page = await pb.collection("admin_notifications").getList(1, 40, {
      filter: 'type = "visit"',
      sort: "-created",
    });
    return page.items
      .map((row) => asRecord(row as unknown as Record<string, unknown>))
      .filter((row): row is AdminNotificationRecord => Boolean(row));
  } catch {
    return [];
  }
}
