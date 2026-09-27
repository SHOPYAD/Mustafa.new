"use client";

import { useState } from "react";
import {
  BadgePercent,
  CheckCircle2,
  Coins,
  DollarSign,
  Lock,
  Percent,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function FinancialSafeguardsVault() {
  const { dir, locale } = useLocale();
  const [testBookingAmount, setTestBookingAmount] = useState<number>(1200);

  // Dynamic calculations based on the 15% safeguard rules
  const minBookingRequired = 500;
  const isEligible = testBookingAmount >= minBookingRequired;
  const maxVoucherAllowed = isEligible ? Math.round(testBookingAmount * 0.15) : 0;
  const customerCashPayment = testBookingAmount - maxVoucherAllowed;
  const cashFlowRatio = testBookingAmount > 0 ? Math.round((customerCashPayment / testBookingAmount) * 100) : 100;

  return (
    <section className="relative py-16 md:py-24 bg-white text-slate-900 border-b border-slate-200 overflow-hidden" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-950 text-xs font-bold shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "الحصن المالي ومكافحة الخسائر (Financial Safeguards & Anti-Loss Protection)",
                en: "Financial Safeguards & Anti-Loss Architecture",
                fr: "Coffre-Fort Financier & Protection Anti-Pertes",
                tr: "Finansal Koruma Kasası ve Zarar Önleme Mimarisi",
              })}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight font-sans text-balance">
            {pickLocaleText(locale, {
              ar: "درع الحماية المالية الصارم يضمن تدفقاً نقدياً حقيقياً في كل حجز",
              en: "Strict Financial Safeguards Securing 85%+ Cash Collections",
              fr: "Sauvegardes Financières Strictes Garantissant 85%+ d'Encaissements",
              tr: "Her Rezervasyonda %85+ Nakit Tahsilatını Garanti Eden Güçlü Finansal Kalkan",
            })}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "صممنا النظام بقواعد رياضية صارمة تمنع الحجوزات المجانية تماماً، وتشترط موافقة الإدارة على نقاط السوشيال ميديا، وتلزم العميل بسداد 85%+ من قيمة حجزه نقداً.",
              en: "Mathematical rules strictly preventing zero-dollar bookings, enforcing admin approval for social points, and guaranteeing customer cash coverage.",
              fr: "Règles mathématiques strictes empêchant les réservations gratuites, exigeant l'approbation administrative des points sociaux et garantissant le paiement cash.",
              tr: "Ücretsiz rezervasyonları tamamen önleyen, sosyal medya puanları için yönetici onayını zorunlu kılan ve müşterinin en az %85 nakit ödemesini şart koşan matematiksel kurallar.",
            })}
          </p>
        </div>

        {/* 4 Core Safeguard Pillar Cards - Commercial Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-700 flex items-center justify-center">
              <Lock className="h-5 w-5 text-amber-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">
              {pickLocaleText(locale, {
                ar: "1. موافقة الإدارة المسبقة",
                en: "1. Mandatory Admin Approval",
                fr: "1. Approbation Préalable de l'Admin",
                tr: "1. Zorunlu Yönetici Onayı",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "كل نقطة يكتسبها العضو في السوشيال ميديا تسجل بحالة معلّقة ولا تصرف إلا بعد مراجعتك واعتمادك لها يدوياً.",
                en: "Points earned from community interactions remain pending until verified and released by your management team.",
                fr: "Tous les points gagnés dans la communauté restent en attente jusqu'à leur vérification et validation manuelle par votre équipe.",
                tr: "Topluluk etkileşimlerinden kazanılan her puan beklemede kalır ve yalnızca ekibiniz tarafından incelenip onaylandıktan sonra kullanılabilir.",
              })}
            </p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
              {pickLocaleText(locale, {
                ar: "حظر التوليد العشوائي",
                en: "Zero Unchecked Inflation",
                fr: "Inflation Zéro",
                tr: "Kontrolsüz Enflasyon Yok",
              })}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
            <div className="size-10 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-800" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">
              {pickLocaleText(locale, {
                ar: "2. شرط حجز بقيمة $500+",
                en: "2. $500 Minimum Booking Rule",
                fr: "2. Seuil Minimum de 500 $",
                tr: "2. Minimum 500$ Rezervasyon Şartı",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "تُحجب القسائم تلقائياً عن الحجوزات المنخفضة، ولا تُقبل إلا على الحجوزات الكبرى التي تبدأ من 500$ فأكثر.",
                en: "Points vouchers are completely locked for micro-orders and only redeemable on high-ticket bookings of $500+.",
                fr: "L'utilisation des points est bloquée pour les réservations inférieures à 500 $, préservant les marges des petites commandes.",
                tr: "Puan kuponları küçük siparişlerde kilitlenir ve yalnızca 500$ ve üzeri rezervasyonlarda kullanılabilir.",
              })}
            </p>
            <span className="text-[10px] font-bold text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded-md inline-block">
              {pickLocaleText(locale, {
                ar: "تدفق نقدي مضمون",
                en: "Guaranteed Cash Flow",
                fr: "Trésorerie Garantie",
                tr: "Garantili Nakit Akışı",
              })}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
            <div className="size-10 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-700 flex items-center justify-center">
              <BadgePercent className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">
              {pickLocaleText(locale, {
                ar: "3. سقف خصم 15% فقط",
                en: "3. 15% Maximum Discount Cap",
                fr: "3. Plafond de Remise à 15%",
                tr: "3. Maksimum %15 İndirim Sınırı",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "القسيمة هي Voucher تخفيض جزئي؛ يدفع العميل على الأقل 85% نقداً بالبطاقة وتستحيل الحجوزات المجانية $0.",
                en: "Vouchers are partial discounts only. Customers must pay 85%+ in cash/credit card, making $0 bookings impossible.",
                fr: "Les vouchers sont des réductions partielles. Les clients doivent payer 85%+ par carte, rendant les réservations à 0 $ impossibles.",
                tr: "Kuponlar yalnızca kısmi indirim sağlar. Müşteriler en az %85 nakit/kart ödemelidir, 0$'lık rezervasyonlar imkansızdır.",
              })}
            </p>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md inline-block">
              {pickLocaleText(locale, {
                ar: "أرباح مؤكدة للشركة",
                en: "Protected Agency Profit",
                fr: "Bénéfice Garanti",
                tr: "Garantili Acente Kazancı",
              })}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
            <div className="size-10 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-700 flex items-center justify-center">
              <Coins className="h-5 w-5 text-purple-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">
              {pickLocaleText(locale, {
                ar: "4. حد تحويل 500 نقطة",
                en: "4. 500 Points Conversion Floor",
                fr: "4. Seuil de Conversion à 500 Pts",
                tr: "4. 500 Puan Dönüştürme Tabanı",
              })}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "لا يمكن تحويل النقاط إلى قسائم إلا بعد جمع حد أدنى (500 نقطة) لحماية المنصة من المعاملات الصغيرة.",
                en: "Travelers cannot convert points to vouchers until accumulating at least 500 points, preventing ledger clutter.",
                fr: "Les voyageurs ne peuvent convertir de points qu'après avoir cumulé au moins 500 points, évitant la surcharge comptable.",
                tr: "Gezginler en az 500 puan biriktirmeden kupona dönüştüremez, bu da küçük işlemlerle muhasebenin yorulmasını önler.",
              })}
            </p>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-md inline-block">
              {pickLocaleText(locale, {
                ar: "استقرار المحفظة",
                en: "Ledger Stability",
                fr: "Stabilité Financière",
                tr: "Cüzdan Kararlılığı",
              })}
            </span>
          </div>
        </div>

        {/* Interactive Protection Simulator Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50/70 via-white to-amber-50/30 border border-purple-200/90 shadow-lg shadow-purple-950/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {pickLocaleText(locale, {
                  ar: "محاكي الحماية المالية المباشر",
                  en: "Live Safeguard Simulator",
                  fr: "Simulateur de Protection en Direct",
                  tr: "Canlı Finansal Koruma Simülatörü",
                })}
              </h3>
              <p className="text-xs text-slate-600">
                {pickLocaleText(locale, {
                  ar: "غيّر قيمة الحجز وشاهد كيف يفرض النظام نسبة التحصيل النقدي الإلزامية ويمنع الخسارة:",
                  en: "Slide booking total to watch how the engine enforces mandatory cash flow and prevents financial loss:",
                  fr: "Faites glisser le curseur pour voir comment le système applique le paiement obligatoire et empêche les pertes :",
                  tr: "Sistemin zorunlu nakit tahsilatı nasıl uyguladığını ve zararı nasıl önlediğini görmek için rezervasyon tutarını kaydırın:",
                })}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-950 bg-purple-100 px-3 py-1 rounded-full self-start sm:self-auto border border-purple-200">
              {pickLocaleText(locale, {
                ar: "سقف الخصم الأقصى: 15%",
                en: "Max Cap: 15%",
                fr: "Plafond Max : 15%",
                tr: "Maks. Tavan: %15",
              })}
            </span>
          </div>

          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>
                {pickLocaleText(locale, {
                  ar: "قيمة الحجز التجريبي:",
                  en: "Simulated Booking Total:",
                  fr: "Montant de Réservation Simulé :",
                  tr: "Simüle Edilen Rezervasyon Tutarı:",
                })}
              </span>
              <span className="text-base font-extrabold text-slate-950 font-mono">
                ${testBookingAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="50"
              value={testBookingAmount}
              onChange={(e) => setTestBookingAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{pickLocaleText(locale, { ar: "$200 (حجز صغير)", en: "$200 (Micro)", fr: "200 $ (Petit)", tr: "200$ (Küçük)" })}</span>
              <span>{pickLocaleText(locale, { ar: "$500 (عتبة الأمان)", en: "$500 (Threshold)", fr: "500 $ (Seuil)", tr: "500$ (Eşik)" })}</span>
              <span>{pickLocaleText(locale, { ar: "$5,000 (حجز فاخر)", en: "$5,000 (Luxury)", fr: "5 000 $ (Luxe)", tr: "5.000$ (Lüks)" })}</span>
            </div>
          </div>

          {/* Result Output Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* 1. Voucher Eligibility & Max Discount */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block">
                {pickLocaleText(locale, {
                  ar: "أقصى خصم بالقسيمة مسموح به:",
                  en: "Max Voucher Allowed:",
                  fr: "Remise Maximale Autorisée :",
                  tr: "İzin Verilen Maks. İndirim:",
                })}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-600 font-mono">
                  ${maxVoucherAllowed}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {isEligible
                    ? pickLocaleText(locale, { ar: "(15% كحد أقصى)", en: "(15% Cap)", fr: "(Plafond 15%)", tr: "(%15 Tavan)" })
                    : pickLocaleText(locale, { ar: "(غير مؤهل < $500)", en: "(Blocked < $500)", fr: "(Bloqué < 500 $)", tr: "(Engellendi < 500$)" })}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isEligible
                  ? pickLocaleText(locale, {
                      ar: "مؤهل لاستخدام قسائم الخصم الجزئي",
                      en: "Eligible for partial voucher",
                      fr: "Éligible au voucher partiel",
                      tr: "Kısmi indirim kuponu için uygun",
                    })
                  : pickLocaleText(locale, {
                      ar: "محجوب تلقائياً لحماية الأرباح",
                      en: "Blocked automatically (< $500)",
                      fr: "Bloqué automatiquement (< 500 $)",
                      tr: "Kazancı korumak için otomatik engellendi",
                    })}
              </p>
            </div>

            {/* 2. Mandatory Customer Cash Payment */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white shadow-md shadow-purple-950/20 space-y-1">
              <span className="text-[11px] font-bold text-purple-200 block">
                {pickLocaleText(locale, {
                  ar: "المبلغ النقدي المحصل للشركة:",
                  en: "Cash Paid to Agency:",
                  fr: "Encaissement Net Entreprise :",
                  tr: "Acenteye Ödenen Nakit:",
                })}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono">
                  ${customerCashPayment.toLocaleString()}
                </span>
                <span className="text-xs text-amber-300 font-bold">({cashFlowRatio}%)</span>
              </div>
              <p className="text-[10px] text-purple-200">
                {pickLocaleText(locale, {
                  ar: "كاش حقيقي يُودع في حسابك البنكي",
                  en: "Real cash arriving in your merchant account",
                  fr: "Argent réel déposé sur votre compte bancaire",
                  tr: "Banka hesabınıza yatan gerçek nakit",
                })}
              </p>
            </div>

            {/* 3. Safety Ratio */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-500 block">
                {pickLocaleText(locale, {
                  ar: "حالة الحجز المالي:",
                  en: "Booking Safety Status:",
                  fr: "Statut de Protection :",
                  tr: "Finansal Güvenlik Durumu:",
                })}
              </span>
              <div className="flex items-center gap-1.5 text-purple-900 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "محمي 100% ضد الخسارة",
                    en: "100% Zero-Loss Protection",
                    fr: "Protection Anti-Pertes 100%",
                    tr: "%100 Sıfır Zarar Koruması",
                  })}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {pickLocaleText(locale, {
                  ar: "يستحيل إتمام أي حجز بقيمة $0",
                  en: "$0 bookings are mathematically blocked",
                  fr: "Les réservations à 0 $ sont impossibles",
                  tr: "0$'lık rezervasyonlar matematiksel olarak imkansızdır",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
