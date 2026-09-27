import fs from "fs";
import path from "path";

export type MessageCategory = "otp" | "booking" | "marketing" | "inbound" | "manual" | "ai_sales";
export type MessageChannel = "whatsapp" | "telegram";
export type MessageDirection = "inbound" | "outbound";
export type MessageTrack = "b2b" | "b2c" | "general";
export type MessageStatus = "sent" | "delivered" | "received" | "failed";

export type CommsMessage = {
  id: string;
  channel: MessageChannel;
  direction: MessageDirection;
  category: MessageCategory;
  track: MessageTrack;
  from: string;
  to: string;
  body: string;
  status: MessageStatus;
  timestamp: string;
  customerName?: string;
  leadScore?: number; // 0 - 100
  intent?: string; // e.g. "istanbul_family_trip", "b2b_reseller_demo", "hotel_booking"
  metadata?: Record<string, unknown>;
};

const DATA_FILE = path.join(process.cwd(), ".data", "comms-messages-log.json");
const MAX_MESSAGES = 1000;

let memoryCache: CommsMessage[] | null = null;

function ensureDataDir(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadCommsMessages(): CommsMessage[] {
  if (memoryCache) return memoryCache;
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      memoryCache = [];
      return memoryCache;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    memoryCache = JSON.parse(raw) as CommsMessage[];
    return memoryCache;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
}

export function saveCommsMessage(msg: Omit<CommsMessage, "id" | "timestamp"> & { id?: string; timestamp?: string }): CommsMessage {
  const list = loadCommsMessages();
  const entry: CommsMessage = {
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: msg.timestamp || new Date().toISOString(),
    ...msg,
  };

  list.unshift(entry);
  if (list.length > MAX_MESSAGES) {
    list.splice(MAX_MESSAGES);
  }
  memoryCache = list;

  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), { mode: 0o600 });
  } catch (err) {
    console.error("[comms-message-store] Failed to persist messages:", err);
  }

  return entry;
}

export function getCommsConversations(): Array<{
  contact: string;
  channel: MessageChannel;
  track: MessageTrack;
  customerName?: string;
  leadScore?: number;
  intent?: string;
  lastMessage: CommsMessage;
  unreadCount: number;
  totalMessages: number;
}> {
  const list = loadCommsMessages();
  const convMap = new Map<string, CommsMessage[]>();

  for (const m of list) {
    const contactKey = m.direction === "inbound" ? m.from : m.to;
    if (!contactKey) continue;
    const key = `${m.channel}:${contactKey}`;
    if (!convMap.has(key)) {
      convMap.set(key, []);
    }
    convMap.get(key)!.push(m);
  }

  const result: Array<{
    contact: string;
    channel: MessageChannel;
    track: MessageTrack;
    customerName?: string;
    leadScore?: number;
    intent?: string;
    lastMessage: CommsMessage;
    unreadCount: number;
    totalMessages: number;
  }> = [];

  for (const [key, msgs] of convMap.entries()) {
    const [channelStr, contact] = key.split(":");
    const lastMessage = msgs[0];
    const customerName = msgs.find((m) => m.customerName)?.customerName;
    const leadScore = msgs.find((m) => m.leadScore !== undefined)?.leadScore;
    const intent = msgs.find((m) => m.intent)?.intent;
    const track = msgs.find((m) => m.track !== "general")?.track || "general";

    result.push({
      contact,
      channel: channelStr as MessageChannel,
      track,
      customerName,
      leadScore,
      intent,
      lastMessage,
      unreadCount: 0,
      totalMessages: msgs.length,
    });
  }

  return result.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
}

export function getMessagesForContact(contact: string, channel: MessageChannel): CommsMessage[] {
  const list = loadCommsMessages();
  return list
    .filter((m) => m.channel === channel && (m.from === contact || m.to === contact))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
