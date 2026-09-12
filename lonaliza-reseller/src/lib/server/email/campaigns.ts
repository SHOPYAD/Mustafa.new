import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { CustomerRecord, EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import { ensureEmailCollections } from "@/lib/server/email/collections";
import { renderTemplateMessage, sendMail } from "@/lib/server/email/send";
import { getEmailBrand } from "@/lib/server/email/brand";
import { syncExtraEmailI18nKeys } from "@/lib/server/email/i18n-keys";
import { resolveRecipientLocale } from "@/lib/server/email/recipient-locale";
import { emailT } from "@/lib/server/email/template-i18n";
import { parseCsvAudience, type CsvRecipient } from "@/lib/email-csv";
import { isLikelyEmail as isStrictEmail, peopleFromUnknownList } from "@/lib/email/parse-audience";
import {
  deleteLocalTemplate,
  getLocalTemplate,
  listLocalTemplates,
  newLocalSlug,
  saveLocalTemplate,
} from "@/lib/server/email/local-store";
import type {
  EmailCampaignAudience,
  EmailCampaignRecord,
  EmailRecipientRecord,
  EmailTemplateRecord,
} from "@/lib/server/email/types";

const DEFAULT_BATCH = 40;
const MIN_BATCH = 10;
const MAX_BATCH = 50;

function clampBatch(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return DEFAULT_BATCH;
  return Math.max(MIN_BATCH, Math.min(MAX_BATCH, Math.round(v)));
}

function isLikelyEmail(value: string): boolean {
  return isStrictEmail(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function pocketbaseErrorMessage(e: unknown, fallback: string): string {
  if (!e || typeof e !== "object") return fallback;
  const err = e as {
    message?: string;
    response?: {
      message?: string;
      data?: Record<string, { message?: string }>;
    };
  };
  const fields = err.response?.data;
  if (fields && typeof fields === "object") {
    const parts = Object.entries(fields)
      .map(([key, value]) => (value?.message ? `${key}: ${value.message}` : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  const raw = err.response?.message || err.message || fallback;
  return raw.replace(/Failed to create record/i, "تعذّر إنشاء السجل — تحقق من القالب والمستلمين");
}

function pbQuote(value: string): string {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export { parseCsvAudience };
export type { CsvRecipient };

async function requirePb(): Promise<PocketBase> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) throw new Error("PocketBase غير متاح");
  const ensured = await ensureEmailCollections(pb);
  if (!ensured.ok) throw new Error(ensured.error || "مجموعات البريد غير جاهزة");
  return pb;
}

export async function listTemplates(): Promise<EmailTemplateRecord[]> {
  const local = await listLocalTemplates();
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return local;
    const ensured = await ensureEmailCollections(pb);
    if (!ensured.ok) return local;
    const remote = await pb.collection("email_templates").getFullList<EmailTemplateRecord>({
      sort: "kind,name",
    });
    const bySlug = new Map<string, EmailTemplateRecord>();
    for (const row of local) bySlug.set(row.slug, row);
    for (const row of remote) {
      if (row.is_builtin || row.source === "builtin") continue;
      if (row.html_ar || !bySlug.has(row.slug)) bySlug.set(row.slug, row);
    }
    return [...bySlug.values()].sort((a, b) =>
      `${a.kind}${a.name}`.localeCompare(`${b.kind}${b.name}`, "ar")
    );
  } catch {
    return local;
  }
}

export async function getTemplate(id: string): Promise<EmailTemplateRecord> {
  const local = await getLocalTemplate(id);
  if (local) return local;
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) throw new Error("القالب غير موجود");
    const remote = await pb.collection("email_templates").getOne<EmailTemplateRecord>(id);
    if (remote.is_builtin || remote.source === "builtin") {
      const fresh = await getLocalTemplate(remote.slug);
      if (fresh) return fresh;
    }
    return remote;
  } catch {
    throw new Error("القالب غير موجود");
  }
}

export async function createTemplate(
  input: Partial<EmailTemplateRecord>
): Promise<EmailTemplateRecord> {
  const slug = newLocalSlug(input.slug || input.name);
  const local = await saveLocalTemplate({
    slug,
    kind: input.kind || "custom",
    name: String(input.name || "قالب جديد").trim(),
    subject_ar: input.subject_ar || "",
    subject_en: input.subject_en || "",
    html_ar: input.html_ar || "",
    html_en: input.html_en || "",
      text_ar: input.text_ar || "",
      text_en: input.text_en || "",
      source: input.source || "manual",
      variables: input.variables || ["name", "company", "bookingId", "amount"],
      document: input.document,
    });
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return local;
    await ensureEmailCollections(pb);
    const remote = await pb.collection("email_templates").create<EmailTemplateRecord>({
      slug: local.slug,
      kind: local.kind,
      name: local.name,
      subject_ar: local.subject_ar,
      subject_en: local.subject_en,
      html_ar: local.html_ar,
      html_en: local.html_en,
      text_ar: local.text_ar,
      text_en: local.text_en,
      is_builtin: false,
      source: local.source,
      variables: local.variables,
      document: local.document ?? null,
    });
    void syncExtraEmailI18nKeys(remote).catch(() => undefined);
    return remote;
  } catch {
    void syncExtraEmailI18nKeys(local).catch(() => undefined);
    return local;
  }
}

export async function updateTemplate(
  id: string,
  input: Partial<EmailTemplateRecord>
): Promise<EmailTemplateRecord> {
  const current = await getTemplate(id);
  const next = await saveLocalTemplate({
    ...current,
    ...input,
    slug: current.slug,
    id: current.id.startsWith("local:") ? current.id : `local:${current.slug}`,
  });
  if (current.id.startsWith("local:")) {
    void syncExtraEmailI18nKeys(next).catch(() => undefined);
    return next;
  }
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) {
      void syncExtraEmailI18nKeys(next).catch(() => undefined);
      return next;
    }
    const updated = await pb.collection("email_templates").update<EmailTemplateRecord>(id, {
      name: input.name ?? current.name,
      kind: input.kind ?? current.kind,
      subject_ar: input.subject_ar ?? current.subject_ar,
      subject_en: input.subject_en ?? current.subject_en,
      html_ar: input.html_ar ?? current.html_ar,
      html_en: input.html_en ?? current.html_en,
      text_ar: input.text_ar ?? current.text_ar,
      text_en: input.text_en ?? current.text_en,
      source: current.is_builtin ? current.source : input.source ?? current.source,
      variables: input.variables ?? current.variables,
      document: input.document !== undefined ? input.document : current.document,
    });
    void syncExtraEmailI18nKeys(updated).catch(() => undefined);
    return updated;
  } catch {
    void syncExtraEmailI18nKeys(next).catch(() => undefined);
    return next;
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  const current = await getTemplate(id);
  if (current.is_builtin) {
    throw new Error("لا يُحذف القالب الجاهز. يمكنك نسخه وتعديله.");
  }
  await deleteLocalTemplate(id);
  if (id.startsWith("local:")) return;
  try {
    const pb = await tryCreateAdminPocketBase();
    if (pb) await pb.collection("email_templates").delete(id);
  } catch {
    /* already removed locally */
  }
}

export async function listCampaigns(): Promise<EmailCampaignRecord[]> {
  const pb = await requirePb();
  return pb.collection("email_campaigns").getFullList<EmailCampaignRecord>({
    sort: "-created",
  });
}

export async function getCampaign(id: string): Promise<
  EmailCampaignRecord & { templateRow?: EmailTemplateRecord }
> {
  const pb = await requirePb();
  const campaign = await pb.collection("email_campaigns").getOne<EmailCampaignRecord>(id);
  let templateRow: EmailTemplateRecord | undefined;
  try {
    templateRow = await pb
      .collection("email_templates")
      .getOne<EmailTemplateRecord>(campaign.template);
  } catch {
    templateRow = undefined;
  }
  return { ...campaign, templateRow };
}

async function insertRecipients(
  pb: PocketBase,
  campaignId: string,
  people: CsvRecipient[]
): Promise<number> {
  let created = 0;
  for (const person of people) {
    if (!isLikelyEmail(person.email)) continue;
    const payload = {
      campaign: campaignId,
      email: person.email.toLowerCase(),
      name: person.name || "",
      company: person.company || "",
      locale: person.locale || "",
      status: "pending" as const,
    };
    try {
      await pb.collection("email_recipients").create(payload);
      created += 1;
    } catch {
      try {
        const { company: _company, locale: _locale, ...withoutCompany } = payload;
        await pb.collection("email_recipients").create(withoutCompany);
        created += 1;
      } catch {
        /* skip duplicates / invalid */
      }
    }
  }
  return created;
}

async function collectEmails(
  rows: Array<{ email?: string; name?: string; locale?: string }>
): Promise<CsvRecipient[]> {
  const seen = new Set<string>();
  const people: CsvRecipient[] = [];
  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase();
    if (!isLikelyEmail(email) || seen.has(email)) continue;
    seen.add(email);
    people.push({
      email,
      name: row.name || "",
      company: "",
      locale: row.locale || "",
    });
  }
  return people;
}

async function loadAudience(
  pb: PocketBase,
  audience: EmailCampaignAudience,
  csv?: string
): Promise<CsvRecipient[]> {
  if (audience === "csv") return parseCsvAudience(csv || "");
  if (audience === "customers") {
    let customers: CustomerRecord[] = [];
    try {
      customers = await pb.collection("customers").getFullList<CustomerRecord>({
        fields: "id,name,email,locale",
      });
    } catch {
      customers = await pb.collection("customers").getFullList<CustomerRecord>({
        fields: "id,name,email",
      });
    }
    return collectEmails(
      customers.map((row) => ({ email: row.email, name: row.name, locale: row.locale }))
    );
  }
  if (audience === "hotel") {
    const [hotels, enquiries] = await Promise.all([
      pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
        fields: "id,customer_name,customer_email",
      }),
      pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
        filter: `type="hotel"`,
        fields: "id,customer_name,customer_email",
      }),
    ]);
    return collectEmails([
      ...hotels.map((row) => ({ email: row.customer_email, name: row.customer_name })),
      ...enquiries.map((row) => ({ email: row.customer_email, name: row.customer_name })),
    ]);
  }
  const typeFilter = audience;
  const enquiries = await pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
    filter: `type="${typeFilter}"`,
    fields: "id,customer_name,customer_email",
  });
  return collectEmails(
    enquiries.map((row) => ({ email: row.customer_email, name: row.customer_name }))
  );
}

async function resolveRemoteTemplateId(pb: PocketBase, templateId: string): Promise<string> {
  if (!templateId.startsWith("local:")) {
    await pb.collection("email_templates").getOne(templateId);
    return templateId;
  }
  const local = await getLocalTemplate(templateId);
  if (!local) throw new Error("القالب غير موجود");
  try {
    const existing = await pb
      .collection("email_templates")
      .getFirstListItem<EmailTemplateRecord>(`slug="${local.slug}"`);
    return existing.id;
  } catch {
    const created = await pb.collection("email_templates").create<EmailTemplateRecord>({
      slug: local.slug,
      kind: local.kind,
      name: local.name,
      subject_ar: local.subject_ar,
      subject_en: local.subject_en,
      html_ar: local.html_ar,
      html_en: local.html_en,
      text_ar: local.text_ar,
      text_en: local.text_en,
      is_builtin: local.is_builtin,
      source: local.source,
      variables: local.variables || ["name", "company", "email"],
    });
    return created.id;
  }
}

export async function createCampaign(input: {
  name: string;
  templateId: string;
  audience: EmailCampaignAudience;
  csv?: string;
  csvName?: string;
  recipients?: CsvRecipient[];
  scheduledAt?: string;
  batchSize?: number;
  sendMode: "draft" | "now" | "schedule";
}): Promise<EmailCampaignRecord> {
  const pb = await requirePb();
  const templateId = await resolveRemoteTemplateId(pb, input.templateId);

  const fromUpload = peopleFromUnknownList(input.recipients);
  const people =
    fromUpload.length > 0
      ? fromUpload
      : await loadAudience(pb, input.audience, input.csv);

  if (input.sendMode !== "draft" && people.length === 0) {
    throw new Error("لا يوجد مستلمون صالحون. لن تُرسل الحملة.");
  }

  const sendMode = input.sendMode;
  let status: EmailCampaignRecord["status"] = "draft";
  if (sendMode === "now") status = "queued";
  if (sendMode === "schedule") status = "scheduled";

  const payload: Record<string, unknown> = {
    name: String(input.name || "حملة جديدة").trim(),
    template: templateId,
    audience: input.audience,
    status,
    batch_size: clampBatch(input.batchSize),
    sent_count: 0,
    failed_count: 0,
    remaining_count: people.length,
    total_count: people.length,
    csv_name: input.csvName || "",
  };
  if (input.scheduledAt) {
    payload.scheduled_at = new Date(input.scheduledAt).toISOString();
  }

  let campaign: EmailCampaignRecord;
  try {
    campaign = await pb.collection("email_campaigns").create<EmailCampaignRecord>(payload);
  } catch (e) {
    throw new Error(pocketbaseErrorMessage(e, "تعذّر إنشاء الحملة"));
  }

  const total = await insertRecipients(pb, campaign.id, people);
  return pb.collection("email_campaigns").update<EmailCampaignRecord>(campaign.id, {
    total_count: total,
    remaining_count: total,
  });
}

export async function patchCampaign(
  id: string,
  input: { status?: EmailCampaignRecord["status"]; scheduledAt?: string }
): Promise<EmailCampaignRecord> {
  const pb = await requirePb();
  const current = await pb.collection("email_campaigns").getOne<EmailCampaignRecord>(id);
  return pb.collection("email_campaigns").update<EmailCampaignRecord>(id, {
    status: input.status || current.status,
    scheduled_at: input.scheduledAt ?? current.scheduled_at,
  });
}

export async function sendCampaignTest(input: {
  templateId: string;
  to: string;
  vars?: Record<string, string>;
  locale?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const template = await getTemplate(input.templateId);
  const brand = await getEmailBrand();
  const locale = await resolveRecipientLocale({
    email: input.to,
    explicit: input.locale,
  });
  const ctaLabel = await emailT(locale, "email.templates.common.cta.visitSite");
  const rendered = await renderTemplateMessage(template, {
    name: "الأدمن",
    company: brand.brandNameAr,
    email: input.to,
    offer_title: "عرض تجريبي من الريان",
    offer_detail: "هذه رسالة تجريبية — لم تُرسل لأي عميل.",
    cta_url: brand.siteUrl,
    cta_label: ctaLabel,
    cta_label_ar: ctaLabel,
    cta_label_en: ctaLabel,
    route: "DXB → IST",
    depart_date: "2026-09-10",
    return_date: "2026-09-17",
    passengers: "2",
    hotel_name: "فندق تجريبي",
    room_name: "غرفة ديلوكس",
    check_in: "2026-09-10",
    check_out: "2026-09-14",
    nights: "4",
    booking_id: "TEST-ADMIN",
    bookingId: "TEST-ADMIN",
    service_name: "تجربة القالب",
    detail_ar: "معاينة فقط — ليست حملة جماعية",
    detail_en: "Preview only — not a bulk campaign",
    amount: "0",
    currency: "USD",
    invoice_url: brand.siteUrl,
    payment_ref: "TEST",
    ...(input.vars || {}),
  }, brand, locale);
  return sendMail({
    to: input.to,
    toName: "Admin",
    subject: `[تجريبي] ${rendered.subject}`,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: true,
    locale,
  });
}

async function refreshCounts(pb: PocketBase, campaignId: string): Promise<EmailCampaignRecord> {
  const [sent, failed, pending] = await Promise.all([
    pb.collection("email_recipients").getList(1, 1, {
      filter: `campaign=${pbQuote(campaignId)} && status="sent"`,
    }),
    pb.collection("email_recipients").getList(1, 1, {
      filter: `campaign=${pbQuote(campaignId)} && status="failed"`,
    }),
    pb.collection("email_recipients").getList(1, 1, {
      filter: `campaign=${pbQuote(campaignId)} && status="pending"`,
    }),
  ]);
  const remaining = pending.totalItems;
  const status: EmailCampaignRecord["status"] =
    remaining === 0 ? "completed" : "sending";
  return pb.collection("email_campaigns").update<EmailCampaignRecord>(campaignId, {
    sent_count: sent.totalItems,
    failed_count: failed.totalItems,
    remaining_count: remaining,
    last_batch_at: new Date().toISOString(),
    status,
    last_error: "",
  });
}

export async function dispatchDueCampaigns(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { processed: 0, sent: 0, failed: 0 };
  await ensureEmailCollections(pb);

  const now = new Date().toISOString();
  const due = await pb.collection("email_campaigns").getFullList<EmailCampaignRecord>({
    filter: `status="queued" || status="sending" || (status="scheduled" && scheduled_at!="" && scheduled_at<="${now}")`,
  });

  let sent = 0;
  let failed = 0;
  for (const campaign of due) {
    const batchSize = clampBatch(campaign.batch_size);
    const template = await pb
      .collection("email_templates")
      .getOne<EmailTemplateRecord>(campaign.template)
      .catch(() => null);
    if (!template) {
      await pb.collection("email_campaigns").update(campaign.id, {
        last_error: "القالب غير موجود",
        status: "paused",
      });
      continue;
    }

    if (campaign.status === "scheduled") {
      await pb.collection("email_campaigns").update(campaign.id, { status: "sending" });
    }

    const page = await pb.collection("email_recipients").getList<EmailRecipientRecord>(1, batchSize, {
      filter: `campaign=${pbQuote(campaign.id)} && status="pending"`,
      sort: "created",
    });

    if (page.items.length === 0) {
      await refreshCounts(pb, campaign.id);
      continue;
    }

    const brand = await getEmailBrand();
    for (const row of page.items) {
      const locale = await resolveRecipientLocale({
        email: row.email,
        explicit: row.locale,
      });
      const ctaLabel = await emailT(locale, "email.templates.common.cta.browseOffers");
      const rendered = await renderTemplateMessage(template, {
        name: row.name || "",
        company: row.company || "",
        email: row.email,
        cta_url: brand.siteUrl,
        cta_label: ctaLabel,
        cta_label_ar: ctaLabel,
        cta_label_en: ctaLabel,
      }, brand, locale);
      const result = await sendMail({
        to: row.email,
        toName: row.name || undefined,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        listUnsubscribe: true,
        locale,
      });
      if (result.ok) {
        sent += 1;
        await pb.collection("email_recipients").update(row.id, {
          status: "sent",
          sent_at: new Date().toISOString(),
          error: "",
        });
      } else {
        failed += 1;
        await pb.collection("email_recipients").update(row.id, {
          status: "failed",
          error: result.error.slice(0, 300),
        });
      }
    }
    await refreshCounts(pb, campaign.id);
  }

  return { processed: due.length, sent, failed };
}

export async function countCustomersWithEmail(): Promise<number> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return 0;
  try {
    const page = await pb.collection("customers").getList(1, 1, {
      filter: `email!=""`,
    });
    return page.totalItems;
  } catch {
    return 0;
  }
}
