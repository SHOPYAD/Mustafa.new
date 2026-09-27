"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Pause,
  Play,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import EmailAudienceUpload from "@/components/admin/EmailAudienceUpload";
import EmailVisualEditor from "@/components/admin/email-editor/EmailVisualEditor";
import {
  validPeopleFromParse,
  type AudienceParseResult,
} from "@/lib/email/parse-audience";
import {
  defaultVisualDocument,
  type EmailBrandLite,
  type EmailVisualDocument,
} from "@/lib/email/visual-doc";

const inputClass =
  "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-sm";
const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-xs";

type Template = {
  id: string;
  slug: string;
  kind: string;
  name: string;
  subject_ar: string;
  subject_en: string;
  html_ar: string;
  is_builtin: boolean;
  source: string;
  document?: unknown;
};

type Campaign = {
  id: string;
  name: string;
  template: string;
  audience: string;
  status: string;
  scheduled_at?: string;
  batch_size: number;
  sent_count: number;
  failed_count: number;
  remaining_count: number;
  total_count: number;
  last_error?: string;
};

const KIND_AR: Record<string, string> = {
  offers_reminder: "تذكير عروض",
  flight_reminder: "تذكير حجز طيران",
  hotel_reminder: "تذكير حجز فندق",
  package_reminder: "تذكير باقة",
  tour_reminder: "تذكير جولة",
  transfer_reminder: "تذكير ترانسفير",
  car_reminder: "تذكير سيارة",
  visa_reminder: "تذكير تأشيرة",
  booking_success: "إشعار حجز ناجح",
  hotel_success: "حجز فندق ناجح",
  flight_success: "حجز طيران ناجح",
  package_success: "حجز باقة ناجح",
  tour_success: "حجز جولة ناجح",
  transfer_success: "حجز ترانسفير ناجح",
  car_success: "حجز سيارة ناجح",
  visa_success: "طلب تأشيرة مستلم",
  invoice: "فاتورة حجز / دفع",
  custom: "مخصّص",
};

const AUDIENCE_AR: Record<string, string> = {
  customers: "كل العملاء",
  csv: "CSV",
  hotel: "حجوزات الفنادق",
  flight: "حجوزات الطيران",
  package: "طلبات الباقات",
  tour: "طلبات الجولات",
  transfer: "طلبات الترانسفير",
  car: "طلبات السيارات",
  visa: "طلبات التأشيرة",
};

type AudienceKey =
  | "customers"
  | "csv"
  | "hotel"
  | "flight"
  | "package"
  | "tour"
  | "transfer"
  | "car"
  | "visa";

export default function AdminEmailMarketingPage() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const [tab, setTab] = useState<"templates" | "campaigns">("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [smtpLabel, setSmtpLabel] = useState("");
  const [smtpReady, setSmtpReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [brand, setBrand] = useState<EmailBrandLite | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftSubjectAr, setDraftSubjectAr] = useState("");
  const [draftSubjectEn, setDraftSubjectEn] = useState("");
  const [draftDocument, setDraftDocument] = useState<EmailVisualDocument | null>(null);
  const [busy, setBusy] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [audience, setAudience] = useState<AudienceKey>("customers");
  const [csvText, setCsvText] = useState("");
  const [csvName, setCsvName] = useState("");
  const [audienceParse, setAudienceParse] = useState<AudienceParseResult | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [batchSize, setBatchSize] = useState(40);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || templates[0],
    [templates, selectedId]
  );

  const applyDraft = (tpl: Template, nextBrand?: EmailBrandLite | null) => {
    const liveBrand = nextBrand || brand;
    setDraftName(tpl.name);
    setDraftSubjectAr(tpl.subject_ar);
    setDraftSubjectEn(tpl.subject_en || tpl.subject_ar);
    setDraftDocument(
      tpl.document
        ? (tpl.document as EmailVisualDocument)
        : liveBrand
          ? defaultVisualDocument(liveBrand)
          : null
    );
  };

  const load = async () => {
    setLoading(true);
    try {
      const [tplRes, campRes, smtpRes] = await Promise.all([
        fetch("/api/admin/email-templates", { cache: "no-store" }),
        fetch("/api/admin/email-campaigns", { cache: "no-store" }),
        fetch("/api/admin/email-settings", { cache: "no-store" }),
      ]);
      const tplJson = (await tplRes.json()) as {
        templates?: Template[];
        brand?: EmailBrandLite;
        error?: string;
      };
      const campJson = (await campRes.json()) as {
        campaigns?: Campaign[];
        customerCount?: number;
        error?: string;
      };
      const smtpJson = (await smtpRes.json()) as {
        smtp?: { connected?: boolean; statusLabelAr?: string; statusLabelEn?: string };
        adminEmail?: string;
      };
      const loaded = tplJson.templates || [];
      if (!tplRes.ok && loaded.length === 0) {
        throw new Error(tplJson.error || "templates");
      }
      const nextBrand = tplJson.brand || brand;
      if (tplJson.brand) setBrand(tplJson.brand);
      setTemplates(loaded);
      setCampaigns(campJson.campaigns || []);
      setCustomerCount(campJson.customerCount || 0);
      setSmtpReady(Boolean(smtpJson.smtp?.connected));
      setSmtpLabel(
        ar ? smtpJson.smtp?.statusLabelAr || "" : smtpJson.smtp?.statusLabelEn || ""
      );
      setAdminEmail(smtpJson.adminEmail || "");
      const firstId = selectedId || loaded[0]?.id || "";
      if (firstId) {
        setSelectedId(firstId);
        const current = loaded.find((t) => t.id === firstId) || loaded[0];
        if (current) applyDraft(current, nextBrand);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTemplate = async () => {
    if (!selected || !draftDocument) return;
    setBusy("save");
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/email-templates/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draftName,
          subject_ar: draftSubjectAr,
          subject_en: draftSubjectEn || draftSubjectAr,
          document: draftDocument,
          source: selected.source === "gemini" ? "gemini" : "manual",
        }),
      });
      const json = (await res.json()) as { template?: Template; error?: string };
      if (!res.ok) throw new Error(json.error || "save");
      setMsg(ar ? "حُفظ القالب وتحدّثت القائمة" : "Template saved and list updated");
      await load();
      if (json.template) {
        setSelectedId(json.template.id);
        applyDraft(json.template);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "save failed");
    } finally {
      setBusy("");
    }
  };

  const testSend = async (templateId: string) => {
    if (!adminEmail) {
      setErr(ar ? "أدخل إيميل الأدمن أولاً في إعدادات البريد" : "Set the admin inbox first");
      return;
    }
    setBusy("test");
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/email-templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, to: adminEmail }),
      });
      const json = (await res.json()) as { error?: string; to?: string };
      if (!res.ok) throw new Error(json.error || "test");
      setMsg(
        ar
          ? `أُرسل تجريبي إلى ${json.to} فقط — لا حملة جماعية`
          : `Test sent only to ${json.to} — no bulk campaign`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "test failed");
    } finally {
      setBusy("");
    }
  };

  const generateGemini = async (prompt: string) => {
    setBusy("gemini");
    setErr("");
    try {
      const res = await fetch("/api/admin/email-templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          kind: selected?.kind || "custom",
          currentDocument: draftDocument,
          audienceHint: (audienceParse ? validPeopleFromParse(audienceParse) : [])
            .slice(0, 20)
            .map((row) => `${row.name || row.email}${row.company ? ` — ${row.company}` : ""}`)
            .join("\n"),
        }),
      });
      const json = (await res.json()) as {
        template?: {
          name?: string;
          subject_ar?: string;
          subject_en?: string;
          document?: EmailVisualDocument;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "gemini");
      if (json.template?.name) setDraftName(json.template.name);
      if (json.template?.subject_ar) setDraftSubjectAr(json.template.subject_ar);
      if (json.template?.subject_en) setDraftSubjectEn(json.template.subject_en);
      if (json.template?.document) setDraftDocument(json.template.document);
      setMsg(ar ? "طُبّق اقتراح Gemini — راجع ثم احفظ" : "Gemini applied — review then save");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "gemini failed");
    } finally {
      setBusy("");
    }
  };

  const createBlank = async () => {
    setBusy("create");
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ar ? "قالب جديد" : "New template",
          kind: "custom",
          subject_ar: brand ? `رسالة من ${brand.brandNameAr}` : "موضوع الرسالة",
          subject_en: brand ? `A note from ${brand.brandNameEn}` : "Email subject",
          document: brand ? defaultVisualDocument(brand) : undefined,
          variables: ["name", "company", "bookingId", "amount"],
        }),
      });
      const json = (await res.json()) as { template?: Template; error?: string };
      if (!res.ok) throw new Error(json.error || "create");
      await load();
      if (json.template) {
        setSelectedId(json.template.id);
        applyDraft(json.template);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "create failed");
    } finally {
      setBusy("");
    }
  };

  const removeTemplate = async (id: string) => {
    if (!confirm(ar ? "حذف هذا القالب؟" : "Delete this template?")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "delete");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "delete failed");
    } finally {
      setBusy("");
    }
  };

  const createCampaign = async (sendMode: "draft" | "now" | "schedule") => {
    if (!selected) {
      setErr(ar ? "اختر قالباً" : "Choose a template");
      return;
    }
    if (sendMode === "now" && !confirm(
      ar
        ? `تأكيد الإرسال الجماعي؟ سيُجدول على دفعات ولن يُرسل للجميع دفعة واحدة. الجمهور: ${AUDIENCE_AR[audience] || audience}.`
        : `Confirm bulk send? Recipients will go out in batches. Audience: ${audience}.`
    )) {
      return;
    }
    setBusy("campaign");
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName || selected.name,
          templateId: selected.id,
          audience,
          csv: csvText,
          csvName: audienceParse?.fileName || csvName,
          recipients: audienceParse ? validPeopleFromParse(audienceParse) : undefined,
          scheduledAt,
          batchSize,
          sendMode,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "campaign");
      setMsg(
        sendMode === "now"
          ? ar
            ? "الحملة في الطابور — إرسال على دفعات عبر Cron"
            : "Campaign queued — batched via Cron"
          : sendMode === "schedule"
            ? ar
              ? "الحملة مجدولة"
              : "Campaign scheduled"
            : ar
              ? "حُفظت كمسودة"
              : "Saved as draft"
      );
      setTab("campaigns");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "campaign failed");
    } finally {
      setBusy("");
    }
  };

  const patchStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "patch");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "patch failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            {ar ? "تسويق البريد" : "Email marketing"}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {ar
              ? "محرر سحب-وإفلات، Gemini، ومعاينة حيّة. الشعار والتذييل من براند الموقع فقط."
              : "Drag-and-drop editor, Gemini, and live preview. Logo and footer from site brand only."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/email"
            className={`text-xs px-3 py-1.5 rounded-lg border ${
              smtpReady
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            }`}
          >
            SMTP: {smtpLabel || (ar ? "غير معدّ" : "not set")}
          </Link>
        </div>
      </div>

      {/* 4-Bento Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{ar ? "قوالب البريد" : "Templates"}</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {ar ? "تصميم ذكي" : "Smart"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{templates.length}</p>
          <p className="text-[11px] text-muted-foreground">{ar ? "قوالب مرئية مع دعم Gemini" : "Visual templates with AI"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{ar ? "حملات التسويق" : "Campaigns"}</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
              {ar ? "أتمتة" : "Automated"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{campaigns.length}</p>
          <p className="text-[11px] text-muted-foreground">{ar ? "حملات مجدولة ومكتملة" : "Scheduled & sent batches"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{ar ? "جمهور العملاء" : "Audience"}</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {ar ? "نشط" : "Live"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{customerCount}</p>
          <p className="text-[11px] text-muted-foreground">{ar ? "عميل مسجل بالقاعدة" : "Registered customers"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{ar ? "خادم SMTP" : "Mail Server"}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              smtpReady ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}>
              {smtpReady ? (ar ? "جاهز" : "Ready") : (ar ? "معطل" : "Off")}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold tracking-tight text-foreground truncate" dir="ltr">
            {smtpLabel || (ar ? "غير معدّ" : "not configured")}
          </p>
          <p className="text-[11px] text-muted-foreground">{ar ? "بوابة الإرسال الآلي للبريد" : "Outbound mail gateway"}</p>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1.5 backdrop-blur-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-fit">
        {(["templates", "campaigns"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              tab === key
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {key === "templates"
              ? ar
                ? "القوالب المرئية"
                : "Templates"
              : ar
                ? "الحملات المجدولة"
                : "Campaigns"}
          </button>
        ))}
      </div>

      {msg && <p className='text-sm text-secondary font-medium'>{msg}</p>}
      {err && <p className="text-sm text-red-300">{err}</p>}

      {loading ? (
        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
          <Loader2 size={16} className="animate-spin" />
          {ar ? "جاري التحميل…" : "Loading…"}
        </div>
      ) : tab === "templates" ? (
        <div className="grid xl:grid-cols-[240px_1fr] gap-5">
          <div className={`${cardClass} space-y-2`}>
            <div className="flex items-center justify-between mb-2">
              <p className='text-xs uppercase tracking-wider text-muted-foreground'>
                {ar ? "القوالب" : "Templates"}
              </p>
              <button
                type="button"
                onClick={() => void createBlank()}
                className='text-secondary hover:text-muted-foreground'
                title={ar ? "قالب جديد" : "New"}
              >
                <Plus size={16} />
              </button>
            </div>
            {templates.length === 0 && (
              <p className='text-xs text-muted-foreground px-1'>
                {ar ? "لا قوالب بعد — أعد تحميل الصفحة." : "No templates yet — reload."}
              </p>
            )}
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setSelectedId(tpl.id);
                  applyDraft(tpl);
                }}
                className={`w-full text-start px-3 py-2.5 rounded-xl text-sm ${
                  selected?.id === tpl.id
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <div className="font-semibold">{tpl.name}</div>
                <div className='text-[11px] text-muted-foreground'>
                  {KIND_AR[tpl.kind] || tpl.kind}
                  {tpl.is_builtin ? (ar ? " · جاهز" : " · built-in") : ""}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {selected && brand && (
              <div className={`${cardClass} space-y-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className='text-lg font-bold text-foreground'>
                      {ar ? "محرر القالب" : "Template editor"}
                    </h2>
                    <p className='text-xs text-muted-foreground'>
                      {ar
                        ? "اسحب المكوّنات، عدّل النص والألوان، ثم احفظ."
                        : "Drag blocks, edit copy and colors, then save."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void testSend(selected.id)}
                      className='inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/40 text-sm text-muted-foreground hover:bg-primary/10 transition-colors'
                    >
                      {busy === "test" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      {ar ? "تجريبي للأدمن" : "Test to admin"}
                    </button>
                    {!selected.is_builtin && (
                      <button
                        type="button"
                        onClick={() => void removeTemplate(selected.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-sm text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  className={inputClass}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder={ar ? "إيميل الأدمن للتجربة فقط" : "Admin test email only"}
                />
                <EmailVisualEditor
                  ar={ar}
                  brand={brand}
                  name={draftName}
                  subjectAr={draftSubjectAr}
                  subjectEn={draftSubjectEn}
                  htmlAr={selected.html_ar}
                  document={draftDocument || selected.document}
                  busy={busy}
                  onNameChange={setDraftName}
                  onSubjectArChange={setDraftSubjectAr}
                  onSubjectEnChange={setDraftSubjectEn}
                  onDocumentChange={setDraftDocument}
                  onSave={() => void saveTemplate()}
                  emailKind={selected?.kind || "custom"}
                  audienceHint={(audienceParse ? validPeopleFromParse(audienceParse) : [])
                    .slice(0, 20)
                    .map((row) => `${row.name || row.email}${row.company ? ` — ${row.company}` : ""}`)
                    .join("\n")}
                  onGemini={(prompt) => void generateGemini(prompt)}
                />
              </div>
            )}

            <div className={`${cardClass} space-y-4`}>
              <h3 className='font-semibold text-foreground'>
                {ar ? "إنشاء حملة" : "Create campaign"}
              </h3>
              <input
                className={inputClass}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder={ar ? "اسم الحملة" : "Campaign name"}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ["customers", ar ? `كل العملاء (${customerCount})` : `All customers (${customerCount})`],
                    ["csv", ar ? "ملف CSV / Excel" : "CSV / Excel file"],
                    ["hotel", ar ? "فنادق" : "Hotels"],
                    ["flight", ar ? "طيران" : "Flights"],
                    ["package", ar ? "باقات" : "Packages"],
                    ["tour", ar ? "جولات يومية" : "Tours"],
                    ["transfer", ar ? "ترانسفير VIP" : "Transfers"],
                    ["car", ar ? "سيارات" : "Cars"],
                    ["visa", ar ? "تأشيرات" : "Visa"],
                  ] as Array<[AudienceKey, string]>
                ).map(([key, label]) => (
                  <label key={key} className='text-sm text-muted-foreground flex items-center gap-2'>
                    <input
                      type="radio"
                      checked={audience === key}
                      onChange={() => setAudience(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <EmailAudienceUpload
                ar={ar}
                result={audienceParse}
                onParsed={(parsed) => {
                  setAudienceParse(parsed);
                  setCsvName(parsed.fileName);
                  setCsvText("");
                  setAudience("csv");
                  setErr("");
                }}
                onClear={() => {
                  setAudienceParse(null);
                  setCsvName("");
                  setCsvText("");
                }}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className='text-[11px] text-muted-foreground block mb-1'>
                    {ar ? "جدولة (اختياري)" : "Schedule (optional)"}
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className='text-[11px] text-muted-foreground block mb-1'>
                    {ar ? "دفعة / دقيقة (30–50)" : "Batch / minute (30–50)"}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    className={inputClass}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value) || 40)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void createCampaign("draft")}
                  className='px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground'
                >
                  {ar ? "حفظ مسودة" : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={() => void createCampaign("schedule")}
                  disabled={!scheduledAt}
                  className='px-4 py-2.5 rounded-xl border border-border/30 text-sm text-muted-foreground disabled:opacity-40'
                >
                  {ar ? "جدولة عبر Cron" : "Schedule via Cron"}
                </button>
                <button
                  type="button"
                  onClick={() => void createCampaign("now")}
                  disabled={!smtpReady}
                  className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-sm font-bold hover:brightness-110 shadow-sm disabled:opacity-40 cursor-pointer'
                >
                  <Mail size={14} />
                  {ar ? "إرسال فوري (دفعات)" : "Send now (batched)"}
                </button>
              </div>
              {!smtpReady && (
                <p className='text-xs text-muted-foreground'>
                  {ar
                    ? "الإرسال الفوري معطّل حتى يُضبط SMTP الحقيقي."
                    : "Immediate send stays disabled until real SMTP is configured."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              {ar ? "لا حملات بعد." : "No campaigns yet."}
            </p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className={`${cardClass} flex flex-wrap items-center gap-4`}>
                <div className="flex-1 min-w-[200px]">
                  <p className='text-foreground font-semibold'>{c.name}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {c.status} · {c.audience} · {ar ? "مرسل" : "sent"} {c.sent_count} /{" "}
                    {ar ? "فشل" : "failed"} {c.failed_count} / {ar ? "متبقٍ" : "left"}{" "}
                    {c.remaining_count} · {c.total_count} {ar ? "الإجمالي" : "total"}
                  </p>
                  {c.last_error && (
                    <p className="text-xs text-red-300 mt-1">{c.last_error}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(c.status === "sending" || c.status === "queued") && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(c.id, "paused")}
                      className='px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground'
                    >
                      <Pause size={14} />
                    </button>
                  )}
                  {c.status === "paused" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(c.id, "queued")}
                      className='px-3 py-2 rounded-xl border border-primary/40 text-xs text-muted-foreground hover:bg-primary/10 transition-colors'
                    >
                      <Play size={14} />
                    </button>
                  )}
                  {c.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => void patchStatus(c.id, "queued")}
                      className='px-3 py-2 rounded-xl border border-border/30 text-xs text-muted-foreground'
                    >
                      {ar ? "طابور" : "Queue"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
