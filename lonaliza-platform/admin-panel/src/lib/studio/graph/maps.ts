import { buildAdminNav, type NavGroupId, type NavLeaf } from "@/components/admin/admin-nav";
import type { Dictionary } from "@/lib/i18n/types";
import { DOMAIN_SCREENS, type DomainHub, type DomainItem, type DomainScreen } from "@/lib/neural-studio/domain-systems";
import type { Tone } from "../tokens";
import type { GraphEdge, GraphMap, GraphNode } from "./types";

/**
 * خرائط الاستوديو:
 *  atlas            L0 — المجموعات الإحدى عشرة من admin-nav حول الوكيل.
 *  group.<id>       L1 — مجموعة لها أكثر من واجهة مجال (الخدمات، التسويق، الذكاء).
 *  screen.<NN>      L1 — أنظمة واجهة المجال من domain-systems.
 *  hub.<hubId>      L2 — مصادر نظام واحد (مجموعات/مسارات) وكل منها يفتح نافذة.
 */

interface GroupDef {
  label: string;
  tone: Tone;
  icon: string;
  screens: string[];
  /** بنود القائمة المعروضة في الأطلس وعناوينها القصيرة (المرجع 01). */
  leaves: [string, string][];
}

const GROUPS: Record<NavGroupId, GroupDef> = {
  overview: { label: "نظرة عامة", tone: "cyan", icon: "layout", screens: [], leaves: [["dashboard", "لوحة المعلومات"]] },
  bookings: { label: "الحجوزات", tone: "gold", icon: "calendar", screens: ["03"], leaves: [["bookings-all", "الحجوزات"], ["cancellations", "طلبات الإلغاء"], ["customer-reviews", "تقييمات العملاء الموثقة"]] },
  inventory: { label: "الخدمات", tone: "gold", icon: "package", screens: ["05", "04", "06"], leaves: [["hotels", "الفنادق"], ["flights", "الرحلات"], ["packages", "الباقات"], ["transfers", "الترانسفير VIP"], ["cars", "تأجير السيارات"], ["tours", "الجولات"], ["visa", "التأشيرات"]] },
  storefront: { label: "محتوى الموقع", tone: "green", icon: "file", screens: ["07"], leaves: [["homepage", "محرر بصري AI"], ["pages", "الصفحات"], ["blog", "المقالات"], ["search-tabs", "تبويبات البحث"], ["pwa", "تطبيق الويب"], ["mobile-app", "تطبيق الجوال"]] },
  customers: { label: "العملاء", tone: "magenta", icon: "users", screens: ["08"], leaves: [["customers", "إدارة العملاء"], ["customer-reviews-mgmt", "التقييمات"], ["deletion-requests", "حذف الحسابات"]] },
  marketing: { label: "التسويق والنشر", tone: "cyan", icon: "megaphone", screens: ["09", "10"], leaves: [["social-accounts", "الحسابات"], ["publish-calendar", "التقويم"], ["publish-compose", "المحتوى"], ["publish-media", "الوسائط"], ["publish-automations", "RSS"], ["paid-ads", "الحملات"]] },
  ai_center: { label: "الذكاء الاصطناعي", tone: "gold", icon: "brain", screens: ["11", "12"], leaves: [["agent-war-room", "غرفة الوكلاء"], ["agent-studio", "استوديو الوكلاء"], ["b2b-landing-agent", "وكيل B2B"], ["builder-agent", "وكيل البناء"], ["automation-hub", "الأتمتة"]] },
  finance: { label: "المالية", tone: "cyan", icon: "credit", screens: ["13"], leaves: [["payments", "الدفع"], ["currencies", "العملات"], ["invoices", "الفواتير"], ["b2b-wallet", "محفظة B2B"], ["loyalty-points", "نقاط الولاء"]] },
  legal: { label: "الامتثال القانوني", tone: "magenta", icon: "shield", screens: ["15"], leaves: [["legal-identity", "الهوية"], ["legal-terms", "الشروط"], ["legal-privacy", "الخصوصية"], ["legal-gdpr", "GDPR"]] },
  system: { label: "الإعدادات", tone: "cyan", icon: "settings", screens: ["16"], leaves: [["smtp", "SMTP"], ["search-providers", "مزودو البحث"], ["pocketbase", "PocketBase"], ["translations", "الترجمات"], ["media-keys", "الوسائط"]] },
  resale: { label: "إعادة البيع", tone: "gold", icon: "store", screens: ["14"], leaves: [["resale-companies", "الشركات"], ["resale-whitelabel", "الوايت ليبل"], ["resale-subscriptions", "الاشتراكات"], ["resale-wallets", "المحافظ"], ["resale-domains", "النطاقات"], ["resale-licenses", "التراخيص"], ["resale-updates", "التحديثات"]] },
};

/** مجموعة PocketBase الأساسية لبند قائمة، لعرض عدّاد حي بجانبه. */
const LEAF_COLLECTION: Record<string, string> = {
  "bookings-all": "hotel_bookings",
  "customer-reviews": "customer_reviews",
  hotels: "hotel_masters",
  blog: "articles",
  customers: "customers",
  "customer-reviews-mgmt": "hotel_guest_reviews",
  "social-accounts": "publish_channels",
  "publish-calendar": "publish_posts",
  "publish-compose": "publish_sets",
  "publish-media": "publish_media",
  "publish-automations": "publish_rss_feeds",
  payments: "financial_transactions",
  "loyalty-points": "loyalty_wallets",
  "resale-companies": "reseller_companies",
  "resale-whitelabel": "reseller_whitelabel_settings",
  "resale-subscriptions": "reseller_subscriptions",
  "resale-domains": "reseller_domain_events",
  "resale-licenses": "reseller_licenses",
};

let navCache: ReturnType<typeof buildAdminNav> | null = null;
function nav() {
  if (!navCache) navCache = buildAdminNav({} as Dictionary["admin"]);
  return navCache;
}

function navLeaves(groupId: NavGroupId): NavLeaf[] {
  return nav().find((g) => g.id === groupId)?.branches.flatMap((b) => b.items) ?? [];
}

function hubForHref(href: string): { screen: DomainScreen; hub: DomainHub } | null {
  const clean = href.split("#")[0];
  for (const screen of DOMAIN_SCREENS) for (const hub of screen.hubs) if (hub.href === clean) return { screen, hub };
  return null;
}

function edge(source: string, target: string, evidenceRef: string): GraphEdge {
  return { id: `${source}->${target}`, source, target, relationType: "contains", evidenceRef };
}

export function buildAtlasMap(): GraphMap {
  const hubs: GraphNode[] = [];
  const leaves: Record<string, GraphNode[]> = {};
  const edges: GraphEdge[] = [];
  for (const group of nav()) {
    const def = GROUPS[group.id];
    if (!def) continue;
    const id = `domain.${group.id}`;
    const childMapId = def.screens.length > 1 ? `group.${group.id}` : def.screens.length === 1 ? `screen.${def.screens[0]}` : undefined;
    hubs.push({ id, kind: "domain", label: def.label, fullLabel: group.label, domainId: group.id, tone: def.tone, icon: def.icon, capabilityRefs: [], childMapId });
    edges.push(edge("agent.supervisor", id, `admin-nav:${group.id}`));
    const byId = new Map(navLeaves(group.id).map((l) => [l.id, l]));
    leaves[id] = def.leaves
      .filter(([leafId]) => byId.has(leafId))
      .map(([leafId, short]) => {
        const leaf = byId.get(leafId) as NavLeaf;
        const target = hubForHref(leaf.href);
        return {
          id: `${id}.${leafId}`,
          kind: "system" as const,
          label: short,
          fullLabel: leaf.label || short,
          parentId: id,
          domainId: group.id,
          tone: def.tone,
          href: leaf.href,
          collection: LEAF_COLLECTION[leafId],
          capabilityRefs: [],
          childMapId: target ? `hub.${target.hub.id}` : undefined,
          window: target ? undefined : ("page" as const),
        };
      });
  }
  return { id: "atlas", title: "الأطلس العصبي الشامل", subtitle: "منصة عمليات المعرفة المؤسسية", screenId: "01", rootId: "agent.supervisor", hubs, leaves, edges };
}

function itemNode(hub: DomainHub, item: DomainItem, i: number, domainId: string): GraphNode {
  return {
    id: `${hub.id}.item${i}`,
    kind: item.collection ? "entity" : "setting",
    label: item.label,
    parentId: hub.id,
    domainId,
    tone: hub.tone as Tone,
    href: item.href ?? hub.href,
    collection: item.collection,
    route: item.route,
    capabilityRefs: [],
    window: item.collection ? "table" : item.route ? "route" : "page",
  };
}

function screenMap(screen: DomainScreen, parentMapId: string): GraphMap {
  const domainId = `screen.${screen.screenId}`;
  const hubs: GraphNode[] = screen.hubs.map((h) => ({
    id: h.id,
    kind: "system",
    label: h.label,
    domainId,
    tone: h.tone as Tone,
    icon: h.icon,
    href: h.href,
    capabilityRefs: [],
    childMapId: `hub.${h.id}`,
  }));
  const leaves = Object.fromEntries(screen.hubs.map((h) => [h.id, h.items.map((it, i) => itemNode(h, it, i, domainId))]));
  const edges = screen.hubs.map((h) => edge("agent.supervisor", h.id, `domain-systems:${h.id}`));
  const root: GraphNode = { id: `${domainId}.core`, kind: "domain", label: screen.core.label, domainId, tone: "gold", icon: screen.core.icon, href: screen.core.href, capabilityRefs: [], window: "page" };
  return { id: `screen.${screen.screenId}`, title: screen.title, subtitle: screen.subtitle, screenId: screen.screenId, parentMapId, rootId: "agent.supervisor", root, hubs, leaves, edges };
}

function hubMap(screen: DomainScreen, hub: DomainHub): GraphMap {
  const domainId = `screen.${screen.screenId}`;
  const hubs: GraphNode[] = hub.items.map((it, i) => ({ ...itemNode(hub, it, i, domainId), kind: (it.collection ? "entity" : "setting") as GraphNode["kind"], icon: it.collection ? "database" : it.route ? "plug" : "layout" }));
  hubs.push({ id: `${hub.id}.page`, kind: "setting", label: "الإعدادات والإجراءات الكاملة", fullLabel: `${hub.label} · الصفحة الكاملة`, parentId: hub.id, domainId, tone: hub.tone as Tone, icon: "settings", href: hub.href, capabilityRefs: [], window: "page" });
  const edges = hubs.map((n) => edge("agent.supervisor", n.id, n.collection ? `pocketbase:${n.collection}` : `route:${n.route ?? n.href}`));
  return { id: `hub.${hub.id}`, title: hub.label, subtitle: screen.title, screenId: screen.screenId, parentMapId: `screen.${screen.screenId}`, rootId: "agent.supervisor", hubs, leaves: {}, edges };
}

function groupMap(groupId: NavGroupId): GraphMap {
  const def = GROUPS[groupId];
  const hubs: GraphNode[] = def.screens
    .map((sid) => DOMAIN_SCREENS.find((s) => s.screenId === sid))
    .filter((s): s is DomainScreen => !!s)
    .map((s) => ({ id: `screen.${s.screenId}.root`, kind: "domain", label: s.core.label, fullLabel: s.title, domainId: groupId, tone: def.tone, icon: s.core.icon, href: s.core.href, capabilityRefs: [], childMapId: `screen.${s.screenId}` }));
  const leaves = Object.fromEntries(
    hubs.map((h) => {
      const s = DOMAIN_SCREENS.find((x) => `screen.${x.screenId}.root` === h.id) as DomainScreen;
      return [h.id, s.hubs.map((sh) => ({ id: `${h.id}.${sh.id}`, kind: "system" as const, label: sh.label, parentId: h.id, domainId: groupId, tone: sh.tone as Tone, href: sh.href, capabilityRefs: [], childMapId: `hub.${sh.id}` }))];
    })
  );
  return { id: `group.${groupId}`, title: def.label, subtitle: nav().find((g) => g.id === groupId)?.label ?? def.label, screenId: def.screens[0], parentMapId: "atlas", rootId: "agent.supervisor", hubs, leaves, edges: hubs.map((h) => edge("agent.supervisor", h.id, `admin-nav:${groupId}`)) };
}

function parentOfScreen(screenId: string): string {
  for (const [gid, def] of Object.entries(GROUPS)) if (def.screens.includes(screenId)) return def.screens.length > 1 ? `group.${gid}` : "atlas";
  return "atlas";
}

const cache = new Map<string, GraphMap>();

export function getMap(mapId: string): GraphMap | null {
  const hit = cache.get(mapId);
  if (hit) return hit;
  let map: GraphMap | null = null;
  if (mapId === "atlas") map = buildAtlasMap();
  else if (mapId.startsWith("group.")) map = GROUPS[mapId.slice(6) as NavGroupId] ? groupMap(mapId.slice(6) as NavGroupId) : null;
  else if (mapId.startsWith("screen.")) {
    const s = DOMAIN_SCREENS.find((x) => x.screenId === mapId.slice(7));
    map = s ? screenMap(s, parentOfScreen(s.screenId)) : null;
  } else if (mapId.startsWith("hub.")) {
    for (const s of DOMAIN_SCREENS) {
      const h = s.hubs.find((x) => x.id === mapId.slice(4));
      if (h) map = hubMap(s, h);
    }
  }
  if (map) cache.set(mapId, map);
  return map;
}

/** الخريطة الابتدائية لكل واجهة. */
export function mapForScreen(screenId: string): string {
  if (screenId === "01" || screenId === "19") return "atlas";
  return DOMAIN_SCREENS.some((s) => s.screenId === screenId) ? `screen.${screenId}` : "atlas";
}

export function allMapIds(): string[] {
  const ids = ["atlas", ...Object.entries(GROUPS).filter(([, d]) => d.screens.length > 1).map(([g]) => `group.${g}`)];
  for (const s of DOMAIN_SCREENS) {
    ids.push(`screen.${s.screenId}`);
    for (const h of s.hubs) ids.push(`hub.${h.id}`);
  }
  return ids;
}


export interface ExpansionPath {
  domainId: string;
  leafId?: string;
  itemId?: string;
}

/** الواجهة 02: سلسلة تراكمية أطلس → مجال → نظام → كيان → حقول (حقول الكيان من مخطط PocketBase الحي). */
export function buildExpansionMap(path: ExpansionPath, fields: string[] | null): GraphMap {
  const atlas = buildAtlasMap();
  const hubs: GraphNode[] = atlas.hubs.map((h) => ({ ...h, id: `mini.${h.domainId}`, childMapId: undefined }));
  const leaves: Record<string, GraphNode[]> = {};
  const edges: GraphEdge[] = [];
  const domain = atlas.hubs.find((h) => h.domainId === path.domainId) ?? atlas.hubs[1];
  const chainDomain: GraphNode = { ...domain, id: "x.domain", childMapId: undefined };
  hubs.push(chainDomain);
  leaves["x.domain"] = atlas.leaves[domain.id] ?? [];
  edges.push(edge(`mini.${domain.domainId}`, "x.domain", `admin-nav:${domain.domainId}`));
  const leaf = leaves["x.domain"].find((l) => l.id === path.leafId);
  const hubId = leaf?.childMapId?.startsWith("hub.") ? leaf.childMapId.slice(4) : null;
  const sys = hubId ? DOMAIN_SCREENS.flatMap((s) => s.hubs.map((h) => ({ s, h }))).find((x) => x.h.id === hubId) : null;
  if (leaf && sys) {
    hubs.push({ id: "x.system", kind: "system", label: sys.h.label, fullLabel: sys.s.title, domainId: domain.domainId, tone: sys.h.tone as Tone, icon: sys.h.icon, href: sys.h.href, capabilityRefs: [] });
    leaves["x.system"] = sys.h.items.map((it, i) => itemNode(sys.h, it, i, domain.domainId));
    edges.push(edge("x.domain", "x.system", `domain-systems:${sys.h.id}`));
    const item = leaves["x.system"].find((n) => n.id === path.itemId);
    if (item?.collection) {
      hubs.push({ id: "x.entity", kind: "entity", label: item.label, fullLabel: item.collection, domainId: domain.domainId, tone: item.tone, collection: item.collection, capabilityRefs: [], window: "table" });
      leaves["x.entity"] = (fields ?? []).map((f) => ({ id: `x.entity.${f}`, kind: "setting" as const, label: f, parentId: "x.entity", domainId: domain.domainId, tone: item.tone, collection: item.collection, capabilityRefs: [], window: "table" as const }));
      edges.push(edge("x.system", "x.entity", `pocketbase:${item.collection}`));
    }
  }
  return { id: "expansion", title: "التوسع التراكمي والشامل الكامل", subtitle: "منصة عمليات المعرفة المؤسسية", screenId: "02", rootId: "agent.supervisor", hubs, leaves, edges };
}


/** الواجهة 20: قدرات الحضور الأربع كما في المرجع، وكل عنصر نظام حقيقي أو مسار عمل الوكيل الحي. */
export function buildPresenceMap(): GraphMap {
  const api = (p: string) => `/api/admin/${p}`;
  const n = (id: string, label: string, tone: Tone, extra: Partial<GraphNode>): GraphNode => ({ id, kind: extra.collection ? "entity" : "setting", label, domainId: "presence", tone, capabilityRefs: [], ...extra });
  const hubs: GraphNode[] = [
    n("presence.speak", "إنتاج الصوت", "gold", { icon: "sparkles", href: "/admin/agent-studio" }),
    n("presence.human", "الوجود البشري", "gold", { icon: "brain", href: "/admin/ai-programs" }),
    n("presence.interact", "التفاعل الطبيعي", "cyan", { icon: "orbit", href: "/admin/agent-war-room" }),
    n("presence.listen", "فهم الصوت", "gold", { icon: "message", href: "/admin/agent-studio" }),
  ];
  const leaves: Record<string, GraphNode[]> = {
    "presence.listen": [n("presence.listen.conv", "المحادثات", "gold", { collection: "ai_conversations", window: "table", parentId: "presence.listen" }), n("presence.listen.trace", "ما سمعه الوكيل", "gold", { window: "trace", parentId: "presence.listen" })],
    "presence.speak": [n("presence.speak.trace", "ردود الوكيل المنطوقة", "gold", { window: "trace", parentId: "presence.speak" })],
    "presence.interact": [n("presence.interact.war", "غرفة العمليات", "cyan", { route: api("automation/agent-war-room"), window: "route", parentId: "presence.interact" }), n("presence.interact.brain", "بيانات المعرفة", "cyan", { route: api("automation/second-brain-data"), window: "route", parentId: "presence.interact" })],
    "presence.human": [n("presence.human.programs", "برامج الذكاء", "gold", { collection: "ai_programs", window: "table", parentId: "presence.human" }), n("presence.human.models", "إعداد النماذج", "gold", { route: api("openrouter/config"), window: "route", parentId: "presence.human" })],
  };
  return { id: "presence", title: "الحضور البشري والصوت الحي", subtitle: "منصة التفاعل الطبيعي والذكاء المساعد", screenId: "20", rootId: "agent.supervisor", hubs, leaves, edges: hubs.map((h) => edge("agent.supervisor", h.id, `presence:${h.id}`)) };
}

/** أين يفتح بند القائمة داخل الاستوديو: واجهة المجال ونظامه إن وُجد في السجل. */
export function studioTargetForHref(href: string): { screenId: string; hubId: string } | null {
  const hit = hubForHref(href);
  return hit ? { screenId: hit.screen.screenId, hubId: hit.hub.id } : null;
}

/** واجهة المجموعة الرئيسية (نظرة عامة → الأطلس). */
export function screenForGroup(groupId: NavGroupId): string {
  return GROUPS[groupId]?.screens[0] ?? "01";
}
