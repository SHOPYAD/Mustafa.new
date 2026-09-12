"use client";

import Link from "next/link";
import {
  ArrowUp,
  Globe,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

export default function LandingFooter({
  supportWhatsapp = "+905015709201",
}: {
  supportWhatsapp?: string;
}) {
  const { dir, locale } = useLocale();
  const cleanWhatsapp = supportWhatsapp.replace(/[^0-9+]/g, "");

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const loc = (ar: string, en: string, fr?: string, tr?: string) => {
    if (locale === "ar") return ar;
    if (locale === "fr") return fr || en;
    if (locale === "tr") return tr || en;
    return en;
  };

  return (
    <footer className="relative bg-white border-t border-slate-200 text-slate-700 overflow-hidden pt-16 pb-12" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <LonalizaLogo variant="footer" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              {loc(
                "منصة لوناليزا (Lonaliza) — المنظومة السياحية الذكية المتكاملة لتشغيل وإدارة الحجوزات للشركات مع ترخيص دائم مشفر، سيرفر سحابي مخصص وتسليم فوري خلال 24 ساعة.",
                "Lonaliza Platform — The enterprise tourism operating system with dedicated cloud hosting, AI automation, and permanent single-domain licensing.",
                "Plateforme Lonaliza — Le système d'exploitation touristique d'entreprise avec hébergement cloud dédié, automatisation par IA et licence permanente.",
                "Lonaliza Platformu — Özel bulut sunucu, yapay zeka otomasyonu ve kalıcı tek alan adı lisansıyla seyahat acenteleri için kurumsal turizm işletim sistemi."
              )}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-950/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-amber-300" />
                <span className="text-white font-bold">{loc("دعم واتساب المباشر", "WhatsApp Support", "Support WhatsApp", "WhatsApp Desteği")}</span>
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 transition-colors"
              >
                <span>{loc("الديمو الحي", "Live Demo", "Démo en Direct", "Canlı Demo")}</span>
              </Link>
            </div>
          </div>

          {/* Nav Col 1: Engines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {loc("محركات السفر", "Travel Engines", "Moteurs de Voyage", "Seyahat Motorları")}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#engines" className="hover:text-purple-900 transition-colors">
                  {loc("محرك الفنادق العالمي (+3M)", "Global Hotels (+3M)", "Hôtels Monde (+3M)", "Küresel Oteller (+3M)")}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-purple-900 transition-colors">
                  {loc("محرك الطيران الدولي GDS", "GDS Flights Engine", "Moteur Vols GDS", "GDS Uçuş Motoru")}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-purple-900 transition-colors">
                  {loc("الباقات والجولات السياحية", "Holiday Packages & Tours", "Forfaits & Circuits", "Tatil Paketleri & Turlar")}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-purple-900 transition-colors">
                  {loc("تأجير السيارات والترانسفير VIP", "Car Rentals & VIP Chauffeur", "Location Voitures & VIP", "Araç Kiralama & VIP Transfer")}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-purple-900 transition-colors">
                  {loc("اليخوت والتأشيرات السياحية", "Yachts & Tourist Visas", "Yachts & Visas Touristiques", "Yatlar & Turist Vizeleri")}
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Core Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {loc("المنظومة والذكاء", "Platform & AI", "Plateforme & IA", "Platform & Yapay Zeka")}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#interactive-demo" className="hover:text-purple-900 transition-colors">
                  {loc("لوحة التحكم التفاعلية الحية", "Live Interactive Dashboard", "Tableau de Bord en Direct", "Canlı Etkileşimli Panel")}
                </a>
              </li>
              <li>
                <a href="#ai-swarm" className="hover:text-purple-900 transition-colors">
                  {loc("سرب الذكاء الاصطناعي (6 وكلاء)", "AI Swarm (6 Agents)", "Essaim IA (6 Agents)", "Yapay Zeka Sürüsü (6 Ajan)")}
                </a>
              </li>
              <li>
                <a href="#builder" className="hover:text-purple-900 transition-colors">
                  {loc("المحرر البصري بالسحب والإفلات", "Visual Drag & Drop Studio", "Éditeur Visuel Studio", "Görsel Sürükle-Bırak Stüdyosu")}
                </a>
              </li>
              <li>
                <a href="#server" className="hover:text-purple-900 transition-colors">
                  {loc("سيرفر Contabo VPS المخصص", "Dedicated Contabo VPS", "Serveur VPS Contabo Dédié", "Özel Contabo VPS Sunucu")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-purple-900 transition-colors">
                  {loc("ترخيص دائم 0% عمولة", "Lifetime License (0% Fee)", "Licence à Vie (0% Frais)", "Ömür Boyu Lisans (%0 Komisyon)")}
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {loc("الأمان والترخيص", "Security & Legal", "Sécurité & Légal", "Güvenlik & Hukuk")}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
                <span>{loc("ترخيص دومين حصري مشفر", "Encrypted Domain License", "Licence Domaine Chiffrée", "Şifreli Alan Adı Lisansı")}</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Lock className="h-3.5 w-3.5 text-purple-700" />
                <span>{loc("غير قابل لإعادة البيع", "Strictly Non-Resellable", "Non Re-vendable", "Yeniden Satılamaz")}</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Server className="h-3.5 w-3.5 text-purple-700" />
                <span>{loc("سيرفر ألماني معزول 100%", "100% Isolated Server", "Serveur Isolé 100%", "%100 İzole Sunucu")}</span>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-900 transition-colors">
                  {loc("الشروط والأحكام", "Terms & Conditions", "Conditions Générales", "Şartlar ve Koşullar")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-purple-900 transition-colors">
                  {loc("سياسة الخصوصية", "Privacy Policy", "Politique de Confidentialité", "Gizlilik Politikası")}
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="hover:text-purple-900 transition-colors">
                  {loc("حماية البيانات (GDPR)", "Data Protection (GDPR)", "Protection des Données (RGPD)", "Veri Koruma (GDPR)")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            {loc(
              "جميع الحقوق محفوظة لمنصة لوناليزا (Lonaliza) © 2026 — نظام التشغيل السياحي المؤسسي. ترخيص أحادي الدومين محمي ومشفر وغير قابل لإعادة البيع.",
              "All rights reserved to Lonaliza Platform © 2026. Single-domain encrypted enterprise tourism OS. Strictly non-resellable.",
              "Tous droits réservés Plateforme Lonaliza © 2026. OS touristique d'entreprise chiffré mono-domaine. Strictement non re-vendable.",
              "Tüm hakları Lonaliza Platformu'na aittir © 2026. Tek alan adı şifreli kurumsal turizm işletim sistemi. Yeniden satılamaz."
            )}
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <span>{loc("العودة للأعلى", "Back to top", "Retour en haut", "Yukarı dön")}</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
