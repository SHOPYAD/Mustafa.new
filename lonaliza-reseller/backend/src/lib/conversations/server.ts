import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: unknown;
  itinerary?: unknown;
  readyForWhatsApp?: boolean;
  attachments?: Array<{ id: string; name: string; mimeType: string }>;
  createdAt?: number;
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
};

export type AiConversationRecord = {
  id: string;
  user?: string;
  title: string;
  messages: StoredChatMessage[];
  created: string;
  updated: string;
};

function sanitizeMessages(raw: unknown): StoredChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 200).map((item, i) => {
    const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const attachments = Array.isArray(rec.attachments)
      ? rec.attachments.slice(0, 8).map((att, j) => {
          const a = att && typeof att === "object" ? (att as Record<string, unknown>) : {};
          return {
            id: String(a.id || `att-${i}-${j}`),
            name: String(a.name || "file").slice(0, 200),
            mimeType: String(a.mimeType || "").slice(0, 80),
          };
        })
      : undefined;
    return {
      id: String(rec.id || `m-${i}`),
      role: rec.role === "user" ? "user" : "assistant",
      text: String(rec.text || "").slice(0, 12000),
      cards: rec.cards,
      itinerary: rec.itinerary,
      readyForWhatsApp: Boolean(rec.readyForWhatsApp),
      attachments,
      createdAt: Number(rec.createdAt) || Date.now(),
      flightHref: rec.flightHref ? String(rec.flightHref).slice(0, 500) : undefined,
      transferHref: rec.transferHref ? String(rec.transferHref).slice(0, 500) : undefined,
      carsHref: rec.carsHref ? String(rec.carsHref).slice(0, 500) : undefined,
    };
  });
}

function titleFromMessages(messages: StoredChatMessage[], fallback: string): string {
  const firstUser = messages.find((m) => m.role === "user" && m.text.trim());
  if (firstUser) return firstUser.text.trim().slice(0, 80);
  return fallback;
}

export function conversationToApi(row: AiConversationRecord) {
  return {
    id: row.id,
    title: row.title || "",
    messages: Array.isArray(row.messages) ? row.messages : [],
    created: row.created,
    updated: row.updated,
  };
}

export async function listConversations(userId: string) {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  const rows = await pb.collection("ai_conversations").getFullList<AiConversationRecord>({
    filter: `user = "${userId}"`,
    sort: "-id",
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title || "",
    preview: sanitizeMessages(row.messages).find((m) => m.role === "user")?.text || "",
    messageCount: sanitizeMessages(row.messages).length,
    created: row.created,
    updated: row.updated,
  }));
}

export async function getConversation(userId: string, id: string) {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const row = await pb.collection("ai_conversations").getOne<AiConversationRecord>(id);
    if (row.user && row.user !== userId) return null;
    return {
      ...conversationToApi(row),
      messages: sanitizeMessages(row.messages),
    };
  } catch {
    return null;
  }
}

export async function upsertConversation(opts: {
  userId: string;
  id?: string;
  title?: string;
  messages: unknown;
}): Promise<{ id: string; title: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) throw new Error("PocketBase unavailable");
  const messages = sanitizeMessages(opts.messages);
  const title = (opts.title || titleFromMessages(messages, "محادثة")).slice(0, 120);

  if (opts.id) {
    const existing = await pb.collection("ai_conversations").getOne<AiConversationRecord>(opts.id);
    if (existing.user && existing.user !== opts.userId) {
      throw new Error("forbidden");
    }
    const updated = await pb.collection("ai_conversations").update<AiConversationRecord>(opts.id, {
      title,
      messages,
    });
    return { id: updated.id, title: updated.title };
  }

  const created = await pb.collection("ai_conversations").create<AiConversationRecord>({
    user: opts.userId,
    title,
    messages,
  });
  return { id: created.id, title: created.title };
}
