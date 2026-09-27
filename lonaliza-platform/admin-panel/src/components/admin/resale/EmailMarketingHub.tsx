"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
  Bot,
  Settings,
  Layers,
  FileText,
  UserCheck,
  Sliders,
  Filter,
} from "lucide-react";
import type { ScrapedBusinessLead, B2BMarketingTemplate } from "@/lib/server/gmaps-scraper/types";

interface EmailMarketingHubProps {
  leads: ScrapedBusinessLead[];
  templates: B2BMarketingTemplate[];
  onRefreshLeads: () => void;
}

export default function EmailMarketingHub({
  leads,
  templates,
  onRefreshLeads,
}: EmailMarketingHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"campaigns" | "settings" | "logs">("campaigns");

  // SMTP Settings State
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [senderName, setSenderName] = useState("Lonaliza Travel & B2B Partnerships");
  const [senderAddress, setSenderAddress] = useState("partners@lonaliza.com");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [verifyingSmtp, setVerifyingSmtp] = useState(false);
  const [smtpStatusBadge, setSmtpStatusBadge] = useState<{ ok: boolean; message: string } | null>(null);

  // Email Logs State
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Campaign Dispatcher State
  const [campaignTitle, setCampaignTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [campaignFeedback, setCampaignFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email Templates
  const emailTemplates = templates.filter((t) => t.channel === "email" || !t.channel);

  // Fetch Settings & Logs
  const fetchSettingsAndLogs = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/resale/marketing/email/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSmtpHost(data.settings.host || "");
          setSmtpPort(data.settings.port || 587);
          setSmtpUser(data.settings.username || "");
          setSmtpPass(data.settings.password || "");
          setSenderName(data.settings.senderName || "Lonaliza Travel");
          setSenderAddress(data.settings.senderAddress || "partners@lonaliza.com");
          setSmtpSecure(Boolean(data.settings.secure));
        }
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch {}
    setLoadingSettings(false);
  };

  useEffect(() => {
    void fetchSettingsAndLogs();
  }, []);

  // When template selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const t = emailTemplates.find((x) => x.id === selectedTemplateId);
      if (t) {
        setCustomSubject(t.title);
        setCustomBody(t.body);
      }
    } else {
      setCustomSubject("فرصة شراكة سياحية استراتيجية B2B مع منصة لوناليزا");
      setCustomBody(
        "السادة إدارة {company_name} المحترمين في {city}،\n\n" +
        "يسر منصة لوناليزا دعوة شركتكم الموقرة للانضمام إلى شبكة التوريد السياحي B2B الحصرية والاستفادة من:\n" +
        "1. محرك حجز فنادق مباشر يضم أكثر من 500,000 فندق مع أسعار تفضيلية.\n" +
        "2. واجهة وايت ليبل متكاملة بهوية شركتكم.\n" +
        "3. بوابات دفع آمنة وخدمات دعم مدار الساعة.\n\n" +
        "يسعدنا تزويدكم بتفاصيل العقد التجريبي عبر الرابط التالي:\n" +
        "{demo_url}\n\n" +
        "مع خالص التحية،\nفريق شراكات B2B | منصة لوناليزا"
      );
    }
  }, [selectedTemplateId]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSmtpStatusBadge(null);
    try {
      const res = await fetch("/api/admin/resale/marketing/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: smtpHost,
          port: Number(smtpPort),
          username: smtpUser,
          password: smtpPass,
          senderName,
          senderAddress,
          secure: smtpSecure,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSmtpStatusBadge({ ok: true, message: "تم حفظ إعدادات خادم SMTP بنجاح!" });
      } else {
        setSmtpStatusBadge({ ok: false, message: data.error || "فشل حفظ الإعدادات" });
      }
    } catch {
      setSmtpStatusBadge({ ok: false, message: "خطأ في الاتصال بالخادم" });
    } finally {
      setSavingSettings(false);
    }
  };

  // Verify SMTP Connection
  const handleVerifySmtp = async () => {
    setVerifyingSmtp(true);
    setSmtpStatusBadge(null);
    try {
      const res = await fetch("/api/admin/resale/marketing/email/verify", {
        method: "POST",
      });
      const data = await res.json();
      setSmtpStatusBadge({
        ok: Boolean(data.ok),
        message: data.message + (data.error ? `: ${data.error}` : ""),
      });
    } catch {
      setSmtpStatusBadge({ ok: false, message: "تعذر فحص اتصال خادم SMTP" });
    } finally {
      setVerifyingSmtp(false);
    }
  };

  // Filter Target Leads for Campaign
  const eligibleLeads = leads.filter((l) => {
    const hasEmail = Boolean(l.email && l.email.includes("@"));
    const matchCity = !cityFilter || l.city?.toLowerCase().includes(cityFilter.toLowerCase());
    return hasEmail && matchCity;
  });

  // Launch Bulk Email Campaign
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibleLeads.length === 0) {
      setCampaignFeedback({ type: "error", text: "لا توجد شركات سياحية تمتلك بريد إلكتروني صالح ضمن التصفية المحددة" });
      return;
    }
    if (!customSubject || !customBody) {
      setCampaignFeedback({ type: "error", text: "يرجى كتابة عنوان ونص الرسالة للحملة" });
      return;
    }

    setLaunchingCampaign(true);
    setCampaignFeedback(null);

    try {
      const res = await fetch("/api/admin/resale/marketing/email/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle || `حملة سياحية B2B - ${new Date().toLocaleDateString("ar-SA")}`,
          templateSubject: customSubject,
          templateBody: customBody,
          targetLeads: eligibleLeads,
          delaySeconds: Number(delaySeconds),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setCampaignFeedback({
          type: "success",
          text: `تم إطلاق الحملة بنجاح عبر الوكيل المسوق لـ ${eligibleLeads.length} شركة سياحية! يجري الإرسال المتتابع الآن.`,
        });
        void fetchSettingsAndLogs();
        onRefreshLeads();
      } else {
        setCampaignFeedback({
          type: "error",
          text: data.error || "فشل إطلاق الحملة البريدية",
        });
      }
    } catch {
      setCampaignFeedback({ type: "error", text: "حدث خطأ أثناء الاتصال بالخادم" });
    } finally {
      setLaunchingCampaign(false);
    }
  };

  // Stats Calculations
  const totalSent = logs.length;
  const totalDelivered = logs.filter((l) => l.status === "delivered").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;
  const successRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;
  const leadsWithEmailCount = leads.filter((l) => l.email && l.email.includes("@")).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <Mail className="size-5 text-purple-600" />
            <span>لوحة التسويق بالبريد الإلكتروني وخادم SMTP الداخلي</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            نظام مراسلة وإطلاق حملات تسويقية مباشرة للشركات السياحية عبر بروتوكول SMTP مع وكيل الإرسال الآمن.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          <button
            type="button"
            onClick={() => setActiveSubTab("campaigns")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === "campaigns"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Bot className="size-3.5" />
            <span>الوكيل وحملات البريد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("settings")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === "settings"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Server className="size-3.5" />
            <span>إعدادات خادم SMTP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("logs")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === "logs"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <Clock className="size-3.5" />
            <span>سجل الإرسال ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">شركات ببريد مؤكد</span>
            <UserCheck className="size-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-600 font-mono">
            {leadsWithEmailCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">إجمالي الرسائل المرسلة</span>
            <Send className="size-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-600 font-mono">
            {totalSent}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">نسبة تسليم SMTP</span>
            <ShieldCheck className="size-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-600 font-mono">
            {successRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">رسائل متعثرة</span>
            <AlertCircle className="size-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600 font-mono">
            {totalFailed}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: CAMPAIGN AGENT & BULK DISPATCHER */}
      {activeSubTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Campaign Form */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Bot className="size-4 text-purple-600" />
                  <span>الوكيل المسوق وإطلاق حملة بريد B2B</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  إرسال عروض الشراكة السياحية للشركات المكتشفة مع تأخير زمني لمكافحة الحظر.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 font-bold text-xs">
                {eligibleLeads.length} مستلم مستهدف
              </span>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground block">عنوان الحملة للتوثيق:</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    placeholder="مثال: حملة شراكة وكالات إسطنبول وطرابزون"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground block">تصفية حسب المدينة:</label>
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="مثال: إسطنبول (اتركه فارغاً لاستهداف الكل)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-1">
                <label className="font-bold text-foreground block">اختيار قالب الرسالة:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold cursor-pointer"
                >
                  <option value="">— قالب شراكة فنادق وجولات مخصص —</option>
                  {emailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="font-bold text-foreground block">عنوان البريد (Subject Line):</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-bold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">نص البريد (مع متغيرات الاستبدال الذكية):</label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {'{company_name}'} • {'{city}'} • {'{demo_url}'}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-card-2 border border-border text-foreground font-mono leading-relaxed focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Anti-Spam Jitter */}
              <div className="p-3.5 rounded-2xl bg-card-2 border border-border space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    <span>فترة الانتظار بين الرسائل (Anti-Spam Throttling):</span>
                  </span>
                  <span className="text-purple-600 font-mono font-black">{delaySeconds} ثانية</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground">
                  يحمي خادم SMTP وعنوان IP الخاص بك من التصنيف كبريد مزعج عند إرسال مئات الرسائل.
                </p>
              </div>

              {campaignFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold ${
                    campaignFeedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  }`}
                >
                  {campaignFeedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={launchingCampaign || eligibleLeads.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {launchingCampaign ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>جاري إطلاق الحملة البريدية...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    <span>بدء إرسال الحملة لـ {eligibleLeads.length} شركة سياحية الآن</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Side Info & Target List */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                <UserCheck className="size-4 text-purple-600" />
                <span>قائمة الشركات المستهدفة ({eligibleLeads.length})</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                الشركات التي سيتم مراسلتها في هذه الحملة تلقائياً:
              </p>
              <div className="max-h-80 overflow-y-auto space-y-2 text-xs divide-y divide-border">
                {eligibleLeads.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground py-4 text-center">لا توجد شركات ببريد إلكتروني صالح.</p>
                ) : (
                  eligibleLeads.map((lead) => (
                    <div key={lead.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <div className="font-bold text-foreground truncate">{lead.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{lead.email}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                        {lead.city}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SMTP SERVER SETTINGS */}
      {activeSubTab === "settings" && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Server className="size-4 text-purple-600" />
                <span>تهيئة خادم البريد SMTP الرسمي</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                إعدادات الاتصال بالخادم المسؤول عن إرسال الرسائل الرسمية للعملاء والشركات.
              </p>
            </div>
            <button
              type="button"
              onClick={handleVerifySmtp}
              disabled={verifyingSmtp}
              className="px-3.5 py-1.5 rounded-xl bg-card-2 hover:bg-muted text-foreground border border-border font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {verifyingSmtp ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5 text-emerald-600" />}
              <span>فحص اتصال SMTP الآن</span>
            </button>
          </div>

          {smtpStatusBadge && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                smtpStatusBadge.ok
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {smtpStatusBadge.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
              <span>{smtpStatusBadge.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-foreground block">مضيف خادم SMTP (Host):</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="mail.lonaliza.com أو smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">المنفذ (Port):</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value, 10))}
                  placeholder="587 أو 465"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">اسم المستخدم / البريد (Username):</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="partners@lonaliza.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">كلمة مرور SMTP (Password):</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">اسم المرسل الظاهر للعميل:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="منصة لوناليزا للسياحة B2B"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">عنوان بريد المرسل (From Email):</label>
                <input
                  type="email"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="partners@lonaliza.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="smtpSecure"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
                className="size-4 rounded text-primary cursor-pointer"
              />
              <label htmlFor="smtpSecure" className="text-foreground font-bold cursor-pointer">
                استخدام تشفير SSL/TLS المباشر (موصى به عند استخدام Port 465)
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {savingSettings ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                <span>حفظ وتطبيق إعدادات خادم SMTP</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: SENT EMAIL LOGS */}
      {activeSubTab === "logs" && (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-card-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-foreground flex items-center gap-2">
              <Clock className="size-4 text-purple-600" />
              <span>سجل الرسائل المرسلة الحقيقي ({logs.length})</span>
            </h3>
            <button
              type="button"
              onClick={fetchSettingsAndLogs}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              title="تحديث"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground space-y-2">
              <Mail className="size-8 mx-auto" />
              <p className="text-xs font-bold">لم يتم إرسال أي رسائل بريد حتى الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3 text-start">المستلم والشركة</th>
                    <th className="p-3 text-start">عنوان الرسالة</th>
                    <th className="p-3 text-start">الحالة</th>
                    <th className="p-3 text-start">تاريخ الإرسال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{String(log.toName || log.to)}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{String(log.to)}</div>
                      </td>
                      <td className="p-3 font-medium text-foreground max-w-xs truncate">
                        {String(log.subject)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {log.status === "delivered" ? "تم التسليم" : "فشل"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-[10px]">
                        {log.sentAt ? new Date(String(log.sentAt)).toLocaleString("ar-SA") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
