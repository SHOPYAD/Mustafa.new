import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { compileVisualEmail, documentToPlainText } from "@/lib/email/visual-doc";
import {
  applyEmailVars,
  brandDisplayName,
  displayRecipientName,
  emailBrandFromDefaults,
  emailLogoCid,
  getEmailBrand,
  htmlToPlainText,
  stampEmailChrome,
  stringifyVars,
  type EmailBrand,
} from "@/lib/server/email/brand";
import { resolveVisualDocument } from "@/lib/server/email/compile-visual";
import {
  parseQueueId,
  saveLastDelivery,
  waitAndProbeDelivery,
} from "@/lib/server/email/delivery";
import { KIND_SLUG, templateKey } from "@/lib/server/email/i18n-keys";
import { loadEmailLogoAttachment } from "@/lib/server/email/logo";
import { DEFAULT_EMAIL_LOCALE } from "@/lib/server/email/recipient-locale";
import { resolveMailTransportConfig } from "@/lib/server/email/smtp";
import { emailT, translateVisualDocument } from "@/lib/server/email/template-i18n";
import { renderBuiltinHtml } from "@/lib/server/email/templates";
import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import type {
  EmailTemplateRecord,
  EmailVars,
  LastMailDelivery,
  MailAttachment,
} from "@/lib/server/email/types";

export type SendMailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
  /** Campaigns only — Gmail expects mailto + https List-Unsubscribe. */
  listUnsubscribe?: boolean;
  trackDelivery?: boolean;
  locale?: string;
};

export type SendMailSuccess = {
  ok: true;
  localAccepted: true;
  delivery: LastMailDelivery;
};

export type SendMailFailure = { ok: false; error: string };

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function senderDomain(address: string): string {
  const at = address.lastIndexOf("@");
  const host = at > 0 ? address.slice(at + 1).trim().toLowerCase() : "";
  return host && !host.includes("example.com") ? host : "lonaliza.com";
}

function transportOptions(cfg: {
  host: string;
  port: number;
  username: string;
  password: string;
  senderAddress: string;
  localName: string;
  secure: boolean;
  requireTLS: boolean;
}) {
  const domain = senderDomain(cfg.senderAddress);
  return {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS && !cfg.secure,
    name: cfg.localName || domain,
    auth:
      cfg.username || cfg.password
        ? { user: cfg.username || cfg.senderAddress, pass: cfg.password }
        : undefined,
    tls: {
      minVersion: "TLSv1.2" as const,
      rejectUnauthorized: !/^(127\.0\.0\.1|localhost)$/i.test(cfg.host),
    },
  };
}

function unsubscribeHeaders(domain: string, sender: string, to: string): Record<string, string> {
  const unsubUrl = `${SITE_PUBLIC_URL}/api/email/unsubscribe?email=${encodeURIComponent(to)}`;
  return {
    "List-Id": `Alrayyan Tourism <campaigns.${domain}>`,
    "List-Unsubscribe": `<mailto:${sender}?subject=unsubscribe>, <${unsubUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    Precedence: "bulk",
  };
}

export async function sendMail(
  input: SendMailInput
): Promise<SendMailSuccess | SendMailFailure> {
  const to = String(input.to || "").trim().toLowerCase();
  if (!isLikelyEmail(to)) {
    return { ok: false, error: "بريد المستلم غير صالح" };
  }

  const transport = await resolveMailTransportConfig();
  if (!transport.ok) return transport;
  if (!transport.senderAddress) {
    return { ok: false, error: "عنوان المرسل غير معدّ" };
  }
  if (/@example\.com$/i.test(transport.senderAddress)) {
    return { ok: false, error: "لا يُرسل من example.com — استخدم noreply@lonaliza.com" };
  }

  const locale = input.locale || DEFAULT_EMAIL_LOCALE;
  const brand = await getEmailBrand();
  const domain = senderDomain(transport.senderAddress);
  const cid = emailLogoCid(domain);
  const logo = await loadEmailLogoAttachment(brand, cid);
  const html = stampEmailChrome(input.html, brand, {
    locale,
    logoSrc: logo ? `cid:${logo.cid}` : null,
  });
  const text =
    String(input.text || "").trim() ||
    htmlToPlainText(html) ||
    `${brandDisplayName(brand, locale)}\n${brand.siteUrl}`;

  const messageId = `<${randomBytes(16).toString("hex")}@${domain}>`;
  const includeUnsub = input.listUnsubscribe === true;
  const headers: Record<string, string> = {
    "MIME-Version": "1.0",
    ...(includeUnsub ? unsubscribeHeaders(domain, transport.senderAddress, to) : {}),
  };

  const attachments = [
    ...(logo
      ? [
          {
            filename: logo.filename,
            content: logo.content,
            contentType: logo.contentType,
            cid: logo.cid,
            contentDisposition: "inline" as const,
          },
        ]
      : []),
    ...(input.attachments || []).map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
      cid: file.cid,
      contentDisposition: file.contentDisposition,
    })),
  ];

  const transporter = nodemailer.createTransport(transportOptions(transport));

  try {
    const mail = {
      from: {
        name: transport.senderName,
        address: transport.senderAddress,
      },
      replyTo: {
        name: transport.senderName,
        address: transport.senderAddress,
      },
      envelope: {
        from: transport.senderAddress,
        to,
      },
      to: input.toName ? { name: input.toName, address: to } : to,
      subject: input.subject,
      html,
      text,
      date: new Date(),
      messageId,
      headers,
      attachments,
    };
    const info = (await transporter.sendMail(mail)) as {
      response?: string;
      messageId?: string;
    };
    const smtpResponse = String(info.response || "");
    const queueId = parseQueueId(smtpResponse);
    const probed =
      input.trackDelivery !== false && queueId
        ? await waitAndProbeDelivery(queueId)
        : {
            status: "local_accepted" as const,
            remoteDsn: "",
            remoteReason: "",
            deliveredToRemote: false,
          };
    const delivery = await saveLastDelivery({
      at: new Date().toISOString(),
      to,
      from: transport.senderAddress,
      localAccepted: true,
      status: probed.status === "unknown" ? "local_accepted" : probed.status,
      queueId,
      messageId: String(info.messageId || messageId),
      smtpResponse,
      remoteDsn: probed.remoteDsn,
      remoteReason: probed.remoteReason,
    });
    return { ok: true, localAccepted: true, delivery };
  } catch (e) {
    const message = e instanceof Error ? e.message : "فشل إرسال البريد";
    return { ok: false, error: message.replace(/pass(word)?=\S+/gi, "password=[redacted]") };
  }
}

export async function verifySmtpConnection(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const transport = await resolveMailTransportConfig();
  if (!transport.ok) return transport;
  const transporter = nodemailer.createTransport(transportOptions(transport));
  try {
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "تعذّر التحقق من SMTP";
    return { ok: false, error: message.replace(/pass(word)?=\S+/gi, "password=[redacted]") };
  }
}

function keepSingleLocaleHtml(html: string, locale: string): string {
  const source = String(html || "");
  const enMarker = 'direction:ltr;text-align:left;color:#122033;font-family:Georgia,Times,serif;';
  const divider = '<div style="border-top:1px dashed #e4d8c4;"></div>';
  if (!source.includes(enMarker) || !source.includes(divider)) return source;
  if (locale === "en") {
    return source
      .replace(/<tr>\s*<td[^>]*direction:rtl[\s\S]*?<\/td>\s*<\/tr>/i, "")
      .replace(/<tr>\s*<td[^>]*>\s*<div style="border-top:1px dashed #e4d8c4;"><\/div>\s*<\/td>\s*<\/tr>/i, "");
  }
  return source
    .replace(/<tr>\s*<td[^>]*>\s*<div style="border-top:1px dashed #e4d8c4;"><\/div>\s*<\/td>\s*<\/tr>/i, "")
    .replace(/<tr>\s*<td[^>]*direction:ltr;text-align:left[\s\S]*?<\/td>\s*<\/tr>/i, "");
}

export async function renderTemplateMessage(
  template: EmailTemplateRecord,
  vars: EmailVars,
  brand?: EmailBrand,
  locale = DEFAULT_EMAIL_LOCALE
): Promise<{ subject: string; html: string; text: string; locale: string }> {
  const chrome = brand || emailBrandFromDefaults();
  const map = stringifyVars({
    ...vars,
    name: displayRecipientName(vars.name, locale),
    company: vars.company == null ? "" : String(vars.company),
  });
  const isBuiltin = template.is_builtin || template.source === "builtin";

  if (isBuiltin && template.kind !== "custom") {
    const rendered = await renderBuiltinHtml(template.kind, chrome, locale);
    return {
      locale,
      subject: applyEmailVars(rendered.subject, map),
      html: stampEmailChrome(applyEmailVars(rendered.html, map), chrome, {
        locale,
        logoSrc: chrome.logoUrl,
      }),
      text: applyEmailVars(rendered.text, map),
    };
  }

  const visual = resolveVisualDocument(template, chrome);
  if (template.document || visual.blocks.length) {
    const localized = await translateVisualDocument(visual, template.slug, locale);
    const compiled = compileVisualEmail(localized, chrome, locale);
    const subjectKey = templateKey(template.slug, "subject");
    const subjectRaw =
      (await emailT(locale, subjectKey)) ||
      (locale === "en" ? template.subject_en : template.subject_ar) ||
      template.subject_ar;
    const html = stampEmailChrome(applyEmailVars(compiled, map), chrome, {
      locale,
      logoSrc: chrome.logoUrl,
    });
    return {
      locale,
      subject: applyEmailVars(subjectRaw, map),
      html,
      text:
        applyEmailVars(documentToPlainText(localized, chrome, locale), map) ||
        htmlToPlainText(html),
    };
  }

  const rawHtml =
    locale === "en"
      ? template.html_en || template.html_ar || ""
      : template.html_ar || template.html_en || "";
  const filled = applyEmailVars(keepSingleLocaleHtml(rawHtml, locale), map);
  const html = stampEmailChrome(filled, chrome, { locale, logoSrc: chrome.logoUrl });
  const rawText =
    locale === "en"
      ? template.text_en || template.text_ar || ""
      : template.text_ar || template.text_en || "";
  const text = applyEmailVars(rawText, map) || htmlToPlainText(html);
  const subject = applyEmailVars(
    locale === "en"
      ? template.subject_en || template.subject_ar || ""
      : template.subject_ar || template.subject_en || "",
    map
  );
  return { locale, subject, html, text };
}

export { KIND_SLUG };
