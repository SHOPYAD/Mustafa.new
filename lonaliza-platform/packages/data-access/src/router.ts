import type { DataBackend } from "./types.js";
import { readDatabasePlatformSettings } from "./settings.js";
import { PocketBaseAdapter } from "./pocketbase-adapter.js";
import { PostgresAdapter } from "./postgres-adapter.js";

let cachedBackend: DataBackend | null = null;
let cachedId: string | null = null;

export async function getActiveDataBackend(
  pocketBaseClient: ConstructorParameters<typeof PocketBaseAdapter>[0]
): Promise<DataBackend> {
  const settings = await readDatabasePlatformSettings();
  if (cachedBackend && cachedId === settings.activeBackend) return cachedBackend;

  cachedId = settings.activeBackend;
  cachedBackend =
    settings.activeBackend === "postgres"
      ? new PostgresAdapter()
      : new PocketBaseAdapter(pocketBaseClient);
  return cachedBackend;
}

export function invalidateDataBackendCache(): void {
  cachedBackend = null;
  cachedId = null;
}
