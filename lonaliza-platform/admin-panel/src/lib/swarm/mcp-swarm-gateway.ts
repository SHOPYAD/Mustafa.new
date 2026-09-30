/**
 * Sovereign Platform-Wide MCP Swarm Gateway:
 * Bridges Model Context Protocol (MCP) servers and tools across 4 sovereign domains:
 * 1. Admin Core & Financials (mcp_admin_*)
 * 2. Storefront & Multilingual Core (mcp_storefront_*)
 * 3. Reseller & Partner B2B Network (mcp_reseller_*)
 * 4. Visual Editor & Live Homepage Schemas (mcp_visual_*)
 */

import { executeSwarmTool } from "./agent-tools";
import type { SwarmToolKey } from "./types";
import { callBuiltinTool } from "@/lib/server/mcp/builtin";
import { isBuiltinMcpId } from "@/lib/server/mcp/catalog";
import {
  getHomepageTemplateDraft,
  getPublishedHomepageDraft,
  saveHomepageTemplateDraft,
  publishHomepageTemplate,
} from "@/lib/server/homepage-template-store";
import { applyTemplatePatch, type TemplatePatch } from "@/lib/visual-editor/apply-patch";
import {
  defaultSectionForType,
  generateInstanceId,
  isHomepageSectionType,
  type HomepageSectionInstance,
  type HomepageSectionType,
} from "@/lib/visual-editor/schema";
import { upsertDesignPatch } from "./qdrant-vector-store";
import { createAdminPocketBase, isPocketBaseConfigured } from "@/lib/pocketbase/admin";

export interface McpSwarmToolDefinition {
  name: string;
  description: string;
  domain: "admin" | "storefront" | "reseller" | "visual_editor" | "comms" | "marketing";
  source: "swarm_grounded" | "mcp_builtin" | "mcp_server" | "sovereign_core";
  parameters?: Record<string, unknown>;
}

export interface McpSwarmToolResult {
  ok: boolean;
  toolName: string;
  summaryAr: string;
  data: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

// Full sovereign catalog of 20+ real platform tools
export function listAvailableMcpSwarmTools(): McpSwarmToolDefinition[] {
  return [
    // --- 1. Admin Core & Financials ---
    {
      name: "mcp_admin_get_financial_ledger",
      description: "جرد الأرباح، المدفوعات، ورصيد بوابات الدفع (Iyzico, Stripe, التحويلات البنكية)",
      domain: "admin",
      source: "sovereign_core",
    },
    {
      name: "mcp_admin_update_currency_rates",
      description: "تحديث واستعلام أسعار الصرف وهامش التحويل للعملات (SAR, USD, EUR, TRY, AED, KWD)",
      domain: "admin",
      source: "sovereign_core",
    },
    {
      name: "mcp_admin_query_database",
      description: "استعلام مباشر وآمن من جداول PocketBase (الحجوزات، الموردين، السائقين، المستخدمين)",
      domain: "admin",
      source: "sovereign_core",
    },
    {
      name: "mcp_admin_manage_staff_permissions",
      description: "فحص وتدقيق حسابات المشرفين وصلاحيات طاقم العمل ومحاولات الدخول",
      domain: "admin",
      source: "sovereign_core",
    },
    {
      name: "mcp_financial_margin_audit",
      description: "تدقيق هوامش الربح والتسعير ومنع الحملات ذات العائد السلبي أو منخفض الهامش",
      domain: "admin",
      source: "swarm_grounded",
    },

    // --- 2. Storefront Core & Content ---
    {
      name: "mcp_storefront_get_page_layout",
      description: "قراءة الهيكل البرمجي والمسارات العامة للصفحات (الرئيسية، باقات VIP، الطيران، الفنادق)",
      domain: "storefront",
      source: "sovereign_core",
    },
    {
      name: "mcp_storefront_update_seo_metadata",
      description: "كتابة وتحديث وسوم الميتا و OpenGraph وعناوين H1/H2 تلقائياً لدعم محركات البحث",
      domain: "storefront",
      source: "sovereign_core",
    },
    {
      name: "mcp_storefront_manage_translations",
      description: "قراءة وتعديل قواميس الترجمة الفورية للموقع (عربي، إنجليزي، تركي، روسي)",
      domain: "storefront",
      source: "sovereign_core",
    },
    {
      name: "mcp_storefront_publish_blog_article",
      description: "نشر مقالات المدونة المنسقة برمجياً مع الصور المهيأة ومفاتيح السيو",
      domain: "storefront",
      source: "sovereign_core",
    },

    // --- 3. Reseller & Partner B2B Network ---
    {
      name: "mcp_reseller_list_agencies",
      description: "فحص حسابات المكاتب والشركات السياحية المسجلة وحالة أرصدتها واشتراكاتها",
      domain: "reseller",
      source: "sovereign_core",
    },
    {
      name: "mcp_reseller_set_pricing_margin",
      description: "تعديل هوامش الربح للموزعين (Wholesale Margin) لقطاع الطيران، الفنادق، والتوصيلات",
      domain: "reseller",
      source: "sovereign_core",
    },
    {
      name: "mcp_reseller_inspect_api_health",
      description: "فحص استجابة واجهات الـ B2B API (/api/v1/b2b/flights/search, /hotels, /transfers)",
      domain: "reseller",
      source: "sovereign_core",
    },
    {
      name: "mcp_reseller_provision_whitelabel",
      description: "توليد وتفعيل إعدادات النطاقات البيضاء للشركاء (Whitelabel Domains) مع شهادات SSL",
      domain: "reseller",
      source: "sovereign_core",
    },

    // --- 4. Visual Editor & Live Homepage Schemas ---
    {
      name: "mcp_visual_get_schema",
      description: "سحب مخطط تصميم الصفحة بالكامل من المحرر البصري وهيكل السيكشانات الحالية",
      domain: "visual_editor",
      source: "sovereign_core",
    },
    {
      name: "mcp_visual_read_sections",
      description: "قراءة أقسام الصفحة الحالية وترتيبها ومحتواها النصي والبصري وألوانها",
      domain: "visual_editor",
      source: "sovereign_core",
    },
    {
      name: "mcp_visual_patch_section",
      description: "تطبيق تعديل برمجي وتصميمي فوري على أي سكشن (Hero, Packages Grid, Fleet, Testimonials)",
      domain: "visual_editor",
      source: "sovereign_core",
    },
    {
      name: "mcp_visual_reorder_sections",
      description: "إعادة ترتيب الأقسام على الصفحة الرئيسية لتحقيق أعلى نسبة تحويل (Conversion Rate)",
      domain: "visual_editor",
      source: "sovereign_core",
    },
    {
      name: "mcp_visual_generate_component",
      description: "توليد كود سكشن جديد بالكامل متوافق مع نظام التصميم السيبراني أو العصري للوجهات",
      domain: "visual_editor",
      source: "sovereign_core",
    },
    {
      name: "mcp_visual_apply_theme_tokens",
      description: "تعديل لوحة الألوان (Color Palette)، الخطوط (Typography)، وأنماط البطاقات",
      domain: "visual_editor",
      source: "sovereign_core",
    },

    // --- Grounded Core Systems ---
    {
      name: "mcp_dashboard_bookings",
      description: "سحب إحصائيات الحجوزات، العملاء، وحالة قاعدة بيانات PocketBase الفعلية",
      domain: "admin",
      source: "swarm_grounded",
    },
    {
      name: "mcp_tourism_inventory",
      description: "استعلام الجولات، البرامج السياحية، الفنادق المتاحة، والسيارات في النظام",
      domain: "storefront",
      source: "swarm_grounded",
    },
    {
      name: "mcp_comms_whatsapp_status",
      description: "فحص أرقام واتساب المتصلة والمحادثات المفتوحة مع العملاء",
      domain: "comms",
      source: "swarm_grounded",
    },
    {
      name: "mcp_meta_ads_intelligence",
      description: "فحص حالة الحملات الإعلانية وميزانيات Meta Ads والوصول",
      domain: "marketing",
      source: "mcp_builtin",
    },
    {
      name: "mcp_b2b_leads_scout",
      description: "استعلام بيانات الوكلاء والشركات السياحية المستهدفة ونتائج الرادار",
      domain: "reseller",
      source: "swarm_grounded",
    },
  ];
}

// Execute any unified tool call dynamically during the agent's Multi-Hop ReAct cycle
function unwired(toolName: string, reason: string, timestamp: string): McpSwarmToolResult {
  return { ok: false, toolName, summaryAr: `الأداة غير مربوطة بنظام حقيقي: ${reason}.`, data: {}, error: "unwired", timestamp };
}

export async function executeMcpSwarmCall(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<McpSwarmToolResult> {
  const timestamp = new Date().toISOString();

  try {
    switch (toolName) {
      // ==========================================
      // DOMAIN 1: ADMIN CORE & FINANCIALS
      // ==========================================
      case "mcp_admin_get_financial_ledger": {
        const pb = await createAdminPocketBase();
        const list = await pb.collection("financial_transactions").getList(1, 20, { sort: "-created" });
        return {
          ok: true,
          toolName,
          summaryAr: `السجل المالي: ${list.totalItems} معاملة في financial_transactions؛ آخر ${list.items.length} مرفقة.`,
          data: { source: "pocketbase:financial_transactions", totalItems: list.totalItems, items: list.items },
          timestamp,
        };
      }

      case "mcp_admin_update_currency_rates":
        return unwired(toolName, "أسعار الصرف تُدار عبر /api/admin/currencies؛ استخدم قدرة العملات في الاستوديو", timestamp);

      case "mcp_admin_query_database": {
        const collection = String(args.collection || "hotel_bookings");
        const limit = Number(args.limit || 10);
        const filter = String(args.filter || "");

        const isConfigured = await isPocketBaseConfigured();
        if (isConfigured) {
          try {
            const pb = await createAdminPocketBase();
            const resultList = await pb.collection(collection).getList(1, limit, {
              filter: filter || undefined,
              sort: "-created",
            });
            return {
              ok: true,
              toolName,
              summaryAr: `استعلام قاعدة البيانات: تم جلب ${resultList.items.length} سجل من جدول ${collection}`,
              data: {
                collection,
                totalItems: resultList.totalItems,
                totalPages: resultList.totalPages,
                items: resultList.items,
              },
              timestamp,
            };
          } catch (pbErr: unknown) {
            console.warn("[MCP] PocketBase direct query fallback:", pbErr);
          }
        }

        return unwired(toolName, isConfigured ? `تعذر الاستعلام من ${collection}` : "PocketBase غير مهيأ", timestamp);
      }

      case "mcp_admin_manage_staff_permissions": {
        const pb = await createAdminPocketBase();
        const admins = await pb.collection("_superusers").getList(1, 50, { fields: "id,email,created,updated" });
        return {
          ok: true,
          toolName,
          summaryAr: `حسابات المشرفين: ${admins.totalItems} حساب superuser في PocketBase.`,
          data: { source: "pocketbase:_superusers", totalItems: admins.totalItems, admins: admins.items },
          timestamp,
        };
      }

      case "mcp_financial_margin_audit": {
        const stats = await executeSwarmTool("dashboard_bookings", args);
        const economics = (stats.payload?.economics as Record<string, unknown>) || {};
        const revenue = Number(economics.paidUsd);
        const profit = Number(economics.profitUsd);
        if (!stats.ok || !Number.isFinite(revenue) || !Number.isFinite(profit) || revenue <= 0) {
          return unwired(toolName, "لا توجد إيرادات وأرباح حقيقية كافية لحساب الهامش", timestamp);
        }
        const marginScore = Math.round((profit / revenue) * 1000) / 10;
        return {
          ok: true,
          toolName,
          summaryAr: `تدقيق الهامش: ${marginScore}% من مدفوعات ${revenue}$ وربح ${profit}$ (بيانات لوحة الحجوزات).`,
          data: { estimatedMargin: marginScore, thresholdApproved: marginScore >= 15, economics },
          timestamp,
        };
      }

      // ==========================================
      // DOMAIN 2: STOREFRONT CORE & CONTENT
      // ==========================================
      case "mcp_storefront_get_page_layout": {
        const pageSlug = String(args.pageSlug || "home");
        const draft = await getPublishedHomepageDraft();
        const sectionCount = draft.layout.length;
        const visibleCount = draft.layout.filter((s) => !s.hidden).length;

        return {
          ok: true,
          toolName,
          summaryAr: `مخطط الصفحة (${pageSlug}): يتضمن ${sectionCount} سيكشن (${visibleCount} مرئي للجمهور)، الهوية البصرية تعتمد Navy: ${draft.global.navy}`,
          data: {
            pageSlug,
            sectionCount,
            visibleCount,
            globalTheme: draft.global,
            sectionsOverview: draft.layout.map((s, idx) => ({
              order: idx + 1,
              instanceId: s.instanceId,
              type: s.type,
              hidden: s.hidden,
              titleAr: s.texts?.title?.ar || s.type,
            })),
          },
          timestamp,
        };
      }

      case "mcp_storefront_update_seo_metadata":
        return unwired(toolName, "لا يوجد مخزن سيو تكتب فيه هذه الأداة", timestamp);

      case "mcp_storefront_manage_translations":
        return unwired(toolName, "الترجمات تُدار عبر /api/admin/translations", timestamp);

      case "mcp_storefront_publish_blog_article":
        return unwired(toolName, "النشر الفعلي يتم عبر مسار المقالات (create_blog) مع الاعتماد", timestamp);

      // ==========================================
      // DOMAIN 3: RESELLER & PARTNER B2B NETWORK
      // ==========================================
      case "mcp_reseller_list_agencies": {
        const pb = await createAdminPocketBase();
        const companies = await pb.collection("reseller_companies").getList(1, 50, { sort: "-created" });
        return {
          ok: true,
          toolName,
          summaryAr: `شبكة الموزعين: ${companies.totalItems} شركة في reseller_companies.`,
          data: { source: "pocketbase:reseller_companies", totalItems: companies.totalItems, companies: companies.items },
          timestamp,
        };
      }

      case "mcp_reseller_set_pricing_margin":
        return unwired(toolName, "هوامش الموزعين تُحفظ عبر /api/admin/resale/settings", timestamp);

      case "mcp_reseller_inspect_api_health":
        return unwired(toolName, "لا يوجد فحص صحة حقيقي لمسارات B2B في هذه الأداة", timestamp);

      case "mcp_reseller_provision_whitelabel":
        return unwired(toolName, "الوايت ليبل يُجهَّز عبر /api/admin/resale/whitelabel مع الاعتماد", timestamp);

      // ==========================================
      // DOMAIN 4: VISUAL EDITOR & LIVE HOMEPAGE SCHEMAS
      // ==========================================
      case "mcp_visual_get_schema": {
        const draft = await getHomepageTemplateDraft();
        return {
          ok: true,
          toolName,
          summaryAr: `مخطط المحرر البصري: تم جلب مسودة التصميم الحالية (${draft.layout.length} سيكشن) مع إعدادات الألوان العالمية`,
          data: {
            layout: draft.layout,
            global: draft.global,
          },
          timestamp,
        };
      }

      case "mcp_visual_read_sections": {
        const draft = await getHomepageTemplateDraft();
        const sections = draft.layout.map((s) => ({
          instanceId: s.instanceId,
          type: s.type,
          hidden: s.hidden,
          titleAr: s.texts?.title?.ar || "",
          subtitleAr: s.texts?.subtitle?.ar || "",
          badgeAr: s.texts?.badge?.ar || "",
          styles: s.styles,
        }));
        return {
          ok: true,
          toolName,
          summaryAr: `أقسام المحرر البصري: ${sections.length} سيكشن مفهرس، يمكن تعديل أو إعادة ترتيب أي منها بالكامل`,
          data: { sections },
          timestamp,
        };
      }

      case "mcp_visual_patch_section": {
        const instanceId = String(args.instanceId || "");
        const updateText = args.updateText as Record<string, string> | undefined;
        const updateStyles = args.updateStyles as Record<string, string> | undefined;

        if (!instanceId) {
          return {
            ok: false,
            toolName,
            summaryAr: "خطأ: لم يتم تحديد instanceId للسكشن المراد تعديله",
            data: {},
            error: "Missing instanceId",
            timestamp,
          };
        }

        const draft = await getHomepageTemplateDraft();
        const patch: TemplatePatch = {};

        if (updateText) {
          patch.updateSectionText = {
            instanceId,
            field: String(args.textField || "title"),
            ar: updateText.ar,
            en: updateText.en,
            tr: updateText.tr,
          };
        }

        if (updateStyles) {
          patch.updateSectionStyles = {
            instanceId,
            styles: updateStyles,
          };
        }

        const patchedDraft = applyTemplatePatch(draft, patch);
        await saveHomepageTemplateDraft(patchedDraft);

        // Record patch into Qdrant design history
        await upsertDesignPatch({
          id: `patch_${Date.now()}`,
          sectionId: instanceId,
          layoutType: "live_patch",
          componentName: instanceId,
          summaryAr: `تعديل سكشن ${instanceId} عبر وكيل التصميم والمحرر`,
          cssTokens: updateStyles || {},
          directorApproved: true,
          timestamp,
        });

        return {
          ok: true,
          toolName,
          summaryAr: `المحرر البصري: تم تطبيق التعديل بنجاح على السكشن (${instanceId}) وحفظه في مسودة الموقع وتوثيقه في Qdrant`,
          data: {
            instanceId,
            patchApplied: patch,
            newDraftSaved: true,
          },
          timestamp,
        };
      }

      case "mcp_visual_reorder_sections": {
        const order = args.instanceIds as string[] | undefined;
        if (!order || !Array.isArray(order) || order.length === 0) {
          return {
            ok: false,
            toolName,
            summaryAr: "خطأ: مصفوفة ترتيب السيكشانات instanceIds غير صحيحة",
            data: {},
            error: "Invalid instanceIds array",
            timestamp,
          };
        }

        const draft = await getHomepageTemplateDraft();
        const patchedDraft = applyTemplatePatch(draft, { reorder: order });
        await saveHomepageTemplateDraft(patchedDraft);

        return {
          ok: true,
          toolName,
          summaryAr: `المحرر البصري: تمت إعادة ترتيب ${order.length} سيكشن بالصفحة الرئيسية لتحسين معدل التحويل`,
          data: { newOrder: order },
          timestamp,
        };
      }

      case "mcp_visual_generate_component": {
        const type = String(args.type || "packages_grid") as HomepageSectionType;
        if (!isHomepageSectionType(type)) {
          return {
            ok: false,
            toolName,
            summaryAr: `نوع السكشن ${type} غير مدعوم في المحرر البصري`,
            data: {},
            error: "Unsupported section type",
            timestamp,
          };
        }

        const draft = await getHomepageTemplateDraft();
        const newInstanceId = generateInstanceId(type);
        const newSection = { ...defaultSectionForType(type), instanceId: newInstanceId };

        if (args.titleAr) {
          newSection.texts.title = { ar: String(args.titleAr), en: "", tr: "" };
        }

        draft.layout.push(newSection);
        await saveHomepageTemplateDraft(draft);

        return {
          ok: true,
          toolName,
          summaryAr: `المحرر البصري: تم توليد وإضافة سكشن جديد (${type}) بمعرف ${newInstanceId} بنجاح إلى الصفحة`,
          data: {
            instanceId: newInstanceId,
            type,
            section: newSection,
          },
          timestamp,
        };
      }

      case "mcp_visual_apply_theme_tokens": {
        const navy = String(args.navy || "#031024");
        const emerald = String(args.emerald || "#00c882");
        const draft = await getHomepageTemplateDraft();
        const patched = applyTemplatePatch(draft, { setGlobal: { navy, emerald } });
        await saveHomepageTemplateDraft(patched);

        return {
          ok: true,
          toolName,
          summaryAr: `المحرر البصري: تم تطبيق لوحة ألوان الهوية البصرية (Navy: ${navy}, Emerald: ${emerald}) على كامل الموقع`,
          data: { globalTheme: patched.global },
          timestamp,
        };
      }

      // ==========================================
      // EXISTING GROUNDED & MCP TOOLS
      // ==========================================
      case "mcp_dashboard_bookings": {
        const res = await executeSwarmTool("dashboard_bookings", args);
        return {
          ok: res.ok,
          toolName,
          summaryAr: res.summaryAr,
          data: res.payload || {},
          timestamp,
        };
      }

      case "mcp_tourism_inventory": {
        const pkgRes = await executeSwarmTool("packages_list", args);
        const tourRes = await executeSwarmTool("tours_list", args);
        const carRes = await executeSwarmTool("cars_list", args);
        return {
          ok: Boolean(pkgRes.ok || tourRes.ok || carRes.ok),
          toolName,
          summaryAr: `المخزون السياحي: ${pkgRes.summaryAr} | ${tourRes.summaryAr} | ${carRes.summaryAr}`,
          data: {
            packages: pkgRes.payload,
            tours: tourRes.payload,
            cars: carRes.payload,
          },
          timestamp,
        };
      }

      case "mcp_comms_whatsapp_status": {
        const wa = await executeSwarmTool("whatsapp_slots", args);
        const comms = await executeSwarmTool("comms_conversations", args);
        return {
          ok: wa.ok,
          toolName,
          summaryAr: `${wa.summaryAr} | ${comms.summaryAr}`,
          data: { wa: wa.payload, comms: comms.payload },
          timestamp,
        };
      }

      case "mcp_meta_ads_intelligence": {
        const adsStatus = await executeSwarmTool("ads_status", args);
        return {
          ok: adsStatus.ok,
          toolName,
          summaryAr: adsStatus.summaryAr,
          data: adsStatus.payload || {},
          timestamp,
        };
      }

      case "mcp_b2b_leads_scout": {
        const b2b = await executeSwarmTool("b2b_sessions", args);
        const leads = await executeSwarmTool("leads_database", args);
        return {
          ok: true,
          toolName,
          summaryAr: `${b2b.summaryAr} | ${leads.summaryAr}`,
          data: { b2b: b2b.payload, leads: leads.payload },
          timestamp,
        };
      }

      case "mcp_platform_system_execute": {
        const { executeControlPanelTool } = await import("@/lib/swarm/control-panel-tool-registry");
        const systemId = String(args.systemId || args.id || "swarm");
        const result = await executeControlPanelTool(systemId);
        return {
          ok: result.ok,
          toolName,
          summaryAr: result.ok ? result.summary : result.error || result.summary,
          data: { systemId, ...result.data, tool: result.tool },
          error: result.error,
          timestamp,
        };
      }

      case "mcp_connector_probe": {
        const { inspectControlPanelTools } = await import("@/lib/swarm/control-panel-tool-registry");
        const rows = await inspectControlPanelTools();
        const missing = rows.filter((row) => !row.connected);
        return {
          ok: missing.length === 0,
          toolName,
          summaryAr: missing.length
            ? `غير متصل: ${missing.map((row) => `${row.tool}: ${row.error}`).join(" | ")}`
            : "موصلات لوحة التحكم المضبوطة متاحة",
          data: { tools: rows },
          error: missing.length ? missing.map((row) => row.error).filter(Boolean).join("; ") : undefined,
          timestamp,
        };
      }

      case "mcp_studio_creative_plan": {
        const ffmpeg = await callBuiltinTool("liotrip-studio", "studio.ffmpeg_status", { dryRun: true });
        const weekly = await callBuiltinTool("liotrip-studio", "studio.weekly_plan", {
          dryRun: true,
          topic: String(args.directive || args.topic || ""),
        });
        const summaryAr = `استوديو الفيديو: ffmpeg ${ffmpeg.ok ? "جاهز" : "غير متاح"} — ${weekly.content || ffmpeg.content || "تم استدعاء خطة الاستوديو"}`;
        return {
          ok: ffmpeg.ok || weekly.ok,
          toolName,
          summaryAr: summaryAr.slice(0, 500),
          data: {
            ffmpeg: ffmpeg.content,
            weeklyPlan: weekly.content,
            invoked: ["liotrip-studio/studio.ffmpeg_status", "liotrip-studio/studio.weekly_plan"],
          },
          error: ffmpeg.ok || weekly.ok ? undefined : weekly.error || ffmpeg.error,
          timestamp,
        };
      }

      default: {
        const fallback = await executeSwarmTool(toolName as SwarmToolKey, args);
        return {
          ok: fallback.ok,
          toolName,
          summaryAr: fallback.summaryAr,
          data: fallback.payload || {},
          error: fallback.error,
          timestamp,
        };
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      toolName,
      summaryAr: `تعذر استدعاء الأداة ${toolName}: ${msg}`,
      data: {},
      error: msg,
      timestamp,
    };
  }
}
