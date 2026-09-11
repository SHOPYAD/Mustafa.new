"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Smartphone } from "lucide-react";

type Settings = {
  displayName: string;
  applicationId: string;
  apiBase: string;
  primaryColor: string;
  amberColor: string;
  githubRepo: string;
};

type Build = { state: string; artifact?: string; error?: string };

const inputClass =
  "w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm";

export default function AdminMobileAppPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [build, setBuild] = useState<Build>({ state: "idle" });
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState(false);
  const [message, setMessage] = useState("");

  const reload = () => {
    void fetch("/api/admin/mobile-app", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setForm(data.settings);
        if (data.build) setBuild(data.build);
      });
  };

  useEffect(() => {
    reload();
    const timer = window.setInterval(reload, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/mobile-app", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.settings) setForm(data.settings);
    setMessage("تم الحفظ. الألوان والاسم تُطبَّق على البناء التالي.");
    setSaving(false);
  };

  const queueBuild = async () => {
    setBuilding(true);
    setMessage("");
    const res = await fetch("/api/admin/mobile-app/build", {
      method: "POST",
      credentials: "same-origin",
    });
    const data = await res.json();
    if (data.build) setBuild(data.build);
    setMessage(
      res.ok
        ? "بدأ بناء Android على هذا السيرفر. iOS يحتاج جهاز Mac."
        : data.error || "تعذر بدء البناء"
    );
    setBuilding(false);
  };

  if (!form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/60">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-white">
      <header className="flex items-center gap-3">
        <Smartphone className="text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold">استوديو تطبيق الجوال</h1>
          <p className="text-sm text-white/50">
            التعديل هنا يغيّر هوية البناء. واجهة العميل في مجلد Lonalizamobilapp، وواجهات
            البرمجة في /api/mobile/v1.
          </p>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <label className="block text-xs text-white/40">اسم التطبيق</label>
        <input className={inputClass} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        <label className="block text-xs text-white/40">معرّف أندرويد</label>
        <input className={inputClass} value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} />
        <label className="block text-xs text-white/40">أصل واجهة الموبايل (https فقط)</label>
        <input className={inputClass} value={form.apiBase} onChange={(e) => setForm({ ...form, apiBase: e.target.value })} />
        <label className="block text-xs text-white/40">GitHub (CI فقط، ليس المتجر)</label>
        <input className={inputClass} value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            <Save size={16} />
            حفظ الهوية
          </button>
          <button
            type="button"
            onClick={() => void queueBuild()}
            disabled={building || build.state === "running"}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm"
          >
            بناء APK على هذا السيرفر
          </button>
        </div>
        {message ? <p className="text-sm text-amber-200">{message}</p> : null}
        <p className="text-xs text-white/40">
          الحالة: {build.state}
          {build.artifact ? ` — ${build.artifact}` : ""}
          {build.error ? ` — ${build.error}` : ""}
        </p>
        <p className="text-xs text-white/35">
          مفاتيح iyzico ومتاجر التطبيقات لا تُكتب داخل التطبيق. أول رفع للمتجر يدوي بعد توقيع
          نسخة فيها مسار الرحلات والدفع.
        </p>
      </section>
    </div>
  );
}
