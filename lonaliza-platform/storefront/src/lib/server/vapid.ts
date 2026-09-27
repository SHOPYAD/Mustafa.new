import webpush from "web-push";
import { getServerEnv, persistInternalEnv } from "@/lib/server/env-store";

export type VapidKeys = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}

export async function ensureVapidKeys(): Promise<VapidKeys> {
  let publicKey = (await getServerEnv("VAPID_PUBLIC_KEY")).trim();
  let privateKey = (await getServerEnv("VAPID_PRIVATE_KEY")).trim();
  let subject = (await getServerEnv("VAPID_SUBJECT")).trim();

  if (!subject) {
    const site = (await getServerEnv("NEXT_PUBLIC_SITE_URL")).trim();
    subject = site
      ? `mailto:admin@${site.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`
      : "mailto:admin@lonaliza.com";
  }

  if (!publicKey || !privateKey) {
    const generated = generateVapidKeys();
    publicKey = generated.publicKey;
    privateKey = generated.privateKey;
    await persistInternalEnv({
      VAPID_PUBLIC_KEY: publicKey,
      VAPID_PRIVATE_KEY: privateKey,
      VAPID_SUBJECT: subject,
    });
  }

  return { publicKey, privateKey, subject };
}
