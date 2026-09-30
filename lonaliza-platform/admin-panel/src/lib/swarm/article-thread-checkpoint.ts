import { promises as fs } from "fs";
import path from "path";
import { getSwarmRedisConnection } from "@/lib/swarm/swarm-queue";
import { wantsSeparateArticle } from "@/lib/swarm/article-pipeline-types";

export type ThreadToolResult = {
  tool: string;
  ok: boolean;
  summary: string;
  at: string;
};

export type ThreadTaskType =
  | "article"
  | "settings"
  | "email"
  | "whatsapp"
  | "ads"
  | "video"
  | "flights"
  | "hotels"
  | "bookings"
  | "automation"
  | "general";

export type ArticleThreadCheckpoint = {
  threadId: string;
  articleId: string;
  slug: string;
  destinationKey: string;
  updatedAt: string;
  taskType?: ThreadTaskType;
  plan?: string;
  toolResults?: ThreadToolResult[];
  /** Article, campaign, or setting id. A revision updates this same record. */
  recordId?: string;
};

const FILE = path.join(process.cwd(), ".data", "article-task-sessions.json");

function redisKey(threadId: string): string {
  return `swarm:thread:${threadId.replace(/[^a-zA-Z0-9:_-]/g, "_")}`;
}

async function readFileStore(): Promise<Record<string, ArticleThreadCheckpoint>> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as { sessions?: Record<string, ArticleThreadCheckpoint> };
    return parsed.sessions || {};
  } catch {
    return {};
  }
}

async function writeFileStore(sessions: Record<string, ArticleThreadCheckpoint>): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ sessions }, null, 2), "utf8");
}

export async function loadThreadCheckpoint(threadId: string): Promise<ArticleThreadCheckpoint | null> {
  if (!threadId) return null;
  try {
    const redis = getSwarmRedisConnection();
    const raw = await redis.get(redisKey(threadId));
    if (raw) return JSON.parse(raw) as ArticleThreadCheckpoint;
  } catch {
    /* Redis is optional at read time; the file mirror is the fallback. */
  }
  const sessions = await readFileStore();
  return sessions[threadId] || null;
}

export async function saveThreadCheckpoint(row: ArticleThreadCheckpoint): Promise<void> {
  try {
    const redis = getSwarmRedisConnection();
    await redis.set(redisKey(row.threadId), JSON.stringify(row));
  } catch {
    /* File mirror still holds the article id. */
  }
  const sessions = await readFileStore();
  sessions[row.threadId] = row;
  await writeFileStore(sessions);
}

export async function reserveArticleIdentity(input: {
  threadId: string;
  directive: string;
  destinationKey: string;
}): Promise<ArticleThreadCheckpoint> {
  const existing = await loadThreadCheckpoint(input.threadId);
  if (existing && existing.destinationKey === input.destinationKey && !wantsSeparateArticle(input.directive)) {
    return existing;
  }
  const stamp = Date.now().toString(36);
  const row: ArticleThreadCheckpoint = {
    threadId: input.threadId,
    articleId: `article_${input.destinationKey}_${stamp}`,
    slug: `${input.destinationKey}-gulf-us-${stamp}`,
    destinationKey: input.destinationKey,
    updatedAt: new Date().toISOString(),
  };
  await saveThreadCheckpoint(row);
  return row;
}
