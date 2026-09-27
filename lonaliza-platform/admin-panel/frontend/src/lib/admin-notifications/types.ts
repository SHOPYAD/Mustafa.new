export const ADMIN_NOTIFICATION_TYPES = ["visit", "register", "booking"] as const;

export type AdminNotificationType = (typeof ADMIN_NOTIFICATION_TYPES)[number];

export type AdminNotificationRecord = {
  id: string;
  type: AdminNotificationType;
  title_ar: string;
  body_ar: string;
  href: string;
  meta?: Record<string, unknown>;
  read: boolean;
  created: string;
};

export const ADMIN_NOTIFICATION_TITLES_AR: Record<AdminNotificationType, string> =
  {
    visit: "عميل زار الموقع",
    register: "عميل تسجّل",
    booking: "عميل حجز",
  };

export function isAdminNotificationType(
  value: string
): value is AdminNotificationType {
  return (ADMIN_NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export function titleArForType(type: AdminNotificationType): string {
  switch (type) {
    case "visit":
      return ADMIN_NOTIFICATION_TITLES_AR.visit;
    case "register":
      return ADMIN_NOTIFICATION_TITLES_AR.register;
    case "booking":
      return ADMIN_NOTIFICATION_TITLES_AR.booking;
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

export function hrefForType(type: AdminNotificationType): string {
  switch (type) {
    case "visit":
      return "";
    case "register":
      return "/admin/customers";
    case "booking":
      return "/admin/bookings";
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

export function announceKeyForNotification(
  item: Pick<AdminNotificationRecord, "id" | "type" | "meta">
): string {
  return announceKeysForNotification(item)[0] || `notif:${item.id}`;
}

export function announceKeysForNotification(
  item: Pick<AdminNotificationRecord, "id" | "type" | "meta">
): string[] {
  const keys = [`notif:${item.id}`];
  const meta = item.meta && typeof item.meta === "object" ? item.meta : {};
  const bookingId = String(meta.bookingId || "").trim();
  const source = String(meta.source || "").trim() || "booking";
  if (item.type === "booking" && bookingId) {
    keys.push(`booking:${bookingId}:${source}`);
  }
  return keys.filter(Boolean);
}
