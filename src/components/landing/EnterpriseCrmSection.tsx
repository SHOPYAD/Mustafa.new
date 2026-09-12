"use client";

import { useState } from "react";
import {
  BellRing,
  Bot,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  FileSpreadsheet,
  MessageCircle,
  MessageSquare,
  QrCode,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function EnterpriseCrmSection() {
  const { dir, locale } = useLocale();

  // Interactive WhatsApp Gateway Simulator
  const [qrConnected, setQrConnected] = useState<boolean>(true);
  const [selectedPipeline, setSelectedPipeline] = useState<"cart" | "confirmed" | "vip">("cart");
  const [dispatchedMessage, setDispatchedMessage] = useState<string | null>(null);

  const handleSimulateDispatch = () => {
    setDispatchedMessage(
      pickLocaleText(locale, {
        ar: "جاري إرسال رسالة الواتساب التلقائية عبر بوابة Baileys...",
        en: "Dispatching automated WhatsApp message via Baileys gateway...",
        fr: "Envoi du message WhatsApp automatisé via la passerelle Baileys...",
        tr: "Baileys ağ geçidi üzerinden otomatik WhatsApp mesajı gönderiliyor...",
      })
    );
    setTimeout(() => {
      setDispatchedMessage(
        pickLocaleText(locale, {
          ar: "تم تسليم الرسالة وقراءة المسافر لها بنجاح — نسبة استعادة الحجز: 38%.",
          en: "Delivered and read by traveler — Cart recovery conversion: 38%.",
          fr: "Délivré et lu par le voyageur — Taux de conversion de récupération : 38%.",
          tr: "Gezgine ulaştı ve okundu — Terk edilen sepet kurtarma oranı: %38.",
        })
      );
    }, 800);
  };

  const crmPillars = [
    {
      title: pickLocaleText(locale, {
        ar: "بوابة واتساب Baileys المباشرة",
        en: "Direct WhatsApp Baileys Gateway",
        fr: "Passerelle Directe WhatsApp Baileys",
        tr: "Doğrudan WhatsApp Baileys Ağ Geçidi",
      }),
      desc: pickLocaleText(locale, {
        ar: "اربط رقم واتساب وكالتك الرسمي عبر رمز QR دون الحاجة لدفع اشتراكات شهرية باهظة لـ Twilio أو وسيط. إرسال فوري لتأكيدات الحجز وتذاكر PDF.",
        en: "Connect your official agency WhatsApp number in seconds via QR scan. Zero extra third-party message fees for booking vouchers and alerts.",
        fr: "Connectez votre numéro WhatsApp d'agence officiel en quelques secondes par scan QR. Aucun frais tiers pour vos vouchers et alertes.",
        tr: "Acentenizin resmi WhatsApp numarasını saniyeler içinde QR taramasıyla bağlayın. Rezervasyon kuponları ve bildirimler için üçüncü taraf mesaj ücreti ödemeyin.",
      }),
      icon: MessageCircle,
      color: "text-purple-900 bg-purple-50 border-purple-200",
      badge: pickLocaleText(locale, {
        ar: "بدون رسوم وسيط",
        en: "Zero Extra Cost",
        fr: "Zéro Coût Tiers",
        tr: "Ek Masraf Yok",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "استعادة الحجوزات المتروكة آلياً",
        en: "Automated Abandoned Cart Recovery",
        fr: "Récupération Automatique des Paniers",
        tr: "Terk Edilen Rezervasyonları Kurtarma",
      }),
      desc: pickLocaleText(locale, {
        ar: "يتعرف النظام فوراً على العميل الذي بدأ حجز فندق أو طيران ولم يكمل الدفع، ويرسل له رسالة تذكير مخصصة بكوبون خصم سري لاستعادة 35%+ من الحجوزات.",
        en: "Instantly detect when a traveler drops off mid-checkout and trigger targeted WhatsApp follow-ups with limited-time incentives.",
        fr: "Détectez instantanément l'abandon en cours de réservation et relancez automatiquement par WhatsApp avec des offres ciblées.",
        tr: "Ödeme aşamasında ayrılan gezginleri anında tespit edin ve kişiselleştirilmiş indirimlerle WhatsApp üzerinden otomatik hatırlatma gönderin.",
      }),
      icon: Zap,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      badge: pickLocaleText(locale, {
        ar: "+35% استرداد مبيعات",
        en: "+35% Recovery Rate",
        fr: "+35% de Récupération",
        tr: "+%35 Geri Kazanım",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "مساعد المسافرين الذكي (AI Concierge)",
        en: "24/7 AI Traveler Concierge",
        fr: "Concierge IA Voyageur 24/7",
        tr: "7/24 Yapay Zeka Seyahat Danışmanı",
      }),
      desc: pickLocaleText(locale, {
        ar: "مساعد افتراضي فوري يجيب على استفسارات المسافرين حول الطيران والفنادق وسياسات الأمتعة باللغة الطبيعية ويقترح الرحلات الأنسب لهم على مدار الساعة.",
        en: "Omnichannel conversational AI answering customer queries regarding flight baggage, hotel amenities, and customized itinerary suggestions 24/7.",
        fr: "Assistant virtuel omnicanal répondant aux questions des voyageurs sur les vols, hôtels et bagages 24h/24 en langage naturel.",
        tr: "Uçuşlar, oteller ve bagaj politikaları hakkındaki soruları doğal dilde 7/24 yanıtlayan ve en uygun seyahatleri öneren çok kanallı yapay zeka.",
      }),
      icon: Bot,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      badge: pickLocaleText(locale, {
        ar: "24/7 دعم فوري",
        en: "24/7 Multilingual",
        fr: "24/7 Multilingue",
        tr: "7/24 Çok Dilli",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "فواتير وسندات PDF ضريبية فاخرة",
        en: "Branded PDF Tax Invoicing & Vouchers",
        fr: "Factures & Vouchers PDF Fiscaux",
        tr: "Markalı PDF Vergi Faturaları ve Kuponlar",
      }),
      desc: pickLocaleText(locale, {
        ar: "إصدار تلقائي لقسائم السفر وسندات القبض والفواتير الضريبية متوافقة مع الأنظمة المالية، برمز QR وشعار وكالتك جاهزة للإرسال والطباعة.",
        en: "Instant branded booking vouchers, receipt slips, and tax invoices generated dynamically with agency logo and secure QR verification.",
        fr: "Vouchers de voyage, reçus et factures fiscales générés automatiquement avec le logo de l'agence et vérification QR sécurisée.",
        tr: "Acente logosu ve güvenli QR doğrulamasıyla otomatik üretilen markalı rezervasyon kuponları, makbuzlar ve vergi faturaları.",
      }),
      icon: Receipt,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badge: pickLocaleText(locale, {
        ar: "معتمدة وضريبية",
        en: "Verified Tax Ready",
        fr: "Conforme & Fiscal",
        tr: "Onaylı ve Faturalı",
      }),
    },
  ];

  return (
    <section className="relative py-24 bg-white border-t border-slate-200 overflow-hidden" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <MessageSquare className="h-4 w-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "منظومة إدارة علاقات العملاء والتسويق بالواتساب",
                en: "Omnichannel Travel CRM & WhatsApp Automation",
                fr: "CRM Touristique & Automatisation WhatsApp",
                tr: "Çok Kanallı Seyahat CRM ve WhatsApp Otomasyonu",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            {pickLocaleText(locale, {
              ar: "حوّل الزائر العادي إلى عميل وفيّ ومسافر دائم",
              en: "Turn Casual Visitors Into Repeat VIP Travelers",
              fr: "Transformez les Visiteurs en Voyageurs VIP Fidèles",
              tr: "Ziyaretçileri Sadık ve Sürekli VIP Gezginlere Dönüştürün",
            })}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "منظومة CRM مدمجة بالكامل مع بوابة واتساب مباشرة وسريعة، تعمل على استعادة الحجوزات المتروكة وإرسال التذاكر والفواتير دون الحاجة لشراء برمجيات إضافية.",
              en: "A native travel CRM engine integrated with our direct WhatsApp QR gateway, built to recover abandoned carts and dispatch vouchers automatically.",
              fr: "Un CRM de voyage natif intégré à notre passerelle WhatsApp directe par QR code, conçu pour récupérer les paniers abandonnés et envoyer les vouchers automatiquement.",
              tr: "Terk edilen rezervasyonları kurtarmak ve kuponları otomatik göndermek için doğrudan WhatsApp QR ağ geçidimizle entegre edilmiş yerel seyahat CRM motoru.",
            })}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {crmPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 hover:bg-white p-6 hover:border-purple-300 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`size-12 rounded-2xl border flex items-center justify-center ${p.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Interactive WhatsApp Baileys Gateway & Cart Recovery Simulation */}
        <div className="rounded-3xl border border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-white to-amber-50/30 p-6 sm:p-10 shadow-xl shadow-purple-950/5">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-950">
                <Smartphone className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "محاكي بوابة الواتساب الذكية وحملات الاسترداد",
                    en: "Interactive WhatsApp Gateway & Cart Recovery Simulator",
                    fr: "Simulateur de Passerelle WhatsApp & Récupération de Paniers",
                    tr: "WhatsApp Ağ Geçidi ve Terk Edilen Sepet Kurtarma Simülatörü",
                  })}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "تكامل مباشر مع WhatsApp Baileys دون اشتراكات خارجية",
                  en: "Direct Baileys WhatsApp Engine Without Recurring SaaS Costs",
                  fr: "Moteur WhatsApp Baileys Direct Sans Coût Récurrent",
                  tr: "Aylık SaaS Masrafı Olmadan Doğrudan Baileys WhatsApp Motoru",
                })}
              </h3>
              <p className="text-sm text-slate-600">
                {pickLocaleText(locale, {
                  ar: "اختر نوع السيناريو لاختبار الرسالة التلقائية التي يتلقاها المسافر على هاتفه مباشرة.",
                  en: "Select a pipeline scenario to test the automated WhatsApp message delivered directly to traveler phones.",
                  fr: "Sélectionnez un scénario pour tester le message WhatsApp automatique envoyé directement aux voyageurs.",
                  tr: "Gezginlerin telefonuna doğrudan iletilen otomatik WhatsApp mesajını test etmek için bir senaryo seçin.",
                })}
              </p>
            </div>

            {/* Pipeline Tabs - Zero Emojis */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedPipeline("cart")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPipeline === "cart"
                    ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-md shadow-purple-950/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pickLocaleText(locale, {
                  ar: "استعادة حجز طيران متروك",
                  en: "Abandoned Flight Checkout",
                  fr: "Panier Vol Abandonné",
                  tr: "Terk Edilen Uçuş Rezervasyonu",
                })}
              </button>
              <button
                onClick={() => setSelectedPipeline("confirmed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPipeline === "confirmed"
                    ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-md shadow-purple-950/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pickLocaleText(locale, {
                  ar: "إرسال قسيمة الفندق وتأكيد الدخول",
                  en: "Hotel Voucher & QR Confirmation",
                  fr: "Voucher d'Hôtel & Confirmation QR",
                  tr: "Otel Kuponu ve QR Onayı",
                })}
              </button>
              <button
                onClick={() => setSelectedPipeline("vip")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPipeline === "vip"
                    ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-md shadow-purple-950/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pickLocaleText(locale, {
                  ar: "ترحيب العميل ونقاط الولاء المؤكدة",
                  en: "Customer Welcome & Verified Points",
                  fr: "Bienvenue Client & Points de Fidélité",
                  tr: "Müşteri Karşılama ve Onaylı Puanlar",
                })}
              </button>
            </div>

            {/* Interactive Chat Bubble & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: WhatsApp Status & QR (5 cols) */}
              <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {pickLocaleText(locale, {
                          ar: "حالة الربط الرسمي",
                          en: "WhatsApp Status",
                          fr: "Statut WhatsApp",
                          tr: "WhatsApp Durumu",
                        })}
                      </div>
                      <div className="text-[10px] text-purple-800 font-bold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                        <span>
                          {pickLocaleText(locale, {
                            ar: "متصل بالخادم (Connected)",
                            en: "Live Connected",
                            fr: "Connecté en Direct",
                            tr: "Bağlantı Aktif",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setQrConnected(!qrConnected)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Refresh connection"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">
                      {pickLocaleText(locale, {
                        ar: "الرقم المرتبط:",
                        en: "Linked Phone:",
                        fr: "Numéro Lié :",
                        tr: "Bağlı Numara:",
                      })}
                    </span>
                    <span className="font-mono font-bold text-slate-800">+90 552 *** 4410</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">
                      {pickLocaleText(locale, {
                        ar: "البروتوكول:",
                        en: "Engine:",
                        fr: "Protocole :",
                        tr: "Protokol:",
                      })}
                    </span>
                    <span className="font-mono text-purple-900 font-bold">Baileys WebSocket</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">
                      {pickLocaleText(locale, {
                        ar: "الرسائل المرسلة اليوم:",
                        en: "Messages Today:",
                        fr: "Messages Envoyés :",
                        tr: "Bugün Gönderilen:",
                      })}
                    </span>
                    <span className="font-bold text-slate-800">
                      1,420 {pickLocaleText(locale, { ar: "رسالة", en: "msgs", fr: "msg", tr: "mesaj" })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateDispatch}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-amber-300" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "أرسل رسالة تجريبية الآن",
                      en: "Trigger Test Automated Dispatch",
                      fr: "Tester l'Envoi Automatique",
                      tr: "Otomatik Test Gönderimi Başlat",
                    })}
                  </span>
                </button>

                {dispatchedMessage && (
                  <div className="text-[11px] font-medium text-purple-950 bg-purple-50 border border-purple-200 p-2.5 rounded-xl animate-fadeIn">
                    {dispatchedMessage}
                  </div>
                )}
              </div>

              {/* Right Column: Simulated WhatsApp Message on Traveler Phone (7 cols) */}
              <div className="md:col-span-7 bg-[#EFEAE2] p-5 sm:p-6 rounded-2xl border border-slate-300 shadow-inner flex flex-col justify-between">
                {/* Chat Header */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white p-3 rounded-t-xl -m-5 sm:-m-6 mb-4 border-b border-purple-800">
                  <div className="size-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-amber-300">
                    LA
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight text-white">
                      {pickLocaleText(locale, {
                        ar: "خدمة عملاء وكالة السفر",
                        en: "Travel Agency Official Concierge",
                        fr: "Conciergerie Officielle de l'Agence",
                        tr: "Seyahat Acentesi Resmi Danışmanı",
                      })}
                    </div>
                    <div className="text-[10px] text-amber-300 font-medium">
                      {pickLocaleText(locale, {
                        ar: "متصل الآن (Online 24/7)",
                        en: "Online 24/7",
                        fr: "En ligne 24/7",
                        tr: "7/24 Çevrim İçi",
                      })}
                    </div>
                  </div>
                </div>

                {/* Message Bubble - Clean Text Without Emojis */}
                <div className="bg-white rounded-2xl rounded-tr-none p-4 shadow-sm space-y-3 max-w-[90%] self-end">
                  <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {selectedPipeline === "cart" ? (
                      pickLocaleText(locale, {
                        ar: `مرحباً أستاذ أحمد،\nلاحظنا أنك كنت تبحث عن رحلة إسطنبول - دبي على متن الخطوط التركية ولم تكمل الحجز.\n\nتذكرتك لا تزال محفوظة لك بالسعر الخاص، واستخدم الكوبون: *FLYSAFE10* للحصول على خصم إضافي قبل نفاد المقاعد.`,
                        en: `Hello Mr. Ahmed,\nWe noticed you explored the Istanbul - Dubai flight on Turkish Airlines but haven't finished checkout yet.\n\nYour seat is reserved at the special fare. Use coupon *FLYSAFE10* to secure an extra discount before seats sell out.`,
                        fr: `Bonjour M. Ahmed,\nNous avons remarqué que vous consultiez le vol Istanbul - Dubaï sur Turkish Airlines sans finaliser votre commande.\n\nVotre siège est réservé au tarif spécial. Utilisez le coupon *FLYSAFE10* pour bénéficier d'une remise exclusive avant épuisement des places.`,
                        tr: `Merhaba Sayın Ahmed,\nTürk Hava Yolları İstanbul - Dubai uçuşunu incelediğinizi ancak rezervasyonu tamamlamadığınızı fark ettik.\n\nKoltuk kontenjanınız özel fiyattan korunmaktadır. Koltuklar tükenmeden ek indirim almak için *FLYSAFE10* kupon kodunu kullanabilirsiniz.`,
                      })
                    ) : selectedPipeline === "confirmed" ? (
                      pickLocaleText(locale, {
                        ar: `تم تأكيد حجزك بنجاح.\nرقم الحجز: #LN-84920\nالفندق: ريتز كارلتون إسطنبول (5 نجوم)\n\nتم إرفاق قسيمة الحجز الرسمية PDF مع رمز الدخول السريع في الملف أدناه.`,
                        en: `Your booking has been confirmed successfully.\nBooking ID: #LN-84920\nHotel: The Ritz-Carlton Istanbul (5-Star)\n\nYour official PDF voucher and express check-in QR code is attached below.`,
                        fr: `Votre réservation a été confirmée avec succès.\nN° de réservation : #LN-84920\nHôtel : The Ritz-Carlton Istanbul (5 étoiles)\n\nVotre voucher officiel en PDF et votre code QR d'accès rapide sont joints ci-dessous.`,
                        tr: `Rezervasyonunuz başarıyla onaylandı.\nRezervasyon No: #LN-84920\nOtel: The Ritz-Carlton İstanbul (5 Yıldız)\n\nResmi PDF rezervasyon kuponunuz ve hızlı giriş QR kodunuz aşağıda yer almaktadır.`,
                      })
                    ) : (
                      pickLocaleText(locale, {
                        ar: `أهلاً بك في فئة المسافرين المعتمدين.\nتم شحن رصيدك بـ 850 نقطة مكافآت مؤكدة في محفظتك.\n\nيمكنك استخدامها كخصم جزئي على حجزك القادم لأي وجهة في العالم.`,
                        en: `Welcome to verified traveler status.\nYour wallet has been credited with 850 verified reward points.\n\nRedeem them anytime for exclusive discounts on future journeys globally.`,
                        fr: `Bienvenue parmi nos voyageurs vérifiés.\nVotre portefeuille a été crédité de 850 points de récompense certifiés.\n\nUtilisez-les à tout moment comme réduction sur votre prochain voyage dans le monde entier.`,
                        tr: `Doğrulanmış gezgin statüsüne hoş geldiniz.\nCüzdanınıza 850 onaylı ödül puanı tanımlandı.\n\nBu puanları dünyanın her yerine yapacağınız bir sonraki seyahatinizde indirim olarak kullanabilirsiniz.`,
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>10:42 AM</span>
                    <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-300/60 text-center text-[11px] text-slate-600 font-medium">
                  {pickLocaleText(locale, {
                    ar: "يتم إرسال الرسائل تلقائياً في الخلفية فور حدوث أي حدث بالمنظومة",
                    en: "Messages trigger autonomously in the background on booking events",
                    fr: "Les messages sont envoyés automatiquement en arrière-plan lors de chaque événement",
                    tr: "Sistemde herhangi bir işlem gerçekleştiğinde mesajlar arka planda otomatik olarak gönderilir",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
