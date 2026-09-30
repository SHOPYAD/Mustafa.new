import { normalizeArabic } from "@/lib/neural-studio/domain-systems";
import { DOMAIN_SCREENS } from "@/lib/neural-studio/domain-systems";
import type { CommandContext, CommandRoute, NavTarget } from "@/lib/studio/commands/catalog";

function screenOf(screenId: string) {
  return DOMAIN_SCREENS.find((s) => s.screenId === screenId);
}
function hubOf(screenId: string, hubId: string) {
  return screenOf(screenId)?.hubs.find((h) => h.id === hubId);
}
import { planStudioCapability, splitOperationalParts, type StudioPlan } from "@/lib/studio/capabilities/agent-plan";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";
import { bestPlatformNode, matchPlatformNodes, type NodeMatch } from "./platform-index";
import type { PlatformIndexNode } from "./types";

const OPEN = /(افتح|افتحه|اعرض|عرض|ورني|وريني|روح|انتقل|اذهب)/;
const READINESS = /(جاهزيه|جاهزية|اطلاق|انتاج|نواقص|ثغرات|حاله المنصه|حاله النظام|الخوادم المفعل|خوادم مفعل)/;
const RADAR = /(رادار|استخبارات الشركات|مكاتب سياح)/;
const TRAVEL = /(زيارات|اداء الموقع|مصادر الزيار)/;
const DISCUSS = /(تناقش|نقاش|ناقشوا|نسق الوكلاء|نسّق الوكلاء)/;
const CREATIVE_VIDEO = /(فيديو|ريلز|heygen|higgsfield|canva|حمله اعلان|حملة إعلان)/i;
const ARTICLE_STRICT = /(مقال|مدونه|انشر مقال|اكتب مقال|blog|article)/i;

export type ResolvedIntent = CommandRoute & {
  nodeId?: string;
  plans?: StudioPlan[];
};

function navTargetFromNode(node: PlatformIndexNode): NavTarget | null {
  if (node.hubId && node.screenId) {
    const hub = hubOf(node.screenId, node.hubId);
    if (hub) return { screenId: node.screenId, hubId: node.hubId, label: hub.label };
  }
  if (node.kind === "domain_hub" && node.screenId && node.hubId) {
    const hub = hubOf(node.screenId, node.hubId);
    if (hub) return { screenId: node.screenId, hubId: node.hubId, label: hub.label };
  }
  if (node.screenId && (node.kind === "screen" || node.id.startsWith("screen."))) {
    const sid = node.screenId;
    const domain = screenOf(sid);
    if (domain) {
      const first = domain.hubs[0];
      if (first) return { screenId: sid, hubId: first.id, label: domain.title };
    }
    return { screenId: sid, hubId: `screen.${sid}`, label: node.labels.ar };
  }
  if (node.kind === "nav_leaf" && node.screenId) {
    return { screenId: node.screenId, hubId: node.id.replace(/^nav\.leaf\./, "nav."), label: node.labels.ar };
  }
  return null;
}

function planForNode(node: PlatformIndexNode, text: string): StudioPlan | null {
  const op = planStudioCapability(text);
  if (op) return op;
  if (node.defaultIntent === "briefing") return null;
  if (node.collection && (/(جدول|سجلات|كم|عد)/.test(normalizeArabic(text)) || node.defaultIntent === "open_table")) {
    return { capabilityId: "studio.open_table", input: { collection: node.collection }, why: `فتح ${node.labels.ar}` };
  }
  if (node.collection && OPEN.test(normalizeArabic(text))) {
    return { capabilityId: "studio.open_table", input: { collection: node.collection }, why: `عرض ${node.labels.ar}` };
  }
  if (node.route && node.defaultIntent === "probe" && /(افحص|حالة|probe|اعرض|اقرأ)/.test(normalizeArabic(text))) {
    return { capabilityId: "admin.route.call", input: { route: node.route, method: "GET" }, why: `فحص ${node.labels.ar}` };
  }
  if (node.mapId && OPEN.test(normalizeArabic(text))) {
    return {
      capabilityId: "studio.navigate",
      input: { mapId: node.mapId, nodeId: node.hubId ? `hub.${node.hubId}` : node.id },
      why: `عرض ${node.labels.ar}`,
    };
  }
  return null;
}

function pickNavigateTarget(text: string, matches: NodeMatch[], ctx: CommandContext): ResolvedIntent {
  const ranked = matches.filter((m) =>
    ["domain_hub", "nav_leaf", "screen", "domain_item", "admin_page"].includes(m.node.kind)
  );
  if (ranked.length >= 2 && ranked[0].score - ranked[1].score < 2) {
    const options: NavTarget[] = [];
    for (const m of ranked.slice(0, 2)) {
      const t = navTargetFromNode(m.node);
      if (t) options.push(t);
    }
    if (options.length >= 2) {
      return {
        kind: "clarify",
        options,
        question: `أي قسم تقصد: ${options[0].label} أم ${options[1].label}؟`,
      };
    }
  }
  const best = ranked[0];
  if (best) {
    const target = navTargetFromNode(best.node);
    const plan = planForNode(best.node, text);
    if (target) {
      return { kind: "navigate", target, nodeId: best.node.id, plans: plan ? [plan] : undefined };
    }
  }
  if (OPEN.test(text) && ctx.last) return { kind: "navigate", target: ctx.last };
  return { kind: "clarify", question: "أي قسم أفتح؟ سمّه، مثل الترجمة أو الحجوزات أو المدونة." };
}

export function resolveIntent(raw: string, ctx: CommandContext): ResolvedIntent {
  const text = normalizeArabic(raw);
  if (!text) return { kind: "none" };

  const parts = splitOperationalParts(raw);
  if (parts) {
    const plans = parts.map((p) => planStudioCapability(p)).filter(Boolean) as StudioPlan[];
    if (plans.length === parts.length) return { kind: "none", plans, nodeId: "multi" };
  }

  const opPlan = planStudioCapability(raw);
  if (opPlan) {
    const match = bestPlatformNode(raw, ctx.screenId);
    const target = match ? navTargetFromNode(match.node) : null;
    if (target) return { kind: "navigate", target, plans: [opPlan], nodeId: match!.node.id };
    return { kind: "none", plans: [opPlan], nodeId: "operational" };
  }

  if (DISCUSS.test(text)) return { kind: "discuss" };

  if (READINESS.test(text)) return { kind: "readiness", nodeId: "ui.briefing.open" };
  if (RADAR.test(text)) return { kind: "radar" };
  if (TRAVEL.test(text)) return { kind: "travel" };

  if (!OPEN.test(text) && ARTICLE_STRICT.test(raw) && isArticleDirective(raw)) return { kind: "article" };
  if (!OPEN.test(text) && CREATIVE_VIDEO.test(raw) && !READINESS.test(text)) return { kind: "article" };

  const matches = matchPlatformNodes(raw, ctx.screenId);
  if (matches.length) {
    const top = matches[0];
    if (top.node.defaultIntent === "briefing" && /(تقرير|report)/.test(text) && READINESS.test(text)) {
      return { kind: "readiness", nodeId: top.node.id };
    }
    const plan = planForNode(top.node, raw);
    const target = navTargetFromNode(top.node);
    if (plan && target) {
      return { kind: "navigate", target, nodeId: top.node.id, plans: [plan] };
    }
    if (plan) return { kind: "none", plans: [plan], nodeId: top.node.id };

    if (target && (OPEN.test(text) || top.score >= 4)) {
      return { kind: "navigate", target, nodeId: top.node.id };
    }
    if (target && top.node.kind === "domain_hub") {
      return { kind: "navigate", target, nodeId: top.node.id };
    }
  }

  if (OPEN.test(text)) {
    if (ctx.last && ctx.last.screenId === ctx.screenId) return { kind: "navigate", target: ctx.last };
    return pickNavigateTarget(text, matches, ctx);
  }

  return { kind: "none" };
}

/** توافق مع catalog.routeUtterance */
export function routeUtteranceFromIndex(raw: string, ctx: CommandContext): CommandRoute {
  const r = resolveIntent(raw, ctx);
  if (r.kind === "none" && r.plans?.length) {
    const match = bestPlatformNode(raw, ctx.screenId);
    const target = match ? navTargetFromNode(match.node) : null;
    if (target) return { kind: "navigate", target };
  }
  const { nodeId: _n, plans: _p, ...route } = r;
  return route;
}

export function plansFromIntent(raw: string, ctx: CommandContext): StudioPlan[] {
  const r = resolveIntent(raw, ctx);
  return r.plans ?? [];
}
