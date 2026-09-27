import path from "path";
import { promises as fs } from "fs";
import pino from "pino";
import QRCode from "qrcode";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

export type WhatsAppSlotConfig = {
  id: number; // 1 to 5
  label: string;
  aiEnabled: boolean;
  aiTrack: "b2b" | "b2c" | "auto";
  isDefault: boolean;
};

export type WhatsAppSlotStatus = {
  id: number;
  slotId: number;
  label: string;
  aiEnabled: boolean;
  aiTrack: "b2b" | "b2c" | "auto";
  isDefault: boolean;
  status: "disconnected" | "connecting" | "qr_ready" | "connected";
  qrCodeUrl: string | null;
  phone: string | null;
  name: string | null;
  updatedAt: string;
  error?: string;
};

const DEFAULT_SLOT_CONFIGS: WhatsAppSlotConfig[] = [
  {
    id: 1,
    label: "المبيعات وإدارة النظام B2B (الرئيسي)",
    aiEnabled: true,
    aiTrack: "b2b",
    isDefault: true,
  },
  {
    id: 2,
    label: "خدمة العملاء وحجوزات السياحة B2C",
    aiEnabled: true,
    aiTrack: "b2c",
    isDefault: false,
  },
  {
    id: 3,
    label: "حجوزات الفنادق والبرامج السياحية",
    aiEnabled: true,
    aiTrack: "b2c",
    isDefault: false,
  },
  {
    id: 4,
    label: "تذاكر الطيران والمواصلات VIP",
    aiEnabled: true,
    aiTrack: "b2c",
    isDefault: false,
  },
  {
    id: 5,
    label: "الدعم المباشر والاستفسارات العامة",
    aiEnabled: false,
    aiTrack: "auto",
    isDefault: false,
  },
];

const logger = pino({ level: "silent" });
const CONFIG_FILE = path.join(process.cwd(), ".data", "whatsapp-slots-config.json");

function getSlotAuthDir(slotId: number): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", `lonaliza-wa-qr-auth-slot-${slotId}`);
  }
  // Slot 1 backward-compatibility with existing auth folder
  if (slotId === 1) {
    return path.join(process.cwd(), ".data", "whatsapp-qr-auth");
  }
  return path.join(process.cwd(), ".data", "whatsapp-qr-auth", `slot_${slotId}`);
}

const sockets = new Map<number, WASocket>();
const initializingSlots = new Set<number>();

const slotStatuses = new Map<number, WhatsAppSlotStatus>();

// Critical Anti-Spam and Concurrency Protection
const activeReplyLocks = new Set<string>();
const lastReplyTimestamps = new Map<string, number>();
const lastManualOutboundTimestamps = new Map<string, number>();

function fsExistsSync(filePath: string): boolean {
  try {
    return require("fs").existsSync(filePath);
  } catch {
    return false;
  }
}

function loadSlotConfigs(): WhatsAppSlotConfig[] {
  try {
    if (fsExistsSync(CONFIG_FILE)) {
      const raw = require("fs").readFileSync(CONFIG_FILE, "utf-8");
      const list = JSON.parse(raw) as WhatsAppSlotConfig[];
      if (Array.isArray(list) && list.length > 0) {
        return DEFAULT_SLOT_CONFIGS.map((def) => {
          const found = list.find((c) => c.id === def.id);
          return found ? { ...def, ...found } : def;
        });
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SLOT_CONFIGS;
}

function saveSlotConfigs(configs: WhatsAppSlotConfig[]): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fsExistsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
    require("fs").writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2), { mode: 0o600 });
  } catch (err) {
    console.error("[multi-whatsapp-qr] Error saving slot configs:", err);
  }
}

// Initialize default in-memory slot states
for (const config of DEFAULT_SLOT_CONFIGS) {
  slotStatuses.set(config.id, {
    ...config,
    slotId: config.id,
    status: "disconnected",
    qrCodeUrl: null,
    phone: null,
    name: null,
    updatedAt: new Date().toISOString(),
  });
}

function extractBaileysText(msgObj: unknown): string {
  if (!msgObj || typeof msgObj !== "object") return "";
  const m = msgObj as Record<string, unknown>;
  if (typeof m.conversation === "string" && m.conversation) return m.conversation;
  if (m.extendedTextMessage && typeof m.extendedTextMessage === "object") {
    const ext = m.extendedTextMessage as Record<string, unknown>;
    if (typeof ext.text === "string") return ext.text;
  }
  if (m.imageMessage && typeof m.imageMessage === "object") {
    const img = m.imageMessage as Record<string, unknown>;
    if (typeof img.caption === "string") return img.caption;
  }
  if (m.videoMessage && typeof m.videoMessage === "object") {
    const vid = m.videoMessage as Record<string, unknown>;
    if (typeof vid.caption === "string") return vid.caption;
  }
  if (m.templateButtonReplyMessage && typeof m.templateButtonReplyMessage === "object") {
    const t = m.templateButtonReplyMessage as Record<string, unknown>;
    if (typeof t.selectedDisplayText === "string") return t.selectedDisplayText;
    if (typeof t.selectedId === "string") return t.selectedId;
  }
  if (m.buttonsResponseMessage && typeof m.buttonsResponseMessage === "object") {
    const b = m.buttonsResponseMessage as Record<string, unknown>;
    if (typeof b.selectedDisplayText === "string") return b.selectedDisplayText;
    if (typeof b.selectedButtonId === "string") return b.selectedButtonId;
  }
  if (m.listResponseMessage && typeof m.listResponseMessage === "object") {
    const l = m.listResponseMessage as Record<string, unknown>;
    const sr = l.singleSelectReply as Record<string, unknown> | undefined;
    if (typeof sr?.selectedRowId === "string") return sr.selectedRowId;
  }
  if (m.ephemeralMessage && typeof m.ephemeralMessage === "object") {
    const eph = m.ephemeralMessage as Record<string, unknown>;
    return extractBaileysText(eph.message);
  }
  if (m.viewOnceMessage && typeof m.viewOnceMessage === "object") {
    const vo = m.viewOnceMessage as Record<string, unknown>;
    return extractBaileysText(vo.message);
  }
  if (m.viewOnceMessageV2 && typeof m.viewOnceMessageV2 === "object") {
    const vo2 = m.viewOnceMessageV2 as Record<string, unknown>;
    return extractBaileysText(vo2.message);
  }
  if (m.documentWithCaptionMessage && typeof m.documentWithCaptionMessage === "object") {
    const doc = m.documentWithCaptionMessage as Record<string, unknown>;
    return extractBaileysText(doc.message);
  }
  return "";
}

export async function getAllWhatsAppSlotsStatus(): Promise<WhatsAppSlotStatus[]> {
  const configs = loadSlotConfigs();
  const results: WhatsAppSlotStatus[] = [];

  for (const config of configs) {
    let current = slotStatuses.get(config.id);
    if (!current) {
      current = {
        ...config,
        slotId: config.id,
        status: "disconnected",
        qrCodeUrl: null,
        phone: null,
        name: null,
        updatedAt: new Date().toISOString(),
      };
      slotStatuses.set(config.id, current);
    } else {
      current.label = config.label;
      current.aiEnabled = config.aiEnabled;
      current.aiTrack = config.aiTrack;
      current.isDefault = config.isDefault;
      current.slotId = config.id;
    }

    if (!sockets.has(config.id)) {
      try {
        const dir = getSlotAuthDir(config.id);
        const credsFile = path.join(dir, "creds.json");
        const credsStats = await fs.stat(credsFile).catch(() => null);
        if (credsStats && credsStats.isFile()) {
          try {
            const raw = await fs.readFile(credsFile, "utf-8");
            const parsedCreds = JSON.parse(raw);
            if (parsedCreds?.me?.id) {
              const numOnly = parsedCreds.me.id.split(":")[0].replace(/\D/g, "");
              current.phone = `+${numOnly}`;
              current.name = parsedCreds.me.name || "Lonaliza";
              current.status = "connected";
              current.updatedAt = credsStats.mtime.toISOString();
            }
          } catch {}
        }
      } catch {
        // ignore
      }
    }

    results.push({ ...current, id: config.id, slotId: config.id });
  }

  return results.sort((a, b) => a.id - b.id);
}

export async function getWhatsAppSlotStatus(slotId: number): Promise<WhatsAppSlotStatus> {
  const all = await getAllWhatsAppSlotsStatus();
  const found = all.find((s) => s.id === slotId);
  if (found) return found;
  return {
    id: slotId,
    slotId: slotId,
    label: `رقم ${slotId}`,
    aiEnabled: true,
    aiTrack: "auto",
    isDefault: slotId === 1,
    status: "disconnected",
    qrCodeUrl: null,
    phone: null,
    name: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function startWhatsAppSlotSession(slotId: number): Promise<WhatsAppSlotStatus> {
  if (slotId < 1 || slotId > 5) {
    throw new Error("رقم الخانة يجب أن يكون بين 1 و 5");
  }

  const existingSocket = sockets.get(slotId);
  const current = (await getAllWhatsAppSlotsStatus()).find((s) => s.id === slotId)!;

  if (existingSocket && current.status === "connected") {
    return current;
  }
  if (initializingSlots.has(slotId)) {
    return current;
  }

  initializingSlots.add(slotId);

  try {
    const dir = getSlotAuthDir(slotId);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1015901307] as [number, number, number],
    }));

    current.status = "connecting";
    current.updatedAt = new Date().toISOString();
    current.error = undefined;
    slotStatuses.set(slotId, { ...current });

    const socket = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: [`Lonaliza Slot ${slotId}`, "Chrome", "1.0.0"],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
    });

    sockets.set(slotId, socket);

    socket.ev.on("creds.update", saveCreds);

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 6,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          current.status = "qr_ready";
          current.qrCodeUrl = qrDataUrl;
          current.phone = null;
          current.name = null;
          current.updatedAt = new Date().toISOString();
          slotStatuses.set(slotId, { ...current });
        } catch {
          // ignore
        }
      }

      if (connection === "open") {
        const user = socket?.user;
        const phone = user?.id ? user.id.split(":")[0].replace(/\D/g, "") : null;
        const name = user?.name || user?.notify || null;
        current.status = "connected";
        current.qrCodeUrl = null;
        current.phone = phone;
        current.name = name;
        current.updatedAt = new Date().toISOString();
        slotStatuses.set(slotId, { ...current });
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (statusCode === DisconnectReason.loggedOut) {
          await logoutWhatsAppSlotSession(slotId);
        } else {
          current.status = "disconnected";
          current.qrCodeUrl = null;
          current.updatedAt = new Date().toISOString();
          current.error = lastDisconnect?.error?.message || "Connection closed";
          slotStatuses.set(slotId, { ...current });

          if (shouldReconnect) {
            setTimeout(() => {
              void startWhatsAppSlotSession(slotId);
            }, 3500);
          }
        }
      }
    });

    socket.ev.on("messages.upsert", async ({ messages, type }) => {
      // 1. STRICT: Only process genuine live notifications, NEVER historical sync or appends!
      if (type !== "notify") {
        return;
      }

      for (const msg of messages) {
        if (!msg.message) continue;

        const remoteJid = msg.key.remoteJid || "";
        if (!remoteJid || remoteJid.endsWith("@g.us") || remoteJid === "status@broadcast") {
          continue;
        }

        const senderPhone = remoteJid.split("@")[0].replace(/\D/g, "");
        if (!senderPhone) continue;

        const customerName = msg.pushName || undefined;
        const textBody = extractBaileysText(msg.message);
        if (!textBody.trim()) continue;

        // 2. STRICT: Skip messages older than 25 seconds (prevents replying to old history on reconnect!)
        const nowSec = Math.floor(Date.now() / 1000);
        const msgTime = Number(msg.messageTimestamp || 0);
        if (msgTime > 0 && nowSec - msgTime > 25) {
          continue;
        }

        if (msg.key.fromMe) {
          // Record that the human owner just chatted with this phone number
          lastManualOutboundTimestamps.set(senderPhone, Date.now());
          try {
            const { saveCommsMessage } = await import("@/lib/automation/comms-message-store");
            saveCommsMessage({
              channel: "whatsapp",
              direction: "outbound",
              category: "manual",
              track: "general",
              from: current.phone || "system",
              to: senderPhone,
              body: textBody,
              status: "sent",
              metadata: { slotId, slotLabel: current.label },
            });
          } catch (err) {
            console.error(`[multi-whatsapp-qr:slot-${slotId}] saveCommsMessage error:`, err);
          }
          continue;
        }

        try {
          const { saveCommsMessage } = await import("@/lib/automation/comms-message-store");
          saveCommsMessage({
            channel: "whatsapp",
            direction: "inbound",
            category: "inbound",
            track: current.aiTrack === "b2b" ? "b2b" : current.aiTrack === "b2c" ? "b2c" : "general",
            from: senderPhone,
            to: current.phone || `slot_${slotId}`,
            body: textBody,
            status: "received",
            customerName,
            metadata: { slotId, slotLabel: current.label },
          });
        } catch {
          // ignore
        }

        // 3. STRICT AI CHECKS: Must be explicitly enabled on this slot
        if (!current.aiEnabled) {
          continue;
        }

        // 4. CHECK HUMAN ACTIVITY: If user was chatting manually with this contact in the last 45 minutes, DO NOT INTERVENE!
        const lastManual = lastManualOutboundTimestamps.get(senderPhone) || 0;
        if (Date.now() - lastManual < 45 * 60 * 1000) {
          console.log(`[multi-whatsapp-qr:slot-${slotId}] Human user chatted with ${senderPhone} in last 45m. Suppressing AI.`);
          continue;
        }

        // 5. CONCURRENCY LOCK & COOLDOWN: Never spam back-to-back!
        if (activeReplyLocks.has(senderPhone)) {
          console.log(`[multi-whatsapp-qr:slot-${slotId}] AI reply already in progress for ${senderPhone}. Skipping.`);
          continue;
        }

        const lastReply = lastReplyTimestamps.get(senderPhone) || 0;
        if (Date.now() - lastReply < 45000) {
          console.log(`[multi-whatsapp-qr:slot-${slotId}] 45s cooldown active for ${senderPhone}. Skipping.`);
          continue;
        }

        // 6. BUSINESS INTENT CHECK: Only reply if business keywords or travel inquiry exists!
        const lower = textBody.toLowerCase();
        const hasBiz = [
          "حجز", "سعر", "باقة", "فندق", "طيران", "رحلة", "ديمو", "نظام", "شركة", "منصة",
          "بكج", "طرابزون", "إسطنبول", "تركيا", "سياحة", "تكلفة", "سيارة", "سائق", "بورصة",
          "booking", "hotel", "flight", "tour", "price", "istanbul", "trabzon"
        ].some((k) => lower.includes(k));

        if (!hasBiz) {
          console.log(`[multi-whatsapp-qr:slot-${slotId}] No travel/business keyword from ${senderPhone}. Skipping.`);
          continue;
        }

        // Acquire lock and process reply
        activeReplyLocks.add(senderPhone);

        try {
          const { isPhoneNumberExcluded } = await import("@/lib/automation/excluded-contacts-store");
          if (isPhoneNumberExcluded(senderPhone)) {
            console.log(`[multi-whatsapp-qr:slot-${slotId}] Number ${senderPhone} is in excluded list. Skipping AI reply.`);
            continue;
          }

          const { processIncomingMessageAndReply, sanitizeHumanReply } = await import("@/lib/automation/ai-sales-agent");
          const replyResult = await processIncomingMessageAndReply({
            from: senderPhone,
            body: textBody,
            channel: "whatsapp",
            customerName,
            forceTrack: current.aiTrack === "b2b" ? "b2b" : current.aiTrack === "b2c" ? "b2c" : undefined,
            metadata: { slotId, slotLabel: current.label },
          });

          if (replyResult && replyResult.replyText) {
            const cleanText = sanitizeHumanReply(replyResult.replyText);
            if (!cleanText || cleanText.startsWith("{")) {
              continue;
            }

            // Realistic typing delay (2.5s - 5s)
            const typingDelayMs = Math.min(5000, Math.max(2500, cleanText.length * 35));
            try {
              await socket.sendPresenceUpdate("composing", remoteJid);
            } catch {
              // ignore
            }

            await new Promise((resolve) => setTimeout(resolve, typingDelayMs));

            await socket.sendMessage(remoteJid, { text: cleanText });
            lastReplyTimestamps.set(senderPhone, Date.now());

            try {
              await socket.sendPresenceUpdate("paused", remoteJid);
            } catch {
              // ignore
            }
          }
        } catch (err) {
          console.error(`[multi-whatsapp-qr:slot-${slotId}] Inbound AI error:`, err);
        } finally {
          activeReplyLocks.delete(senderPhone);
        }
      }
    });

    return current;
  } catch (error) {
    current.status = "disconnected";
    current.qrCodeUrl = null;
    current.error = error instanceof Error ? error.message : "Failed to start session";
    slotStatuses.set(slotId, { ...current });
    return current;
  } finally {
    initializingSlots.delete(slotId);
  }
}

export async function logoutWhatsAppSlotSession(slotId: number): Promise<WhatsAppSlotStatus> {
  try {
    const socket = sockets.get(slotId);
    if (socket) {
      try {
        await socket.logout();
      } catch {
        // ignore
      }
      sockets.delete(slotId);
    }
    const dir = getSlotAuthDir(slotId);
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  } catch {
    // ignore
  }

  const current = (await getAllWhatsAppSlotsStatus()).find((s) => s.id === slotId)!;
  current.status = "disconnected";
  current.qrCodeUrl = null;
  current.phone = null;
  current.name = null;
  current.updatedAt = new Date().toISOString();
  slotStatuses.set(slotId, { ...current });
  return current;
}

export async function updateWhatsAppSlotConfig(
  slotId: number,
  patch: Partial<WhatsAppSlotConfig>
): Promise<WhatsAppSlotStatus> {
  const configs = loadSlotConfigs();
  const index = configs.findIndex((c) => c.id === slotId);
  if (index === -1) {
    throw new Error(`Slot ${slotId} not found`);
  }

  if (patch.isDefault) {
    for (const c of configs) {
      c.isDefault = c.id === slotId;
    }
  }

  configs[index] = { ...configs[index], ...patch, id: slotId };
  saveSlotConfigs(configs);

  const current = slotStatuses.get(slotId);
  if (current) {
    current.label = configs[index].label;
    current.aiEnabled = configs[index].aiEnabled;
    current.aiTrack = configs[index].aiTrack;
    current.isDefault = configs[index].isDefault;
    slotStatuses.set(slotId, { ...current });
    return current;
  }

  return getWhatsAppSlotStatus(slotId);
}

export async function sendMultiQrWhatsAppMessage(input: {
  slotId?: number;
  to: string;
  body: string;
  category?: "otp" | "booking" | "marketing" | "manual" | "ai_sales";
  customerName?: string;
}): Promise<{ ok: boolean; error?: string; providerId?: string; slotId?: number }> {
  const slots = await getAllWhatsAppSlotsStatus();

  let targetSlotId = input.slotId;
  let targetSocket = targetSlotId ? sockets.get(targetSlotId) : undefined;

  if (!targetSocket) {
    const defaultSlot = slots.find((s) => s.isDefault && s.status === "connected");
    if (defaultSlot) {
      targetSlotId = defaultSlot.id;
      targetSocket = sockets.get(defaultSlot.id);
    } else {
      const anyConnected = slots.find((s) => s.status === "connected");
      if (anyConnected) {
        targetSlotId = anyConnected.id;
        targetSocket = sockets.get(anyConnected.id);
      }
    }
  }

  if (!targetSocket || !targetSlotId) {
    return { ok: false, error: "no_connected_whatsapp_slot" };
  }

  const rawDigits = input.to.replace(/\D/g, "");
  if (rawDigits.length < 8) {
    return { ok: false, error: "invalid_phone_number" };
  }

  const jid = `${rawDigits}@s.whatsapp.net`;
  const slotObj = slots.find((s) => s.id === targetSlotId);

  try {
    const result = await targetSocket.sendMessage(jid, { text: input.body });

    try {
      const { saveCommsMessage } = await import("@/lib/automation/comms-message-store");
      saveCommsMessage({
        channel: "whatsapp",
        direction: "outbound",
        category: input.category || "manual",
        track: slotObj?.aiTrack === "b2b" ? "b2b" : "b2c",
        from: slotObj?.phone || `slot_${targetSlotId}`,
        to: rawDigits,
        body: input.body,
        status: "sent",
        customerName: input.customerName,
        metadata: { slotId: targetSlotId, slotLabel: slotObj?.label },
      });
    } catch (saveErr) {
      console.error("[multi-whatsapp-qr] Error logging message:", saveErr);
    }

    return { ok: true, providerId: result?.key?.id || undefined, slotId: targetSlotId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "whatsapp_qr_send_failed",
      slotId: targetSlotId,
    };
  }
}
