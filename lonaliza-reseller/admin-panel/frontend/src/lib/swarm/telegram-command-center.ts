import fs from "fs";
import path from "path";
import { listRegisteredAgents } from "./agent-registry";
import { collectPlatformGroundedSnapshot } from "./live-agent-metrics";
import type { TelegramAgentSession } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const SESSIONS_FILE = path.join(DATA_DIR, "telegram-sessions.json");
const SECRET_FILE = path.join(DATA_DIR, "telegram-webhook-secret.json");
const SESSION_TTL_MS = 30 * 60 * 1000;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getOrCreateTelegramWebhookSecret(): string {
  ensureDir();
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SECRET_FILE, "utf-8")) as { secret?: string };
      if (raw.secret && raw.secret.length >= 16) return raw.secret;
    }
  } catch {
    /* recreate */
  }
  const secret = `tg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 18)}`;
  fs.writeFileSync(SECRET_FILE, JSON.stringify({ secret }, null, 2), "utf-8");
  return secret;
}

export function verifyTelegramWebhookSecret(headerValue: string | null): boolean {
  const secret = getOrCreateTelegramWebhookSecret();
  return Boolean(headerValue && headerValue === secret);
}

function loadSessions(): TelegramAgentSession[] {
  try {
    ensureDir();
    if (!fs.existsSync(SESSIONS_FILE)) return [];
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8")) as TelegramAgentSession[];
  } catch {
    return [];
  }
}

function saveSessions(list: TelegramAgentSession[]) {
  ensureDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function setTelegramAgentSession(chatId: string, agentKey: string): void {
  const next = loadSessions().filter((s) => s.chatId !== chatId);
  next.push({
    chatId,
    agentKey,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  saveSessions(next);
}

export function clearTelegramAgentSession(chatId: string): void {
  saveSessions(loadSessions().filter((s) => s.chatId !== chatId));
}

export function getTelegramAgentSession(chatId: string): TelegramAgentSession | null {
  const found = loadSessions().find((s) => s.chatId === chatId);
  if (!found) return null;
  if (Date.parse(found.expiresAt) < Date.now()) {
    clearTelegramAgentSession(chatId);
    return null;
  }
  return found;
}

export function telegramAllowedUpdates() {
  return ["message", "edited_message", "callback_query"] as const;
}

export function buildTelegramAgentRouteKeyboard(directiveId: string): Array<Array<{ text: string; callback_data?: string; url?: string }>> {
  const rows: Array<Array<{ text: string; callback_data?: string; url?: string }>> = [
    [
      { text: "👑 المشرف العام (تنفيذ فوري)", callback_data: `agent_route:copilot:${directiveId}` },
      { text: "⚡ خلية العمليات", callback_data: `agent_route:swarm:${directiveId}` },
    ],
  ];
  const agents = listRegisteredAgents(false);
  let row: Array<{ text: string; callback_data?: string; url?: string }> = [];
  for (const agent of agents) {
    row.push({
      text: `${agent.nameAr}`.slice(0, 34),
      callback_data: `agent_route:${agent.id}:${directiveId}`.slice(0, 64),
    });
    if (row.length === 2) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push(row);
  rows.push([{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }]);
  return rows;
}

export async function buildTelegramStartCard(): Promise<string> {
  const snap = await collectPlatformGroundedSnapshot();
  return [
    "👑 *مركز قيادة خلية لوناليزا*",
    "",
    `📦 باقات: ${snap.catalog.packages} · مقالات: ${snap.catalog.posts} · حجوزات: ${snap.catalog.bookings}`,
    `🚗 سيارات: ${snap.catalog.cars} · جولات: ${snap.catalog.tours} · MCP: ${snap.catalog.mcpServers}`,
    `🗄️ PocketBase: ${snap.catalog.pocketbase ? "متصل" : "غير متصل"}`,
    "",
    "الأوامر:",
    "`/agents` حالة الوكلاء الحية",
    "`/metrics` حقائق المنصة",
    "`/swarm الأمر` تشغيل الخلية",
    "`/copilot الأمر` تنفيذ المشرف العام",
    "`/done` إنهاء جلسة الوكيل الحالي",
    "",
    "أو اكتبوا أي توجيه وسيظهر اختيار الوكيل.",
  ].join("\n");
}

export async function buildTelegramAgentsCard(): Promise<string> {
  const snap = await collectPlatformGroundedSnapshot();
  const lines = snap.agents.map(
    (a) => `• *${a.id}*: ${a.keyMetric} — ${a.currentTaskAr}`
  );
  return ["🤖 *حالة الوكلاء من البيانات الحية*", "", ...lines].join("\n");
}

export async function buildTelegramMetricsCard(): Promise<string> {
  const snap = await collectPlatformGroundedSnapshot();
  return [
    "📊 *حقائق المنصة (مصادر فعلية فقط)*",
    "",
    ...snap.facts.map((f) => `• ${f.labelAr}: ${f.available ? String(f.value) : "لا تتوفر بيانات فعلية من النظام"}`),
  ].join("\n");
}

export function mapTelegramRouteToAgent(agentKey: string): { kind: "copilot" | "swarm" | "agent"; agentId?: string } {
  if (agentKey === "copilot") return { kind: "copilot" };
  if (agentKey === "swarm") return { kind: "swarm" };
  if (agentKey === "content") return { kind: "agent", agentId: "social" };
  if (agentKey === "fleet") return { kind: "agent", agentId: "site_advisor" };
  return { kind: "agent", agentId: agentKey };
}
