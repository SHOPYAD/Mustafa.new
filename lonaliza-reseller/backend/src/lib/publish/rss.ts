import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { createPost } from "./posts";
import { newPublishId } from "./file-store";
import { publishDataDir } from "./paths";
import { isMissingCollectionError, PUBLISH_COLLECTIONS } from "./pb-collections";
import { listPublicChannels } from "./store";
import type { PublishAutomationTickStats, PublishChannel } from "./types";

export type PublishRssRecord = {
  id: string;
  title: string;
  content: string;
  onSlot: boolean;
  syncLast: boolean;
  url: string;
  lastUrl: string;
  active: boolean;
  addPicture: boolean;
  generateContent: boolean;
  integrations: Array<{ id: string }>;
};

type FilePayload = { version: 1; feeds: PublishRssRecord[]; updatedAt: string };

let memory: FilePayload | null = null;
let writeQueue = Promise.resolve();

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

function filePath(): string {
  return path.join(publishDataDir(), "rss.json");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === true || value === "true" || value === 1;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function integrationsFrom(value: unknown): Array<{ id: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (typeof row === "string" && row.trim()) return { id: row.trim() };
      const id = asString(asRecord(row).id || asRecord(row).channelId);
      return id ? { id } : null;
    })
    .filter((row): row is { id: string } => Boolean(row));
}

export function sanitizeRssFeed(raw: unknown): PublishRssRecord | null {
  const row = asRecord(raw);
  const id = asString(row.id);
  const url = asString(row.url).trim();
  if (!id || !url) return null;
  return {
    id,
    title: asString(row.title).trim() || url,
    content: asString(row.content),
    onSlot: asBool(row.onSlot ?? row.on_slot),
    syncLast: asBool(row.syncLast ?? row.sync_last, true),
    url,
    lastUrl: asString(row.lastUrl || row.last_url),
    active: asBool(row.active, true),
    addPicture: asBool(row.addPicture ?? row.add_picture),
    generateContent: asBool(row.generateContent ?? row.generate_content, true),
    integrations: integrationsFrom(row.integrations ?? row.channelIds ?? row.channels),
  };
}

async function readFileStore(): Promise<FilePayload> {
  if (memory) return memory;
  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), "utf8")) as Partial<FilePayload>;
    memory = {
      version: 1,
      feeds: Array.isArray(parsed.feeds)
        ? parsed.feeds.map(sanitizeRssFeed).filter((row): row is PublishRssRecord => Boolean(row))
        : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
  } catch {
    memory = { version: 1, feeds: [], updatedAt: new Date().toISOString() };
  }
  return memory;
}

async function writeFileStore(next: FilePayload): Promise<void> {
  memory = { ...next, updatedAt: new Date().toISOString() };
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(filePath()), { recursive: true, mode: 0o700 });
    const tmp = `${filePath()}.${randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(memory, null, 2), { mode: 0o600 });
    await fs.rename(tmp, filePath());
  });
  await writeQueue;
}

export async function listRssFeeds(): Promise<PublishRssRecord[]> {
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const rows = await pb.collection(PUBLISH_COLLECTIONS.rssFeeds).getFullList({ sort: "-created" });
        return rows
          .map((row) => sanitizeRssFeed({ ...asRecord(row), id: (row as { id?: string }).id }))
          .filter((row): row is PublishRssRecord => Boolean(row));
      }
    } catch (err) {
      if (!isMissingCollectionError(err)) {
        /* file */
      }
    }
  }
  return (await readFileStore()).feeds;
}

export async function saveRssFeed(raw: unknown): Promise<PublishRssRecord> {
  const rec = asRecord(raw);
  const existingId = asString(rec.id);
  const current = existingId ? (await listRssFeeds()).find((row) => row.id === existingId) : undefined;
  const url = asString(rec.url || current?.url).trim();
  const title = asString(rec.title || current?.title).trim();
  if (!url) throw new Error("رابط التغذية مطلوب");
  if (!/^https?:\/\//i.test(url)) throw new Error("رابط التغذية يجب أن يبدأ بـ http أو https");
  const row: PublishRssRecord = {
    id: existingId || newPublishId("rss"),
    title: title || url,
    content: rec.content === undefined ? current?.content || "" : asString(rec.content),
    onSlot: rec.onSlot === undefined && rec.on_slot === undefined ? current?.onSlot ?? true : asBool(rec.onSlot ?? rec.on_slot),
    syncLast:
      rec.syncLast === undefined && rec.sync_last === undefined ? current?.syncLast ?? true : asBool(rec.syncLast ?? rec.sync_last, true),
    url,
    lastUrl: rec.lastUrl === undefined && rec.last_url === undefined ? current?.lastUrl || "" : asString(rec.lastUrl || rec.last_url),
    active: rec.active === undefined ? current?.active ?? true : asBool(rec.active, true),
    addPicture:
      rec.addPicture === undefined && rec.add_picture === undefined
        ? current?.addPicture ?? false
        : asBool(rec.addPicture ?? rec.add_picture),
    generateContent:
      rec.generateContent === undefined && rec.generate_content === undefined
        ? current?.generateContent ?? true
        : asBool(rec.generateContent ?? rec.generate_content, true),
    integrations:
      rec.integrations === undefined && rec.channelIds === undefined && rec.channels === undefined
        ? current?.integrations || []
        : integrationsFrom(rec.integrations ?? rec.channelIds ?? rec.channels),
  };
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const col = pb.collection(PUBLISH_COLLECTIONS.rssFeeds);
        const body = {
          title: row.title,
          content: row.content,
          url: row.url,
          lastUrl: row.lastUrl,
          active: row.active,
          onSlot: row.onSlot,
          syncLast: row.syncLast,
          addPicture: row.addPicture,
          generateContent: row.generateContent,
          integrations: row.integrations,
        };
        const saved = existingId ? await col.update(row.id, body) : await col.create({ id: row.id, ...body });
        const parsed = sanitizeRssFeed({ ...asRecord(saved), id: (saved as { id?: string }).id });
        if (parsed) return parsed;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  await writeFileStore({
    ...store,
    feeds: [row, ...store.feeds.filter((item) => item.id !== row.id)],
  });
  return row;
}

export async function deleteRssFeed(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        await pb.collection(PUBLISH_COLLECTIONS.rssFeeds).delete(id);
        ok = true;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  const next = store.feeds.filter((row) => row.id !== id);
  if (next.length !== store.feeds.length) {
    await writeFileStore({ ...store, feeds: next });
    ok = true;
  }
  return ok;
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function firstTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

export type RssItem = {
  title: string;
  url: string;
  description: string;
  image?: string;
  publishedAt?: string;
};

export function parseRssXml(xml: string): RssItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  const items = blocks.map((item) => {
    const link = firstTag(item, "link") || item.match(/<link[^>]+href="([^"]+)"/i)?.[1] || "";
    const title = firstTag(item, "title");
    const description = firstTag(item, "description") || firstTag(item, "summary") || title;
    const image =
      item.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ||
      item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ||
      "";
    const publishedAt = firstTag(item, "pubDate") || firstTag(item, "updated") || firstTag(item, "published");
    return { title, url: link, description, image: image || undefined, publishedAt };
  });
  return items.sort((a, b) => Date.parse(b.publishedAt || "") - Date.parse(a.publishedAt || ""));
}

export function findNextFreeSlot(
  channel: PublishChannel,
  occupied: string[],
  now = new Date()
): string {
  const taken = new Set(occupied.map((row) => Date.parse(row)).filter(Number.isFinite));
  const times = (channel.postingTimes || [])
    .map((row) => row.time)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  const slots = times.length ? times : [now.getUTCHours() * 60 + now.getUTCMinutes() + 60];
  for (let day = 0; day < 14; day++) {
    for (const minutes of slots) {
      const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + day, 0, 0, 0, 0));
      next.setUTCMinutes(minutes);
      if (next.getTime() <= now.getTime()) continue;
      if (taken.has(next.getTime())) continue;
      return next.toISOString();
    }
  }
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
}

export type RssPreview = {
  success: boolean;
  url?: string;
  description?: string;
  image?: string;
  error?: string;
};

export async function previewRssFeed(url: string): Promise<RssPreview> {
  const href = String(url || "").trim();
  if (!/^https?:\/\//i.test(href)) {
    return { success: false, error: "الرابط يجب أن يبدأ بـ http أو https" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(href, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    if (!res.ok) return { success: false, error: `تعذّر جلب التغذية (${res.status})` };
    const xml = await res.text();
    const items = parseRssXml(xml);
    if (!items[0]) return { success: false, error: "لا عناصر في التغذية" };
    return {
      success: true,
      url: items[0].url || href,
      description: items[0].description,
      image: items[0].image,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "تعذّر قراءة التغذية" };
  }
}

export async function runRssAutopost(options?: {
  fetchImpl?: typeof fetch;
  force?: boolean;
  now?: Date;
}): Promise<PublishAutomationTickStats> {
  const feeds = (await listRssFeeds()).filter((row) => row.active);
  const channels = await listPublicChannels();
  const fetchImpl = options?.fetchImpl || fetch;
  const now = options?.now || new Date();
  let checked = 0;
  let created = 0;
  let fired = 0;
  let skipped = 0;
  let errors = 0;
  for (const feed of feeds) {
    checked += 1;
    let xml = "";
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      const res = await fetchImpl(feed.url, { signal: options?.force ? undefined : controller.signal, redirect: "follow" });
      clearTimeout(timer);
      if (!res.ok) {
        errors += 1;
        continue;
      }
      xml = await res.text();
    } catch {
      errors += 1;
      continue;
    }
    const items = parseRssXml(xml);
    const newest = items[0];
    if (!newest?.url) {
      errors += 1;
      continue;
    }
    if (feed.lastUrl && feed.lastUrl === newest.url) {
      skipped += 1;
      continue;
    }
    const targets =
      feed.integrations.length > 0
        ? channels.filter((row) => feed.integrations.some((item) => item.id === row.id) && !row.disabled)
        : channels.filter((row) => !row.disabled);
    if (targets.length === 0) {
      skipped += 1;
      continue;
    }
    const caption = `${newest.title || feed.title}\n${newest.description || feed.content}\n${newest.url}`.slice(0, 2000);
    const mediaUrls = feed.addPicture && newest.image ? [newest.image] : [];
    try {
      for (const channel of targets) {
        const occupied: string[] = [];
        await createPost({
          channelId: channel.id,
          content: caption,
          title: newest.title || feed.title,
          publishDate: feed.onSlot ? findNextFreeSlot(channel, occupied, now) : now.toISOString(),
          state: "queue",
          approved: true,
          creationMethod: "autopost",
          mediaUrls,
          settings: { source: "rss", feedId: feed.id, itemUrl: newest.url, approved: true },
        });
        created += 1;
        fired += 1;
      }
      await saveRssFeed({ ...feed, lastUrl: newest.url });
    } catch {
      errors += 1;
    }
  }
  return { checked, created, fired, skipped, errors };
}

export function resetPublishRssMemory(): void {
  memory = null;
}
