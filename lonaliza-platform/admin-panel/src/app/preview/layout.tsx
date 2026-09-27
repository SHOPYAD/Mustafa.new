"use client";

import { useEffect } from "react";
import { ShieldCheck, Eye, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dir, locale } = useLocale();

  // Ensure daylight theme is active for preview
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#2e1065] selection:text-amber-300 font-sans antialiased overflow-x-hidden scroll-smooth"
    >
      {/* Top Embedded Live Preview Watermark / Trust Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-purple-600 animate-ping" />
          <span className="font-bold text-slate-900">
            {locale === "ar"
              ? "معاينة حية وتصفح تفاعلي للمنظومة (وضع المشاهدة الآمن)"
              : locale === "fr"
                ? "Aperçu interactif en direct du système (Mode lecture sécurisé)"
                : locale === "tr"
                  ? "Canlı Etkileşimli Sistem Önizlemesi (Güvenli Salt Okunur Mod)"
                  : "Live Interactive System Preview (Safe Read-Only Mode)"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
          <span>
            {locale === "ar"
              ? "لوحة التحكم الحقيقية — يمكنك التمرير والتنقل بحرية"
              : locale === "fr"
                ? "Véritable tableau de bord de la plateforme — Défilement et navigation fluides"
                : locale === "tr"
                  ? "Gerçek Platform Yönetim Paneli — Kesintisiz Kaydırma ve Gezinme"
                  : "Real Platform Dashboard — Full Smooth Scroll & Navigation Enabled"}
          </span>
        </div>
      </div>

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
    </div>
  );
}
