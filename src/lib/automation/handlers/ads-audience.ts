import { createHash } from "crypto";
import { metaAdsReady, resolveAdsCredentials } from "@/lib/ads/config";
import { loadCrmContacts } from "@/lib/automation/crm-audience";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";

function sha256Norm(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  if (!v.includes("@")) return null;
  return sha256Norm(v);
}

function hashPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const e164 = digits.startsWith("00") ? digits.slice(2) : digits;
  return sha256Norm(e164);
}

async function graphPost(
  path: string,
  token: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown>; error?: string }> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const err = data.error as { message?: string } | undefined;
  if (!res.ok || err) {
    return { ok: false, data, error: err?.message || `http_${res.status}` };
  }
  return { ok: true, data };
}

export async function runCtwaLookalike(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const dryRun = Boolean(ctx.dryRun);
  const settings = { ...(ctx.job?.settings || {}), ...(ctx.job?.payload || {}) };
  const approved = settings.approved === true;
  const budget = Number(settings.dailyBudget || settings.budget || 0);
  const creds = await resolveAdsCredentials();
  if (!metaAdsReady(creds)) {
    return {
      ok: false,
      processed: 0,
      message: "ميتا غير جاهزة. الصقوا META_ADS_ACCESS_TOKEN و META_ADS_AD_ACCOUNT_ID من /admin/ads.",
      dryRun,
    };
  }

  const contacts = await loadCrmContacts("customers");
  const emails = contacts.map((row) => (row.email ? hashEmail(row.email) : null)).filter((v): v is string => Boolean(v));
  const phones = contacts
    .filter((row) => row.marketingWhatsapp && row.phone)
    .map((row) => hashPhone(row.phone || ""))
    .filter((v): v is string => Boolean(v));
  const uniqueEmails = [...new Set(emails)];
  const uniquePhones = [...new Set(phones)];

  if (!approved || dryRun || budget <= 0) {
    return {
      ok: true,
      processed: 0,
      skipped: uniqueEmails.length + uniquePhones.length,
      message: dryRun || !approved
        ? `تجريبي/بانتظار موافقة: ${uniqueEmails.length} إيميل و ${uniquePhones.length} هاتف موافق — مشفّر SHA256 عبر Graph الرسمي. لا إطلاق بدون approved وميزانية.`
        : "حدّدوا ميزانية يومية أكبر من صفر بعد الموافقة.",
      dryRun: true,
      details: {
        hashedEmails: uniqueEmails.length,
        hashedPhones: uniquePhones.length,
        approved,
        budget: budget || null,
        note: "CTWA uses official WhatsApp destination. No scraped contacts.",
      },
    };
  }

  const act = creds.metaAdAccountId.replace(/^act_/i, "");
  const audience = await graphPost(`act_${act}/customaudiences`, creds.metaAccessToken, {
    name: `LIOTRIP CRM hashed ${new Date().toISOString().slice(0, 10)}`,
    subtype: "CUSTOM",
    description: "Hashed CRM customers — official Custom Audiences API",
    customer_file_source: "USER_PROVIDED_ONLY",
  });
  if (!audience.ok) {
    return { ok: false, processed: 0, message: audience.error || "فشل إنشاء الجمهور", dryRun: false };
  }
  const audienceId = String(audience.data.id || "");
  const payload: Record<string, unknown> = {
    payload: {
      schema: uniqueEmails.length ? ["EMAIL", "PHONE"] : ["PHONE"],
      data: [
        ...uniqueEmails.slice(0, 4000).map((email) => [email, uniquePhones[0] || ""]),
      ],
    },
  };
  if (uniqueEmails.length === 0 && uniquePhones.length) {
    payload.payload = {
      schema: ["PHONE"],
      data: uniquePhones.slice(0, 4000).map((phone) => [phone]),
    };
  }
  const users = await graphPost(`${audienceId}/users`, creds.metaAccessToken, payload);
  const lookalike = await graphPost(`act_${act}/customaudiences`, creds.metaAccessToken, {
    name: `LIOTRIP LAL ${new Date().toISOString().slice(0, 10)}`,
    subtype: "LOOKALIKE",
    origin_audience_id: audienceId,
    lookalike_spec: JSON.stringify({
      type: "similarity",
      country: String(settings.country || "TR"),
      ratio: 0.01,
    }),
  });

  const ctwa = await graphPost(`act_${act}/campaigns`, creds.metaAccessToken, {
    name: "LIOTRIP Click-to-WhatsApp",
    objective: "OUTCOME_ENGAGEMENT",
    status: "PAUSED",
    special_ad_categories: [],
    daily_budget: Math.round(budget * 100),
  });

  return {
    ok: Boolean(audience.ok && lookalike.ok),
    processed: uniqueEmails.length + uniquePhones.length,
    message: lookalike.ok
      ? "أُنشئ جمهور مشفّر وجمهور مشابه. حملة CTWA متوقفة للمراجعة في مدير الإعلانات."
      : lookalike.error || users.error || "اكتمل الجمهور المصدر جزئياً",
    dryRun: false,
    details: {
      customAudienceId: audienceId,
      usersOk: users.ok,
      lookalikeId: lookalike.data.id || null,
      ctwaCampaignId: ctwa.data.id || null,
      ctwaError: ctwa.error || null,
    },
  };
}
