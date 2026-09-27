import { promises as fs } from "fs";
import path from "path";
import type { WeeklyPlan } from "@/lib/studio/planner/types";

const PLAN_DIR = path.join(process.cwd(), ".data", "uploads", "studio", "plans");

export function weeklyPlanFileName(plan: WeeklyPlan): string {
  return `${plan.id}-${plan.locale}.json`;
}

export function weeklyPlanPublicUrl(fileName: string): string {
  return `/api/studio/creative/files?name=plans/${encodeURIComponent(fileName)}`;
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<{
  absolutePath: string;
  relativePath: string;
  url: string;
}> {
  await fs.mkdir(PLAN_DIR, { recursive: true });
  const fileName = weeklyPlanFileName(plan);
  const absolutePath = path.join(PLAN_DIR, fileName);
  await fs.writeFile(absolutePath, JSON.stringify(plan, null, 2), "utf8");
  return {
    absolutePath,
    relativePath: `plans/${fileName}`,
    url: weeklyPlanPublicUrl(fileName),
  };
}
