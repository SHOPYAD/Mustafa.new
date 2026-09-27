import Link from "next/link";
import { AlertTriangle, Lock, ShieldAlert, Sparkles } from "lucide-react";

export default function LicenseInvalidPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">النسخة غير مرخصة على هذا النطاق</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            تم إيقاف خدمات المنصة مؤقتاً لأن مفتاح الترخيص الخاص بهذه النسخة غير مقترن بهذا النطاق، أو تم إلغاؤه من الخادم الرئيسي.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs text-slate-300 text-right">
          <p className="font-semibold text-white">كيفية إعادة التفعيل:</p>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li>تأكد من إدخال مفتاح الترخيص الصحيح في لوحة الأدمن.</li>
            <li>تأكد من توجيه الدومين المسجل في حساب شركتك.</li>
            <li>للحصول على ترخيص رسمي معتمد، تواصل مع فريق المنصة.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/admin"
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
          >
            دخول لوحة التحكم لإدخال الترخيص
          </Link>
          <a
            href="https://lonaliza.com"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-slate-950 transition-colors"
          >
            شراء ترخيص رسمي من LIOTRIP
          </a>
        </div>
      </div>
    </div>
  );
}
