import { collectDashboardStats } from "@/lib/server/dashboard-stats";
import { listMergedPackages } from "@/lib/server/packages-store";
import { listBlogPosts } from "@/lib/server/blog-store";
import { listInternalCars } from "@/lib/server/cars-store";
import { listMergedTours } from "@/lib/server/tours-store";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";
import { getB2BChatSessions } from "@/lib/automation/b2b-landing-agent-store";
import { getCommsConversations } from "@/lib/automation/comms-message-store";
import { resolveAdsCredentials, connectionStatus } from "@/lib/ads/config";
import { BUILTIN_MCP_IDS } from "@/lib/server/mcp/catalog";
import { listRegisteredAgents } from "./agent-registry";
import type { GroundedFact, LiveAgentSnapshot } from "./types";

const UNAVAILABLE = "لا تتوفر بيانات فعلية من النظام";

function fact(
  key: string,
  labelAr: string,
  value: string | number | boolean | null,
  source: string,
  available: boolean
): GroundedFact {
  return { key, labelAr, value, source, fetchedAt: new Date().toISOString(), available };
}

export type PlatformGroundedSnapshot = {
  facts: GroundedFact[];
  agents: Array<LiveAgentSnapshot & { id: string }>;
  catalog: {
    posts: number;
    packages: number;
    cars: number;
    tours: number;
    bookings: number;
    mcpServers: number;
    pocketbase: boolean;
  };
};

async function safe<T>(fn: () => Promise<T> | T, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function collectPlatformGroundedSnapshot(): Promise<PlatformGroundedSnapshot> {
  const [stats, packages, posts, cars, tours, hotels, flights, social, b2bSessions, convos, adsCreds] =
    await Promise.all([
      safe(() => collectDashboardStats(), null),
      safe(() => listMergedPackages(), []),
      safe(() => listBlogPosts(), []),
      safe(() => listInternalCars(), []),
      safe(() => listMergedTours(), []),
      safe(() => getHotelsRuntime(), null),
      safe(() => getFlightsRuntime(), null),
      safe(() => getNostrSocialSettings(), null),
      safe(() => getB2BChatSessions(), []),
      safe(() => getCommsConversations(), []),
      safe(() => resolveAdsCredentials(), null),
    ]);

  let waConnected = 0;
  let waTotal = 0;
  try {
    const { getAllWhatsAppSlotsStatus } = await import("@/lib/server/whatsapp-qr/multi-service");
    const slots = await getAllWhatsAppSlotsStatus();
    waTotal = slots.length;
    waConnected = slots.filter((s) => s.status === "connected").length;
  } catch {
    waConnected = 0;
    waTotal = 0;
  }

  const ads = adsCreds ? connectionStatus(adsCreds) : { metaLive: false, googleLive: false };
  const activeRelays = (social?.relays || []).filter((r) => r.active !== false).length;
  const bookingsTotal = stats?.bookings.total ?? null;
  const pocketbase = Boolean(stats?.pocketbase);

  const sharedFacts: GroundedFact[] = [
    fact("bookings_total", "إجمالي الحجوزات", bookingsTotal, "dashboard-stats / PocketBase", bookingsTotal !== null),
    fact("customers_total", "العملاء", stats?.customers.total ?? null, "dashboard-stats / PocketBase", Boolean(stats)),
    fact("packages", "البرامج السياحية", packages.length, "packages-store", true),
    fact("blog_posts", "مقالات المدونة", posts.length, "blog-store", true),
    fact("cars", "أسطول السيارات", cars.length, "cars-store", true),
    fact("tours", "الجولات", tours.length, "tours-store", true),
    fact("whatsapp_connected", "واتساب متصل", `${waConnected}/${waTotal || 0}`, "whatsapp-qr", waTotal > 0 || waConnected > 0),
    fact("comms_conversations", "محادثات التواصل", convos.length, "comms-message-store", true),
    fact("b2b_sessions", "جلسات B2B", b2bSessions.length, "b2b-landing-agent-store", true),
    fact("meta_ads", "Meta Ads مربوط", ads.metaLive, "ads/config", true),
    fact("google_ads", "Google Ads مربوط", ads.googleLive, "ads/config", true),
    fact("hotels_mode", "وضع الفنادق", hotels?.mode || UNAVAILABLE, "hotels-runtime", Boolean(hotels)),
    fact("flights_provider", "مزود الطيران", flights ? (flights.providers?.join(", ") || flights.mode) : UNAVAILABLE, "flights-runtime", Boolean(flights)),
    fact("nostr_relays", "ريلايز نوستر النشطة", activeRelays, "nostr-social-store", Boolean(social)),
    fact("mcp_servers", "خوادم MCP المدمجة", BUILTIN_MCP_IDS.length, "mcp/catalog", true),
    fact("pocketbase", "PocketBase متصل", pocketbase, "dashboard-stats", Boolean(stats)),
  ];

  const byId: Record<string, { task: string; metric: string; status: LiveAgentSnapshot["currentStatus"]; connected: boolean; source: string; facts: GroundedFact[] }> = {
    sales: {
      task: waTotal > 0 ? `متابعة ${waConnected} من ${waTotal} أرقام واتساب و${convos.length} محادثة` : "قناة واتساب غير مربوطة — بانتظار الربط",
      metric: waTotal > 0 ? `${waConnected}/${waTotal} واتساب · ${packages.length} باقة` : UNAVAILABLE,
      status: waConnected > 0 ? "active" : "idle",
      connected: waConnected > 0,
      source: "whatsapp-qr + packages-store",
      facts: sharedFacts.filter((f) => ["whatsapp_connected", "comms_conversations", "packages"].includes(f.key)),
    },
    b2b_landing: {
      task: `متابعة ${b2bSessions.length} جلسة شركات على صفحة الهبوط`,
      metric: `${b2bSessions.length} جلسة B2B فعلية`,
      status: b2bSessions.length > 0 ? "active" : "idle",
      connected: true,
      source: "b2b-landing-agent-store",
      facts: sharedFacts.filter((f) => ["b2b_sessions", "packages"].includes(f.key)),
    },
    site_advisor: {
      task: bookingsTotal !== null ? `مراقبة ${bookingsTotal} حجزاً و${packages.length} باقة و${cars.length} سيارة` : "لوحة الحجوزات غير متاحة حالياً",
      metric: bookingsTotal !== null ? `${bookingsTotal} حجز · ${cars.length} سيارة` : UNAVAILABLE,
      status: bookingsTotal && bookingsTotal > 0 ? "active" : "idle",
      connected: pocketbase || packages.length > 0,
      source: "dashboard-stats + cars/packages",
      facts: sharedFacts.filter((f) => ["bookings_total", "cars", "packages", "tours", "hotels_mode", "flights_provider"].includes(f.key)),
    },
    ads: {
      task: ads.metaLive || ads.googleLive ? "الحسابات الإعلانية مربوطة — جاهز لاقتراح حملات بموافقة" : "حسابات الإعلانات غير مربوطة — بانتظار التوكنات",
      metric: ads.metaLive || ads.googleLive ? `Meta ${ads.metaLive ? "مربوط" : "غير مربوط"} · Google ${ads.googleLive ? "مربوط" : "غير مربوط"}` : "غير مربوط",
      status: ads.metaLive || ads.googleLive ? "optimizing" : "idle",
      connected: ads.metaLive || ads.googleLive,
      source: "ads/config",
      facts: sharedFacts.filter((f) => ["meta_ads", "google_ads", "bookings_total"].includes(f.key)),
    },
    social: {
      task: `محتوى فعلي: ${posts.length} مقال · ${activeRelays} ريلاي نوستر`,
      metric: `${posts.length} مقال · ${activeRelays} ريلاي`,
      status: posts.length > 0 ? "active" : "idle",
      connected: true,
      source: "blog-store + nostr-social-store",
      facts: sharedFacts.filter((f) => ["blog_posts", "nostr_relays", "tours"].includes(f.key)),
    },
    email: {
      task: convos.length > 0 ? `اعتماد محادثات التواصل (${convos.length}) — قناة الإيميل التسويقي غير مفعّلة كحملة مستقلة` : "قناة حملات الإيميل غير مربوطة",
      metric: "غير مربوط كحملة إيميل",
      status: "idle",
      connected: false,
      source: "comms-message-store",
      facts: sharedFacts.filter((f) => ["comms_conversations", "bookings_total"].includes(f.key)),
    },
  };

  const agents = listRegisteredAgents(false).map((agent) => {
    const mapped = byId[agent.id];
    if (mapped) {
      return {
        id: agent.id,
        currentStatus: mapped.status,
        currentTaskAr: mapped.task,
        keyMetric: mapped.metric,
        lastActive: new Date().toISOString(),
        connected: mapped.connected,
        metricSource: mapped.source,
        facts: mapped.facts,
      } satisfies LiveAgentSnapshot & { id: string };
    }
    return {
      id: agent.id,
      currentStatus: "idle" as const,
      currentTaskAr: agent.missionAr || "وكيل مخصص — يعتمد على أدواته المختارة فقط",
      keyMetric: packages.length > 0 || posts.length > 0 ? `${packages.length} باقة · ${posts.length} مقال` : UNAVAILABLE,
      lastActive: agent.updatedAt,
      connected: true,
      metricSource: "registry + catalog",
      facts: sharedFacts.filter((f) => ["packages", "blog_posts", "bookings_total"].includes(f.key)),
    };
  });

  return {
    facts: sharedFacts,
    agents,
    catalog: {
      posts: posts.length,
      packages: packages.length,
      cars: cars.length,
      tours: tours.length,
      bookings: bookingsTotal ?? 0,
      mcpServers: BUILTIN_MCP_IDS.length,
      pocketbase,
    },
  };
}

export function formatGroundedFactsForPrompt(facts: GroundedFact[]): string {
  return facts
    .map((f) => {
      const val = f.available ? String(f.value) : UNAVAILABLE;
      return `- ${f.labelAr}: ${val} (المصدر: ${f.source})`;
    })
    .join("\n");
}
