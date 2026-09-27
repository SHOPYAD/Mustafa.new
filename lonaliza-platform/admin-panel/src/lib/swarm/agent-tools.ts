import { listMergedPackages, upsertPublishedPackage } from "@/lib/server/packages-store";
import { saveSwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";
import { listBlogPosts, upsertBlogPost } from "@/lib/server/blog-store";
import { listInternalCars } from "@/lib/server/cars-store";
import { listMergedTours, upsertTour } from "@/lib/server/tours-store";
import { collectDashboardStats } from "@/lib/server/dashboard-stats";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";
import { getB2BChatSessions } from "@/lib/automation/b2b-landing-agent-store";
import { getCommsConversations } from "@/lib/automation/comms-message-store";
import { resolveAdsCredentials, connectionStatus } from "@/lib/ads/config";
import { upsertAutomationJob } from "@/lib/server/automation/store";
import { launchTargetedMetaAdCampaign } from "@/lib/server/mcp/servers/meta-ads-campaign-launcher";
import type { AutomationJobType } from "@/lib/automation/types";
import type { GroundedFact, SwarmToolKey, SwarmToolResult } from "./types";

const UNAVAILABLE = "لا تتوفر بيانات فعلية من النظام";

function fact(key: string, labelAr: string, value: string | number | boolean | null, source: string, available = true): GroundedFact {
  return { key, labelAr, value: available ? value : UNAVAILABLE, source, fetchedAt: new Date().toISOString(), available };
}

function ok(tool: SwarmToolKey, summaryAr: string, facts: GroundedFact[], payload?: Record<string, unknown>): SwarmToolResult {
  return { tool, ok: true, summaryAr, facts, payload };
}

function fail(tool: SwarmToolKey, error: string): SwarmToolResult {
  return { tool, ok: false, summaryAr: error, facts: [], error };
}

export async function executeSwarmTool(
  tool: SwarmToolKey,
  args: Record<string, unknown> = {}
): Promise<SwarmToolResult> {
  try {
    switch (tool) {
      case "whatsapp_slots": {
        const { getAllWhatsAppSlotsStatus } = await import("@/lib/server/whatsapp-qr/multi-service");
        const slots = await getAllWhatsAppSlotsStatus();
        const connected = slots.filter((s) => s.status === "connected").length;
        return ok(tool, `واتساب: ${connected} متصل من ${slots.length}`, [
          fact("wa_connected", "أرقام متصلة", connected, "whatsapp-qr"),
          fact("wa_total", "إجمالي الأرقام", slots.length, "whatsapp-qr"),
        ], { connected, total: slots.length });
      }
      case "comms_conversations": {
        const convos = getCommsConversations();
        return ok(tool, `${convos.length} محادثة تواصل فعلية`, [
          fact("comms_count", "محادثات", convos.length, "comms-message-store"),
        ], { count: convos.length });
      }
      case "packages_list": {
        const packages = await listMergedPackages();
        const titles = packages.slice(0, 8).map((p) => p.titleAr || p.titleEn || p.id || "باقة");
        return ok(tool, `${packages.length} برنامج سياحي معتمد`, [
          fact("packages", "البرامج", packages.length, "packages-store"),
        ], { count: packages.length, sample: titles });
      }
      case "blog_list": {
        const posts = await listBlogPosts();
        return ok(tool, `${posts.length} مقالاً في المدونة`, [
          fact("posts", "المقالات", posts.length, "blog-store"),
        ], { count: posts.length, titles: posts.slice(0, 8).map((p) => p.titleAr || p.slug) });
      }
      case "b2b_sessions": {
        const sessions = getB2BChatSessions();
        const avg =
          sessions.length > 0
            ? Math.round(sessions.reduce((s, x) => s + (x.leadScore || 0), 0) / sessions.length)
            : null;
        return ok(tool, `${sessions.length} جلسة B2B`, [
          fact("b2b_count", "جلسات B2B", sessions.length, "b2b-landing-agent-store"),
          fact("b2b_avg_score", "متوسط Lead Score للجلسات الفعلية", avg, "b2b-landing-agent-store", avg !== null),
        ], { count: sessions.length, avgScore: avg });
      }
      case "dashboard_bookings": {
        const stats = await collectDashboardStats();
        return ok(tool, `${stats.bookings.total} حجزاً · PocketBase ${stats.pocketbase ? "متصل" : "غير متصل"}`, [
          fact("bookings", "الحجوزات", stats.bookings.total, "dashboard-stats"),
          fact("customers", "العملاء", stats.customers.total, "dashboard-stats"),
          fact("pocketbase", "PocketBase", stats.pocketbase, "dashboard-stats"),
        ], {
          bookings: stats.bookings.total,
          customers: stats.customers.total,
          pocketbase: stats.pocketbase,
          economics: stats.economics.available
            ? { paidUsd: stats.economics.paidUsd, profitUsd: stats.economics.profitUsd }
            : null,
        });
      }
      case "hotels_runtime": {
        const runtime = await getHotelsRuntime();
        return ok(tool, `محرك الفنادق: ${runtime.mode}`, [
          fact("hotels_mode", "وضع الفنادق", runtime.mode, "hotels-runtime"),
          fact("hotels_providers", "المزودون", runtime.providers.join(", ") || UNAVAILABLE, "hotels-runtime", runtime.providers.length > 0),
        ], { mode: runtime.mode, providers: runtime.providers });
      }
      case "flights_runtime": {
        const runtime = await getFlightsRuntime();
        const provider = runtime.providers?.join(", ") || runtime.mode || "مضبوط";
        return ok(tool, `محرك الطيران: ${provider}`, [
          fact("flights", "الطيران", provider, "flights-runtime"),
        ], { mode: runtime.mode, providers: runtime.providers });
      }
      case "cars_list": {
        const cars = await listInternalCars();
        const active = cars.filter((c) => c.isActive).length;
        return ok(tool, `${cars.length} سيارة (${active} نشطة)`, [
          fact("cars", "السيارات", cars.length, "cars-store"),
          fact("cars_active", "نشطة", active, "cars-store"),
        ], { count: cars.length, active });
      }
      case "ads_status": {
        const creds = await resolveAdsCredentials();
        const status = connectionStatus(creds);
        return ok(
          tool,
          `Meta: ${status.metaLive ? "مربوط" : "غير مربوط"} · Google: ${status.googleLive ? "مربوط" : "غير مربوط"}`,
          [
            fact("meta", "Meta Ads", status.metaLive, "ads/config"),
            fact("google", "Google Ads", status.googleLive, "ads/config"),
          ],
          { ...status }
        );
      }
      case "nostr_social": {
        const settings = await getNostrSocialSettings();
        const relays = (settings.relays || []).filter((r) => r.active !== false).length;
        return ok(tool, `${relays} ريلاي نوستر نشط`, [
          fact("relays", "ريلايز", relays, "nostr-social-store"),
        ], { relays, destinations: (settings.destinations || []).length });
      }
      case "tours_list": {
        const tours = await listMergedTours();
        return ok(tool, `${tours.length} جولة`, [
          fact("tours", "الجولات", tours.length, "tours-store"),
        ], { count: tours.length, titles: tours.slice(0, 8).map((t) => t.title) });
      }
      case "create_blog": {
        const titleAr = String(args.articleTitleAr || args.titleAr || "").trim();
        if (!titleAr) return fail(tool, "عنوان المقال مطلوب للتنفيذ");
        const slug = `guide-${Date.now().toString(36)}`;
        const article = await upsertBlogPost({
          titleAr,
          titleEn: String(args.articleTitleEn || titleAr),
          slug,
          excerptAr: String(args.articleExcerptAr || titleAr),
          contentAr: String(args.articleContentAr || `<h2>${titleAr}</h2><p>محتوى أولي من خلية الوكلاء — راجعوه قبل الاعتماد النهائي إن لزم.</p>`),
          category: String(args.articleCategory || "وجهات سياحية"),
          status: "published",
          coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
          author: "خلية وكلاء لوناليزا",
          tags: ["سياحة", "تركيا"],
          publishedAt: new Date().toISOString(),
        });
        return ok(tool, `تم نشر المقال: ${article.titleAr}`, [
          fact("created_slug", "المقال", article.slug, "blog-store"),
        ], { slug: article.slug, url: `https://lonaliza.com/blog/${article.slug}` });
      }
      case "create_tour": {
        const title = String(args.tourTitle || args.title || "").trim();
        if (!title) return fail(tool, "عنوان الجولة مطلوب");
        const price = Number(args.tourPriceUSD || args.price || 120);
        const tour = await upsertTour({
          title,
          duration: String(args.tourDuration || "يوم كامل"),
          timing: "morning",
          price,
          originalPrice: price * 1.25,
          category: String(args.tourCategory || "VIP Day Tour"),
          highlights: Array.isArray(args.tourHighlights) ? (args.tourHighlights as string[]) : ["سيارة VIP", "سائق عربي"],
          image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
          popular: true,
          isActive: true,
        });
        return ok(tool, `تمت إضافة الجولة: ${tour.title}`, [
          fact("tour", "الجولة", tour.title, "tours-store"),
        ], { id: tour.id, url: "https://lonaliza.com/vip-tours" });
      }
      case "create_automation_job": {
        const job = await upsertAutomationJob({
          name: String(args.jobName || `أتمتة خلية: ${String(args.focus || "مهمة").slice(0, 40)}`),
          type: (String(args.jobType || "articles.research_and_publish") as AutomationJobType),
          cron: String(args.cronExpression || "0 9 * * *"),
          timezone: "Europe/Istanbul",
          enabled: true,
          dryRun: false,
          locales: ["ar", "en", "tr"],
          maxPerRun: 2,
          maxPerDay: 5,
          settings: { focusTopic: String(args.focus || "") },
        });
        return ok(tool, `تم إنشاء وظيفة أتمتة: ${job.name}`, [
          fact("job", "الأتمتة", job.name, "automation-store"),
        ], { id: job.id, url: "https://lonaliza.com/admin/automation" });
      }
      case "launch_meta_ad": {
        const creds = await resolveAdsCredentials();
        if (!connectionStatus(creds).metaLive) {
          return fail(tool, "حساب Meta Ads غير مربوط — لا يمكن إطلاق حملة. أدخلوا التوكن في إعدادات الإعلانات.");
        }
        const adResult = await launchTargetedMetaAdCampaign({
          campaignName: String(args.campaignName || "حملة خلية الوكلاء"),
          objective: "OUTCOME_LEADS",
          targetLocations: Array.isArray(args.targetLocations) ? (args.targetLocations as string[]) : ["SA", "AE", "KW", "QA", "TR"],
          targetInterests: Array.isArray(args.targetInterests) ? (args.targetInterests as string[]) : ["Tourism in Turkey"],
          dailyBudgetUSD: Number(args.dailyBudgetUSD || 50),
          adCaption: String(args.adCaption || "عروض لوناليزا للسياحة والسفر"),
          callToAction: "SEND_WHATSAPP_MESSAGE",
          approved: true,
        });
        return adResult.ok
          ? ok(tool, adResult.summaryAr, [fact("ad", "الحملة", String(args.campaignName || "Meta"), "meta-ads")], { summaryAr: adResult.summaryAr })
          : fail(tool, adResult.summaryAr);
      }
      case "publish_travel_package": {
        const titleAr = String(args.titleAr || args.title || "").trim();
        const destination = String(args.destination || args.destinationAr || "إسطنبول").trim();
        const durationDays = Number(args.durationDays || args.days || 5);
        const price = Number(args.price || args.priceUSD || 1250);
        if (!titleAr) return fail(tool, "عنوان البرنامج السياحي مطلوب للنشر");

        const slug = String(args.slug || `trip-${Date.now().toString(36)}`).trim();
        const days = Array.isArray(args.itinerary) ? args.itinerary : [];

        const pkg = await upsertPublishedPackage({
          title: titleAr,
          titleAr,
          titleEn: String(args.titleEn || titleAr),
          slug,
          destination,
          destinationAr: destination,
          country: String(args.country || "Turkey"),
          countryAr: String(args.countryAr || "تركيا"),
          durationDays,
          durationNights: Math.max(1, durationDays - 1),
          price,
          currency: "USD",
          rating: 4.9,
          isFeatured: true,
          isPublished: true,
          images: Array.isArray(args.images) && args.images.length > 0
            ? args.images
            : [{ url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80", alt: titleAr, width: 800, height: 600 }],
          itinerary: days as any,
          amenities: ["فنادق مختارة", "طيران مباشر / مريح", "جولات سياحية مميزة", "استقبال وتوديع VIP"],
          amenitiesAr: ["فنادق مختارة", "طيران مباشر / مريح", "جولات سياحية مميزة", "استقبال وتوديع VIP"],
          descriptionAr: String(args.descriptionAr || `برنامج سياحي متكامل تم إعداده واعتماده بواسطة مستشار لوناليزا الذكي.`),
        });

        // Notify the Swarm Hive
        try {
          saveSwarmDiscussionMessage({
            id: `disc_${Date.now()}_pub`,
            fromAgent: "site_advisor",
            toAgent: "all",
            type: "decision",
            topic: "نشر برنامج سياحي في الكتالوج",
            contentAr: `🎯 تم بنجاح نشر برنامج سياحي جديد في الكتالوج العام للموقع:\n**${pkg.titleAr}** (${pkg.durationDays} أيام) بسعر $${pkg.price}.\nالرابط: /package/${pkg.slug}`,
            timestamp: new Date().toISOString(),
            impactLevel: "high",
            proposalData: {
              actionType: "publish_package" as any,
              targetPlatform: "storefront",
              suggestedChange: `نشر باقة ${pkg.slug}`,
              estimatedCostUSD: pkg.price,
            },
          });
        } catch {}

        return ok(tool, `تم نشر البرنامج السياحي في الكتالوج: ${pkg.titleAr}`, [
          fact("published_pkg", "البرنامج المنشور", pkg.titleAr, "packages-store"),
          fact("package_slug", "المعرف", pkg.slug, "packages-store"),
          fact("package_url", "الرابط", `/package/${pkg.slug}`, "packages-store"),
        ], { id: pkg.id, slug: pkg.slug, url: `https://lonaliza.com/package/${pkg.slug}` });
      }
      case "launch_maps_scrape": {
        const { launchScrapeJob } = await import("@/lib/server/gmaps-scraper/gmaps-scraper-service");
        const city = String(args.city || args.location || "إسطنبول").trim();
        const keywords = Array.isArray(args.keywords)
          ? (args.keywords as string[])
          : [String(args.keyword || "وكالات سياحة وسفر")];
        const depth = Number(args.depth || 5);
        const res = await launchScrapeJob({
          city,
          keywords,
          depth,
          email: true,
          socials: true,
        });
        if (res.ok && res.job) {
          return ok(tool, `تم إطلاق مسح خرائط جوجل لمدينة ${city} (المعرف: ${res.job.id})`, [
            fact("gmaps_job_id", "مهمة المسح", res.job.id, "gmaps-scraper"),
            fact("gmaps_city", "المدينة", city, "gmaps-scraper"),
          ], { jobId: res.job.id, city });
        }
        return fail(tool, res.error || "فشل إطلاق مهمة المسح");
      }
      case "leads_database": {
        const { getLeadsStatistics, getAllLeads } = await import("@/lib/server/gmaps-scraper/reseller-leads-store");
        const stats = getLeadsStatistics();
        const leads = getAllLeads();
        const topCities = Object.entries(stats.citiesCount)
          .slice(0, 4)
          .map(([c, count]) => `${c} (${count})`)
          .join("، ");
        return ok(tool, `قاعدة بيانات الشركات: ${stats.totalLeads} شركة (${stats.totalWithWhatsapp} واتساب، ${stats.totalWithEmail} إيميل) في ${topCities || "المدن المستهدفة"}`, [
          fact("total_leads", "إجمالي الشركات", stats.totalLeads, "reseller-leads-store"),
          fact("leads_whatsapp", "أرقام واتساب", stats.totalWithWhatsapp, "reseller-leads-store"),
          fact("leads_email", "إيميلات", stats.totalWithEmail, "reseller-leads-store"),
          fact("leads_qualified", "مؤهلة", stats.totalQualified, "reseller-leads-store"),
        ], { stats, sample: leads.slice(0, 5).map((l) => ({ name: l.title, city: l.city, phone: l.phone })) });
      }
      default:
        return fail(tool, `أداة غير معروفة: ${tool}`);
    }
  } catch (err) {
    return fail(tool, err instanceof Error ? err.message : "فشل تنفيذ الأداة");
  }
}

export async function runAgentReadTools(tools: SwarmToolKey[]): Promise<SwarmToolResult[]> {
  const reads = tools.filter((t) =>
    !["create_blog", "create_tour", "create_automation_job", "launch_meta_ad", "publish_travel_package", "launch_maps_scrape"].includes(t)
  );
  const results: SwarmToolResult[] = [];
  for (const tool of reads) {
    results.push(await executeSwarmTool(tool));
  }
  return results;
}
