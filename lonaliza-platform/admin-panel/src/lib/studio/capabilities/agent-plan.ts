import { DOMAIN_SCREENS } from "@/lib/neural-studio/domain-systems";
import { allMapIds, getMap } from "@/lib/studio/graph/maps";

export interface StudioPlan {
  capabilityId: string;
  input: Record<string, unknown>;
  why: string;
}

const PB_ID = /\b([a-z0-9]{15})\b/;

export function norm(s: string) {
  return s
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

/** أسماء المجموعات بالعربية كما تظهر في سجل الأنظمة. */
export function collectionAliases(): { alias: string; collection: string }[] {
  const out: { alias: string; collection: string }[] = [];
  for (const s of DOMAIN_SCREENS)
    for (const h of s.hubs)
      for (const it of h.items)
        if (it.collection) out.push({ alias: norm(it.label), collection: it.collection }, { alias: norm(`${h.label} ${it.label}`), collection: it.collection }, { alias: it.collection, collection: it.collection });
  return out.sort((a, b) => b.alias.length - a.alias.length);
}

/** كل عقد الخرائط (مجال، نظام، مصدر) مع الخريطة التي تُفتح. */
export function nodeAliases(): { alias: string; mapId: string; nodeId: string; label: string }[] {
  const out: { alias: string; mapId: string; nodeId: string; label: string }[] = [];
  for (const id of allMapIds()) {
    const m = getMap(id);
    if (!m) continue;
    for (const h of m.hubs) if (h.childMapId) out.push({ alias: norm(h.label), mapId: h.childMapId, nodeId: h.id, label: h.label });
  }
  const seen = new Set<string>();
  return out.filter((a) => a.alias.length > 2 && !seen.has(a.alias) && seen.add(a.alias)).sort((a, b) => b.alias.length - a.alias.length);
}

/** كلمات الحالة الشائعة → قيم PocketBase الفعلية. */
const STATUS_WORDS: [RegExp, string][] = [
  [/(مدفوع|تم الدفع)/, "paid"],
  [/(ملغي|الغ)/, "cancelled"],
  [/(بانتظار الدفع|غير مدفوع)/, "pending_payment"],
  [/(قيد|جاري|متابعه)/, "in-progress"],
  [/(تم|محلول|انتهى|مغلق)/, "resolved"],
  [/جديد/, "new"],
];

const OPEN = /(افتح|اعرض|ورني|وريني|روح|انتقل|اذهب)/;

/** قواعد حتمية؛ تعود null إن لم تطابق بوضوح. */
export function planStudioCapability(directive: string): StudioPlan | null {
  const d = norm(directive);
  const id = directive.match(PB_ID)?.[1];
  const cancel = /(الغاء|كنسل)/.test(d);
  if (cancel && id && /(وافق|اعتمد|نفذ)/.test(d)) {
    const fee = Number(d.match(/رسوم\s*(\d+(?:\.\d+)?)/)?.[1] ?? 0);
    return { capabilityId: "bookings.cancellation.approve", input: { bookingId: id, feeAmount: fee, note: "" }, why: "اعتماد إلغاء محدد بالمعرّف" };
  }
  if (cancel && id && /(ارفض|رفض)/.test(d)) {
    const note = directive.split(/(?:لان|لأن|بسبب|السبب)/)[1]?.trim() || "مرفوض بعد مراجعة المدير";
    return { capabilityId: "bookings.cancellation.reject", input: { bookingId: id, note }, why: "رفض إلغاء محدد بالمعرّف" };
  }
  if (cancel && /(اعرض|ورني|كم|قائمه|المعلقه|طلبات)/.test(d) && !id) return { capabilityId: "bookings.cancellation.list", input: {}, why: "قراءة طلبات الإلغاء" };
  if (id && /تقييم/.test(d)) {
    const action = /(انشر|اعتمد|وافق)/.test(d) ? "approve" : /(اخف|اخفي|اخفاء)/.test(d) ? "hide" : /(احذف|حذف)/.test(d) ? "delete" : null;
    if (action) return { capabilityId: "reviews.moderate", input: { reviewId: id, action }, why: "إشراف على تقييم" };
  }
  const coll = collectionAliases().find((a) => d.includes(a.alias));
  if (id && /طلب/.test(d) && /(حاله|اجعل|غير|حول)/.test(d) && (!coll || coll.collection === "enquiry_bookings")) {
    const status = /(تم|محلول|انتهى|مغلق)/.test(d) ? "resolved" : /(قيد|جاري|متابعه)/.test(d) ? "in-progress" : /جديد/.test(d) ? "new" : null;
    if (status) return { capabilityId: "bookings.enquiry.set_status", input: { id, status }, why: "تغيير حالة طلب حجز" };
  }
  if (id && coll && /(حاله|اجعل|غير|حول)/.test(d)) {
    const status = STATUS_WORDS.find(([re]) => re.test(d.split(coll.alias).pop() ?? d))?.[1];
    if (status) return { capabilityId: "records.update", input: { collection: coll.collection, id, patch: { status } }, why: `تغيير حالة سجل في ${coll.collection}` };
  }
  if (id && coll && /(احذف|حذف)/.test(d)) return { capabilityId: "records.delete", input: { collection: coll.collection, id }, why: "حذف سجل" };
  if (id && coll && OPEN.test(d)) return { capabilityId: "studio.open_record", input: { collection: coll.collection, id }, why: "فتح سجل" };
  const search = d.match(/ابحث\s+(?:عن\s+)?(.+?)\s+في\s+/);
  if (search && coll) return { capabilityId: "studio.open_table", input: { collection: coll.collection, q: search[1].trim().slice(0, 80) }, why: "بحث في جدول" };
  if (coll && /كم عدد/.test(d)) return { capabilityId: "records.list", input: { collection: coll.collection }, why: "عدّ سجلات" };
  if (coll && /(جدول|سجلات)/.test(d)) return { capabilityId: "studio.open_table", input: { collection: coll.collection }, why: "فتح جدول" };
  if (/(نكسus|nexus|orbital|هولوغر|هولوجر|سلايد البطاق|الاسطوان|orbital deck|مسرح nexus)/.test(d)) {
    return { capabilityId: "studio.open_screen", input: { screenId: "21" }, why: "فتح مسرح Nexus" };
  }
  if (/(استوديو العقد|visual loops|blueprint|العقد والاتمت|العقد والأتمت|visual loop)/.test(d)) {
    return { capabilityId: "studio.open_screen", input: { screenId: "22" }, why: "فتح استوديو الأتمتة البصرية" };
  }
  if (/(العقل المدبر|mind graph|الفهرس السيادي|عقد المنظومة|خارطة العقل|screen\.23)/.test(d)) {
    return { capabilityId: "studio.open_screen", input: { screenId: "23" }, why: "فتح كوكبيت العقل المدبر السيادي" };
  }
  if (OPEN.test(d)) {
    const node = nodeAliases().find((a) => d.includes(a.alias));
    if (node) return { capabilityId: "studio.navigate", input: { mapId: node.mapId, nodeId: node.nodeId }, why: `عرض ${node.label}` };
    if (coll) return { capabilityId: "studio.open_table", input: { collection: coll.collection }, why: "فتح جدول" };
  }
  if (/(البطاقه التاليه|البطاقة التالية|يمين|next card)/.test(d)) {
    return { capabilityId: "nexus.rotate", input: { delta: 1 }, why: "البطاقة التالية في Nexus" };
  }
  if (/(البطاقه السابق|البطاقة السابقة|يسار|prev card)/.test(d)) {
    return { capabilityId: "nexus.rotate", input: { delta: -1 }, why: "البطاقة السابقة في Nexus" };
  }
  if (/(شغّل التدflow|شغل التدflow|run loop|نفّذ الblueprint|نفذ الblueprint)/.test(d)) {
    return { capabilityId: "loops.run", input: { dryRun: true }, why: "تشغيل تدflow الأتمتة" };
  }
  if (/(اختبر العقد|شغّل العقد|شغل العقد|run node)/.test(d) && !/(شغّل التدflow|شغل التدflow)/.test(d)) {
    const nodeId = directive.match(/\b(node[_-][a-z0-9_-]+|[a-z]+_\d+)\b/i)?.[1];
    return { capabilityId: "loops.run_node", input: { nodeId: nodeId || "selected", dryRun: true }, why: "اختبار عقدة" };
  }
  return null;
}

/**
 * طلب مركّب من أوامر تعرفها القواعد يُقسَّم هنا قبل أي نموذج لغوي.
 * يُقبل فقط إن كان لكل جزء خطة حتمية خاصة به (قراءة أو إجراء معروف).
 */
export function splitOperationalParts(directive: string): string[] | null {
  const parts = directive
    .split(/\s*(?:،|,|؛|;|\sثم\s)\s*/)
    .map((s) => s.replace(/^(?:و|ثم)\s*/, "").trim())
    .filter(Boolean);
  if (parts.length < 2 || parts.length > 4) return null;
  if (!parts.every((p) => planStudioCapability(p))) return null;
  return parts;
}

/** هل تبدو المهمة عملية تشغيلية على أنظمة اللوحة (تستحق محاولة المخطط اللغوي)؟ */
export function looksOperational(directive: string) {
  return /(افتح|اعرض|ورني|غير|حول|اجعل|احذف|وافق|اعتمد|ارفض|كم|ابحث|حدث|عدل|انشئ|اضف)/.test(norm(directive));
}
