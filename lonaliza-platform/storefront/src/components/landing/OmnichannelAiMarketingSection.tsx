"use client";

import { useState } from "react";
import {
  Video,
  Share2,
  TrendingUp,
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Check,
  Clock,
  Eye,
  Crown,
  Lock,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function OmnichannelAiMarketingSection() {
  const { dir, locale } = useLocale();
  const isAr = locale === "ar";
  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });

  const [activeTab, setActiveTab] = useState<"flow" | "capcut" | "telegram" | "syndication">("flow");
  const [isSimulatingFlow, setIsSimulatingFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<"idle" | "connecting" | "extracted" | "capcut_editing" | "sent_telegram" | "approved">("idle");

  const handleSimulateFlow = () => {
    setIsSimulatingFlow(true);
    setFlowStep("connecting");
    setTimeout(() => {
      setFlowStep("extracted");
      setTimeout(() => {
        setFlowStep("capcut_editing");
        setTimeout(() => {
          setFlowStep("sent_telegram");
          setIsSimulatingFlow(false);
        }, 1200);
      }, 1000);
    }, 1200);
  };

  const handleApproveOnTelegram = () => {
    setFlowStep("approved");
  };

  return (
    <section
      id="omnichannel-ai-marketing"
      className="py-16 sm:py-24 bg-slate-50/70 text-slate-900 relative overflow-hidden border-t border-slate-200"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-950 text-xs font-black shadow-xs">
            <Bot className="size-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "منظومة التسويق الذاتي بالـ AI وربط Google Flow عبر MCP",
                en: "Autonomous AI Marketing & Google Flow MCP Suite",
                fr: "Suite Marketing IA Autonome & Google Flow MCP",
                tr: "Otonom Yapay Zeka Pazarlama ve Google Flow MCP Paketi",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight text-balance">
            {pickLocaleText(locale, {
              ar: "صناعة ريلز السفر ونشرها آلياً باعتماد فوري عبر تيليجرام",
              en: "Automated Travel Reels Production With Telegram Admin Approval",
              fr: "Production Automatisée de Reels avec Approbation Telegram",
              tr: "Telegram Yönetici Onayı ile Otomatik Seyahat Reels Üretimi",
            })}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "يتصل وكيل الذكاء الاصطناعي بـ Google Flow عبر بروتوكول MCP ومتصفح متخفٍ (Stealth Puppeteer)، ويستخرج الفيديو ويرسله لحسابك على تيليجرام؛ وبمجرد موافقتك يُبث تلقائياً إلى تيك توك، إنستغرام، فيسبوك، إكس، والمجتمع الداخلي.",
              en: "AI agent orchestrates Google Flow via MCP & Stealth Puppeteer, extracts 4K reels, requests your 1-click approval on Telegram, then syndicates across TikTok, Instagram, Meta, X, and the internal community.",
              fr: "L'agent IA pilote Google Flow via MCP et Puppeteer furtif, extrait des reels 4K, demande votre accord en 1 clic sur Telegram, puis diffuse sur TikTok, Instagram, Meta et X.",
              tr: "Yapay zeka ajanı MCP ve gizli tarayıcı ile Google Flow'dan 4K reels videoları üretir, Telegram üzerinden tek tıkla onayınızı alır ve tüm sosyal ağlarda otomatik yayınlar.",
            })}
          </p>
        </div>

        {/* 4 Interactive Process Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: Google Flow via MCP */}
          <div
            onClick={() => setActiveTab("flow")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
              activeTab === "flow"
                ? "bg-white border-purple-800 shadow-md shadow-purple-950/10"
                : "bg-white/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <Bot className="size-5" />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-950">
                01. Google Flow MCP
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              {pickLocaleText(locale, {
                ar: "استخراج لقطات 4K من Google Flow",
                en: "4K Drone Footage via MCP",
                fr: "Plans 4K Drone via MCP",
                tr: "MCP ile 4K Drone Çekimleri",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "توليد المشاهد السياحية الخام بنماذج Veo / Omni 1.1 عبر بروتوكول MCP دون استهلاك عتاد السيرفر.",
                en: "Fetches raw 4K cinematic travel clips via MCP without local VPS rendering overhead.",
                fr: "Génère des clips cinématiques 4K via MCP sans surcharger votre serveur VPS.",
                tr: "Sunucu donanımını zorlamadan MCP protokolü üzerinden 4K sinematik seyahat görüntüleri üretir.",
              })}
            </p>
          </div>

          {/* Step 2: CapCut & Canva via Computer/Browser Use */}
          <div
            onClick={() => setActiveTab("capcut")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
              activeTab === "capcut"
                ? "bg-white border-purple-800 shadow-md shadow-purple-950/10"
                : "bg-white/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <Sparkles className="size-5" />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                02. CapCut Computer Use
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              {pickLocaleText(locale, {
                ar: "مونتاج سينمائي آلي في CapCut",
                en: "Automated CapCut & Canva",
                fr: "Montage Automatisé CapCut",
                tr: "Otomatik CapCut Kurgusu",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "يتحكم الوكيل بمتصفح وكمبيوتر العميل لمونتاج الفيديو، إضافة النصوص والموسيقى وتصدير الريلز.",
                en: "Controls client desktop/browser directly to cut, caption, score, and render the final reel.",
                fr: "Contrôle directement le navigateur pour couper, sous-titrer, sonoriser et exporter le reel.",
                tr: "Videoyu kurgulamak, altyazı ve müzik eklemek için tarayıcıyı doğrudan otonom yönetir.",
              })}
            </p>
          </div>

          {/* Step 3: Telegram Approval */}
          <div
            onClick={() => setActiveTab("telegram")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
              activeTab === "telegram"
                ? "bg-white border-purple-800 shadow-md shadow-purple-950/10"
                : "bg-white/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                <Send className="size-5" />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                03. Telegram Approval
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              {pickLocaleText(locale, {
                ar: "اعتماد المدير عبر تيليجرام",
                en: "Telegram Admin Review",
                fr: "Validation Admin sur Telegram",
                tr: "Telegram Yönetici İncelemesi",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "يصل الفيديو لتيليجرام لمعاينته بنقرة واحدة: يمكنك الضغط على 'اعتماد ونشر' أو طلب تعديل بالصوت.",
                en: "Reel preview dispatched directly to Telegram for instant 1-tap approval or voice revision.",
                fr: "L'aperçu du reel est envoyé sur Telegram pour une validation immédiate ou demande de modification.",
                tr: "Video tek tıkla inceleme için Telegram'a iletilir: 'Onayla ve Yayınla'ya basabilir veya sesle revize isteyebilirsiniz.",
              })}
            </p>
          </div>

          {/* Step 4: 5-Platform Syndication & Ads */}
          <div
            onClick={() => setActiveTab("syndication")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
              activeTab === "syndication"
                ? "bg-white border-purple-800 shadow-md shadow-purple-950/10"
                : "bg-white/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Share2 className="size-5" />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                04. 5-Platform & Ads
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              {pickLocaleText(locale, {
                ar: "النشر على 5 منصات وإعلانات Meta",
                en: "Omnichannel & Meta Ads",
                fr: "Multi-Diffusion & Meta Ads",
                tr: "5 Platformda Yayın ve Meta Reklamları",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "بث الفيديو لحظياً على تيك توك، إنستغرام، فيسبوك، إكس، ونوستر، وإطلاق حملات إعلانية تلقائية.",
                en: "Instant syndication to TikTok, Reels, FB, X, Nostr, with automated Meta Ads ROAS booster.",
                fr: "Diffusion instantanée sur TikTok, Reels, FB, X et Nostr, avec optimisation des publicités Meta.",
                tr: "TikTok, Instagram Reels, Facebook, X ve Nostr'da anlık yayın ve otomatik Meta reklam optimizasyonu.",
              })}
            </p>
          </div>
        </div>

        {/* Interactive Live Demonstration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          {activeTab === "flow" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-950 text-xs font-bold border border-purple-200">
                  <Sparkles className="size-3.5 text-purple-700" />
                  <span>
                    {loc(
                      "هندسة MCP و Stealth Puppeteer ضد الكابتشا",
                      "Stealth Headless Browser MCP Engine",
                      "Moteur MCP Navigateur Furtif Anti-Captcha",
                      "Gizli Tarayıcı ve MCP Bot Engeli Aşma Motoru"
                    )}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 leading-snug">
                  {loc(
                    "توليد ريلز السفر 4K بالذكاء الاصطناعي عبر Google Flow",
                    "Autonomous 4K Reels Generation via Google Flow MCP",
                    "Génération Autonome de Reels 4K via Google Flow MCP",
                    "Google Flow MCP ile Otonom 4K Reels Video Üretimi"
                  )}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {loc(
                    "يقوم الروبوت بفتح جلسة آمنة عبر Puppeteer مع تفادي حظر الكابتشا واستخدام كوكيز معتمدة، ويُرسل طلب التوليد عبر HTTP في الخلفية ليستخرج ريلز سينمائي بدقة 4K مع تعليق صوتي وترجمة تلقائية بدون أي انقطاع.",
                    "Employs Puppeteer-core with anti-fingerprinting flags, humanized cursor behavior, and session persistence to interface with Google Flow in the background.",
                    "Utilise Puppeteer furtif avec anti-fingerprinting et persistance de session pour interagir avec Google Flow en arrière-plan et extraire des vidéos 4K.",
                    "Arka planda Google Flow ile bağlantı kurmak, oturum çerezlerini korumak ve 4K sinematik videoları sorunsuz çıkarmak için gelişmiş gizli Puppeteer mimarisi kullanır."
                  )}
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="size-4 text-purple-700 shrink-0" />
                    <span>
                      {loc(
                        "تشغيل متخفٍ (Stealth Flags) يمنع حظر الحساب أو طلب كابتشا",
                        "Anti-bot evasion bypasses Cloudflare & reCAPTCHA smoothly",
                        "Contournement anti-bot et reCAPTCHA sans blocage",
                        "Cloudflare ve reCAPTCHA korumalarını sorunsuz aşan gizli oturum"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="size-4 text-purple-700 shrink-0" />
                    <span>
                      {loc(
                        "تصدير الفيديو وإرساله مباشرة لتيليجرام لاعتماده قبل أي نشر",
                        "Direct handoff pipeline to Telegram admin review before publishing",
                        "Pipeline direct vers Telegram pour validation avant publication",
                        "Yayın öncesi yönetici onayı için Telegram'a doğrudan video aktarımı"
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulateFlow}
                    disabled={isSimulatingFlow}
                    className="px-6 py-3 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white rounded-2xl font-bold text-xs shadow-md shadow-purple-950/20 flex items-center gap-2 transition-all"
                  >
                    {isSimulatingFlow ? (
                      <span>
                        {loc(
                          "جارٍ الاتصال واستخراج الفيديو عبر MCP...",
                          "Connecting & Extracting via MCP...",
                          "Connexion et extraction via MCP...",
                          "MCP ile bağlanıyor ve video çıkarılıyor..."
                        )}
                      </span>
                    ) : (
                      <>
                        <Play className="size-4" />
                        <span>
                          {loc(
                            "محاكاة التوليد عبر Google Flow",
                            "Simulate Flow Generation",
                            "Simuler la génération Flow",
                            "Google Flow Üretimini Simüle Et"
                          )}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Frame Simulator */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px] bg-slate-900 rounded-3xl p-3 shadow-xl border-4 border-slate-800 text-white relative overflow-hidden">
                  <div className="rounded-2xl bg-slate-950 min-h-[460px] flex flex-col justify-between p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300">
                        {loc("كابادوكيا · 4K HDR", "Cappadocia · 4K HDR", "Cappadoce · 4K HDR", "Kapadokya · 4K HDR")}
                      </span>
                      <span className="text-[10px] text-white/70">MCP Active</span>
                    </div>

                    <div className="text-center space-y-2 z-10 my-auto">
                      {flowStep === "connecting" ? (
                        <div className="space-y-3">
                          <div className="size-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                          <div className="text-xs font-bold text-amber-300">Puppeteer Stealth Session...</div>
                          <div className="text-[10px] text-slate-400">
                            {loc(
                              "جلب الفيديو من Google Flow في الخلفية",
                              "Fetching video from Google Flow in background",
                              "Récupération vidéo depuis Google Flow en arrière-plan",
                              "Arka planda Google Flow'dan video getiriliyor"
                            )}
                          </div>
                        </div>
                      ) : flowStep === "extracted" || flowStep === "sent_telegram" || flowStep === "approved" ? (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                          <div className="size-12 rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle2 className="size-6 text-amber-300" />
                          </div>
                          <div className="text-xs font-bold text-amber-300">
                            {flowStep === "approved"
                              ? loc("تم النشر على كافة المنصات!", "Published Everywhere!", "Publié sur toutes les plateformes !", "Tüm Platformlarda Yayınlandı!")
                              : loc("تم استخراج الفيديو وإرساله لتيليجرام!", "Video Sent to Telegram!", "Vidéo envoyée sur Telegram !", "Video Telegram'a Gönderildi!")}
                          </div>
                          <p className="text-[10px] text-slate-300">
                            {flowStep === "approved"
                              ? loc("تيك توك، إنستغرام، فيسبوك، إكس، ومجتمع المنصة", "TikTok, Reels, FB, X, & Community", "TikTok, Reels, FB, X et Communauté", "TikTok, Reels, FB, X ve Topluluk")
                              : loc("في انتظار نقرة اعتماد المدير على تيليجرام", "Awaiting Telegram admin approval", "En attente de validation admin sur Telegram", "Telegram yönetici onayı bekleniyor")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="size-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-white">
                            <Play className="size-5 fill-white" />
                          </div>
                          <div className="text-xs font-bold text-white/90">
                            {loc("معاينة الفيديو المستخرج", "Extracted Video Reel", "Aperçu de la vidéo extraite", "Çıkarılan Video Önizlemesi")}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 z-10 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                      <p className="text-[11px] font-bold text-amber-300 leading-tight">
                        {loc(
                          "\"مناطيد كابادوكيا مع إقامة فندقية 5 نجوم بخصم 40%\"",
                          "\"Cappadocia Hot Air Balloons & 5-Star Hotel with 40% OFF\"",
                          "\"Montgolfières de Cappadoce & Hôtel 5 étoiles à -40%\"",
                          "\"Kapadokya Balon Turu & %40 İndirimli 5 Yıldızlı Otel\""
                        )}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/10">
                        <span>{loc("رابط الحجز المباشر", "Direct booking link", "Lien de réservation directe", "Doğrudan rezervasyon linki")}</span>
                        <span className="font-mono text-teal-300">lonaliza.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "capcut" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
                  <Video className="size-4" />
                  <span>
                    {loc(
                      "مونتاج فيديو آلي عبر MCP: التحكم بالمتصفح وكمبيوتر العميل",
                      "Autonomous Video Editing: Browser & Computer Use MCP",
                      "Montage Vidéo Autonome : MCP Browser & Computer Use",
                      "Otonom Video Kurgusu: Tarayıcı ve Masaüstü MCP Kullanımı"
                    )}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {loc(
                    "وكيل الذكاء الاصطناعي يحرر الفيديوهات في CapCut وCanva ذاتياً",
                    "AI Agent Edits Reels in CapCut & Canva Autonomously",
                    "L'Agent IA monte les reels sur CapCut et Canva de manière autonome",
                    "Yapay Zeka Ajanı CapCut ve Canva'da Videoları Otonom Kurgular"
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  {loc(
                    "يتحكم الوكيل في واجهة CapCut Desktop عبر Computer Use MCP ومتصفح كاب كانفا عبر Browser Use MCP (CDP)، حيث يقوم بقص لقطات 4K، إضافة خطوط عربية كينيتك راقية، تركيب أسعار الفنادق، ومزامنة الصوتيات الفاخرة ثم التصدير بدقة 1080p 60fps.",
                    "Agent automates CapCut Desktop via native Computer Use MCP and CapCut/Canva Web via CDP Browser Use MCP—trimming 4K clips, applying Arabic kinetic typography, price overlays, luxury sound beds, and rendering 1080p 60fps reels.",
                    "L'agent automatise CapCut Desktop et Canva via MCP : découpe de clips 4K, typographie cinétique, superposition des prix d'hôtels, bandes sonores et rendu 1080p 60fps.",
                    "Ajan, CapCut ve Canva'yı otonom yönetir: 4K klipleri keser, kinetik tipografi, otel fiyat katmanları ve lüks sesler ekleyip 1080p 60fps formatında dışa aktarır."
                  )}
                </p>
              </div>

              {/* 4 Core MCP Video Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    title: loc("تحكم بالكمبيوتر (Computer Use)", "Native Computer Use MCP", "Contrôle Bureau (Computer Use)", "Masaüstü Kontrolü (Computer Use)"),
                    desc: loc("محاكاة الفأرة والكيبورد والتحكم ببرنامج CapCut Desktop مباشرة", "Cursor, keyboard shortcuts & CapCut Desktop window control", "Contrôle du curseur, raccourcis et fenêtre CapCut Desktop", "CapCut Masaüstü uygulamasını fare ve klavye kısayollarıyla doğrudan yönetme"),
                    badge: "Desktop Automation",
                    color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
                  },
                  {
                    title: loc("تحكم بالمتصفح (Browser Use)", "CDP Browser Use MCP", "Contrôle Navigateur (Browser Use)", "Tarayıcı Kontrolü (Browser Use)"),
                    desc: loc("جلسة Chrome DevTools لأتمتة CapCut Web وCanva Web بدون كابتشا", "Stealth headless browser for Canva & CapCut Web workflows", "Navigateur furtif pour flux de travail Canva et CapCut Web", "Canva ve CapCut Web için gizli ve engelsiz tarayıcı oturumu"),
                    badge: "CDP Session",
                    color: "border-purple-200 bg-purple-50/50 text-purple-950",
                  },
                  {
                    title: loc("موشن جرافيك ونصوص متحركة", "Arabic Kinetic Titles", "Titres et Textes Dynamiques", "Hareketli Başlıklar ve Yazılar"),
                    desc: loc("خطوط راقية مخصصة، شريط الأسعار، والخصومات ونقاط الولاء", "Auto lower-thirds, hotel pricing cards & direct booking QR", "Bandeaux inférieurs, cartes de prix d'hôtels et QR de réservation", "Alt bantlar, otel fiyat kartları ve doğrudan rezervasyon karekodu"),
                    badge: "Dynamic Motion",
                    color: "border-amber-200 bg-amber-50/50 text-amber-900",
                  },
                  {
                    title: loc("تصدير 60fps واعتماد تيليجرام", "60fps Render & Telegram Sync", "Rendu 60fps & Sync Telegram", "60fps Render ve Telegram Senkronizasyonu"),
                    desc: loc("تصدير عمودي 9:16 فائق السلاسة وإرساله فوراً لبوت الإدارة", "Vertical 9:16 export dispatched instantly for 1-click admin signoff", "Export vertical 9:16 envoyé instantanément pour validation admin", "Tek tıkla yönetici onayı için anında iletilen akıcı 9:16 dikey video"),
                    badge: "Production Ready",
                    color: "border-purple-200 bg-purple-50/50 text-purple-950",
                  },
                ].map((cap, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${cap.color} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200">
                        {cap.badge}
                      </span>
                      <Sparkles className="size-3.5 text-indigo-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 pt-1">{cap.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{cap.desc}</p>
                  </div>
                ))}
              </div>

              {/* CapCut Timeline & Video Studio Simulator */}
              <div className="bg-slate-950 rounded-3xl p-5 sm:p-7 border-2 border-slate-800 text-white shadow-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-[#2e1065] to-[#4c1d95] flex items-center justify-center font-black text-xs text-amber-300 shadow-md">
                      CC
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black flex items-center gap-2">
                        <span>CapCut Studio Pro · Agent Controller</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                          MCP Connected
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sequence: Istanbul_Luxury_Palace_Reel_9x16 (1080x1920 @ 60fps)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      00:00:15 / 00:00:30
                    </span>
                    <button
                      onClick={handleSimulateFlow}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Zap className="size-3.5 text-amber-300" />
                      <span>{loc("تشغيل محاكاة المونتاج", "Run CapCut AI Edit", "Lancer la simulation de montage", "CapCut Video Kurgu Simülasyonu")}</span>
                    </button>
                  </div>
                </div>

                {/* Multitrack Timeline */}
                <div className="space-y-2 font-mono text-[11px]">
                  {/* Track 1: Text / Lower-Thirds */}
                  <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-20 sm:w-24 text-[10px] text-amber-400 font-bold shrink-0">
                      {loc("T1: نصوص حركية", "T1: Kinetic Titles", "T1: Titres Cinétiques", "T1: Kinetik Başlıklar")}
                    </span>
                    <div className="flex-1 flex gap-2 overflow-x-auto py-0.5">
                      <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] font-sans font-bold whitespace-nowrap">
                        {loc("قصر تشراغان كمبينسكي (00:00 - 00:08)", "Çırağan Palace Kempinski (00:00 - 00:08)", "Palais Çırağan Kempinski (00:00 - 00:08)", "Çırağan Sarayı Kempinski (00:00 - 00:08)")}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] font-sans font-bold whitespace-nowrap">
                        {loc("خصم 40% + إفطار عثماني مجاني (00:08 - 00:20)", "40% OFF + Free Ottoman Breakfast (00:08 - 00:20)", "-40% + Petit-déjeuner ottoman offert (00:08 - 00:20)", "%40 İndirim + Ücretsiz Osmanlı Kahvaltısı (00:08 - 00:20)")}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 text-[10px] font-sans font-bold whitespace-nowrap">
                        {loc("احجز الآن عبر lonaliza.com (00:20 - 00:30)", "Book now via lonaliza.com (00:20 - 00:30)", "Réservez sur lonaliza.com (00:20 - 00:30)", "lonaliza.com üzerinden hemen ayırtın (00:20 - 00:30)")}
                      </div>
                    </div>
                  </div>

                  {/* Track 2: 4K Drone Footage */}
                  <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-20 sm:w-24 text-[10px] text-amber-400 font-bold shrink-0">
                      {loc("V1: لقطات 4K", "V1: 4K Footage", "V1: Plans 4K Drone", "V1: 4K Drone Çekimleri")}
                    </span>
                    <div className="flex-1 flex gap-1.5 overflow-x-auto py-0.5">
                      <div className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-purple-900/40 border border-purple-500/40 text-purple-100 text-[10px] flex items-center justify-between">
                        <span>Bosphorus_Drone_4K.mp4</span>
                        <span className="text-[9px] text-amber-300">08s</span>
                      </div>
                      <div className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-purple-900/40 border border-purple-500/40 text-purple-100 text-[10px] flex items-center justify-between">
                        <span>Palace_Interior_Gimbal.mp4</span>
                        <span className="text-[9px] text-amber-300">12s</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-3 py-2 rounded-lg bg-purple-900/40 border border-purple-500/40 text-purple-100 text-[10px] flex items-center justify-between">
                        <span>InfinityPool_Sunset.mp4</span>
                        <span className="text-[9px] text-amber-300">10s</span>
                      </div>
                    </div>
                  </div>

                  {/* Track 3: Soundbed */}
                  <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-20 sm:w-24 text-[10px] text-indigo-400 font-bold shrink-0">
                      {loc("A1: ساوند تراك", "A1: Soundtrack", "A1: Bande Sonore", "A1: Müzik Kanalı")}
                    </span>
                    <div className="flex-1 p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-[10px] flex items-center justify-between">
                      <span className="font-sans">🎵 Luxury Turkish Ambient Beats (Beat-Synced 120BPM)</span>
                      <span className="font-mono text-[9px] text-indigo-300">Stereo 48kHz WAV</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-purple-400" />
                      Auto Cut & Trimming
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-400" />
                      Color Grading (LUT Applied)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-indigo-400" />
                      Auto Telegram Dispatch
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {loc(
                      "محرر الذكاء الاصطناعي جاهز لاستقبال مهام المونتاج 24/7",
                      "AI Video Editor standing by 24/7 for automated production",
                      "Monteur IA disponible 24/7 pour la production automatisée",
                      "Yapay Zeka Video Kurgucusu 7/24 otonom üretime hazır"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "telegram" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  {loc(
                    "نظام الأمان البشري: لا يُنشر أي فيديو إلا بعد موافقتك على تيليجرام",
                    "Human-in-the-Loop: Zero Rogue Publishing Without Telegram Signoff",
                    "Contrôle Humain : Aucune publication sans accord Telegram",
                    "İnsan Denetimli Güvenlik: Telegram Onayı Olmadan Video Yayınlanmaz"
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {loc(
                    "يحميك هذا الإجراء من نشر أي محتوى خاطئ: بمجرد تجهيز الفيديو بواسطة Google Flow، يُرسل بوت تيليجرام رسالة للمدير تحتوي على معاينة الفيديو وأزرار اعتماد تفاعلية.",
                    "Zero rogue publishing: every extracted video is routed to your Telegram bot with inline Approve / Revise buttons.",
                    "Zéro risque d'erreur : chaque vidéo générée est envoyée à votre bot Telegram avec des boutons interactifs de validation ou révision.",
                    "Hatalı içerik riskini sıfırlar: Google Flow ile hazırlanan her video, onay veya revize butonlarıyla Telegram yöneticisine iletilir."
                  )}
                </p>
              </div>

              {/* Telegram Card Mockup */}
              <div className="bg-slate-100 rounded-3xl p-6 border border-slate-300 max-w-md mx-auto space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                    BOT
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Lonaliza Studio AI Bot</div>
                    <div className="text-[10px] text-slate-500">
                      {loc(
                        "تم استخراج ريلز جديد عبر Google Flow",
                        "New 4K Reel extracted via Google Flow",
                        "Nouveau reel 4K extrait via Google Flow",
                        "Google Flow ile yeni 4K reels videosu çıkarıldı"
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-800">
                    {loc(
                      "🎬 ريلز ترويجي: رحلات كابادوكيا الفاخرة (4K 9:16)",
                      "🎬 Travel Reel: Cappadocia Luxury Tours (4K 9:16)",
                      "🎬 Reel Promo : Circuits Luxe Cappadoce (4K 9:16)",
                      "🎬 Tanıtım Videosu: Lüks Kapadokya Turları (4K 9:16)"
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {loc(
                      "تم توليد الفيديو بنجاح بواسطة وكيل الاستوديو. جاهز للنشر على: تيك توك، إنستغرام، فيسبوك، إكس، والمجتمع الداخلي.",
                      "Video rendered successfully by Studio Agent. Ready for TikTok, Instagram, Facebook, X, and internal community syndication.",
                      "Vidéo générée avec succès par l'agent Studio. Prête pour TikTok, Instagram, Facebook, X et communauté interne.",
                      "Stüdyo ajanı tarafından başarıyla üretildi. TikTok, Instagram, Facebook, X ve iç toplulukta yayınlanmaya hazır."
                    )}
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleApproveOnTelegram}
                      className="flex-1 py-2 bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="size-3.5 text-amber-300" />
                      <span>{loc("اعتماد ونشر فوري", "Approve & Publish Now", "Approuver et Publier", "Onayla ve Hemen Yayınla")}</span>
                    </button>
                    <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
                      {loc("تعديل السيناريو", "Revise Script", "Modifier le Script", "Senaryoyu Revize Et")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "syndication" && (
            <div className="space-y-6">
              <div className="max-w-2xl space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  {loc(
                    "النشر الموحد عبر 5 منصات اجتماعية متصلة",
                    "Omnichannel 5-Platform Broadcast",
                    "Diffusion Omnicanale sur 5 Plateformes",
                    "5 Bağlantılı Sosyal Platformda Eşzamanlı Yayın"
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {loc(
                    "فور الاعتماد، يُبث الفيديو تلقائياً على كافة شبكات التواصل الاجتماعي التابعة للوكالة بالإضافة إلى شبكة المسافرين الداخلية (Nostr) باسم إدارة المنصة.",
                    "Automatically posts to all connected brand accounts plus the decentralized Nostr traveler network under the verified Admin Crown.",
                    "Dès validation, la vidéo est automatiquement diffusée sur tous vos réseaux sociaux ainsi que sur le réseau de voyageurs Nostr sous badge officiel.",
                    "Onaylandığı anda video, tüm acente sosyal medya hesaplarında ve doğrulanmış yönetici tacıyla Nostr seyahat ağında otomatik yayınlanır."
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  {
                    name: "TikTok",
                    status: loc("متصل ومعتمد", "Connected & Verified", "Connecté & Vérifié", "Bağlı ve Doğrulanmış"),
                    note: loc("فيديوهات 9:16 بجودة عالية", "High-res 9:16 vertical video", "Vidéos 9:16 haute qualité", "Yüksek çözünürlüklü 9:16 dikey videolar"),
                  },
                  {
                    name: "Instagram Reels",
                    status: loc("متصل ومعتمد", "Connected & Verified", "Connecté & Vérifié", "Bağlı ve Doğrulanmış"),
                    note: loc("نشر مباشر مع الهاشتاغات", "Direct reels posting with hashtags", "Publication directe avec hashtags", "Hashtagler ile doğrudan yayın"),
                  },
                  {
                    name: "Facebook Pages",
                    status: loc("متصل ومعتمد", "Connected & Verified", "Connecté & Vérifié", "Bağlı ve Doğrulanmış"),
                    note: loc("بث للفيديو مع رابط الحجز", "Video post with direct booking link", "Diffusion avec lien de réservation", "Rezervasyon bağlantılı video paylaşımı"),
                  },
                  {
                    name: "X (Twitter)",
                    status: loc("متصل ومعتمد", "Connected & Verified", "Connecté & Vérifié", "Bağlı ve Doğrulanmış"),
                    note: loc("تغريدة مرفقة بالفيديو", "X thread with embedded video", "Tweet avec vidéo intégrée", "Videolu X paylaşımı"),
                  },
                  {
                    name: loc("مجتمع Nostr الداخلي", "Decentralized Nostr Community", "Communauté Décentralisée Nostr", "Merkeziyetsiz Nostr Topluluğu"),
                    status: loc("حساب الإدارة الموثق 👑", "Verified Admin Crown 👑", "Compte Admin Vérifié 👑", "Doğrulanmış Yönetici Tacı 👑"),
                    note: loc("منشور رسمي برصيد ولاء", "Official post with loyalty perks", "Post officiel avec bonus fidélité", "Sadakat puanlı resmi duyuru"),
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{item.name}</span>
                      <span className="size-2 rounded-full bg-purple-600" />
                    </div>
                    <div className="text-[11px] text-purple-900 font-bold">{item.status}</div>
                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ads ROAS Autopilot metrics integrated with syndication */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="max-w-2xl space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    {loc(
                      "الطيار الآلي لإعلانات جوجل وميتا (Ads ROAS Autopilot)",
                      "Autonomous Google & Meta Ads Manager",
                      "Gestionnaire Autonome de Publicités Google & Meta",
                      "Otonom Google ve Meta Reklam Yöneticisi (Ads ROAS)"
                    )}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {loc(
                      "يقوم الروبوت برصد وجهات البحث الأكثر طلباً في المنظومة، وتوليد إعلانات بحث فورية، وإيقاف الكلمات المفتاحية غير المربحة تلقائياً لتعظيم أرباح الوكالة.",
                      "Continuously tracks in-app search intent, allocates ad budget toward highest yield routes, and prunes non-converting keywords.",
                      "Analyse en temps réel les recherches sur la plateforme, alloue le budget sur les routes les plus rentables et supprime les mots-clés inefficaces.",
                      "Sistemdeki en çok aranan rotaları izler, reklam bütçesini en karlı hedeflere yönlendirir ve zararlı anahtar kelimeleri otomatik ayıklar."
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <div className="text-2xl font-black text-purple-900">+480%</div>
                    <div className="text-xs font-bold text-slate-800">
                      {loc("متوسط العائد الإعلاني ROAS", "Average ROAS", "ROAS Moyen", "Ortalama Reklam Getirisi (ROAS)")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {loc("لكل دولار يتم إنفاقه", "Per $1 spent", "Par dollar investi", "Harcanan her 1$ için")}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <div className="text-2xl font-black text-amber-600">-$0.38</div>
                    <div className="text-xs font-bold text-slate-800">
                      {loc("تخفيض تكلفة النقرة CPC", "CPC Cost Reduction", "Réduction du CPC", "Tıklama Başı Maliyet Düşüşü (CPC)")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {loc("عبر استبعاد النقرات العشوائية", "Negative keywords pruning", "Par exclusion des clics non qualifiés", "Negatif anahtar kelime optimizasyonu ile")}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <div className="text-2xl font-black text-amber-600">24/7</div>
                    <div className="text-xs font-bold text-slate-800">
                      {loc("تحسين مستمر ومراقبة ميزانية", "Autonomous Budget Guard", "Surveillance Budgétaire 24/7", "7/24 Bütçe Takibi ve Optimizasyon")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {loc("بدون تدخل بشري يومي", "Zero daily maintenance", "Sans gestion humaine quotidienne", "Günlük manuel müdahale gerektirmez")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
