"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Plane,
  Hotel,
  Car,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  Server,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Coins,
  ExternalLink,
  Users,
  Compass,
  Award,
  Crown,
  HeartHandshake,
  Check,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBrandName } from "@/components/branding/BrandingProvider";
import { CustomPageView } from "@/components/pages/CustomPageView";

export default function AboutPage() {
  const { locale, t } = useLocale();
  const brand = useBrandName(locale);
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [hasCustomCmsPage, setHasCustomCmsPage] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if a customized page exists in the CMS
    void fetch("/api/pages/about", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        // If an admin customized the page and added custom sections beyond the default
        if (data?.ok && data.page && data.page.sections?.length > 3) {
          setHasCustomCmsPage(true);
        } else {
          setHasCustomCmsPage(false);
        }
      })
      .catch(() => setHasCustomCmsPage(false));
  }, []);

  if (hasCustomCmsPage) {
    return <CustomPageView slug="about" />;
  }

  // Multilingual copy
  const c = {
    badge: isAr
      ? "المنظومة السحابية المتكاملة لتقنية السياحة والسفر"
      : isTr
        ? "Entegre Bulut Seyahat ve Turizm Teknolojisi Ekosistemi"
        : isFr
          ? "L'Écosystème Cloud Intégré du Voyage & du Tourisme"
          : "The Unified Cloud Travel & Tourism Technology Ecosystem",
    heroTitle: isAr
      ? `عن ${brand} — ريادة التقنية السحابية وتمكين صناعة السفر`
      : isTr
        ? `${brand} Hakkında — Bulut Teknolojisi ve Seyahat Sektörünün Gücü`
        : isFr
          ? `À propos de ${brand} — Leader Tech Cloud & Avenir du Voyage`
          : `About ${brand} — Pioneering Cloud Travel Tech & Global Agency Growth`,
    heroDesc: isAr
      ? "نحن نجمع بين تقديم تجربة حجز عصرية وسلسة للمسافرين حول العالم، وبين تمكين شركات ووكالات السياحة والرياديين من إطلاق منصاتهم الرقمية المستقلة بهويتهم الخاصة خلال 24 ساعة عبر حلول الوايت ليبل وبنوك الأسرة وشبكات GDS العالمية."
      : isTr
        ? "Dünya çapındaki gezginlere modern ve kesintisiz rezervasyon deneyimi sunarken, turizm acentelerine 24 saatte kendi markalarıyla dijital seyahat platformlarını başlatma gücü veriyoruz."
        : isFr
          ? "Nous combinons une expérience de réservation fluide pour les voyageurs et permettons aux agences de lancer leur plateforme en marque blanche en 24h avec accès direct aux GDS mondiaux."
          : "We bridge consumer travel convenience with turn-key enterprise capability, enabling travel agencies worldwide to launch branded digital travel portals in 24 hours with live GDS and global bedbank feeds.",

    stats: [
      {
        num: "24h",
        label: isAr ? "إطلاق المنصة للشركات" : isTr ? "Acente Kurulum Süresi" : isFr ? "Déploiement agence" : "Turnkey Deployment",
        desc: isAr ? "جاهزة للعمل بهويتك الخاصة" : isTr ? "Kendi markanızla hazır" : isFr ? "Clé en main" : "Ready under your brand",
      },
      {
        num: "+3,000,000",
        label: isAr ? "فندق ومنتجع عالمي" : isTr ? "Otel ve Tesis" : isFr ? "Hôtels & complexes" : "Hotels & Global Resorts",
        desc: isAr ? "عبر Hotelbeds و RateHawk" : isTr ? "Hotelbeds ve RateHawk ile" : isFr ? "Via Hotelbeds & RateHawk" : "Via Hotelbeds & RateHawk",
      },
      {
        num: "+500",
        label: isAr ? "شركة طيران عالمية" : isTr ? "Havayolu Şirketi" : isFr ? "Compagnies aériennes" : "Global GDS Airlines",
        desc: isAr ? "Travelport و PKFARE و Seeru" : isTr ? "Travelport, PKFARE ve Seeru" : isFr ? "Travelport, PKFARE & Seeru" : "Travelport, PKFARE & Seeru",
      },
      {
        num: "100%",
        label: isAr ? "عزل وأمان البيانات" : isTr ? "Veri Gizliliği ve Güvenlik" : isFr ? "Isolation des données" : "Private Server Isolation",
        desc: isAr ? "سيرفر مستقل ولوحة aaPanel" : isTr ? "aaPanel bağımsız sunucu" : isFr ? "Serveur dédié aaPanel" : "Dedicated server with aaPanel",
      },
    ],

    story: {
      tag: isAr ? "قصتنا ورؤيتنا" : isTr ? "Hikayemiz ve Vizyonumuz" : isFr ? "Notre Histoire & Vision" : "Our Story & Vision",
      title: isAr
        ? "إعادة صياغة صناعة السفر والسياحة الرقمية"
        : isTr
          ? "Dijital Seyahat Endüstrisini Yeniden Şekillendiriyoruz"
          : isFr
            ? "Repenser l'industrie du voyage digitalisé"
            : "Reshaping Digital Travel and Tourism Infrastructure",
      p1: isAr
        ? "ولدت لوناليزا استجابةً لحاجة ملحة في قطاع السياحة العالمي: الحاجة إلى منصة حديثة وموثوقة تجمع أرقى معايير التقنية السحابية مع السهولة الفائقة. في السابق، كانت مكاتب السفر والرياديين يواجهون عوائق هائلة لإطلاق مواقعهم؛ حيث يتطلب الأمر شهوراً من البرمجة وتكاليف تفوق عشرات الآلاف من الدولارات واشتراكات شهرية باهظة."
        : isTr
          ? "Lonaliza, küresel turizm sektöründeki hayati bir ihtiyaca yanıt olarak doğdu: Gelişmiş bulut teknolojisini kullanım kolaylığı ile birleştiren güvenilir bir platform. Geçmişte acenteler kendi sitelerini açmak için aylarca süren kodlama ve yüksek maliyetlerle karşılaşıyordu."
          : isFr
            ? "Lonaliza est née pour répondre à un besoin crucial : offrir une technologie cloud de pointe sans complexité. Autrefois, créer une agence en ligne prenait des mois et coûtait des dizaines de milliers d'euros."
            : "Lonaliza was born in response to a critical gap in the travel industry: the need for a modern, turnkey cloud architecture that merges enterprise-grade GDS sourcing with extreme ease of use. Traditionally, launching an online travel agency took months of bespoke programming and tens of thousands of dollars in licensing.",
      p2: isAr
        ? "لقد قمنا بتطوير بنية سحابية متكاملة تتصل مباشرة بأكبر شبكات التوزيع العالمية (Travelport, PKFARE, Seeru) وبنوك الأسرة العالمية (Hotelbeds, RateHawk)، بالإضافة إلى أسطول النقل والترانسفير وبوابات الدفع البنكي وسرب الذكاء الاصطناعي للمبيعات والواتساب، مما يمكّن أي شركة من الانطلاق في غضون 24 ساعة فقط."
        : isTr
          ? "Doğrudan Travelport, PKFARE, Seeru gibi küresel GDS ağlarına ve Hotelbeds, RateHawk gibi yatak bankalarına bağlanan, ödeme geçitleri ve yapay zeka satış araçlarıyla donatılmış entegre bir altyapı inşa ettik."
          : isFr
            ? "Nous avons développé une infrastructure intégrée connectée directement aux GDS mondiaux (Travelport, PKFARE, Seeru) et aux grandes banques de lits (Hotelbeds, RateHawk), intégrant paiements et IA de vente autonome."
            : "We developed a battle-tested cloud ecosystem connected directly to leading GDS networks (Travelport, PKFARE, Seeru), global bedbanks (Hotelbeds, RateHawk), VIP transfer dispatch systems, certified banking processors, and an autonomous AI sales suite.",
    },

    pillars: [
      {
        icon: Globe,
        title: isAr ? "ربط توريد حي ومباشر" : isTr ? "Canlı Doğrudan Tedarik" : isFr ? "Approvisionnement Direct" : "Live GDS & Bedbank Sourcing",
        desc: isAr
          ? "اتصال لحظي بـ Travelport و Hotelbeds و RateHawk و PKFARE لضمان أفضل الأسعار والتأكيد الإلكتروني الفوري."
          : "Direct live integration with Travelport, Hotelbeds, RateHawk, and PKFARE ensuring competitive rates and instant confirmation.",
      },
      {
        icon: Car,
        title: isAr ? "نظام الترانسفير والأساطيل السياحية المتقدم" : isTr ? "Gelişmiş Transfer ve VIP Filo Sistemi" : isFr ? "Système de Transfert & Flotte Avancé" : "Advanced Fleet & Transfer Engine",
        desc: isAr
          ? "تمكين الشركات من بناء شبكة ترانسفير عملاقة تتيح لشركات النقل وسائقي الـ VIP التسجيل بسياراتهم عبر تطبيق Flutter وإدارة مساراتهم، مع توجيه الحجوزات تلقائياً واقتطاع عمولة المنصة آلياً."
          : "Enables travel agencies to build scalable multi-vendor transfer networks where fleet owners register vehicles via Flutter apps, with automated dispatch and zero-delay commission escrow.",
      },
      {
        icon: Sparkles,
        title: isAr ? "استوديو المحتوى، SEO، والمحرر البصري" : isTr ? "Görsel Sayfa Düzenleyici ve Yapay Zeka İçerik Stüdyosu" : isFr ? "Éditeur Visuel & Studio de Contenu SEO" : "Visual CMS & AI SEO Content Studio",
        desc: isAr
          ? "محرر بصري تفاعلي لتصميم الصفحات وتعديلها بسهولة فائقة، مع أدوات ذكاء اصطناعي لتوليد المقالات السياحية وفيديوهات التسويق بدقة وتحسين محركات البحث بـ 4 لغات."
          : "Interactive drag-and-drop visual page builder paired with automated AI travel blog generation and multi-language SEO optimization across 4 languages.",
      },
      {
        icon: Coins,
        title: isAr ? "محفظة B2B ودفع بنكي ثلاثي الأبعاد" : isTr ? "B2B Cüzdan ve 3D Güvenli Ödeme" : isFr ? "Portefeuille B2B & 3D Secure" : "B2B Wallet & 3D Secure Vault",
        desc: isAr
          ? "محفظة رقمية للخصم اللحظي عند الحجز، مع بوابات دفع بنكية معتمدة (iyzico و Stripe) بدون مخاطر مالية."
          : "Pre-funded digital wallet with instant auto-deduction, integrated with iyzico and Stripe with 3D Secure protection.",
      },
      {
        icon: ShieldCheck,
        title: isAr ? "استقلالية وأمان تام 100%" : isTr ? "%100 Bağımsızlık ve Veri İzolasyonu" : isFr ? "Sécurité & Contrôle Total" : "100% Data & Brand Autonomy",
        desc: isAr
          ? "موقعك وتطبيقك يعملان بهويتك وشعارك ودومينك الخاص مع سيرفر سحابي مستقل وعزل تام لبيانات العملاء."
          : "Operates 100% under your agency's domain and brand on dedicated cloud server infrastructure with zero data sharing.",
      },
    ],

    whitelabelIntro: {
      tag: isAr ? "نماذج العمل والشراكة" : isTr ? "Ortaklık Modelleri" : isFr ? "Modèles de Partenariat" : "Partnership Models",
      title: isAr ? "اختر النموذج الأنسب لطموح شركتك" : isTr ? "Şirketinizin Hedeflerine Uygun Modeli Seçin" : isFr ? "Choisissez le modèle adapté à vos ambitions" : "Tailored Business Models for Agencies of All Sizes",
      desc: isAr
        ? "سواء كنت ترغب في بدء أعمالك فورياً دون أي التزامات شهرية عبر باقتنا المجانية، أو التوسع بأدوات الذكاء الاصطناعي، أو التملك الكامل لمنصتك."
        : "Whether you want to launch instantly with zero recurring fees via our Free White Label, scale with Pro AI marketing, or fully own your dedicated platform.",
    },

    cta: {
      title: isAr ? "هل أنت جاهز لنقل أعمالك السياحية إلى المستقبل؟" : isTr ? "Turizm İşinizi Geleceğe Taşımaya Hazır mısınız?" : isFr ? "Prêt à propulser votre agence vers le futur ?" : "Ready to Take Your Travel Business into the Future?",
      desc: isAr
        ? "تواصل معنا اليوم لحجز جلسة استشارية وعرض توضيحي مباشر لمنصة لوناليزا."
        : isTr
          ? "Lonaliza platformunun canlı demosunu incelemek ve danışmanlık almak için bizimle iletişime geçin."
          : isFr
            ? "Contactez-nous dès aujourd'hui pour réserver une démonstration en direct de la plateforme."
            : "Contact us today to book a live demonstration of the Lonaliza platform.",
      b2bBtn: isAr ? "استكشف بوابة الشركاء B2B" : isTr ? "B2B Ortaklık Paneli" : isFr ? "Explorer le Portail B2B" : "Explore B2B Partner Portal",
      contactBtn: isAr ? "تواصل مع فريق الدعم" : isTr ? "İletişime Geçin" : isFr ? "Contactez-nous" : "Contact Our Team",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section - Seamlessly connected to header with zero white gap */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120328] via-[#240B4F] to-[#3B1278] px-4 pt-28 sm:pt-36 pb-20 text-white sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-1.5 text-xs font-black text-amber-300 border border-amber-300/30 backdrop-blur-md">
            <Sparkles size={14} />
            <span>{c.badge}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            {c.heroTitle}
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-purple-100/90 sm:text-lg">
            {c.heroDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/partners/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 text-sm font-black text-[#2E1065] shadow-xl transition-all hover:scale-105 active:scale-95 hover:bg-amber-300"
            >
              <span>{c.cta.b2bBtn}</span>
              <ArrowIcon size={16} />
            </Link>
            <Link
              href="/flights"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <span>{isAr ? "معاينة محرك الحجز الحي" : "Live Booking Engines"}</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {/* Glow Effects */}
        <div className="pointer-events-none absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      </section>

      {/* KPI Stats Bar */}
      <section className="relative z-20 -mt-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:grid-cols-4">
          {c.stats.map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="font-mono text-3xl font-black text-[#2E1065] sm:text-4xl">{s.num}</p>
              <p className="text-xs font-black text-slate-800 sm:text-sm">{s.label}</p>
              <p className="text-[11px] text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Vision Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-[#7C3AED]">
              {c.story.tag}
            </span>
            <h2 className="text-2xl font-black text-[#2E1065] sm:text-4xl leading-tight">
              {c.story.title}
            </h2>
            <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <p>{c.story.p1}</p>
              <p>{c.story.p2}</p>
            </div>
          </div>

          {/* Graphical Card */}
          <div className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-[#2E1065] to-[#4C1D95] p-8 text-white shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-[#2E1065]">
                  <Compass size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{isAr ? "معايير الجيل القادم" : "Next-Gen Travel Standards"}</h3>
                  <p className="text-xs text-purple-200">{isAr ? "سرعة، عزل، واستقلالية" : "Speed, Isolation & Autonomy"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                  <span className="text-xs font-bold">{isAr ? "ربط فوري بـ Travelport GDS و PKFARE و Seeru" : "Live Travelport GDS, PKFARE & Seeru feeds"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                  <span className="text-xs font-bold">{isAr ? "أكبر بنوك الغرف الفندقية Hotelbeds و RateHawk" : "Major Bedbanks: Hotelbeds & RateHawk"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                  <span className="text-xs font-bold">{isAr ? "نظام الترانسفير الداخلي وشبكة الأساطيل المتعددة والتوجيه التلقائي" : "Enterprise Multi-Vendor Fleet & Automated Dispatch"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                  <span className="text-xs font-bold">{isAr ? "أتمتة الواتساب لخدمة العملاء بدون رسوم ميتا" : "Native WhatsApp customer support without Meta fees"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="bg-white py-20 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              {isAr ? "ركائز القوة التقنية" : "Core Technical Pillars"}
            </span>
            <h2 className="text-2xl font-black text-[#2E1065] sm:text-3xl">
              {isAr ? "لماذا يثق بنا رواد السفر والشركات العالمية؟" : "Why Industry Leaders Trust Lonaliza"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-100 bg-[#FAF8FE] p-6 space-y-3 transition-all hover:border-purple-200 hover:shadow-md"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E1065] text-amber-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-black text-[#2E1065]">{p.title}</h3>
                  <p className="text-xs leading-6 text-slate-600">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* White Label Models Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-[#7C3AED]">
            {c.whitelabelIntro.tag}
          </span>
          <h2 className="text-2xl font-black text-[#2E1065] sm:text-3xl">
            {c.whitelabelIntro.title}
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            {c.whitelabelIntro.desc}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-800">
                {isAr ? "انطلاقة سريعة بدون مخاطرة" : "Zero Risk Start"}
              </span>
              <h3 className="text-lg font-black text-[#2E1065]">{isAr ? "الوايت ليبل المجاني" : "Free White Label"}</h3>
              <p className="font-mono text-xl font-bold text-emerald-600">{isAr ? "0$ شهرياً" : "$0 / mo"}</p>
              <p className="text-xs leading-5 text-slate-500">
                {isAr
                  ? "ابدأ بيع الطيران والفنادق والترانسفير فورياً بدون أي اشتراك شهري مع محفظة B2B وواتساب مدمج."
                  : "Launch flights, hotels, and transfers immediately with zero monthly fees, B2B wallet, and WhatsApp."}
              </p>
            </div>
            <Link
              href="/partners/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-black text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <span>{isAr ? "تفاصيل الباقة" : "Explore Plan"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-amber-400 bg-white p-6 shadow-lg space-y-4 flex flex-col justify-between relative">
            <div className="space-y-3">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black text-[#2E1065]">
                {isAr ? "الأكثر طلباً للنمو" : "Most Popular"}
              </span>
              <h3 className="text-lg font-black text-[#2E1065]">{isAr ? "الوايت ليبل الاحترافي" : "Pro Monthly White Label"}</h3>
              <p className="font-mono text-xl font-bold text-amber-600">{isAr ? "اشتراك شهري مرن" : "Flexible Monthly"}</p>
              <p className="text-xs leading-5 text-slate-500">
                {isAr
                  ? "يفتح لك كامل المخزون الداخلي للباقات والجولات السياحية الخاصة، وسرب الذكاء الاصطناعي واستوديو 4K."
                  : "Unlocks full private inventory for packages and tours, plus 6-agent AI swarm and 4K reels studio."}
              </p>
            </div>
            <Link
              href="/partners/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#2E1065] py-3 text-xs font-black text-amber-300 shadow hover:bg-[#3B1582] transition-colors"
            >
              <span>{isAr ? "ابدأ الآن" : "Get Started"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>

          <div className="rounded-3xl border border-purple-300 bg-gradient-to-br from-[#1E0842] to-[#2E1065] p-6 text-white shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-300/30">
                {isAr ? "أعلى قيمة استثمارية" : "Lifetime Value"}
              </span>
              <h3 className="text-lg font-black text-white">{isAr ? "امتلاك المنصة مدى الحياة" : "Lifetime Ownership"}</h3>
              <p className="font-mono text-xl font-bold text-amber-400">{isAr ? "امتلاك كامل لمرة واحدة" : "One-Time Lifetime"}</p>
              <p className="text-xs leading-5 text-purple-200">
                {isAr
                  ? "سيرفر سحابي مستقل خاص بك مع لوحة تحكم aaPanel وعزل تام 100% دون عمولات شهرية نهائياً."
                  : "Dedicated cloud server with aaPanel, complete data isolation, and zero recurring booking cuts."}
              </p>
            </div>
            <Link
              href="/partners/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-xs font-black text-[#2E1065] shadow hover:bg-amber-300 transition-colors"
            >
              <span>{isAr ? "امتلاك المنصة" : "Own Platform"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#2E1065] via-[#4C1D95] to-[#2E1065] p-8 text-center text-white shadow-2xl sm:p-12 space-y-6">
          <h2 className="text-2xl font-black sm:text-3xl text-white">
            {c.cta.title}
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-purple-200 sm:text-sm">
            {c.cta.desc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/partners/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-xs font-black text-[#2E1065] shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <span>{c.cta.b2bBtn}</span>
              <ArrowIcon size={14} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-8 py-4 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span>{c.cta.contactBtn}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
