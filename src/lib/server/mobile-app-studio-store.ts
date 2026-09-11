import { promises as fs } from "fs";
import path from "path";

export type MobileAppStudioSettings = {
  displayName: string;
  applicationId: string;
  apiBase: string;
  primaryColor: string;
  amberColor: string;
  githubRepo: string;
};

export type MobileAppBuildStatus = {
  state: "idle" | "queued" | "running" | "succeeded" | "failed";
  artifact?: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "mobile-app-studio.json");
const BUILD_FILE = path.join(DATA_DIR, "mobile-app-build.json");

export const DEFAULT_MOBILE_APP_STUDIO: MobileAppStudioSettings = {
  displayName: "Lonaliza",
  applicationId: "com.lonaliza.app",
  apiBase: "https://lonaliza.com",
  primaryColor: "#7C3AED",
  amberColor: "#F59E0B",
  githubRepo: "",
};

export async function getMobileAppStudioSettings(): Promise<MobileAppStudioSettings> {
  try {
    const raw = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) as Partial<MobileAppStudioSettings>;
    return { ...DEFAULT_MOBILE_APP_STUDIO, ...raw };
  } catch {
    return DEFAULT_MOBILE_APP_STUDIO;
  }
}

export async function saveMobileAppStudioSettings(
  patch: Partial<MobileAppStudioSettings>
): Promise<MobileAppStudioSettings> {
  const next = { ...(await getMobileAppStudioSettings()), ...sanitize(patch) };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2));
  return next;
}

export async function getMobileAppBuildStatus(): Promise<MobileAppBuildStatus> {
  try {
    return JSON.parse(await fs.readFile(BUILD_FILE, "utf8")) as MobileAppBuildStatus;
  } catch {
    return { state: "idle" };
  }
}

export async function writeMobileAppBuildStatus(status: MobileAppBuildStatus): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BUILD_FILE, JSON.stringify(status, null, 2));
}

function sanitize(patch: Partial<MobileAppStudioSettings>): Partial<MobileAppStudioSettings> {
  const next: Partial<MobileAppStudioSettings> = {};
  if (typeof patch.displayName === "string") next.displayName = patch.displayName.trim().slice(0, 40) || "Lonaliza";
  if (typeof patch.applicationId === "string" && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(patch.applicationId)) {
    next.applicationId = patch.applicationId.trim();
  }
  if (typeof patch.apiBase === "string" && /^https:\/\//i.test(patch.apiBase)) {
    next.apiBase = patch.apiBase.trim().replace(/\/$/, "");
  }
  if (typeof patch.primaryColor === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.primaryColor)) {
    next.primaryColor = patch.primaryColor;
  }
  if (typeof patch.amberColor === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(patch.amberColor)) {
    next.amberColor = patch.amberColor;
  }
  if (typeof patch.githubRepo === "string") {
    next.githubRepo = patch.githubRepo.replace(/[^a-zA-Z0-9._\-\/]/g, "").slice(0, 120);
  }
  return next;
}
