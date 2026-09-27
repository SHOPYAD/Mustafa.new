"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  X,
} from "lucide-react";

type WhiteLabelOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: "whitelabel_free" | "whitelabel_paid";
};

type ProvisionResult = {
  companyId: string;
  companyName: string;
  subdomain: string;
  siteUrl: string;
  adminUrl: string;
  adminUsername: string;
  adminPassword: string;
  planType: string;
  licenseKey: string;
};

export default function WhiteLabelOnboardingModal({
  isOpen,
  onClose,
  initialPlan = "whitelabel_free",
}: WhiteLabelOnboardingModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [planType, setPlanType] = useState<"whitelabel_free" | "whitelabel_paid">(initialPlan);

  // States: 'form' | 'provisioning' | 'completed'
  const [step, setStep] = useState<"form" | "provisioning" | "completed">("form");
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStageText, setCurrentStageText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    setPlanType(initialPlan);
  }, [initialPlan]);

  if (!isOpen) return null;

  const handleStartProvisioning = async () => {
    const cleanSub = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!companyName.trim()) {
      setErrorMsg("يرجى إدخال اسم الشركة");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("يرجى إدخال بريد إلكتروني صالح");
      return;
    }
    if (!cleanSub || cleanSub.length < 3) {
      setErrorMsg("يرجى كتابة سابدومين صالح بالإنجليزية لا يقل عن 3 أحرف");
      return;
    }

    setErrorMsg("");
    setStep("provisioning");
    setProgressPercent(10);
    setCurrentStageText("جاري التحقق من النطاق وتجهيز خوادم لوناليزا...");

    // Progressive animation simulation alongside real API call
    const animInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) return prev;
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 35 && next < 60) {
          setCurrentStageText("تهيئة بيئة المستأجر وقاعدة البيانات المعزولة...");
        } else if (next >= 60 && next < 85) {
          setCurrentStageText("تطبيق قيود الباقة وتوليد شهادة الأمان SSL ومفاتيح التوزيع...");
        }
        return next;
      });
    }, 450);

    try {
      const res = await fetch("/api/partners/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          subdomain: cleanSub,
          planType,
        }),
      });
      const data = await res.json();
      clearInterval(animInterval);

      if (!res.ok || !data.ok) {
        setStep("form");
        setErrorMsg(data.error || "تعذر إنشاء المنظومة. يرجى مراجعة البيانات.");
        return;
      }

      setProgressPercent(100);
      setCurrentStageText("تم إنشاء وإطلاق موقعك بنجاح تام!");
      setResult(data);
      setTimeout(() => {
        setStep("completed");
      }, 700);
    } catch {
      clearInterval(animInterval);
      setStep("form");
      setErrorMsg("حدث خطأ في الاتصال بالخادم");
    }
  };

  const copyPassword = () => {
    if (result?.adminPassword) {
      void navigator.clipboard.writeText(result.adminPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900 shadow-2xl p-6 sm:p-8 relative text-slate-100 overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -end-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {step !== "provisioning" && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 end-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
        )}

        {/* STEP 1: FORM */}
        {step === "form" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="size-3.5" />
                <span>إطلاق فوري خلال ثوانٍ</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {planType === "whitelabel_free"
                  ? "أطلق موقعك السياحي بالعلامة البيضاء مجاناً ($0)"
                  : "اشتراك العلامة البيضاء الاحترافية الشاملة ($199/ش)"}
              </h3>
              <p className="text-xs text-slate-400">
                أدخل اسم شركتك واختر نطاقك الفرعي (Subdomain) لنقوم باستنساخ وتهيئة موقعك ولوحة تحكمك وقاعدة بياناتك المعزولة فورياً.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">اسم شركتك أو وكالتك السياحية:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: شركة الفردوس للسياحة والسفر"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني للشركة:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@yourcompany.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">رقم الهاتف / الواتساب:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                  />
                </div>
              </div>

              {/* Subdomain Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">اختر السابدومين التجريبي لموقعك:</label>
                <div className="relative flex items-center font-mono">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="alferdos"
                    className="w-full px-4 py-2.5 pe-36 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-start"
                  />
                  <span className="absolute end-4 text-xs font-bold text-amber-400 pointer-events-none">
                    .lonaliza.com
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  يمكنك لاحقاً ربط دومينك المستقل (yourcompany.com) مجاناً من لوحة التحكم.
                </p>
              </div>

              {/* Plan Choice Radios */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300">الباقة المختارة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanType("whitelabel_free")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all text-start cursor-pointer ${
                      planType === "whitelabel_free"
                        ? "border-amber-500 bg-amber-500/10 text-amber-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-extrabold text-sm">العلامة البيضاء المجانية (0$)</span>
                    <span className="text-[10px] text-slate-400">اشتراك $0 + تحديثات مجانية + وصول لأسعار الجملة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType("whitelabel_paid")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-start gap-1 transition-all text-start cursor-pointer ${
                      planType === "whitelabel_paid"
                        ? "border-purple-500 bg-purple-500/10 text-purple-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-extrabold text-sm">العلامة البيضاء الشاملة ($199/ش)</span>
                    <span className="text-[10px] text-slate-400">كافة الـ 52 ميزة مفعلة + البرامج السياحية والأسطول</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartProvisioning}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="size-4" />
              <span>إنشاء وإطلاق المنظومة وموقعي فوراً</span>
            </button>
          </div>
        )}

        {/* STEP 2: PROVISIONING ANIMATION */}
        {step === "provisioning" && (
          <div className="py-8 space-y-6 text-center animate-in fade-in duration-200">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <div className="text-xl font-black font-mono text-white">{progressPercent}%</div>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">جاري إنشاء موقع شركتك وتخصيص بيئتك المعزولة...</h4>
              <p className="text-xs text-amber-400 font-medium animate-pulse">{currentStageText}</p>
            </div>

            {/* Checklist Pipeline */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-start space-y-2.5 text-xs font-medium">
              <div className="flex items-center gap-2 text-slate-300">
                {progressPercent >= 30 ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Loader2 className="size-4 animate-spin text-amber-400" />}
                <span>حجز السابدومين وتفعيل شهادة الأمان SSL المشفرة</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {progressPercent >= 60 ? <CheckCircle2 className="size-4 text-emerald-400" /> : progressPercent >= 30 ? <Loader2 className="size-4 animate-spin text-amber-400" /> : <div className="size-4 rounded-full border border-slate-700" />}
                <span>استنساخ المنظومة وتهيئة قاعدة البيانات المعزولة (Multi-Tenant)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {progressPercent >= 85 ? <CheckCircle2 className="size-4 text-emerald-400" /> : progressPercent >= 60 ? <Loader2 className="size-4 animate-spin text-amber-400" /> : <div className="size-4 rounded-full border border-slate-700" />}
                <span>تطبيق ميزات الباقة وتفعيل موديولات لوناليزا المركزية</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                {progressPercent >= 100 ? <CheckCircle2 className="size-4 text-emerald-400" /> : progressPercent >= 85 ? <Loader2 className="size-4 animate-spin text-amber-400" /> : <div className="size-4 rounded-full border border-slate-700" />}
                <span>توليد حساب وبيانات الأدمن المشفرة للمدير</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED CELEBRATION */}
        {step === "completed" && result && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                مبروك! تم إنشاء موقعك وهو جاهز للاستخدام الآن
              </h3>
              <p className="text-xs text-slate-300">
                أصبح موقع وكالتك حياً ومستضافاً على السيرفر، مع لوحة تحكم كاملة مهيأة لك.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/15 text-start space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-slate-200">بيانات الدخول للوحة تحكم موقعك:</span>
                <span className="text-[10px] text-amber-400 font-bold">يمكنك تغييرها من اللوحة</span>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">رابط لوحة الأدمن:</span>
                  <a
                    href={result.adminUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{result.adminUrl}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">اسم المستخدم (Username):</span>
                  <span className="text-white font-bold">{result.adminUsername}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">كلمة المرور المؤقتة:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{result.adminPassword}</span>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPass ? <Check className="size-3" /> : <Copy className="size-3" />}
                      <span>{copiedPass ? "تم النسخ" : "نسخ"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Step Guidance */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-start space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                <Wallet className="size-4" />
                <span>الخطوة التالية لتفعيل ظهور نتائج البحث وإصدار التذاكر:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ادخل إلى <strong>لوحة الشركاء (Partners Portal)</strong> لرفع مبلغ الديبوزيت (2,000$ فأكثر) لتفعيل المحفظة وربط الدومين المخصص الخاص بك بمساعدة وكيل الذكاء الاصطناعي.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={result.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Globe className="size-4" />
                <span>زيارة موقعك الحي</span>
              </a>
              <a
                href="/partners/dashboard"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Wallet className="size-4" />
                <span>الدخول للوحة الشركاء لشحن الديبوزيت</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
