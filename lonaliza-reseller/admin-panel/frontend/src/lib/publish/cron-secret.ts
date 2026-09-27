import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";
import { publishCronSecretFile } from "./paths";

export async function ensurePublishCronSecret(): Promise<string> {
  let secret =
    (process.env.PUBLISH_CRON_SECRET || "").trim() ||
    (await getServerEnv("PUBLISH_CRON_SECRET"));
  if (!secret) {
    secret =
      (process.env.AUTOMATION_CRON_SECRET || "").trim() ||
      (await getServerEnv("AUTOMATION_CRON_SECRET"));
  }
  if (!secret) {
    secret = randomBytes(24).toString("hex");
  }
  try {
    await fs.mkdir(path.dirname(publishCronSecretFile()), { recursive: true });
    await fs.writeFile(publishCronSecretFile(), `${secret}\n`, { mode: 0o600 });
  } catch {
    /* optional */
  }
  return secret;
}

export async function assertPublishCronSecret(req: Request): Promise<boolean> {
  const secret = (await ensurePublishCronSecret()).trim();
  const header = req.headers.get("x-cron-secret")?.trim() || "";
  return Boolean(secret) && header === secret;
}
