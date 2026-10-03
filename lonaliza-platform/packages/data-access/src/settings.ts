import { promises as fs } from "fs";
import path from "path";
import type { DataBackendId } from "./types.js";

export type DatabasePlatformSettings = {
  activeBackend: DataBackendId;
  standbySyncEnabled: boolean;
  lastCutoverAt?: string;
  lastSyncAt?: string;
  syncLagMs?: number;
};

const SETTINGS_REL = "database/data/platform-db-settings.json";

function settingsPath(): string {
  const cwd = process.cwd();
  const base = cwd.endsWith("admin-panel") || cwd.endsWith("storefront") ? path.join(cwd, "..") : cwd;
  return path.join(base, SETTINGS_REL);
}

const DEFAULTS: DatabasePlatformSettings = {
  activeBackend: "pocketbase",
  standbySyncEnabled: true,
};

export async function readDatabasePlatformSettings(): Promise<DatabasePlatformSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabasePlatformSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function writeDatabasePlatformSettings(
  next: DatabasePlatformSettings
): Promise<DatabasePlatformSettings> {
  const file = settingsPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}
