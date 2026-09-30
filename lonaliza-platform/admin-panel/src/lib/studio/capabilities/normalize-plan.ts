import { PROBE_ROUTE_BY_CAP_ID } from "@/lib/studio/index/probe-routes.generated";
import type { StudioPlan } from "./agent-plan";

/** يحوّل معرّفات القدرات الافتراضية من الفهرس إلى قدرات المنفذ الفعلية. */
export function normalizeStudioPlan(plan: StudioPlan): StudioPlan {
  const collList = plan.capabilityId.match(/^collection\.([a-z][a-z0-9_]*)\.list$/);
  if (collList) {
    return {
      ...plan,
      capabilityId: "records.list",
      input: { collection: collList[1], ...plan.input },
    };
  }
  const collGet = plan.capabilityId.match(/^collection\.([a-z][a-z0-9_]*)\.get$/);
  if (collGet) {
    return {
      ...plan,
      capabilityId: "records.get",
      input: { collection: collGet[1], ...plan.input },
    };
  }
  const route = PROBE_ROUTE_BY_CAP_ID[plan.capabilityId];
  if (route) {
    return {
      ...plan,
      capabilityId: "admin.route.call",
      input: { route, method: "GET", ...plan.input },
    };
  }
  return plan;
}
