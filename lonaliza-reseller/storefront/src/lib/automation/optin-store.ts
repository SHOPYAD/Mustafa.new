import { promises as fs } from "fs";
import path from "path";

export type OptInStore = {
  emailUnsubscribed: string[];
  newsletter: string[];
  whatsappOptIn: string[];
  telegramOptIn: string[];
};

function storeFile(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "lonaliza-comms-optin.json");
  }
  return path.join(process.cwd(), ".data", "comms-optin.json");
}

function normEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function normPhone(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

function uniq(values: string[]): string[] {
  return [...new Set(values.map((v) => v).filter(Boolean))];
}

async function readStore(): Promise<OptInStore> {
  try {
    const raw = JSON.parse(await fs.readFile(storeFile(), "utf8")) as Partial<OptInStore>;
    return {
      emailUnsubscribed: uniq((raw.emailUnsubscribed || []).map(normEmail)),
      newsletter: uniq((raw.newsletter || []).map(normEmail)),
      whatsappOptIn: uniq((raw.whatsappOptIn || []).map(normPhone)),
      telegramOptIn: uniq((raw.telegramOptIn || []).map(String)),
    };
  } catch {
    return { emailUnsubscribed: [], newsletter: [], whatsappOptIn: [], telegramOptIn: [] };
  }
}

let writeChain: Promise<void> = Promise.resolve();

async function mutate<T>(fn: (store: OptInStore) => T): Promise<T> {
  let result!: T;
  writeChain = writeChain.then(async () => {
    const store = await readStore();
    result = fn(store);
    await fs.mkdir(path.dirname(storeFile()), { recursive: true });
    await fs.writeFile(storeFile(), JSON.stringify(store, null, 2), { mode: 0o600 });
  });
  await writeChain;
  return result;
}

export async function getOptInStore(): Promise<OptInStore> {
  return readStore();
}

export async function isEmailUnsubscribed(email: string): Promise<boolean> {
  const store = await readStore();
  return store.emailUnsubscribed.includes(normEmail(email));
}

export async function isNewsletterSubscriber(email: string): Promise<boolean> {
  const store = await readStore();
  const e = normEmail(email);
  return store.newsletter.includes(e) && !store.emailUnsubscribed.includes(e);
}

export async function isWhatsAppOptedIn(phone: string): Promise<boolean> {
  const store = await readStore();
  return store.whatsappOptIn.includes(normPhone(phone));
}

export async function isTelegramOptedIn(chatId: string): Promise<boolean> {
  const store = await readStore();
  return store.telegramOptIn.includes(String(chatId || "").trim());
}

export async function recordEmailUnsubscribe(email: string): Promise<void> {
  const e = normEmail(email);
  if (!e) return;
  await mutate((store) => {
    if (!store.emailUnsubscribed.includes(e)) store.emailUnsubscribed.push(e);
  });
}

export async function recordNewsletterOptIn(email: string): Promise<boolean> {
  const e = normEmail(email);
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  await mutate((store) => {
    if (!store.newsletter.includes(e)) store.newsletter.push(e);
    store.emailUnsubscribed = store.emailUnsubscribed.filter((row) => row !== e);
  });
  return true;
}

export async function recordWhatsAppInbound(phone: string): Promise<void> {
  const p = normPhone(phone);
  if (p.length < 8) return;
  await mutate((store) => {
    if (!store.whatsappOptIn.includes(p)) store.whatsappOptIn.push(p);
  });
}

export async function recordTelegramInbound(chatId: string): Promise<void> {
  const id = String(chatId || "").trim();
  if (!id) return;
  await mutate((store) => {
    if (!store.telegramOptIn.includes(id)) store.telegramOptIn.push(id);
  });
}
