import { DOMAIN_SCREENS, normalizeArabic, type DomainHub, type DomainScreen } from "@/lib/neural-studio/domain-systems";
import { routeUtteranceFromIndex } from "@/lib/studio/index/intent-router";

export type CommandKind = "navigate" | "clarify" | "readiness" | "radar" | "travel" | "discuss" | "article" | "none";

export type NavTarget = { screenId: string; hubId: string; label: string };

export type CommandRoute = {
  kind: CommandKind;
  target?: NavTarget;
  options?: NavTarget[];
  question?: string;
};

export type CommandContext = {
  screenId: string;
  last?: NavTarget | null;
};

/** توجيه حتمي عبر الفهرس الشامل + قواعد agent-plan. */
export function routeUtterance(raw: string, ctx: CommandContext): CommandRoute {
  return routeUtteranceFromIndex(raw, ctx);
}

export function screenOf(screenId: string): DomainScreen | undefined {
  return DOMAIN_SCREENS.find((screen) => screen.screenId === screenId);
}

export function hubOf(screenId: string, hubId: string): DomainHub | undefined {
  return screenOf(screenId)?.hubs.find((hub) => hub.id === hubId);
}

export { normalizeArabic };
