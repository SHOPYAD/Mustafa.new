import { createAdminPocketBase, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  getServerEnv,
  isMaskedPlaceholder,
  saveServerEnv,
} from "@/lib/server/env-store";
import type { SmtpPublicStatus, SmtpSaveInput } from "@/lib/server/email/types";

const PLACEHOLDER_HOSTS = /^(smtp\.example\.com|localhost|example\.com)$/i;
const PLACEHOLDER_SENDERS = /@example\.com$/i;

type PocketBaseSmtp = {
  enabled?: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  authMethod?: string;
  tls?: boolean;
  localName?: string;
};

type PocketBaseMeta = {
  senderName?: string;
  senderAddress?: string;
  appName?: string;
  appURL?: string;
};

type PocketBaseSettings = {
  smtp?: PocketBaseSmtp;
  meta?: PocketBaseMeta;
};

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function asPort(value: unknown, fallback = 587): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 65535) return fallback;
  return Math.round(n);
}

export function isPlaceholderSmtp(host: string, sender: string): boolean {
  const h = asString(host).toLowerCase();
  const s = asString(sender).toLowerCase();
  if (!h) return true;
  if (PLACEHOLDER_HOSTS.test(h) || h.includes("example.com")) return true;
  if (s && PLACEHOLDER_SENDERS.test(s)) return true;
  return false;
}

function tlsModeFromSettings(smtp: PocketBaseSmtp): string {
  const port = asPort(smtp.port);
  if (port === 465) return "tls";
  if (port === 587) return "starttls";
  if (smtp.tls === false) return "none";
  return "starttls";
}

function smtpTlsFlag(mode: string, port: number): boolean {
  if (mode === "none") return false;
  if (mode === "tls" || port === 465) return true;
  return false;
}

export async function readSmtpPassword(): Promise<string> {
  return (await getServerEnv("POCKETBASE_SMTP_PASSWORD")).trim();
}

export async function readPocketBaseMailSettings(): Promise<{
  smtp: PocketBaseSmtp;
  meta: PocketBaseMeta;
}> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return {
      smtp: {},
      meta: {},
    };
  }
  const current = (await pb.settings.getAll()) as PocketBaseSettings;
  return {
    smtp: current.smtp || {},
    meta: current.meta || {},
  };
}

async function enableSmtpIfPasswordReady(): Promise<void> {
  const password = await readSmtpPassword();
  if (!password) return;
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return;
    const current = (await pb.settings.getAll()) as PocketBaseSettings;
    const smtp = { ...(current.smtp || {}) };
    const meta = { ...(current.meta || {}) };
    if (smtp.enabled && asString(smtp.host) && asString(smtp.username)) return;
    smtp.enabled = true;
    smtp.host = asString(smtp.host) || "127.0.0.1";
    smtp.port = asPort(smtp.port, 587);
    smtp.username = asString(smtp.username) || "noreply@lonaliza.com";
    smtp.authMethod = asString(smtp.authMethod) || "PLAIN";
    smtp.localName = asString(smtp.localName) || "lonaliza.com";
    if (!asString(meta.senderAddress)) meta.senderAddress = "noreply@lonaliza.com";
    if (!asString(meta.senderName)) meta.senderName = "لوناليزا للسياحة والسفر";
    await pb.settings.update({ smtp, meta });
  } catch {
    /* status endpoint must stay readable */
  }
}

export async function getSmtpPublicStatus(): Promise<SmtpPublicStatus> {
  await enableSmtpIfPasswordReady();
  const [{ smtp, meta }, password] = await Promise.all([
    readPocketBaseMailSettings(),
    readSmtpPassword(),
  ]);
  const host = asString(smtp.host);
  const senderAddress = asString(meta.senderAddress);
  const placeholder = isPlaceholderSmtp(host, senderAddress);
  const passwordConfigured = Boolean(password || asString(smtp.password));
  const enabled = Boolean(smtp.enabled) || (passwordConfigured && Boolean(host) && !placeholder);
  const configured = Boolean(
    host && !placeholder && (asString(smtp.username) || passwordConfigured)
  );
  const connected = configured && passwordConfigured;

  return {
    configured,
    connected,
    placeholder,
    enabled,
    host,
    port: asPort(smtp.port),
    username: asString(smtp.username),
    passwordConfigured,
    authMethod: asString(smtp.authMethod) || "PLAIN",
    tlsMode: tlsModeFromSettings(smtp),
    localName: asString(smtp.localName),
    senderName: asString(meta.senderName) || "لوناليزا للسياحة والسفر",
    senderAddress,
    statusLabelAr: connected
      ? "SMTP محلّي جاهز (قبول الخادم ≠ وصول جيميل)"
      : configured
        ? "مُعدّ — بانتظار التحقق"
        : placeholder || !host
          ? "غير مفعّل"
          : "غير متصل",
    statusLabelEn: connected
      ? "Local SMTP ready (accept ≠ Gmail inbox)"
      : configured
        ? "Configured — awaiting verify"
        : placeholder || !host
          ? "Not configured"
          : "Disconnected",
  };
}

export async function savePocketBaseMailSettings(
  input: SmtpSaveInput
): Promise<SmtpPublicStatus> {
  const pb = await createAdminPocketBase();
  const current = (await pb.settings.getAll()) as PocketBaseSettings;
  const smtp = { ...(current.smtp || {}) };
  const meta = { ...(current.meta || {}) };

  if (input.enabled !== undefined) smtp.enabled = Boolean(input.enabled);
  if (input.host !== undefined) smtp.host = asString(input.host);
  if (input.port !== undefined) smtp.port = asPort(input.port);
  if (input.username !== undefined) smtp.username = asString(input.username);
  if (input.authMethod !== undefined) smtp.authMethod = asString(input.authMethod);
  if (input.localName !== undefined) smtp.localName = asString(input.localName);
  const nextPort = asPort(input.port ?? smtp.port);
  const nextTlsMode =
    input.tlsMode !== undefined
      ? input.tlsMode
      : nextPort === 587
        ? "starttls"
        : undefined;
  if (nextTlsMode !== undefined) {
    smtp.tls = smtpTlsFlag(nextTlsMode === "none" && nextPort === 587 ? "starttls" : nextTlsMode, nextPort);
  }
  if (input.senderName !== undefined) meta.senderName = asString(input.senderName);
  if (input.senderAddress !== undefined) {
    meta.senderAddress = asString(input.senderAddress);
  }

  const incomingPassword = asString(input.password);
  if (incomingPassword && !isMaskedPlaceholder(incomingPassword)) {
    smtp.password = incomingPassword;
    await saveServerEnv({ POCKETBASE_SMTP_PASSWORD: incomingPassword });
  }

  await pb.settings.update({ smtp, meta });
  return getSmtpPublicStatus();
}

export async function resolveMailTransportConfig(): Promise<
  | {
      ok: true;
      host: string;
      port: number;
      username: string;
      password: string;
      senderName: string;
      senderAddress: string;
      localName: string;
      secure: boolean;
      requireTLS: boolean;
    }
  | { ok: false; error: string }
> {
  const [{ smtp, meta }, password] = await Promise.all([
    readPocketBaseMailSettings(),
    readSmtpPassword(),
  ]);
  const host = asString(smtp.host);
  const senderAddress = asString(meta.senderAddress);
  if (!smtp.enabled) {
    return { ok: false, error: "SMTP غير مفعّل في PocketBase" };
  }
  if (isPlaceholderSmtp(host, senderAddress)) {
    return {
      ok: false,
      error: "SMTP ما زال بقيم تجريبية (smtp.example.com). احفظ خادماً حقيقياً أولاً.",
    };
  }
  if (!host) {
    return { ok: false, error: "عنوان خادم SMTP غير معدّ" };
  }
  const port = asPort(smtp.port);
  const secret = password || asString(smtp.password);
  return {
    ok: true,
    host,
    port,
    username: asString(smtp.username),
    password: secret,
    senderName: asString(meta.senderName) || "لوناليزا للسياحة والسفر",
    senderAddress: senderAddress || asString(smtp.username),
    localName: asString(smtp.localName) || "lonaliza.com",
    secure: port === 465,
    requireTLS: port === 587 || smtp.tls === true,
  };
}

export async function getAdminTestEmail(): Promise<string> {
  const listed = (await getServerEnv("NEXT_PUBLIC_ADMIN_EMAILS")).trim();
  const first = listed.split(/[,\s]+/).map((s) => s.trim()).find(Boolean);
  if (first) return first;
  const pbAdmin = (await getServerEnv("POCKETBASE_ADMIN_EMAIL")).trim();
  if (pbAdmin) return pbAdmin;
  const { meta } = await readPocketBaseMailSettings();
  return asString(meta.senderAddress);
}
