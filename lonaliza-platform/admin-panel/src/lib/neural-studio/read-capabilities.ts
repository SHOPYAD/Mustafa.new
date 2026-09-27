/**
 * Server-owned read allowlist. A UI label or an LLM tool name is never authority.
 * These tools return observations, not refunds, synchronizations or deployments.
 */
export const READ_CAPABILITIES = {
  dashboard_bookings: { labelAr: "قراءة ملخص الحجوزات", domain: "bookings" },
  flights_runtime: { labelAr: "قراءة إعدادات محرك الطيران", domain: "flights" },
  hotels_runtime: { labelAr: "قراءة إعدادات محرك الفنادق", domain: "hotels" },
  cars_list: { labelAr: "قراءة كتالوج السيارات", domain: "mobility" },
  packages_list: { labelAr: "قراءة كتالوج الباقات", domain: "mobility" },
  tours_list: { labelAr: "قراءة كتالوج الجولات", domain: "mobility" },
  blog_list: { labelAr: "قراءة فهرس المقالات", domain: "cms" },
  comms_conversations: { labelAr: "قراءة عدد المحادثات", domain: "customers" },
  whatsapp_slots: { labelAr: "قراءة حالة اتصالات واتساب", domain: "customers" },
  nostr_social: { labelAr: "قراءة إعدادات نوستر", domain: "publishing" },
  ads_status: { labelAr: "قراءة ربط حسابات الإعلانات", domain: "growth" },
  b2b_sessions: { labelAr: "قراءة جلسات الشركات", domain: "b2b" },
  leads_database: { labelAr: "قراءة إحصاءات الشركات", domain: "b2b" },
} as const;
export type ReadCapability = keyof typeof READ_CAPABILITIES;
export function isReadCapability(value: unknown): value is ReadCapability {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(READ_CAPABILITIES, value);
}
// The other legacy directives promise effects their assigned read tools cannot perform.
export const LEGACY_VERIFIED_READS: Readonly<Record<string, ReadCapability>> = {
  "dir-inspect-b2b-sessions": "b2b_sessions",
  "dir-refresh-analytics": "dashboard_bookings",
};
