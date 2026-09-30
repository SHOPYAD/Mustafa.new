/**
 * نموذج الواجهة 03 (الحجوزات والإلغاء والتقييمات) ومحوّل بياناتها الحية.
 * المواضع مقاسة من 03-bookings-cancellations.png بمقاس 1672×941.
 */
export type ClusterTone = "gold" | "cyan" | "magenta";
export type RelationType = "contains" | "depends_on" | "links_domain";

export type MetricKey = "core" | "cancel" | "refund" | "review" | "confirm" | "payment" | "supplier" | "verify" | "track";

export interface Pt {
  x: number;
  y: number;
}

export interface BookingCluster {
  id: string;
  /** معرف المكوّن الثابت من مواصفة الشاشة إن وُجد. */
  specId?: string;
  label: string;
  tone: ClusterTone;
  hub: Pt;
  title: { right: number; y: number; size: number };
  bullets: { x: number; ys: number[] };
  /** موضع النص بالنسبة للنقطة. */
  textSide: "left" | "right";
  items: string[];
  relationType: RelationType;
  evidenceRef: string;
  capability?: string;
  linkScreenId?: string;
  metric?: MetricKey;
  /** حلقة سلسلة الإلغاء (بنفسجية) بدل محور شعاعي من المركز. */
  chain?: boolean;
  depth: number;
}

export const CORE = {
  specId: "domain.03.component.1",
  label: "طلب الحجز",
  center: { x: 690, y: 432 } as Pt,
  evidenceRef: "PocketBase:hotel_bookings",
  capability: "booking.read",
};

export const BOOKING_CLUSTERS: BookingCluster[] = [
  {
    id: "service",
    label: "الخدمة",
    tone: "gold",
    hub: { x: 618, y: 220 },
    title: { right: 550, y: 130, size: 20 },
    bullets: { x: 552, ys: [160, 182, 205, 228] },
    textSide: "left",
    items: ["تفاصيل الخدمة", "التوفر", "الشروط", "المتطلبات"],
    relationType: "links_domain",
    evidenceRef: "PocketBase:hotel_bookings.service_snapshot",
    linkScreenId: "05",
    depth: 1,
  },
  {
    id: "customer",
    label: "العميل",
    tone: "cyan",
    hub: { x: 742, y: 218 },
    title: { right: 867, y: 122, size: 20 },
    bullets: { x: 823, ys: [152, 176, 200, 224] },
    textSide: "right",
    items: ["بيانات العميل", "سجل الحجوزات", "التفضيلات", "قنوات التواصل"],
    relationType: "links_domain",
    evidenceRef: "PocketBase:hotel_bookings.customer_name",
    linkScreenId: "08",
    depth: 1,
  },
  {
    id: "price",
    label: "السعر",
    tone: "gold",
    hub: { x: 867, y: 327 },
    title: { right: 985, y: 240, size: 20 },
    bullets: { x: 943, ys: [270, 295, 318, 342] },
    textSide: "right",
    items: ["السعر الأساسي", "الضرائب والرسوم", "العروض", "تفاصيل التسعير"],
    relationType: "depends_on",
    evidenceRef: "PocketBase:hotel_bookings.price",
    linkScreenId: "04",
    depth: 1,
  },
  {
    id: "supplier",
    specId: "domain.03.component.3",
    label: "المورد",
    tone: "cyan",
    hub: { x: 872, y: 465 },
    title: { right: 985, y: 403, size: 20 },
    bullets: { x: 943, ys: [432, 457, 481, 505] },
    textSide: "right",
    items: ["معلومات المورد", "مدى التوفر", "شروط المورد", "مستوى الخدمة"],
    relationType: "depends_on",
    evidenceRef: "PocketBase:hotel_bookings.supplier_reference",
    linkScreenId: "05",
    metric: "supplier",
    depth: 1,
  },
  {
    id: "payment",
    label: "الدفع",
    tone: "gold",
    hub: { x: 847, y: 590 },
    title: { right: 973, y: 552, size: 20 },
    bullets: { x: 930, ys: [582, 606, 630, 654] },
    textSide: "right",
    items: ["طريقة الدفع", "حالة الدفع", "السجل المالي", "الربط المحاسبي"],
    relationType: "links_domain",
    evidenceRef: "PocketBase:hotel_bookings.payment_status",
    linkScreenId: "13",
    metric: "payment",
    depth: 1,
  },
  {
    id: "confirm",
    specId: "domain.03.component.4",
    label: "التأكيد",
    tone: "cyan",
    hub: { x: 657, y: 670 },
    title: { right: 777, y: 668, size: 20 },
    bullets: { x: 725, ys: [700, 724, 748, 772] },
    textSide: "right",
    items: ["تأكيد الحجز", "إشعارات", "مستندات الحجز", "تفاصيل الرحلة/الخدمة"],
    relationType: "contains",
    evidenceRef: "PocketBase:hotel_bookings.status",
    metric: "confirm",
    depth: 1,
  },
  {
    id: "review",
    specId: "domain.03.component.8",
    label: "التقييم الموثق",
    tone: "cyan",
    hub: { x: 527, y: 343 },
    title: { right: 445, y: 275, size: 20 },
    bullets: { x: 447, ys: [303, 327, 350, 372] },
    textSide: "left",
    items: ["تقييم العميل", "مراجعة الخدمة", "ملاحظات", "تحسين الخدمة"],
    relationType: "contains",
    evidenceRef: "PocketBase:hotel_guest_reviews",
    capability: "reviews.read",
    linkScreenId: "08",
    metric: "review",
    depth: 1,
  },
  {
    id: "cancel",
    specId: "domain.03.component.6",
    label: "طلب الإلغاء",
    tone: "magenta",
    hub: { x: 465, y: 475 },
    title: { right: 370, y: 415, size: 21 },
    bullets: { x: 366, ys: [445, 470, 493, 517] },
    textSide: "left",
    items: ["سبب الإلغاء", "سياسة الإلغاء", "حالة الطلب", "المرفقات"],
    relationType: "contains",
    evidenceRef: "src/lib/server/hotel-cancellations.ts#listPendingCancellations",
    capability: "cancellation.preview",
    metric: "cancel",
    depth: 1,
  },
  {
    id: "policy",
    label: "سياسة الإلغاء",
    tone: "magenta",
    hub: { x: 92, y: 549 },
    title: { right: 235, y: 523, size: 18 },
    bullets: { x: 237, ys: [550, 571] },
    textSide: "left",
    items: ["الشروط والخيارات", "المدة الزمنية"],
    relationType: "depends_on",
    evidenceRef: "src/lib/server/hotel-cancellations.ts#isFreeCancelEligible",
    chain: true,
    depth: 2,
  },
  {
    id: "refund",
    specId: "domain.03.component.7",
    label: "احتساب الاسترداد",
    tone: "magenta",
    hub: { x: 121, y: 610 },
    title: { right: 290, y: 606, size: 18 },
    bullets: { x: 308, ys: [632, 654] },
    textSide: "left",
    items: ["قيمة الاسترداد", "الرسوم المطبقة"],
    relationType: "depends_on",
    evidenceRef: "src/lib/server/hotel-cancellations.ts#approveCancel",
    capability: "cancellation.preview",
    metric: "refund",
    chain: true,
    depth: 2,
  },
  {
    id: "verify",
    specId: "domain.03.component.2",
    label: "مراجعة",
    tone: "magenta",
    hub: { x: 167, y: 688 },
    title: { right: 260, y: 683, size: 18 },
    bullets: { x: 350, ys: [708, 732] },
    textSide: "left",
    items: ["مراجعة الطلب", "التحقق من الشروط"],
    relationType: "contains",
    evidenceRef: "/api/admin/cancellations (POST approve|reject)",
    capability: "cancellation.request",
    metric: "verify",
    chain: true,
    depth: 2,
  },
  {
    id: "track",
    specId: "domain.03.component.5",
    label: "متابعة الحالة",
    tone: "magenta",
    hub: { x: 215, y: 766 },
    title: { right: 357, y: 770, size: 18 },
    bullets: { x: 366, ys: [797, 820] },
    textSide: "left",
    items: ["التحديثات", "التواصل مع العميل"],
    relationType: "contains",
    evidenceRef: "PocketBase:hotel_bookings.cancel_admin_note",
    metric: "track",
    chain: true,
    depth: 2,
  },
];

export const FAINT_DOMAINS: { label: string; at: Pt; screenId: string }[] = [
  { label: "العملاء", at: { x: 172, y: 144 }, screenId: "08" },
  { label: "التسويق والنشر", at: { x: 100, y: 390 }, screenId: "09" },
  { label: "الخدمات", at: { x: 1180, y: 137 }, screenId: "06" },
  { label: "المالية", at: { x: 500, y: 828 }, screenId: "13" },
  { label: "الذكاء", at: { x: 915, y: 808 }, screenId: "11" },
  { label: "الذكاء الاصطناعي", at: { x: 913, y: 835 }, screenId: "11" },
];

export function clusterById(id: string) {
  return BOOKING_CLUSTERS.find((c) => c.id === id);
}

export function matchClusters(query: string) {
  const q = query.trim();
  if (!q) return [];
  return BOOKING_CLUSTERS.filter((c) => c.label.includes(q) || c.items.some((item) => item.includes(q)));
}

// ---- live data adapter ----

export type CancelState = "none" | "pending_admin" | "approved" | "rejected" | "refunded" | "refund_failed";

export interface BookingRowInput {
  id: string;
  status?: string;
  payment_status?: string;
  cancel_status: CancelState;
  cancel_reason?: string;
  cancel_until?: string;
  free_cancellation?: boolean;
  non_refundable?: boolean;
  customer_name?: string;
  supplier_reference?: string;
  cancel_requested_at?: string;
  charged_amount?: number;
  charged_currency?: string;
  cancel_fee_amount?: number;
  request_type?: "cancel" | "change";
}

export interface BookingSummary {
  sampled: number;
  cancel: Record<CancelState, number>;
  confirmed: number;
  paid: number;
  withSupplierRef: number;
}

export interface FocusRequest {
  bookingId: string;
  reference: string;
  customer: string;
  state: CancelState;
  reason: string;
  policy: string;
  requestedAt: string;
}

export function maskName(name: string | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "غير مسجل";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

export function policyText(row: Pick<BookingRowInput, "free_cancellation" | "non_refundable" | "cancel_until">) {
  if (row.non_refundable) return "غير قابل للاسترداد";
  if (row.free_cancellation && row.cancel_until) return `إلغاء مجاني حتى ${row.cancel_until.slice(0, 10)}`;
  if (row.free_cancellation) return "إلغاء مجاني";
  return "وفق الشروط المطبقة";
}

export function summarizeBookings(rows: BookingRowInput[]): BookingSummary {
  const cancel: Record<CancelState, number> = { none: 0, pending_admin: 0, approved: 0, rejected: 0, refunded: 0, refund_failed: 0 };
  let confirmed = 0;
  let paid = 0;
  let withSupplierRef = 0;
  for (const row of rows) {
    cancel[row.cancel_status] = (cancel[row.cancel_status] ?? 0) + 1;
    if ((row.status ?? "").toLowerCase() === "confirmed") confirmed += 1;
    if ((row.payment_status ?? "").toLowerCase() === "paid") paid += 1;
    if (row.supplier_reference) withSupplierRef += 1;
  }
  return { sampled: rows.length, cancel, confirmed, paid, withSupplierRef };
}

/** أحدث طلب إلغاء (المعلّق أولًا) ليكون سياق المفتش الافتراضي. */
export function pickFocusRequest(rows: BookingRowInput[]): FocusRequest | null {
  const requests = rows.filter((row) => row.cancel_status !== "none" && row.request_type !== "change");
  if (requests.length === 0) return null;
  const pending = requests.find((row) => row.cancel_status === "pending_admin");
  const row = pending ?? requests[0];
  return {
    bookingId: row.id,
    reference: row.supplier_reference || row.id,
    customer: maskName(row.customer_name),
    state: row.cancel_status,
    reason: row.cancel_reason?.trim() || "غير محدد",
    policy: policyText(row),
    requestedAt: row.cancel_requested_at ?? "",
  };
}

export function refundPreview(row: Pick<BookingRowInput, "charged_amount" | "cancel_fee_amount" | "charged_currency" | "cancel_status">) {
  const paid = Math.max(0, row.charged_amount ?? 0);
  const fee = Math.min(Math.max(0, row.cancel_fee_amount ?? 0), paid);
  return {
    paid,
    fee,
    refund: Math.round((paid - fee) * 100) / 100,
    currency: row.charged_currency || "",
    actionable: row.cancel_status === "pending_admin",
  };
}

export const CANCEL_STATE_LABEL: Record<CancelState, { text: string; color: string }> = {
  none: { text: "لا يوجد طلب", color: "#8aa0ab" },
  pending_admin: { text: "للمراجعة", color: "#ffc94a" },
  approved: { text: "موافق عليه", color: "#3ee58f" },
  rejected: { text: "مرفوض", color: "#ff5d6c" },
  refunded: { text: "تم الاسترداد", color: "#3ee58f" },
  refund_failed: { text: "فشل الاسترداد", color: "#ff5d6c" },
};

/** مراحل الطلب: استلام ← مراجعة ← قرار. */
export function requestStage(state: CancelState): 0 | 1 | 2 | 3 {
  if (state === "none") return 0;
  if (state === "pending_admin") return 2;
  return 3;
}
