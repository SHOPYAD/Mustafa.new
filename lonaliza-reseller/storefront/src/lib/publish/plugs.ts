import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { newPublishId } from "./file-store";
import { publishDataDir } from "./paths";
import { isMissingCollectionError, PUBLISH_COLLECTIONS } from "./pb-collections";
import { createPost } from "./posts";
import { listStoredPosts } from "./store";
import type { PublishAutomationTickStats } from "./types";

export type PublishPlugField = { name: string; value: string };

export type PublishPlugRecord = {
  id: string;
  channelId: string;
  plugFunction: string;
  data: PublishPlugField[];
  activated: boolean;
};

export type PublishPlugCatalogField = {
  name: string;
  type: "number" | "richtext";
  placeholder: string;
  description: string;
  descriptionAr: string;
};

export type PublishPlugDefinition = {
  identifier: string;
  methodName: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  kind: "repost" | "comment";
  fields: PublishPlugCatalogField[];
};

export type PublishPlugCatalog = {
  identifier: string;
  name: string;
  nameAr: string;
  plugs: PublishPlugDefinition[];
};

type FilePayload = { version: 1; plugs: PublishPlugRecord[]; fired: string[]; updatedAt: string };

let memory: FilePayload | null = null;
let writeQueue = Promise.resolve();

function forceFileStore(): boolean {
  return (process.env.PUBLISH_FORCE_FILE || "").trim() === "1";
}

function filePath(): string {
  return path.join(publishDataDir(), "plugs.json");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function fieldsFrom(value: unknown): PublishPlugField[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = asRecord(row);
      const name = asString(item.name);
      return name ? { name, value: asString(item.value) } : null;
    })
    .filter((row): row is PublishPlugField => Boolean(row));
}

export function sanitizePlug(raw: unknown): PublishPlugRecord | null {
  const row = asRecord(raw);
  const id = asString(row.id);
  const channelRel = row.channel;
  const channelFromRel =
    typeof channelRel === "string"
      ? channelRel
      : asString(asRecord(channelRel).id);
  const channelId = asString(row.channelId || row.channel_id || row.integrationId || channelFromRel);
  const plugFunction = asString(row.plugFunction || row.func || row.methodName);
  if (!id || !channelId || !plugFunction) return null;
  return {
    id,
    channelId,
    plugFunction,
    data: fieldsFrom(row.data ?? row.fields),
    activated: asBool(row.activated),
  };
}

const likesField: PublishPlugCatalogField = {
  name: "likesAmount",
  type: "number",
  placeholder: "20",
  description: "Trigger after this many likes",
  descriptionAr: "بعد كم إعجاب؟",
};

const commentField: PublishPlugCatalogField = {
  name: "post",
  type: "richtext",
  placeholder: "تعليق تلقائي…",
  description: "Comment text",
  descriptionAr: "نص التعليق",
};

export const PLUG_CATALOG: PublishPlugCatalog[] = [
  {
    identifier: "x",
    name: "X",
    nameAr: "إكس",
    plugs: [
      {
        identifier: "x-repost-post-users",
        methodName: "x-repost-post-users",
        title: "Repost after likes",
        titleAr: "إعادة نشر بعد الإعجابات",
        description: "Repost when likes hit the threshold.",
        descriptionAr: "يعيد نشر التغريدة عند بلوغ عدد الإعجابات.",
        kind: "repost",
        fields: [likesField],
      },
    ],
  },
  {
    identifier: "threads",
    name: "Threads",
    nameAr: "ثريدز",
    plugs: [
      {
        identifier: "threads-repost",
        methodName: "threads-repost",
        title: "Repost after likes",
        titleAr: "إعادة نشر بعد الإعجابات",
        description: "Repost a Threads post after likes.",
        descriptionAr: "يعيد نشر خيط ثريدز بعد الإعجابات.",
        kind: "repost",
        fields: [likesField],
      },
    ],
  },
  {
    identifier: "linkedin-page",
    name: "LinkedIn Page",
    nameAr: "صفحة لينكدإن",
    plugs: [
      {
        identifier: "linkedin-page-repost",
        methodName: "linkedin-page-repost",
        title: "Repost after reactions",
        titleAr: "إعادة نشر بعد التفاعل",
        description: "Company-page repost.",
        descriptionAr: "إعادة نشر من صفحة الشركة.",
        kind: "repost",
        fields: [likesField],
      },
    ],
  },
  {
    identifier: "linkedin",
    name: "LinkedIn",
    nameAr: "لينكدإن",
    plugs: [
      {
        identifier: "linkedin-add-comment",
        methodName: "linkedin-add-comment",
        title: "Auto comment",
        titleAr: "تعليق تلقائي",
        description: "Comment after reactions.",
        descriptionAr: "يضيف تعليقاً بعد التفاعل.",
        kind: "comment",
        fields: [likesField, commentField],
      },
      {
        identifier: "linkedin-repost-post-users",
        methodName: "linkedin-repost-post-users",
        title: "Repost after reactions",
        titleAr: "إعادة نشر بعد التفاعل",
        description: "Personal repost.",
        descriptionAr: "إعادة نشر من الحساب الشخصي.",
        kind: "repost",
        fields: [likesField],
      },
    ],
  },
  {
    identifier: "bluesky",
    name: "Bluesky",
    nameAr: "بلوسكاي",
    plugs: [
      {
        identifier: "bluesky-repost",
        methodName: "bluesky-repost",
        title: "Repost after likes",
        titleAr: "إعادة نشر بعد الإعجابات",
        description: "Bluesky repost.",
        descriptionAr: "إعادة نشر على بلوسكاي.",
        kind: "repost",
        fields: [likesField],
      },
    ],
  },
];

async function readFileStore(): Promise<FilePayload> {
  if (memory) return memory;
  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), "utf8")) as Partial<FilePayload>;
    memory = {
      version: 1,
      plugs: Array.isArray(parsed.plugs)
        ? parsed.plugs.map(sanitizePlug).filter((row): row is PublishPlugRecord => Boolean(row))
        : [],
      fired: Array.isArray(parsed.fired) ? parsed.fired.map((row) => asString(row)).filter(Boolean) : [],
      updatedAt: asString(parsed.updatedAt) || new Date().toISOString(),
    };
  } catch {
    memory = { version: 1, plugs: [], fired: [], updatedAt: new Date().toISOString() };
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

export async function listPlugs(): Promise<PublishPlugRecord[]> {
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const rows = await pb.collection(PUBLISH_COLLECTIONS.plugs).getFullList({ sort: "-created" });
        return rows
          .map((row) => sanitizePlug({ ...asRecord(row), id: (row as { id?: string }).id }))
          .filter((row): row is PublishPlugRecord => Boolean(row));
      }
    } catch (err) {
      if (!isMissingCollectionError(err)) {
        /* file */
      }
    }
  }
  return (await readFileStore()).plugs;
}

export async function savePlug(raw: unknown): Promise<PublishPlugRecord> {
  const rec = asRecord(raw);
  const existingId = asString(rec.id);
  const current = existingId ? (await listPlugs()).find((row) => row.id === existingId) : undefined;
  const channelId = asString(rec.channelId || rec.channel_id || current?.channelId);
  const plugFunction = asString(rec.plugFunction || rec.func || rec.methodName || current?.plugFunction);
  if (!channelId || !plugFunction) throw new Error("القناة ودالة الـ Plug مطلوبة");
  const row: PublishPlugRecord = {
    id: existingId || newPublishId("pl"),
    channelId,
    plugFunction,
    data: fieldsFrom(rec.data ?? rec.fields ?? current?.data),
    activated: rec.activated === undefined ? current?.activated ?? true : asBool(rec.activated),
  };
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        const col = pb.collection(PUBLISH_COLLECTIONS.plugs);
        const body = {
          integrationId: row.channelId,
          plugFunction: row.plugFunction,
          data: row.data,
          activated: row.activated,
        };
        const saved = existingId ? await col.update(row.id, body) : await col.create({ id: row.id, ...body });
        const parsed = sanitizePlug({ ...asRecord(saved), id: (saved as { id?: string }).id, channelId: row.channelId });
        if (parsed) return parsed;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  await writeFileStore({
    ...store,
    plugs: [row, ...store.plugs.filter((item) => item.id !== row.id)],
  });
  return row;
}

export async function deletePlug(id: string): Promise<boolean> {
  let ok = false;
  if (!forceFileStore()) {
    try {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        await pb.collection(PUBLISH_COLLECTIONS.plugs).delete(id);
        ok = true;
      }
    } catch {
      /* file */
    }
  }
  const store = await readFileStore();
  const next = store.plugs.filter((row) => row.id !== id);
  if (next.length !== store.plugs.length) {
    await writeFileStore({ ...store, plugs: next });
    ok = true;
  }
  return ok;
}

export function plugCatalog(): PublishPlugCatalog[] {
  return PLUG_CATALOG;
}

function fieldOf(plug: PublishPlugRecord, name: string): string {
  return plug.data.find((row) => row.name === name)?.value || "";
}

function plugKind(plug: PublishPlugRecord): "comment" | "repost" {
  if (/comment|autoPlugPost/i.test(plug.plugFunction)) return "comment";
  return "repost";
}

export async function runDuePlugs(options?: {
  now?: Date;
  likesFetcher?: (input: { postId: string; releaseId?: string; channelId: string }) => Promise<number>;
}): Promise<PublishAutomationTickStats> {
  const plugs = (await listPlugs()).filter((row) => row.activated);
  const posts = await listStoredPosts({ state: "published" });
  const store = await readFileStore();
  const fired = new Set(store.fired);
  let checked = 0;
  let created = 0;
  let firedCount = 0;
  let skipped = 0;
  let errors = 0;
  void options?.now;
  for (const plug of plugs) {
    const candidates = posts.filter((post) => post.channelId === plug.channelId && post.releaseId);
    for (const post of candidates) {
      checked += 1;
      const key = `${plug.id}:${post.id}`;
      if (fired.has(key)) {
        skipped += 1;
        continue;
      }
      const threshold = Number(fieldOf(plug, "likesAmount") || 0);
      let likes = 0;
      try {
        likes = options?.likesFetcher
          ? await options.likesFetcher({ postId: post.id, releaseId: post.releaseId, channelId: post.channelId })
          : 0;
      } catch {
        errors += 1;
        continue;
      }
      if (!Number.isFinite(likes) || likes < threshold) {
        skipped += 1;
        continue;
      }
      try {
        const kind = plugKind(plug);
        const comment = fieldOf(plug, "post").trim();
        await createPost({
          channelId: post.channelId,
          content: kind === "comment" ? comment || post.content : post.content,
          title: post.title,
          publishDate: new Date().toISOString(),
          state: "queue",
          approved: true,
          creationMethod: "autopost",
          parentPostId: post.id,
          group: post.group,
          settings: { approved: true, plugKind: kind, plugId: plug.id, sourceReleaseId: post.releaseId },
        });
        created += 1;
        firedCount += 1;
        fired.add(key);
      } catch {
        errors += 1;
      }
    }
  }
  await writeFileStore({ ...store, fired: [...fired] });
  return { checked, created, fired: firedCount, skipped, errors };
}

export function resetPublishPlugsMemory(): void {
  memory = null;
}
