import { promises as fs } from "fs";
import path from "path";

export type DataBackendId = "pocketbase" | "postgres";

export type DatabasePlatformSettings = {
  activeBackend: DataBackendId;
  standbySyncEnabled: boolean;
  lastCutoverAt?: string;
  lastSyncAt?: string;
  syncLagMs?: number;
};

const SETTINGS_REL = "database/data/platform-db-settings.json";

function settingsPath(): string {
  return path.join(process.cwd(), "..", SETTINGS_REL);
}

const DEFAULTS: DatabasePlatformSettings = {
  activeBackend: "pocketbase",
  standbySyncEnabled: true,
};

export async function readDatabasePlatformSettings(): Promise<DatabasePlatformSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), "utf8");
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<DatabasePlatformSettings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function writeDatabasePlatformSettings(
  patch: Partial<DatabasePlatformSettings>
): Promise<DatabasePlatformSettings> {
  const current = await readDatabasePlatformSettings();
  const next = { ...current, ...patch };
  const file = settingsPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function postgresHealth(): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!url) return { ok: false, error: "DATABASE_URL not configured" };
  try {
    const pg = await import("pg");
    const pool = new pg.default.Pool({ connectionString: url, max: 1 });
    await pool.query("SELECT 1");
    await pool.end();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "postgres_error" };
  }
}
