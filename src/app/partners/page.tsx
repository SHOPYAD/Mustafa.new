"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Lock,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

export default function PartnersLoginPage() {
  const router = useRouter();
  const { dir } = useLocale();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/partners/me", { cache: "no-store" });
        const json = (await res.json()) as { ok?: boolean };
        if (json?.ok) {
          router.replace("/partners/dashboard");
          return;
        }
      } catch {
        /* proceed to login form */
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google?next=/partners/dashboard";
  };

  if (checking) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 space-y-12" dir={dir}>
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>بوابة الشركاء والوكالات السياحية المعتمدة</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1e1b4b] font-sans">
          تسجيل الدخول وإدارة{" "}
          <span className="bg-gradient-to-r from-purple-900 via-indigo-900 to-amber-600 bg-clip-text text-transparent">
            منصتك السياحية
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          سجل دخولك بحساب جوجل لشراء باقة الترخيص، نسخ مفتاح API الخاص بك، ومتابعة مراحل تجهيز سيرفرك وربط دومين شركتك لحظة بلحظة.
        </p>
      </div>

      {/* Daylight Luxury Google Login Card */}
      <div className="max-w-md mx-auto rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-purple-950/5 space-y-6 text-center">
        <div className="flex justify-center pb-2">
          <LonalizaLogo variant="large" className="h-14 sm:h-16" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">دخول سريع وآمن</h2>
          <p className="text-xs text-slate-500">
            استخدم حساب جوجل الرسمي لشركتك لتفعيل لوحة التحكم
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 hover:bg-purple-50/50 hover:border-purple-300 hover:text-purple-950 active:scale-[0.98] shadow-sm transition-all"
        >
          {/* Google Color Icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>المتابعة باستخدام Google</span>
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock className="h-3.5 w-3.5 text-purple-700" />
          <span>تشفير OAuth 2.0 آمن ومحمي بالكامل</span>
        </div>
      </div>

      {/* Feature summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-2">
          <Server className="h-5 w-5 text-purple-700 mx-auto" />
          <p className="text-xs font-bold text-slate-900">سيرفر Contabo VPS مجاناً</p>
          <p className="text-[11px] text-slate-500">مخصص لشركتك مع لوحة aaPanel</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-2">
          <ShieldCheck className="h-5 w-5 text-amber-600 mx-auto" />
          <p className="text-xs font-bold text-slate-900">ترخيص دائم مدى الحياة</p>
          <p className="text-[11px] text-slate-500">مقفل ومحمي لدومينك حصرياً</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-2">
          <Rocket className="h-5 w-5 text-indigo-700 mx-auto" />
          <p className="text-xs font-bold text-slate-900">تسليم 12–24 ساعة</p>
          <p className="text-[11px] text-slate-500">متابعة حية لتقدم كل مرحلة</p>
        </div>
      </div>
    </div>
  );
}
