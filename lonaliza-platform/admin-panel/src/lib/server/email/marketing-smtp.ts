import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { resolveMailTransportConfig } from "@/lib/server/email/smtp";

const SETTINGS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/email-settings.json";
const LOGS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/email-logs.json";

export type MarketingSmtpSettings = {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password?: string;
  senderName: string;
  senderAddress: string;
  secure: boolean;
  replyTo?: string;
};

const DEFAULT_SETTINGS: MarketingSmtpSettings = {
  enabled: true,
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  username: process.env.SMTP_USER || "",
  password: process.env.SMTP_PASSWORD || "",
  senderName: "Lonaliza Travel & B2B Partnerships",
  senderAddress: "partners@lonaliza.com",
  secure: false,
  replyTo: "partners@lonaliza.com",
};

export function getMarketingEmailSettings(): MarketingSmtpSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveMarketingEmailSettings(settings: Partial<MarketingSmtpSettings>): MarketingSmtpSettings {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const current = getMarketingEmailSettings();
  const updated: MarketingSmtpSettings = {
    ...current,
    ...settings,
    password: settings.password && settings.password !== "••••••••" ? settings.password : current.password,
  };

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function createMarketingTransporter() {
  const custom = getMarketingEmailSettings();

  // If custom host is provided and not localhost/placeholder
  if (custom.host && custom.host !== "localhost" && custom.username) {
    return {
      transporter: nodemailer.createTransport({
        host: custom.host,
        port: custom.port,
        secure: custom.secure || custom.port === 465,
        auth: {
          user: custom.username,
          pass: custom.password || "",
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
      senderName: custom.senderName,
      senderAddress: custom.senderAddress,
      replyTo: custom.replyTo || custom.senderAddress,
    };
  }

  // Fallback to platform-wide PocketBase/System SMTP config
  const sysConfig = await resolveMailTransportConfig();
  if (sysConfig.ok) {
    return {
      transporter: nodemailer.createTransport({
        host: sysConfig.host,
        port: sysConfig.port,
        secure: sysConfig.secure || sysConfig.port === 465,
        auth: sysConfig.username || sysConfig.password ? {
          user: sysConfig.username,
          pass: sysConfig.password,
        } : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      }),
      senderName: custom.senderName || sysConfig.senderName,
      senderAddress: custom.senderAddress || sysConfig.senderAddress,
      replyTo: custom.replyTo || custom.senderAddress || sysConfig.senderAddress,
    };
  }

  // Fallback direct localhost Postfix / Sendmail if present
  return {
    transporter: nodemailer.createTransport({
      host: "127.0.0.1",
      port: 25,
      secure: false,
      tls: { rejectUnauthorized: false },
    }),
    senderName: custom.senderName,
    senderAddress: custom.senderAddress,
    replyTo: custom.replyTo || custom.senderAddress,
  };
}

export async function verifyMarketingSmtp(): Promise<{ ok: boolean; message: string; error?: string }> {
  try {
    const { transporter } = await createMarketingTransporter();
    await transporter.verify();
    return { ok: true, message: "تم الاتصال بخادم SMTP بنجاح وجاهز لإرسال الحملات البريدية!" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "فشل الاتصال بخادم البريد";
    return { ok: false, message: "تعذر الاتصال بخادم SMTP", error: errorMsg };
  }
}

export async function sendMarketingEmail(params: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  companyId?: string;
  campaignId?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    const { transporter, senderName, senderAddress, replyTo } = await createMarketingTransporter();

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderAddress}>`,
      to: params.toName ? `"${params.toName}" <${params.to}>` : params.to,
      replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>?/gm, ""),
    });

    // Log email record
    logSentEmail({
      id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      to: params.to,
      toName: params.toName || "",
      subject: params.subject,
      companyId: params.companyId,
      campaignId: params.campaignId,
      messageId: info.messageId,
      status: "delivered",
      sentAt: new Date().toISOString(),
    });

    return { ok: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "فشل إرسال البريد";
    logSentEmail({
      id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      to: params.to,
      toName: params.toName || "",
      subject: params.subject,
      companyId: params.companyId,
      campaignId: params.campaignId,
      status: "failed",
      error: errorMsg,
      sentAt: new Date().toISOString(),
    });
    return { ok: false, error: errorMsg };
  }
}

function logSentEmail(logEntry: Record<string, unknown>) {
  try {
    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
      } catch {}
    }
    logs.unshift(logEntry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write email log:", e);
  }
}

export function getEmailLogs() {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}
