import { createHash } from "crypto";
import { metaAdsReady, resolveAdsCredentials } from "@/lib/ads/config";
import { loadCrmContacts } from "@/lib/automation/crm-audience";
import { getServerEnv } from "@/lib/server/env-store";
import type { AutomationJobContext, AutomationJobResult } from "@/lib/automation/types";

function sha256Norm(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  if (!v.includes("@")) return null;
  return sha256Norm(v);
}

/** Meta requires digits only with country code, no + / spaces / leading zeros. */
function hashPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length < 8 || digits.length > 15) return null;
  return sha256Norm(digits);
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

async function loadOptedInHashes(): Promise<{
  emails: string[];
  phones: string[];
  rows: Array<string[]>;
  schema: string[];
}> {
  const contacts = await loadCrmContacts("customers");
  const paired: Array<string[]> = [];
  const emailsOnly: string[] = [];
  const phonesOnly: string[] = [];

  for (const row of contacts) {
    const emailHash = row.marketingEmail && row.email ? hashEmail(row.email) : null;
    const phoneHash = row.marketingWhatsapp && row.phone ? hashPhone(row.phone) : null;
    if (emailHash && phoneHash) {
      paired.push([emailHash, phoneHash]);
    } else if (emailHash) {
      emailsOnly.push(emailHash);
    } else if (phoneHash) {
      phonesOnly.push(phoneHash);
    }
  }

  if (paired.length) {
    return {
      emails: paired.map((r) => r[0]),
      phones: paired.map((r) => r[1]),
      rows: paired.slice(0, 4000),
      schema: ["EMAIL", "PHONE"],
    };
  }
  if (emailsOnly.length) {
    const unique = [...new Set(emailsOnly)];
    return {
      emails: unique,
      phones: [],
      rows: unique.slice(0, 4000).map((email) => [email]),
      schema: ["EMAIL"],
    };
  }
  const uniquePhones = [...new Set(phonesOnly)];
  return {
    emails: [],
    phones: uniquePhones,
    rows: uniquePhones.slice(0, 4000).map((phone) => [phone]),
    schema: ["PHONE"],
  };
}

function gateApprovalBudget(ctx: AutomationJobContext): {
  dryRun: boolean;
  approved: boolean;
  budget: number;
  settings: Record<string, unknown>;
} {
  const dryRun = Boolean(ctx.dryRun);
  const settings = { ...(ctx.job?.settings || {}), ...(ctx.job?.payload || {}) };
  return {
    dryRun,
    approved: settings.approved === true,
    budget: Number(settings.dailyBudget || settings.budget || 0),
    settings,
  };
}

export async function runLookalikeAudience(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const { dryRun, approved, budget, settings } = gateApprovalBudget(ctx);
  const creds = await resolveAdsCredentials();
  const hashes = await loadOptedInHashes();

  if (!metaAdsReady(creds)) {
    return {
      ok: false,
      processed: 0,
      message: "ميتا غير جاهزة. الصقوا META_ADS_ACCESS_TOKEN و META_ADS_AD_ACCOUNT_ID من /admin/ads.",
      dryRun,
      details: { hashedEmails: hashes.emails.length, hashedPhones: hashes.phones.length },
    };
  }

  if (!hashes.rows.length) {
    return {
      ok: false,
      processed: 0,
      message: "لا عملاء PocketBase بموافقة تسويق (إيميل غير ملغى أو واتساب opt-in) — لن نرفع جهات مكشوطة.",
      dryRun,
    };
  }

  if (!approved || dryRun) {
    return {
      ok: true,
      processed: 0,
      skipped: hashes.rows.length,
      message: `تجريبي/بانتظار موافقة: ${hashes.emails.length} إيميل و ${hashes.phones.length} هاتف مشفّر SHA256 — بلا إنشاء جمهور حي.`,
      dryRun: true,
      details: {
        hashedEmails: hashes.emails.length,
        hashedPhones: hashes.phones.length,
        approved,
        note: "CRM opt-in only. Official Custom Audiences + Lookalike API.",
      },
    };
  }

  const act = creds.metaAdAccountId.replace(/^act_/i, "");
  const audience = await graphPost(`act_${act}/customaudiences`, creds.metaAccessToken, {
    name: `LIOTRIP CRM hashed ${new Date().toISOString().slice(0, 10)}`,
    subtype: "CUSTOM",
    description: "Hashed CRM customers — USER_PROVIDED_ONLY",
    customer_file_source: "USER_PROVIDED_ONLY",
  });
  if (!audience.ok) {
    return { ok: false, processed: 0, message: audience.error || "فشل إنشاء الجمهور المخصص", dryRun: false };
  }
  const audienceId = String(audience.data.id || "");
  const users = await graphPost(`${audienceId}/users`, creds.metaAccessToken, {
    payload: { schema: hashes.schema, data: hashes.rows },
  });
  const lookalike = await graphPost(`act_${act}/customaudiences`, creds.metaAccessToken, {
    name: `LIOTRIP LAL ${new Date().toISOString().slice(0, 10)}`,
    subtype: "LOOKALIKE",
    origin_audience_id: audienceId,
    lookalike_spec: JSON.stringify({
      type: "similarity",
      country: String(settings.country || "TR"),
      ratio: Number(settings.ratio || 0.01) || 0.01,
    }),
  });

  return {
    ok: Boolean(lookalike.ok),
    processed: hashes.rows.length,
    message: lookalike.ok
      ? "أُنشئ جمهور مشفّر وجمهور مشابه عبر Marketing API."
      : lookalike.error || users.error || "فشل الجمهور المشابه",
    dryRun: false,
    details: {
      customAudienceId: audienceId,
      usersOk: users.ok,
      lookalikeId: lookalike.data.id || null,
      budgetHint: budget || null,
    },
  };
}

/**
 * Official Click-to-WhatsApp campaign (Meta Marketing API).
 * Creates PAUSED campaign + ad set with WhatsApp destination — never unofficial WA Web/QR.
 */
export async function runCtwaCampaign(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const { dryRun, approved, budget, settings } = gateApprovalBudget(ctx);
  const creds = await resolveAdsCredentials();
  const pageId = creds.metaPageId || String(settings.pageId || "");
  const waPhone =
    (await getServerEnv("WHATSAPP_CLOUD_PHONE_NUMBER_ID")) ||
    String(settings.whatsappPhoneNumberId || "");

  if (!metaAdsReady(creds)) {
    return {
      ok: false,
      processed: 0,
      message: "ميتا غير جاهزة لـ CTWA. الصقوا META_ADS_ACCESS_TOKEN و META_ADS_AD_ACCOUNT_ID و META_ADS_PAGE_ID.",
      dryRun,
    };
  }

  if (!approved || dryRun || budget <= 0) {
    return {
      ok: true,
      processed: 0,
      skipped: 1,
      message:
        dryRun || !approved
          ? "تجريبي/بانتظار موافقة: ستُنشأ حملة Click-to-WhatsApp متوقفة (PAUSED) بوجهة واتساب Cloud الرسمية بعد approved وميزانية."
          : "حدّدوا ميزانية يومية أكبر من صفر بعد الموافقة.",
      dryRun: true,
      details: {
        approved,
        budget: budget || null,
        pageId: pageId || null,
        whatsappPhoneNumberId: waPhone || null,
        note: "Official Meta Marketing API only. No WhatsApp Web/QR.",
      },
    };
  }

  if (!pageId) {
    return {
      ok: false,
      processed: 0,
      message: "يلزم META_ADS_PAGE_ID لربط إعلان Click-to-WhatsApp بالصفحة.",
      dryRun: false,
    };
  }

  const act = creds.metaAdAccountId.replace(/^act_/i, "");
  const campaign = await graphPost(`act_${act}/campaigns`, creds.metaAccessToken, {
    name: String(settings.name || "LIOTRIP Click-to-WhatsApp"),
    objective: "OUTCOME_ENGAGEMENT",
    status: "PAUSED",
    special_ad_categories: [],
    is_adset_budget_sharing_enabled: false,
  });
  if (!campaign.ok) {
    return { ok: false, processed: 0, message: campaign.error || "فشل إنشاء حملة CTWA", dryRun: false };
  }
  const campaignId = String(campaign.data.id || "");

  const promotedObject: Record<string, string> = { page_id: pageId };
  if (waPhone) {
    promotedObject.whatsapp_phone_number = waPhone;
  }

  const adSet = await graphPost(`act_${act}/adsets`, creds.metaAccessToken, {
    name: "LIOTRIP CTWA ad set",
    campaign_id: campaignId,
    daily_budget: Math.round(budget * 100),
    billing_event: "IMPRESSIONS",
    optimization_goal: "CONVERSATIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    targeting: {
      geo_locations: {
        countries: Array.isArray(settings.countries)
          ? settings.countries.map(String)
          : [String(settings.country || "TR")],
      },
      publisher_platforms: ["facebook", "instagram"],
    },
    promoted_object: promotedObject,
    status: "PAUSED",
  });

  const message = String(settings.message || settings.caption || "مرحباً — الريان للسياحة. كيف نساعدكم؟");
  const creative = await graphPost(`act_${act}/adcreatives`, creds.metaAccessToken, {
    name: "LIOTRIP CTWA creative",
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message,
        link: String(settings.landingUrl || "https://lonaliza.com/"),
        name: String(settings.headline || "تواصل عبر واتساب"),
        call_to_action: {
          type: "WHATSAPP_MESSAGE",
          value: { link: String(settings.landingUrl || "https://lonaliza.com/") },
        },
      },
    },
  });

  let adId: string | null = null;
  let adError: string | null = null;
  if (adSet.ok && creative.ok) {
    const ad = await graphPost(`act_${act}/ads`, creds.metaAccessToken, {
      name: "LIOTRIP CTWA ad",
      adset_id: adSet.data.id,
      creative: { creative_id: creative.data.id },
      status: "PAUSED",
    });
    adId = ad.ok ? String(ad.data.id || "") : null;
    adError = ad.ok ? null : ad.error || null;
  }

  return {
    ok: Boolean(campaign.ok && adSet.ok),
    processed: 1,
    message: adSet.ok
      ? "حملة CTWA أُنشئت متوقفة للمراجعة في مدير الإعلانات — بلا إطلاق تلقائي."
      : adSet.error || creative.error || "اكتملت الحملة جزئياً",
    dryRun: false,
    details: {
      campaignId,
      adSetId: adSet.data.id || null,
      creativeId: creative.data.id || null,
      adId,
      adSetError: adSet.error || null,
      creativeError: creative.error || null,
      adError,
      status: "PAUSED",
    },
  };
}

/** Combined job: lookalike seed + CTWA campaign (both require approval). */
export async function runCtwaLookalike(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const lookalike = await runLookalikeAudience(ctx);
  const ctwa = await runCtwaCampaign(ctx);
  return {
    ok: lookalike.ok || ctwa.ok,
    processed: (lookalike.processed || 0) + (ctwa.processed || 0),
    skipped: (lookalike.skipped || 0) + (ctwa.skipped || 0),
    message: `Lookalike: ${lookalike.message} | CTWA: ${ctwa.message}`,
    dryRun: Boolean(lookalike.dryRun && ctwa.dryRun),
    details: { lookalike: lookalike.details, ctwa: ctwa.details },
  };
}
