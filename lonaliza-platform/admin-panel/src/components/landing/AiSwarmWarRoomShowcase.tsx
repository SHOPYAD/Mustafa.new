"use client";

import { useState } from "react";
import {
  Bot,
  Brain,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  Compass,
  Cpu,
  Crown,
  FileText,
  Globe,
  MessageSquare,
  Play,
  RotateCw,
  Send,
  Shield,
  Sparkles,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

type AgentId = "copilot" | "sales" | "seo" | "fleet" | "social" | "recovery";

export default function AiSwarmWarRoomShowcase() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("copilot");
  const [activeSimulationPrompt, setActiveSimulationPrompt] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const agents: Array<{
    id: AgentId;
    name: string;
    title: string;
    badge: string;
    icon: typeof Crown;
    colorClass: string;
    description: string;
    kpi: string;
    prompts: Array<{
      input: string;
      response: string;
      actionTag: string;
    }>;
  }> = [
    {
      id: "copilot",
      name: pickLocaleText(locale, {
        ar: "المشرف العام (Executive Co-Pilot)",
        en: "Executive Co-Pilot",
        fr: "Superviseur Général (Executive Co-Pilot)",
        tr: "Genel Danışman (Executive Co-Pilot)",
      }),
      title: pickLocaleText(locale, {
        ar: "العقل المدبر وإدارة المنظومة المركزية",
        en: "Central Intelligence Coordinator",
        fr: "Cerveau Central et Coordination du Système",
        tr: "Merkezi Zeka ve Operasyon Koordinatörü",
      }),
      badge: pickLocaleText(locale, {
        ar: "الوكيل الرئيسي",
        en: "Chief Swarm Agent",
        fr: "Agent Principal",
        tr: "Baş Yapay Zeka Ajanı",
      }),
      icon: Crown,
      colorClass: "from-amber-500 to-yellow-600",
      description: pickLocaleText(locale, {
        ar: "يراقب العمليات على مدار 24 ساعة، ينسق بين الوكلاء الآخرين، ويقترح قرارات لزيادة المبيعات بنقرة واحدة عبر تيليجرام.",
        en: "Coordinates operations 24/7, syncs agent outputs, and prepares one-click execution decisions via Telegram.",
        fr: "Surveille les opérations 24/7, synchronise les agents et prépare les décisions d'exécution en 1 clic via Telegram.",
        tr: "Operasyonları 7/24 izler, ajan çıktılarını senkronize eder ve Telegram üzerinden tek tıkla onaylanan kararlar üretir.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "مراقبة حية 24/7 لأكثر من 140 حجز يومي",
        en: "24/7 monitoring of 140+ daily bookings",
        fr: "Surveillance en direct 24/7 de 140+ réservations par jour",
        tr: "Günlük 140+ rezervasyonun 7/24 canlı takibi",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "حلل أداء المبيعات اليوم وقدم توصية فورية لزيادة هوامش الأرباح",
            en: "Analyze sales performance today and recommend margin enhancements",
            fr: "Analysez les ventes du jour et recommandez une hausse de marge",
            tr: "Bugünkü satış performansını analiz edin ve kâr marjını artırma önerisi sunun",
          }),
          response: pickLocaleText(locale, {
            ar: "تم رصد زيادة في عمليات البحث عن رحلات إسطنبول-أنطاليا بنسبة 35%. التوصية: تفعيل باقة صيفية متكاملة تتضمن ترانسفير فيتو مجاني لمن يودع حجزه خلال 6 ساعات.",
            en: "35% surge detected for Istanbul-Antalya. Recommendation: activate summer bundle with free VIP transfer for bookings made within 6h.",
            fr: "Hausse de 35% sur Istanbul-Antalya. Recommandation : activer le pack été avec transfert VIP offert sous 6h.",
            tr: "İstanbul-Antalya rotasında %35 arama artışı tespit edildi. Öneri: 6 saat içinde rezervasyon yapanlara ücretsiz VIP Vito transferi içeren yaz paketi.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تم الإرسال لتيليجرام المشرف بنقرة اعتماد",
            en: "Telegram card dispatched with one-click approval",
            fr: "Carte Telegram envoyée avec approbation en 1 clic",
            tr: "Tek tıkla onay için yönetici Telegram'ına gönderildi",
          }),
        },
        {
          input: pickLocaleText(locale, {
            ar: "ما هو حجم السيولة النقدية المحصلة اليوم عبر بوابة الدفع؟",
            en: "What is today's net cash collected via payment gateways?",
            fr: "Quel est le montant net collecté aujourd'hui via les passerelles ?",
            tr: "Bugün ödeme ağ geçitleri üzerinden toplanan net nakit akışı nedir?",
          }),
          response: pickLocaleText(locale, {
            ar: "إجمالي التحصيل اليومي حتى الآن: $14,290.00 تم إيداعها مباشرة في حساب الشركة بدون أي عمولات وسيطة.",
            en: "Today's net collections: $14,290.00 deposited directly into company merchant account with 0% middle-man cut.",
            fr: "Total collecté aujourd'hui : 14 290,00 $ déposés sur le compte de l'agence avec 0% de commission intermédiaire.",
            tr: "Bugünkü net tahsilat: 14.290,00 $ doğrudan şirket hesabınıza aktarıldı, %0 aracı komisyonu.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تقرير مالي فوري موثق",
            en: "Verified financial log generated",
            fr: "Rapport financier instantané généré",
            tr: "Doğrulanmış anlık finansal rapor oluşturuldu",
          }),
        },
      ],
    },
    {
      id: "sales",
      name: pickLocaleText(locale, {
        ar: "مدير المبيعات والتسعير (Sales Director)",
        en: "Sales & Pricing Director",
        fr: "Directeur Ventes & Tarification",
        tr: "Satış ve Fiyatlandırma Direktörü",
      }),
      title: pickLocaleText(locale, {
        ar: "التسعير الذكي واقتناص أفضل الصفقات",
        en: "Dynamic Margin & Smart Pricing",
        fr: "Tarification Intelligente & Meilleures Marges",
        tr: "Akıllı Fiyatlandırma ve Dinamik Marj",
      }),
      badge: pickLocaleText(locale, {
        ar: "ذكاء التسعير",
        en: "Yield Intelligence",
        fr: "Intelligence des Rendements",
        tr: "Gelir Yönetimi",
      }),
      icon: TrendingUp,
      colorClass: "from-[#2e1065] to-[#b18a52]",
      description: pickLocaleText(locale, {
        ar: "يراقب أسعار الطيران والفنادق عالمياً ويضبط هوامش الربح الديناميكية ويقدم عروض أسعار فورية للعملاء المهتمين.",
        en: "Monitors global GDS flight and hotel rates, adjusting dynamic agency markup per route and hotel tier.",
        fr: "Surveille les tarifs mondiaux GDS vols et hôtels, ajustant la marge dynamique de l'agence.",
        tr: "Global GDS uçuş ve otel fiyatlarını izler, rota ve otel sınıfına göre dinamik acente kârını ayarlar.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "ضبط أسعار ديناميكي لـ 500,000+ فندق",
        en: "Dynamic pricing across 500k+ hotels",
        fr: "Tarification dynamique sur 500 000+ hôtels",
        tr: "500.000+ otelde dinamik fiyatlandırma",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "احسب أفضل سعر منافس لتذكرة طيران من دبي إلى إسطنبول مع هامش ربح 12%",
            en: "Quote best competitive fare Dubai - Istanbul with 12% agency markup",
            fr: "Calculez le tarif le plus compétitif Dubaï - Istanbul avec 12% de marge",
            tr: "Dubai - İstanbul uçuşu için %12 acente kâr marjıyla en rekabetçi fiyatı hesaplayın",
          }),
          response: pickLocaleText(locale, {
            ar: "سعر الشراء من المزود GDS: $380. سعر البيع المقترح بهامش 12%: $425.60. ربح الوكالة الصافي: $45.60 للتذكرة الواحدة مع توفير $30 عن سعر طيران الإمارات المباشر.",
            en: "Supplier GDS fare: $380. 12% markup selling price: $425.60. Agency net profit: $45.60 per seat while remaining $30 cheaper than direct carrier.",
            fr: "Tarif fournisseur GDS : 380 $. Prix de vente à 12% : 425,60 $. Profit net agence : 45,60 $ par billet, 30 $ moins cher que le vol direct.",
            tr: "GDS tedarikçi fiyatı: 380 $. %12 marjla satış fiyatı: 425,60 $. Bilet başı acente net kârı: 45,60 $, doğrudan havayolundan 30 $ daha ucuz.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تحديث هوامش الربح التلقائي",
            en: "Dynamic markup saved",
            fr: "Marge dynamique mise à jour",
            tr: "Dinamik marj güncellendi",
          }),
        },
      ],
    },
    {
      id: "seo",
      name: pickLocaleText(locale, {
        ar: "استراتيجي المحتوى والسيو (SEO Master)",
        en: "SEO & Editorial Master",
        fr: "Expert SEO & Rédactionnel",
        tr: "SEO ve İçerik Stratejisti",
      }),
      title: pickLocaleText(locale, {
        ar: "تصدر نتائج محركات البحث بمقالات 5000 كلمة",
        en: "Long-Form 5,000-Word Google Dominance",
        fr: "Domination Google avec Articles de 5 000 Mots",
        tr: "5.000 Kelimelik Rehberlerle Google Liderliği",
      }),
      badge: pickLocaleText(locale, {
        ar: "صحافة السفر",
        en: "Travel Journalism",
        fr: "Journalisme Touristique",
        tr: "Seyahat Gazeteciliği",
      }),
      icon: FileText,
      colorClass: "from-blue-500 to-cyan-600",
      description: pickLocaleText(locale, {
        ar: "يولد أدلة سياحية مرجعية كبرى تفوق 30,000 حرف مدعمة بنماذج الذكاء مع دمج بطاقات الحجز وجداول المقارنة وسكيما جوجل تلقائياً.",
        en: "Generates comprehensive 5,000-word travel masterclass guides with embedded booking widgets and Google Schema markup.",
        fr: "Génère des guides touristiques de référence de 5 000 mots avec widgets de réservation intégrés et balises Google Schema.",
        tr: "Rezervasyon widget'ları ve Google Schema uyumlu 5.000 kelimelik kapsamlı seyahat rehberleri üretir.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "+250,000 زيارة مجانية من جوجل سنوياً",
        en: "+250k annual organic Google visits",
        fr: "+250 000 visites organiques Google par an",
        tr: "Google'dan yılda +250.000 organik ücretsiz ziyaretçi",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "اكتب مقالاً مرجعياً شاملاً عن أفضل فنادق البوسفور الفاخرة مع روابط الحجز",
            en: "Compose a 5,000-word definitive guide to luxury Bosphorus hotels with booking cards",
            fr: "Rédigez un guide de référence de 5 000 mots sur les hôtels de luxe du Bosphore",
            tr: "Boğaz'ın en lüks otelleri hakkında rezervasyon bağlantılı 5.000 kelimelik rehber yazın",
          }),
          response: pickLocaleText(locale, {
            ar: "تم إنشاء مقال بطول 5,200 كلمة يتضمن Ciragan Palace و Mandarin Oriental مع بطاقات الحجز المباشر وجدول مقارنة الأسعار ومخطط الأسئلة الشائعة FAQ Schema.",
            en: "5,200-word authoritative guide drafted featuring direct booking cards, price comparison matrix, and validated FAQ schema.",
            fr: "Guide faisant autorité de 5 200 mots rédigé avec fiches de réservation, tableau comparatif des prix et schéma FAQ validé.",
            tr: "Çırağan Sarayı ve Mandarin Oriental'i içeren 5.200 kelimelik rehber, rezervasyon kartları ve FAQ Schema ile oluşturuldu.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تم النشر التلقائي في المدونة والسيو",
            en: "Published to Blog & Google Index",
            fr: "Publié sur le blog et indexé par Google",
            tr: "Blog ve Google İndeksine otomatik yayınlandı",
          }),
        },
      ],
    },
    {
      id: "fleet",
      name: pickLocaleText(locale, {
        ar: "مدير أسطول VIP واللوجستيات (Fleet Director)",
        en: "VIP Fleet & Logistics Director",
        fr: "Directeur Flotte VIP & Logistique",
        tr: "VIP Filo ve Lojistik Direktörü",
      }),
      title: pickLocaleText(locale, {
        ar: "تنسيق سيارات المايباخ والفيتو والترانسفير",
        en: "VIP Airport Chauffeur Dispatch",
        fr: "Coordination des Chauffeurs & Transferts VIP",
        tr: "VIP Havalimanı Şoför ve Transfer Koordinasyonu",
      }),
      badge: pickLocaleText(locale, {
        ar: "خدمات VIP",
        en: "VIP Transfers",
        fr: "Transferts VIP",
        tr: "VIP Transfer",
      }),
      icon: Car,
      colorClass: "from-purple-500 to-indigo-600",
      description: pickLocaleText(locale, {
        ar: "يتابع وصول رحلات الطيران في المطارات لحظياً، ويوجه السائقين الخاصين لتفادي أي تأخير، وينسق رحلات اليخوت الخاصة.",
        en: "Tracks flight arrivals live, adjusting chauffeur dispatch to terminal gates and coordinating private yachts.",
        fr: "Suit les arrivées des vols en direct, coordonne les chauffeurs privés aux portes des terminaux et les yachts.",
        tr: "Uçak inişlerini canlı takip eder, terminal kapılarına VIP şoför sevkini yönetir ve özel yat turlarını koordine eder.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "صفر تأخير في مواعيد استقبال المطارات",
        en: "0 airport pickup delays",
        fr: "0 retard lors des accueils aux aéroports",
        tr: "Havalimanı karşılamalarında 0 gecikme",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "تأخرت رحلة العميل رقم TK1821 في مطار إسطنبول بـ 40 دقيقة، ما هو الإجراء؟",
            en: "Client flight TK1821 delayed 40 minutes at Istanbul Airport. Next step?",
            fr: "Le vol TK1821 a 40 minutes de retard à l'aéroport d'Istanbul. Quelle action ?",
            tr: "Müşterinin TK1821 numaralı uçuşu İstanbul Havalimanı'nda 40 dakika gecikti. Sonraki adım?",
          }),
          response: pickLocaleText(locale, {
            ar: "تم تتبع الرحلة آلياً وتحديث موعد وصول السائق الخاص بسيارة مرسيدس فيتو VIP إلى البوابة رقم 13 مع إرسال إشعار طمأنة بالواتساب للعميل.",
            en: "Flight delay synced. Chauffeur pickup revised to Gate 13 with automated reassuring WhatsApp update sent to passenger.",
            fr: "Retard synchronisé. Chauffeur VIP Mercedes Vito réaffecté à la porte 13 avec notification WhatsApp rassurante.",
            tr: "Uçuş gecikmesi senkronize edildi. Mercedes Vito VIP şoförü Kapı 13'e yönlendirildi ve yolcuya WhatsApp bilgilendirmesi gönderildi.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تنسيق لوجستي آلي ناجح",
            en: "Chauffeur arrival re-synced",
            fr: "Arrivée chauffeur resynchronisée",
            tr: "Şoför varışı başarıyla yeniden senkronize edildi",
          }),
        },
      ],
    },
    {
      id: "social",
      name: pickLocaleText(locale, {
        ar: "مسؤول السوشيال ومجتمع نوستر (Social Agent)",
        en: "Decentralized Social Agent",
        fr: "Agent Réseaux Sociaux & Nostr",
        tr: "Sosyal Medya ve Nostr Ajanı",
      }),
      title: pickLocaleText(locale, {
        ar: "تغذية شبكة الريلز والنشر التلقائي",
        en: "Nostr & Multi-Social Publishing",
        fr: "Publication Multi-Réseaux & Réseau Nostr",
        tr: "Nostr ve Çoklu Sosyal Medya Yayını",
      }),
      badge: pickLocaleText(locale, {
        ar: "شبكة نوستر",
        en: "Nostr Protocol",
        fr: "Protocole Nostr",
        tr: "Nostr Protokolü",
      }),
      icon: Globe,
      colorClass: "from-rose-500 to-pink-600",
      description: pickLocaleText(locale, {
        ar: "ينشر تجارب السفر عبر تيك توك وميتا وإكس ويوتيوب وتيليجرام، ويدير نقاط مكافآت الأعضاء وشارات التوثيق.",
        en: "Syndicates travel reels across TikTok, Instagram, X, YouTube, and Nostr relays while managing community rewards.",
        fr: "Diffuse les reels voyage sur TikTok, Instagram, X, YouTube et Nostr tout en gérant les récompenses des membres.",
        tr: "Seyahat reels videolarını TikTok, Instagram, X, YouTube ve Nostr üzerinde yayınlar, topluluk ödüllerini yönetir.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "تفاعل آلي على مدار الساعة مع 8,000+ عضو",
        en: "24/7 engagement with 8,000+ members",
        fr: "Engagement 24/7 avec 8 000+ membres",
        tr: "8.000+ üye ile 7/24 otomatik etkileşim",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "انشر مقطع ريلز لجولة مناطيد كابادوكيا عبر تيك توك وإنستغرام وتيليجرام",
            en: "Publish Cappadocia Hot Air Balloon reel to TikTok, Instagram, and Telegram",
            fr: "Publiez le reel Montgolfières de Cappadoce sur TikTok, Instagram et Telegram",
            tr: "Kapadokya Sıcak Hava Balonu reels videosunu TikTok, Instagram ve Telegram'da yayınlayın",
          }),
          response: pickLocaleText(locale, {
            ar: "تم جدولة ونشر المقطع بنجاح مع روابط الحجز المباشر وشارة التوثيق الملكية وهاشتاجات السفر الرائجة في تركيا والخليج.",
            en: "Reel scheduled and broadcasted with embedded booking CTA, official verified admin badge, and trending GCC travel tags.",
            fr: "Reel programmé et diffusé avec lien de réservation directe, badge vérifié officiel et hashtags tendances.",
            tr: "Video, doğrudan rezervasyon bağlantısı, doğrulanmış onay rozeti ve popüler seyahat etiketleriyle yayınlandı.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تم النشر المتزامن بنجاح",
            en: "Omnichannel broadcast complete",
            fr: "Diffusion multi-canal réussie",
            tr: "Çok kanallı yayın tamamlandı",
          }),
        },
      ],
    },
    {
      id: "recovery",
      name: pickLocaleText(locale, {
        ar: "وكيل استرداد الحجوزات المتروكة (Recovery Agent)",
        en: "Cart Recovery Agent",
        fr: "Agent Récupération de Paniers",
        tr: "Terk Edilmiş Rezervasyon Kurtarma Ajanı",
      }),
      title: pickLocaleText(locale, {
        ar: "مراسلة واتساب الذكية لإنقاذ المبيعات",
        en: "Automated WhatsApp Recovery",
        fr: "Relance Intelligente WhatsApp",
        tr: "Otomatik WhatsApp Rezervasyon Kurtarma",
      }),
      badge: pickLocaleText(locale, {
        ar: "استرداد المبيعات",
        en: "Cart Recovery",
        fr: "Récupération Panier",
        tr: "Satış Kurtarma",
      }),
      icon: Zap,
      colorClass: "from-cyan-500 to-blue-600",
      description: pickLocaleText(locale, {
        ar: "يرصد أي مسافر غادر في خطوة الدفع دون إتمام الحجز، ويرسل له رسالة واتساب آلية تشجيعية مع كود خصم فوري.",
        en: "Identifies checkout drop-offs and fires targeted WhatsApp follow-ups with limited-time booking vouchers.",
        fr: "Détecte les abandons au paiement et envoie un suivi WhatsApp ciblé avec code promo limité dans le temps.",
        tr: "Ödeme adımında ayrılan yolcuları tespit eder ve süreli indirim kuponuyla otomatik WhatsApp mesajı gönderir.",
      }),
      kpi: pickLocaleText(locale, {
        ar: "استعادة 32% من الحجوزات المتروكة",
        en: "32% abandoned booking recovery",
        fr: "32% de récupération des réservations abandonnées",
        tr: "Terk edilen rezervasyonların %32'sini kurtarma",
      }),
      prompts: [
        {
          input: pickLocaleText(locale, {
            ar: "عميل توقف عند إدخال بيانات البطاقة لحجز فندق في أنطاليا بقيمة $940",
            en: "Traveler dropped out at card payment for $940 Antalya resort stay",
            fr: "Client bloqué au paiement par carte pour un séjour de 940 $ à Antalya",
            tr: "Müşteri Antalya'da 940 $'lık otel rezervasyonu kart ödemesi adımında ayrıldı",
          }),
          response: pickLocaleText(locale, {
            ar: "تم إرسال رسالة واتساب مخصصة بلباقة خلال 5 دقائق تتضمن رابطاً آمناً بنقرة واحدة لاستكمال الحجز مع كود خصم $30 صالح لمدة ساعة.",
            en: "Personalized WhatsApp recovery prompt dispatched within 5 mins with 1-click checkout link and $30 limited-time incentive.",
            fr: "Message WhatsApp personnalisé envoyé en 5 min avec lien sécurisé en 1 clic et réduction de 30 $ valable 1 heure.",
            tr: "5 dakika içinde 1 tıkla ödeme bağlantısı ve 1 saat geçerli 30 $ indirim kuponu içeren özel WhatsApp mesajı gönderildi.",
          }),
          actionTag: pickLocaleText(locale, {
            ar: "تم استرداد الحجز بنجاح ودفع العميل",
            en: "Recovered booking paid successfully",
            fr: "Réservation récupérée et payée",
            tr: "Rezervasyon başarıyla kurtarıldı ve ödendi",
          }),
        },
      ],
    },
  ];

  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];
  const currentPrompt = currentAgent.prompts[activeSimulationPrompt] || currentAgent.prompts[0];

  const handleSimulatePrompt = (idx: number) => {
    setActiveSimulationPrompt(idx);
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 450);
  };

  return (
    <section id="ai-swarm" className="relative py-20 bg-slate-50/70 text-slate-900 border-t border-slate-200 overflow-hidden" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-950 text-xs font-bold shadow-xs">
            <Bot className="h-4 w-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "سرب الذكاء الاصطناعي وغرفة العمليات المركزية (AI Swarm War Room)",
                en: "Autonomous Multi-Agent AI Swarm War Room",
                fr: "Salle d'Opérations du Swarm d'Agents IA Autonome",
                tr: "Otonom Çoklu Yapay Zeka Ajanı Operasyon Odası",
              })}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight font-sans text-balance">
            {locale === "ar" ? (
              <>
                6 وكلاء ذكاء اصطناعي متخصصين{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  يديرون وكالتك بالكامل
                </span>
              </>
            ) : locale === "fr" ? (
              <>
                6 Agents IA Autonomes Spécialisés{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Gèrent Votre Agence 24/7
                </span>
              </>
            ) : locale === "tr" ? (
              <>
                6 Uzman Otonom Yapay Zeka Ajanı{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Acentenizi 7/24 Yönetsin
                </span>
              </>
            ) : (
              <>
                6 Autonomous AI Swarm Agents{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Running Your Agency 24/7
                </span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "فريق عمل رقمي مستقل يتولى مراقبة الأسعار، كتابة المقالات السياحية، تنسيق أسطول الاستقبال، واسترداد الحجوزات مع بوت موافقة تيليجرام بنقرة واحدة.",
              en: "An autonomous digital workforce handling pricing, travel journalism, VIP transfer dispatch, and cart recovery with one-click Telegram confirmation.",
              fr: "Une main-d'œuvre numérique autonome gérant la tarification dynamique, la rédaction touristique, la flotte VIP et la relance panier avec validation Telegram.",
              tr: "Dinamik fiyatlandırmayı, seyahat yazarlığını, VIP karşılama filosunu ve sepet kurtarmayı tek tıkla Telegram onayıyla yöneten otonom dijital ekip.",
            })}
          </p>
        </div>

        {/* Swarm Agent Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setSelectedAgent(agent.id);
                  setActiveSimulationPrompt(0);
                }}
                className={`p-3.5 rounded-2xl border text-start transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-purple-800 shadow-md shadow-purple-950/10 ring-2 ring-purple-500/20 scale-[1.02]"
                    : "bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-800"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`size-9 rounded-xl bg-gradient-to-br ${agent.colorClass} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                        isSelected ? "bg-purple-50 text-purple-950" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {agent.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{agent.name}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {agent.title}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-purple-800 font-bold">
                  <span>
                    {isSelected
                      ? pickLocaleText(locale, {
                          ar: "الوكيل النشط",
                          en: "Active Agent",
                          fr: "Agent Actif",
                          tr: "Aktif Ajan",
                        })
                      : pickLocaleText(locale, {
                          ar: "عرض الأوامر",
                          en: "Inspect",
                          fr: "Inspecter",
                          tr: "İncele",
                        })}
                  </span>
                  <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Terminal Sandbox */}
        <div className="rounded-3xl border border-slate-700/80 bg-slate-950/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Agent Info & Quick Directives (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-800 pb-6 lg:pb-0 lg:pe-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-8 rounded-lg bg-gradient-to-br ${currentAgent.colorClass} flex items-center justify-center text-white`}
                  >
                    {(() => {
                      const Icon = currentAgent.icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{currentAgent.name}</h3>
                    <span className="text-xs text-amber-300 font-medium">{currentAgent.title}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {currentAgent.description}
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{currentAgent.kpi}</span>
                </div>
              </div>

              {/* Prompt Testing Triggers */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 block">
                  {pickLocaleText(locale, {
                    ar: "اختبر أوامر الذكاء الاصطناعي الحية لهذا الوكيل:",
                    en: "Test live AI commands for this agent:",
                    fr: "Testez les commandes IA en direct pour cet agent :",
                    tr: "Bu ajan için canlı yapay zeka komutlarını test edin:",
                  })}
                </span>
                <div className="space-y-1.5">
                  {currentAgent.prompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSimulatePrompt(idx)}
                      className={`w-full text-start p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        activeSimulationPrompt === idx
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <span className="line-clamp-1 pe-2">«{p.input}»</span>
                      <Play className="h-3 w-3 shrink-0 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Terminal & Telegram Bot Dispatches (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              {/* Terminal Top Chrome */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="size-2.5 rounded-full bg-purple-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 ms-2">
                    LONALIZA-SWARM-DAEMON // AGENT-ID: {currentAgent.id.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {pickLocaleText(locale, {
                    ar: "متصل بالخادم",
                    en: "Daemon Live",
                    fr: "Démon Actif",
                    tr: "Daemon Aktif",
                  })}
                </span>
              </div>

              {/* Command and Output Stream */}
              <div className="space-y-4 flex-1">
                {/* User Input Prompt */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="text-amber-400 font-bold">admin@lonaliza:~$</span>
                    <span>prompt_agent --agent={currentAgent.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs sm:text-sm">
                    «{currentPrompt.input}»
                  </div>
                </div>

                {/* Agent Response */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-purple-300 font-bold">
                    <Bot className="h-3.5 w-3.5 text-amber-300" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: `استجابة ${currentAgent.name}:`,
                        en: `Response from ${currentAgent.name}:`,
                        fr: `Réponse de ${currentAgent.name} :`,
                        tr: `${currentAgent.name} yanıtı:`,
                      })}
                    </span>
                    {isSimulating && <RotateCw className="h-3 w-3 animate-spin text-purple-400" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-100 font-sans text-xs sm:text-sm leading-relaxed transition-opacity duration-300 ${
                      isSimulating ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    {currentPrompt.response}
                  </div>
                </div>

                {/* Telegram Bot Action Notification */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-[11px]">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5 font-sans">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>{currentPrompt.actionTag}</span>
                  </span>
                  <span className="text-slate-400 font-sans">
                    {pickLocaleText(locale, {
                      ar: "مزامنة تيليجرام 100%",
                      en: "Telegram Bot 100% Synced",
                      fr: "Bot Telegram 100% Synchronisé",
                      tr: "Telegram Botu %100 Senkronize",
                    })}
                  </span>
                </div>
              </div>

              {/* Terminal Footer */}
              <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                <span>Latency: 42ms · Token Execution: Optimized</span>
                <span className="text-amber-400 font-bold font-sans">
                  {pickLocaleText(locale, {
                    ar: "جاهز للتنفيذ الفوري",
                    en: "Ready for Execution",
                    fr: "Prêt pour Exécution",
                    tr: "Anında Uygulamaya Hazır",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
