import { z } from "zod";

export type CapabilityKind = "query" | "command";
export type CapabilityRisk = "low" | "medium" | "high";

export interface Capability<I extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string;
  domainId: string;
  /** عقدة الخريطة التي تُضاء عند التنفيذ. */
  nodeId: string;
  kind: CapabilityKind;
  risk: CapabilityRisk;
  target: { collection?: string; route?: string; fn?: string };
  titleAr: string;
  input: I;
  /** مصادر التحقق: ملف الخادم أو المسار الذي يُنفذ فعليًا. */
  evidence: string;
}

const id = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/, "معرّف غير صالح");
const collection = z.string().min(1).max(64).regex(/^[a-z][a-z0-9_]*$/, "اسم مجموعة غير صالح");

/** مجموعات تعديلها يمس المال أو الهوية أو الأمان: أي كتابة عليها عالية الخطورة. */
export const SENSITIVE_COLLECTIONS = new Set([
  "financial_transactions",
  "loyalty_wallets",
  "loyalty_ledger",
  "b2b_wallet_transactions",
  "reseller_wallets",
  "reseller_licenses",
  "admin_settings",
  "platform_settings",
  "users",
  "customers",
]);

function cap<I extends z.ZodTypeAny>(c: Capability<I>): Capability<I> {
  return c;
}

export const CAPABILITIES = [
  cap({ id: "records.list", domainId: "platform", nodeId: "agent.supervisor", kind: "query", risk: "low", target: { fn: "pb.getList" }, titleAr: "عرض سجلات مجموعة", evidence: "api/admin/studio/records", input: z.object({ collection, page: z.number().int().min(1).optional(), q: z.string().max(80).optional() }) }),
  cap({ id: "records.get", domainId: "platform", nodeId: "agent.supervisor", kind: "query", risk: "low", target: { fn: "pb.getOne" }, titleAr: "قراءة سجل", evidence: "api/admin/studio/records", input: z.object({ collection, id }) }),
  cap({
    id: "records.update",
    domainId: "platform",
    nodeId: "agent.supervisor",
    kind: "command",
    risk: "medium",
    target: { fn: "pb.update" },
    titleAr: "تعديل سجل",
    evidence: "lib/studio/capabilities/executor.server.ts",
    input: z.object({ collection, id, patch: z.record(z.unknown()).refine((p) => Object.keys(p).length > 0, "لا تغييرات"), expectedUpdated: z.string().optional() }),
  }),
  cap({ id: "records.create", domainId: "platform", nodeId: "agent.supervisor", kind: "command", risk: "medium", target: { fn: "pb.create" }, titleAr: "إنشاء سجل", evidence: "lib/studio/capabilities/executor.server.ts", input: z.object({ collection, data: z.record(z.unknown()) }) }),
  cap({ id: "records.delete", domainId: "platform", nodeId: "agent.supervisor", kind: "command", risk: "high", target: { fn: "pb.delete" }, titleAr: "حذف سجل", evidence: "lib/studio/capabilities/executor.server.ts", input: z.object({ collection, id, expectedUpdated: z.string().optional() }) }),

  cap({ id: "bookings.cancellation.list", domainId: "bookings", nodeId: "bookings.cancellations", kind: "query", risk: "low", target: { route: "/api/admin/cancellations", fn: "listPendingCancellations" }, titleAr: "طلبات الإلغاء المعلقة", evidence: "lib/server/hotel-cancellations.ts", input: z.object({}) }),
  cap({
    id: "bookings.cancellation.approve",
    domainId: "bookings",
    nodeId: "bookings.cancellations",
    kind: "command",
    risk: "high",
    target: { collection: "hotel_bookings", fn: "approveCancel" },
    titleAr: "اعتماد إلغاء واسترداد",
    evidence: "lib/server/hotel-cancellations.ts#approveCancel",
    input: z.object({ bookingId: id, feeAmount: z.number().min(0).max(100000).default(0), note: z.string().max(500).default("") }),
  }),
  cap({ id: "bookings.cancellation.reject", domainId: "bookings", nodeId: "bookings.cancellations", kind: "command", risk: "medium", target: { collection: "hotel_bookings", fn: "rejectCancel" }, titleAr: "رفض طلب إلغاء", evidence: "lib/server/hotel-cancellations.ts#rejectCancel", input: z.object({ bookingId: id, note: z.string().min(3, "اكتب سبب الرفض").max(500) }) }),
  cap({
    id: "bookings.change.resolve",
    domainId: "bookings",
    nodeId: "bookings.cancellations",
    kind: "command",
    risk: "medium",
    target: { collection: "hotel_bookings", fn: "resolveChangeRequest" },
    titleAr: "حسم طلب تعديل حجز",
    evidence: "lib/server/hotel-cancellations.ts#resolveChangeRequest",
    input: z.object({ bookingId: id, action: z.enum(["done", "reject"]), note: z.string().max(500).default(""), newCheckIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), newCheckOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }),
  }),
  cap({ id: "bookings.enquiry.set_status", domainId: "bookings", nodeId: "bookings.enquiries", kind: "command", risk: "medium", target: { collection: "enquiry_bookings" }, titleAr: "تغيير حالة طلب حجز", evidence: "pocketbase:enquiry_bookings.status", input: z.object({ id, status: z.enum(["new", "in-progress", "resolved"]), expectedUpdated: z.string().optional() }) }),
  cap({ id: "reviews.moderate", domainId: "bookings", nodeId: "bookings.reviews", kind: "command", risk: "medium", target: { collection: "customer_reviews", fn: "moderateReviewAdmin" }, titleAr: "إشراف على تقييم", evidence: "lib/server/customer-reviews-store.ts#moderateReviewAdmin", input: z.object({ reviewId: id, action: z.enum(["approve", "hide", "delete"]), adminNotes: z.string().max(500).optional() }) }),

  cap({
    id: "admin.route.call",
    domainId: "platform",
    nodeId: "agent.supervisor",
    kind: "command",
    risk: "high",
    target: { fn: "internal admin API" },
    titleAr: "تنفيذ إجراء في لوحة الإدارة",
    evidence: "src/app/api/admin/** (نفس مسارات اللوحة العادية)",
    input: z.object({
      route: z.string().max(200).regex(/^\/api\/admin\/[a-zA-Z0-9_\-/.[\]]+(\?[^#\s]*)?$/, "مسار إدارة غير صالح"),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
      body: z.record(z.unknown()).optional(),
    }),
  }),
  cap({ id: "studio.navigate", domainId: "platform", nodeId: "agent.supervisor", kind: "query", risk: "low", target: { fn: "client.flyTo" }, titleAr: "عرض خريطة", evidence: "lib/studio/graph/maps.ts", input: z.object({ mapId: z.string().max(80), nodeId: z.string().max(120).optional() }) }),
  cap({ id: "studio.open_table", domainId: "platform", nodeId: "agent.supervisor", kind: "query", risk: "low", target: { fn: "client.openTable" }, titleAr: "فتح جدول", evidence: "shell/windows/TableWindow.tsx", input: z.object({ collection, q: z.string().max(80).optional() }) }),
  cap({ id: "studio.open_record", domainId: "platform", nodeId: "agent.supervisor", kind: "query", risk: "low", target: { fn: "client.openRecord" }, titleAr: "فتح سجل", evidence: "shell/windows/RecordWindow", input: z.object({ collection, id }) }),

  cap({
    id: "briefing.readiness",
    domainId: "platform",
    nodeId: "agent.supervisor",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/studio/briefing" },
    titleAr: "تقرير جاهزية المنصة",
    evidence: "api/admin/studio/briefing/route.ts",
    input: z.object({}),
  }),
  cap({
    id: "finance.overview.read",
    domainId: "finance",
    nodeId: "finance.overview",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/finance/overview" },
    titleAr: "ملخص مالي",
    evidence: "api/admin/finance/overview/route.ts",
    input: z.object({}),
  }),
  cap({
    id: "publish.posts.list",
    domainId: "marketing",
    nodeId: "publish.calendar",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/publish/posts" },
    titleAr: "منشورات النشر",
    evidence: "api/admin/publish/posts/route.ts",
    input: z.object({ page: z.number().int().min(1).optional() }),
  }),
  cap({
    id: "automation.jobs.list",
    domainId: "automation",
    nodeId: "auto.jobs",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/automation/jobs" },
    titleAr: "مهام الأتمتة",
    evidence: "api/admin/automation/jobs/route.ts",
    input: z.object({}),
  }),
  cap({
    id: "flights.postops.read",
    domainId: "flights",
    nodeId: "flights.postops",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/flights/post-ops" },
    titleAr: "عمليات ما بعد الحجز",
    evidence: "api/admin/flights/post-ops/route.ts",
    input: z.object({}),
  }),
  cap({
    id: "reseller.wallets.read",
    domainId: "resale",
    nodeId: "b2b.wallets",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/resale/wallets" },
    titleAr: "محافظ الموزعين",
    evidence: "api/admin/resale/wallets/route.ts",
    input: z.object({}),
  }),
  cap({
    id: "legal.deletions.list",
    domainId: "legal",
    nodeId: "legal.deletions",
    kind: "query",
    risk: "low",
    target: { route: "/api/admin/legal/deletions" },
    titleAr: "طلبات حذف الحسابات",
    evidence: "api/admin/legal/deletions/route.ts",
    input: z.object({}),
  }),
] as const;

export type CapabilityId = (typeof CAPABILITIES)[number]["id"];

export const CAPABILITY_BY_ID: Record<string, Capability> = Object.fromEntries(CAPABILITIES.map((c) => [c.id, c as Capability]));

/** مسارات إعدادات واختبار: الكتابة عليها متوسطة الخطورة (لا دفع ولا حذف ولا نشر عام). */
const SETTINGS_ROUTE = /^\/api\/admin\/[a-z0-9\-/]*(settings|config|configs|test|connect-test|templates)(\/|$|\?)/i;
const BLOCKED_ROUTE = /^\/api\/admin\/(studio\/capabilities|session|pocketbase\/superuser|env)(\/|$|\?)/;

export function isBlockedRoute(route: string) {
  return BLOCKED_ROUTE.test(route);
}

/** الخطورة الفعلية: الكتابة على مجموعة حساسة ترفع الخطورة إلى high. */
export function effectiveRisk(c: Capability, input: Record<string, unknown>): CapabilityRisk {
  if (c.id === "admin.route.call") {
    const method = String(input.method || "GET");
    if (method === "GET") return "low";
    return SETTINGS_ROUTE.test(String(input.route)) && method !== "DELETE" ? "medium" : "high";
  }
  if (c.kind === "command" && typeof input.collection === "string" && SENSITIVE_COLLECTIONS.has(input.collection)) return "high";
  return c.risk;
}

/** هل يمكن التنفيذ دون سؤال المدير؟ high دائمًا يحتاج اعتمادًا. */
export function needsApproval(risk: CapabilityRisk, kind: CapabilityKind, autoExecute: boolean) {
  if (kind === "query" || risk === "low") return false;
  if (risk === "high") return true;
  return !autoExecute;
}

/** قدرات الأوامر المتاحة لخريطة (لعرضها في نافذة العقدة). */
export function capabilitiesForNode(nodeId: string): Capability[] {
  return CAPABILITIES.filter((c) => c.nodeId === nodeId).map((c) => c as Capability);
}
