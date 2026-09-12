import { promises as fs } from "fs";
import path from "path";
import { getServerEnv, getServerEnvMap } from "@/lib/server/env-store";
import { isOtpChannel, type OtpChannel } from "@/lib/automation/types";
import { sanitizeWhatsAppPhoneNumberId } from "@/lib/automation/comms-validate";

export type CommsSettings = {
  otpEnabled: boolean;
  otpChannels: OtpChannel[];
  otpTtlSec: number;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappWabaId: string;
  whatsappVerifyToken: string;
  whatsappGraphVersion: string;
  whatsappOtpTemplate: string;
  whatsappTransactionalTemplate: string;
  whatsappMarketingTemplate: string;
  telegramBotToken: string;
  telegramDefaultChatId: string;
  rateLimitPerMinute: number;
};

export const DEFAULT_COMMS_SETTINGS: CommsSettings = {
  otpEnabled: false,
  otpChannels: ["whatsapp", "telegram", "email"],
  otpTtlSec: 600,
  whatsappPhoneNumberId: "",
  whatsappAccessToken: "",
  whatsappWabaId: "",
  whatsappVerifyToken: "",
  whatsappGraphVersion: "v21.0",
  whatsappOtpTemplate: "otp_code",
  whatsappTransactionalTemplate: "",
  whatsappMarketingTemplate: "",
  telegramBotToken: "",
  telegramDefaultChatId: "",
  rateLimitPerMinute: 20,
};

const ENV_KEYS = [
  "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
  "WHATSAPP_CLOUD_ACCESS_TOKEN",
  "WHATSAPP_CLOUD_WABA_ID",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_GRAPH_VERSION",
  "WHATSAPP_OTP_TEMPLATE",
  "WHATSAPP_TRANSACTIONAL_TEMPLATE",
  "WHATSAPP_MARKETING_TEMPLATE",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_DEFAULT_CHAT_ID",
  "COMMS_OTP_ENABLED",
] as const;

function settingsFile(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "lonaliza-comms-settings.json");
  }
  return path.join(process.cwd(), ".data", "comms-settings.json");
}

function isOn(value: unknown): boolean {
  const v = String(value || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function sanitizeChannels(raw: unknown): OtpChannel[] {
  if (!Array.isArray(raw)) return [...DEFAULT_COMMS_SETTINGS.otpChannels];
  const next = raw.map(String).filter(isOtpChannel);
  return next.length ? [...new Set(next)] : [...DEFAULT_COMMS_SETTINGS.otpChannels];
}

function sanitize(raw: Partial<CommsSettings> | Record<string, unknown> | null): CommsSettings {
  const rec = raw && typeof raw === "object" ? raw : {};
  const rate = Number(rec.rateLimitPerMinute);
  const ttl = Number(rec.otpTtlSec);
  return {
    otpEnabled: rec.otpEnabled === true || isOn(rec.otpEnabled),
    otpChannels: sanitizeChannels(rec.otpChannels),
    otpTtlSec: Number.isFinite(ttl) ? Math.max(60, Math.min(1800, Math.round(ttl))) : 600,
    whatsappPhoneNumberId: sanitizeWhatsAppPhoneNumberId(String(rec.whatsappPhoneNumberId || "")),
    whatsappAccessToken: String(rec.whatsappAccessToken || "").trim(),
    whatsappWabaId: String(rec.whatsappWabaId || "").trim(),
    whatsappVerifyToken: String(rec.whatsappVerifyToken || "").trim(),
    whatsappGraphVersion: String(rec.whatsappGraphVersion || "v21.0").trim() || "v21.0",
    whatsappOtpTemplate: String(rec.whatsappOtpTemplate || "otp_code").trim() || "otp_code",
    whatsappTransactionalTemplate: String(rec.whatsappTransactionalTemplate || "").trim(),
    whatsappMarketingTemplate: String(rec.whatsappMarketingTemplate || "").trim(),
    telegramBotToken: String(rec.telegramBotToken || "").trim(),
    telegramDefaultChatId: String(rec.telegramDefaultChatId || "").trim(),
    rateLimitPerMinute: Number.isFinite(rate) ? Math.max(1, Math.min(80, Math.round(rate))) : 20,
  };
}

async function readFileSettings(): Promise<Partial<CommsSettings>> {
  try {
    const raw = JSON.parse(await fs.readFile(settingsFile(), "utf8")) as Partial<CommsSettings>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function pick(fileVal: string, envVal: string): string {
  return fileVal || envVal || "";
}

export async function getCommsSettings(): Promise<CommsSettings> {
  const [file, env] = await Promise.all([readFileSettings(), getServerEnvMap([...ENV_KEYS])]);
  const merged = sanitize({
    ...file,
    otpEnabled: file.otpEnabled ?? isOn(env.COMMS_OTP_ENABLED),
    whatsappPhoneNumberId: pick(file.whatsappPhoneNumberId || "", env.WHATSAPP_CLOUD_PHONE_NUMBER_ID),
    whatsappAccessToken: pick(file.whatsappAccessToken || "", env.WHATSAPP_CLOUD_ACCESS_TOKEN),
    whatsappWabaId: pick(file.whatsappWabaId || "", env.WHATSAPP_CLOUD_WABA_ID),
    whatsappVerifyToken: pick(file.whatsappVerifyToken || "", env.WHATSAPP_VERIFY_TOKEN),
    whatsappGraphVersion: pick(file.whatsappGraphVersion || "", env.WHATSAPP_GRAPH_VERSION),
    whatsappOtpTemplate: pick(file.whatsappOtpTemplate || "", env.WHATSAPP_OTP_TEMPLATE),
    whatsappTransactionalTemplate: pick(
      file.whatsappTransactionalTemplate || "",
      env.WHATSAPP_TRANSACTIONAL_TEMPLATE
    ),
    whatsappMarketingTemplate: pick(file.whatsappMarketingTemplate || "", env.WHATSAPP_MARKETING_TEMPLATE),
    telegramBotToken: pick(file.telegramBotToken || "", env.TELEGRAM_BOT_TOKEN),
    telegramDefaultChatId: pick(file.telegramDefaultChatId || "", env.TELEGRAM_DEFAULT_CHAT_ID),
  });
  return merged;
}

export async function saveCommsSettings(patch: Partial<CommsSettings>): Promise<CommsSettings> {
  const current = await getCommsSettings();
  const next = sanitize({
    ...current,
    ...patch,
    whatsappAccessToken:
      patch.whatsappAccessToken === undefined || looksMasked(patch.whatsappAccessToken)
        ? current.whatsappAccessToken
        : patch.whatsappAccessToken,
    telegramBotToken:
      patch.telegramBotToken === undefined || looksMasked(patch.telegramBotToken)
        ? current.telegramBotToken
        : patch.telegramBotToken,
    whatsappVerifyToken:
      patch.whatsappVerifyToken === undefined || looksMasked(patch.whatsappVerifyToken)
        ? current.whatsappVerifyToken
        : patch.whatsappVerifyToken,
  });
  await fs.mkdir(path.dirname(settingsFile()), { recursive: true });
  await fs.writeFile(settingsFile(), JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}

export function looksMasked(value: string): boolean {
  const v = String(value || "").trim();
  return !v || v.includes("…") || v.includes("...") || /^•+$/.test(v);
}

export function maskSecret(value: string): string {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.length <= 8) return "•".repeat(Math.min(v.length, 8));
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

export function publicCommsSettings(settings: CommsSettings) {
  const phoneId = sanitizeWhatsAppPhoneNumberId(settings.whatsappPhoneNumberId);
  return {
    ...settings,
    whatsappPhoneNumberId: phoneId,
    whatsappAccessToken: maskSecret(settings.whatsappAccessToken),
    telegramBotToken: maskSecret(settings.telegramBotToken),
    whatsappVerifyToken: maskSecret(settings.whatsappVerifyToken),
    whatsappReady: Boolean(phoneId && settings.whatsappAccessToken),
    telegramReady: Boolean(settings.telegramBotToken),
    whatsappPhoneIdInvalid: Boolean(settings.whatsappPhoneNumberId && !phoneId),
  };
}

export async function getOtpPepper(): Promise<string> {
  const secret = (await getServerEnv("ADMIN_SESSION_SECRET")).trim();
  if (secret.length >= 16) return secret;
  return "lonaliza-otp-dev-pepper";
}

export function channelReady(settings: CommsSettings, channel: OtpChannel): boolean {
  switch (channel) {
    case "whatsapp":
      return Boolean(settings.whatsappPhoneNumberId && settings.whatsappAccessToken);
    case "telegram":
      return Boolean(settings.telegramBotToken);
    case "email":
      return true;
    case "sms":
      return false;
    default: {
      const _never: never = channel;
      return Boolean(_never);
    }
  }
}

export function pickOtpChannel(
  settings: CommsSettings,
  phone?: string,
  email?: string,
  telegramChatId?: string
): OtpChannel | null {
  if (!settings.otpEnabled) return null;
  const preferred = settings.otpChannels.filter((ch) => channelReady(settings, ch));
  for (const channel of preferred) {
    switch (channel) {
      case "whatsapp":
        if (phone) return "whatsapp";
        break;
      case "telegram":
        if (telegramChatId) return "telegram";
        break;
      case "email":
        if (email) return "email";
        break;
      case "sms":
        break;
      default: {
        const _never: never = channel;
        void _never;
      }
    }
  }
  return null;
}
