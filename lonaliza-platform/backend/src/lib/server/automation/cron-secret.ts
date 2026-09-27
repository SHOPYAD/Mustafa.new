import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { getServerEnv, saveServerEnv } from "@/lib/server/env-store";
import { cronSecretFile } from "./paths";

export async function ensureAutomationCronSecret(): Promise<string> {
  let secret = (await getServerEnv("AUTOMATION_CRON_SECRET")).trim();
  if (!secret) {
    secret = (await getServerEnv("EMAIL_CRON_SECRET")).trim();
  }
  if (!secret) {
    secret = randomBytes(24).toString("hex");
    await saveServerEnv({ AUTOMATION_CRON_SECRET: secret });
  }
  try {
    await fs.mkdir(path.dirname(cronSecretFile()), { recursive: true });
    await fs.writeFile(cronSecretFile(), `${secret}\n`, { mode: 0o600 });
  } catch {
    /* PocketBase hook file is optional */
  }
  return secret;
}

export async function assertAutomationCronSecret(req: Request): Promise<boolean> {
  const secret = (await ensureAutomationCronSecret()).trim();
  const header = req.headers.get("x-cron-secret")?.trim() || "";
  return Boolean(secret) && header === secret;
}
