"use client";

import { useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  Clapperboard,
  FileText,
  Flame,
  Image as ImageIcon,
  Layers,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Play,
  Send,
  Share2,
  Sparkles,
  Users,
  Video,
  Workflow,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function AiAutomationSuite() {
  const { locale } = useLocale();
  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });

  const aiFeatures = [
    {
      id: "studio-approval",
      title: loc("الاستوديو الإبداعي ونشر تيليجرام («انشر»)", "Creative Studio & Telegram Approval", "Studio Créatif & Approbation Telegram («Publier»)", "Kreatif Stüdyo ve Telegram Onayı («Yayınla»)"),
      icon: Clapperboard,
      tag: "Autonomous Creative Flow",
      badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
      description: loc(
        "يولد الذكاء الاصطناعي خطة النشر الأسبوعية، يصمم الصور، ويمنتج فيديوهات تيك توك وريلز بـ FFmpeg تلقائياً. يرسل النظام بطاقة المعاينة إلى تيليجرام لتعتمدها بضغطة زر أو بالرد بكلمة «انشر» ليتم النشر الفوري لكافة حساباتك.",
        "AI plans weekly content, generates visuals, and renders reels via FFmpeg. Sends preview cards to Telegram for one-click approval with «Publish» keyword.",
        "L'IA planifie le contenu hebdomadaire, crée les visuels et monte les reels via FFmpeg. Une carte d'aperçu est envoyée sur Telegram pour validation d'un clic avec le mot-clé « Publier ».",
        "Yapay zeka haftalık içerik planını hazırlar, görselleri tasarlar ve FFmpeg ile dikey reels videoları kurgular. Telegram'a gönderilen önizleme kartını tek tıkla veya «Yayınla» diyerek onayladığınızda anında tüm hesaplarınızda paylaşır."
      ),
      bullets: [
        loc("توليد صور فائقة الجودة وفيديوهات عمودية للمنصات", "AI vertical reels generation with FFmpeg rendering", "Génération de reels verticaux IA avec rendu FFmpeg", "FFmpeg render desteğiyle yüksek kaliteli dikey reels üretimi"),
        loc("بوت تيليجرام تفاعلي للموافقة بكلمة «انشر»", "Telegram approval webhook bot with «Publish» trigger", "Bot webhook Telegram interactif déclenché par « Publier »", "«Yayınla» komutuyla tetiklenen interaktif Telegram onay botu"),
        loc("نشر تلقائي فوري على فيسبوك، إنستغرام، تيك توك، إكس، ويوتيوب", "Auto-distribution to Meta, TikTok, X, and YouTube", "Distribution automatique sur Meta, TikTok, X et YouTube", "Meta, TikTok, X ve YouTube'a anında otomatik dağıtım"),
      ],
    },
    {
      id: "places-marketing",
      title: loc("تكامل Google Places الرسمي للأفكار والمحتوى", "Official Google Places Content Insights", "Intégration Officielle Google Places & Idées de Contenu", "Resmi Google Places Entegrasyonu ve İçerik Fikirleri"),
      icon: MapPin,
      tag: "Official API Intelligence",
      badgeColor: "text-cyan-700 bg-cyan-50 border-cyan-200",
      description: loc(
        "استخراج مراجعات وتقييمات المنشآت السياحية والفنادق والأنشطة عبر Google Places API الرسمي، وتحويل تجارب المسافرين الحقيقية إلى منشورات ومقالات مدونة جاذبة مع احترام كامل لمعايير الخصوصية.",
        "Fetch genuine tourism spot reviews via official Google Places API to fuel engaging marketing stories and SEO blog articles.",
        "Extraction des avis et notes des lieux touristiques via l'API officielle Google Places pour créer des récits marketing captivants et des articles de blog SEO.",
        "Resmi Google Places API ile turistik mekan ve otel yorumlarını çekerek gezgin deneyimlerini yüksek etkileşimli sosyal medya paylaşımlarına ve SEO blog yazılarına dönüştürür."
      ),
      bullets: [
        loc("جلب مراجعات الأماكن السياحية باللغة العربية والعالمية", "Multilingual tourist spot review intelligence", "Extraction multilingue des avis sur les lieux touristiques", "Çok dilli turistik mekan yorum ve değerlendirme istihbaratı"),
        loc("استلهام أفكار الحملات الإعلانية من تقييمات المسافرين", "Derive high-converting ad copy from traveler feedback", "Création de textes publicitaires percutants basés sur les retours voyageurs", "Gezgin geri bildirimlerinden yüksek dönüşümlü reklam metinleri türetme"),
        loc("امتثال كامل لسياسات الخصوصية وحماية البيانات", "100% compliant with Google Maps data privacy rules", "Conformité totale aux politiques de confidentialité Google Maps", "Google Maps veri gizliliği kurallarına %100 tam uyumluluk"),
      ],
    },
    {
      id: "meta-ctwa",
      title: loc("إعلانات Meta و WhatsApp (CTWA) وجماهير Lookalike", "Meta Click-to-WhatsApp Ads & Lookalikes", "Publicités Meta Click-to-WhatsApp (CTWA) & Audiences Lookalike", "Meta Click-to-WhatsApp (CTWA) Reklamları ve Benzer Hedef Kitleler"),
      icon: Megaphone,
      tag: "High-ROI Lead Generation",
      badgeColor: "text-purple-900 bg-purple-50 border-purple-200",
      description: loc(
        "توليد حملات إعلانية مباشرة تقود العملاء إلى واتساب الشركة (Click-to-WhatsApp) واستخراج جماهير مشابهة (Lookalike) رسمياً من قاعدة عملاء المنصة كمسودات آمنة بحالة PAUSED لتعتمدها وتطلقها.",
        "Generate Click-to-WhatsApp Meta campaigns and build Lookalike audiences from PocketBase CRM customer data in safe PAUSED state.",
        "Générez des campagnes Meta Click-to-WhatsApp et créez des audiences similaires (Lookalike) à partir des données CRM en statut PAUSED sécurisé.",
        "Müşterileri doğrudan şirket WhatsApp'ına yönlendiren (Click-to-WhatsApp) reklamlar oluşturur ve CRM verilerinden benzer kitleleri güvenli PAUSED taslak modunda hazırlar."
      ),
      bullets: [
        loc("إنشاء جماهير مخصصة (Custom Audiences) من عملاء النظام", "Build high-intent custom audiences from CRM buyers", "Création d'audiences personnalisées à partir des acheteurs CRM", "CRM alıcılarından yüksek satın alma niyetli özel hedef kitleler oluşturma"),
        loc("توليد حملات واتساب تفاعلية بأسعار ونصوص جذابة", "Launch Click-to-WhatsApp campaigns for direct bookings", "Lancement de campagnes WhatsApp interactives pour réservations directes", "Doğrudan rezervasyon için ilgi çekici WhatsApp reklam kampanyaları başlatma"),
        loc("تحكم كامل في الميزانيات وتفعيل الإعلانات بضغطة زر", "Safe PAUSED draft mode with one-click budget activation", "Contrôle budgétaire total et activation des campagnes en un clic", "Bütçeler üzerinde tam kontrol ve tek tıkla reklam bütçesi aktifleştirme"),
      ],
    },
    {
      id: "itinerary-pdf",
      title: loc("توليد البرامج السياحية والبروشورات الذكية", "Gemini AI Itinerary & Luxury PDF Builder", "Générateur d'Itinéraires Gemini AI & Brochures PDF de Luxe", "Gemini AI Seyahat Programı ve Lüks PDF Oluşturucu"),
      icon: Brain,
      tag: "Smart Travel Itineraries",
      badgeColor: "text-purple-700 bg-purple-50 border-purple-200",
      description: loc(
        "مولد برامج سياحية متطور مدعوم بـ Gemini AI يصمم جداول الرحلات اليومية حسب رغبة العميل، يوزع الفنادق والجولات، ويصدر ملف PDF فاخر بشعار الشركة وعلامتها التجارية جاهزاً للطباعة والإرسال.",
        "Generate tailored day-by-day travel itineraries with Gemini AI and export branded, luxury PDF client brochures instantly.",
        "Générateur d'itinéraires sur-mesure propulsé par Gemini AI : planifie les journées, hôtels et circuits, et exporte une brochure PDF élégante avec votre logo.",
        "Gemini AI destekli gelişmiş tur oluşturucu: müşteri talebine göre günlük seyahat planını hazırlar, otel ve turları dağıtır ve şirket logonuzla şık bir PDF broşür üretir."
      ),
      bullets: [
        loc("تخطيط جدول الأيام والمزارات والوجبات والمواصلات", "Day-by-day schedule with attractions and transfers", "Planning jour par jour avec attractions, repas et transferts", "Gezilecek yerler, transferler ve öğünlerle gün be gün seyahat planı"),
        loc("تصدير ملف بروشور PDF فندقي أنيق بعلامة شركتك", "Export luxury branded PDF quotation brochures", "Exportation de brochures de devis PDF élégantes à vos couleurs", "Şirketinizin kurumsal kimliğiyle şık PDF teklif broşürü dışa aktarımı"),
        loc("مساعد مبيعات ذكي يجيب استفسارات المسافرين 24/7", "24/7 AI sales assistant closing travel inquiries", "Assistant de vente IA disponible 24/7 pour convertir les demandes", "Gezginlerin sorularını yanıtlayıp satış kapatan 7/24 akıllı satış asistanı"),
      ],
    },
  ];

  return (
    <section id="ai-suite" className="relative py-24 bg-slate-50/80 border-t border-slate-200 overflow-hidden">
      {/* Background Lighting */}
      <div className="pointer-events-none absolute top-1/2 -right-48 w-96 h-96 bg-purple-500/5 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 -left-48 w-96 h-96 bg-purple-500/5 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-700">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>
              {loc("جناح الذكاء الاصطناعي والأتمتة المستقلة", "Autonomous AI & Marketing Suite", "Suite d'Automatisation & Intelligence Artificielle", "Otonom Yapay Zeka ve Pazarlama Paketi")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {loc(
              "فريق تسويق وإنتاج محتوى آلي يعمل لخدمة شركتك على مدار الساعة",
              "An Autonomous AI Marketing Engine Working 24/7",
              "Une Équipe Marketing et de Production IA au Service de Votre Entreprise 24/7",
              "Şirketiniz İçin 7/24 Çalışan Otonom Yapay Zeka Pazarlama ve Üretim Ekibi"
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            {loc(
              "وداعاً للتكاليف الباهظة لإدارة الحملات وصناعة المحتوى؛ منصة لوناليزا تدير دمج الذكاء الاصطناعي، صناعة الفيديو، النشر الاجتماعي، وحملات واتساب المباشرة في دورة عمل مؤتمتة متكاملة.",
              "Automate social media publishing, video creation, review scraping, and Meta WhatsApp ad campaigns through one unified AI system.",
              "Fini les coûts astronomiques : la plateforme Lonaliza orchestre la production vidéo, la diffusion sur les réseaux sociaux et les campagnes WhatsApp en boucle fermée.",
              "Yüksek reklam yönetimi ve içerik maliyetlerine son: Lonaliza platformu video üretimini, sosyal medya paylaşımını ve WhatsApp reklamlarını uçtan uca otomatikleştirir."
            )}
          </p>
        </div>

        {/* 4 Feature Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {aiFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-3xl border border-slate-200/90 bg-white p-8 hover:border-purple-300 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-500/5 space-y-6"
              >
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                        {feat.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  {feat.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
