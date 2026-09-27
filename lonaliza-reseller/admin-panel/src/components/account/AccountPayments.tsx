"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plane,
  Hotel,
  Car,
  Bus,
  MapPin,
  FileText,
  Sliders,
  DollarSign,
  Tag,
  Loader2,
  Calendar,
  Send,
  ShieldCheck,
  MessageCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export type PaymentLedgerItem = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  serviceType: "flight" | "hotel" | "car" | "transfer" | "tour" | "package";
  title: string;
  pnr: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: "card" | "binance_usdt" | "wallet" | "whatsapp";
  voucherCode: string;
  discountAmount: number;
  status: "paid" | "refunded" | "pending";
};

type PaymentStats = {
  totalPaid: number;
  completedCount: number;
  discountsTotal: number;
  refundedTotal: number;
  currency: string;
};

const PAGE_SIZE = 10;

export default function AccountPayments() {
  const { t, locale, dir } = useLocale();
  const { currency, convert } = useCurrency();
  const isRtl = dir === "rtl" || locale === "ar";

  const [payments, setPayments] = useState<PaymentLedgerItem[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPaid: 0,
    completedCount: 0,
    discountsTotal: 0,
    refundedTotal: 0,
    currency: "USD",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentLedgerItem | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/account/payments", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.ok) {
          setPayments(data.payments || []);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const pI18n = {
    totalPaidTitle: t.account.totalPaidTitle,
    totalPaidSub: t.account.totalPaidSub,
    completedTitle: t.account.completedTitle,
    completedUnit: t.account.completedUnit,
    completedSub: t.account.completedSub,
    discountsTitle: t.account.discountsTitle,
    discountsSub: t.account.discountsSub,
    refundedTitle: t.account.refundedTitle,
    refundedSub: t.account.refundedSub,

    searchPlaceholder: t.account.searchPaymentsPlaceholder,

    allServices: t.account.allServices,
    svcFlight: t.account.filterFlights,
    svcHotel: t.account.filterHotels,
    svcCar: t.account.filterCars,
    svcTransfer: t.account.filterTransfers,
    svcTour: t.account.filterPrograms,

    allStatuses: t.account.allStatuses,
    statusPaid: isAr ? "مسدد بالكامل" : isTr ? "Tam Ödendi" : isFr ? "Entièrement payé" : "Paid in Full",
    statusRefunded: isAr ? "مسترد" : isTr ? "İade Edildi" : isFr ? "Remboursé" : "Refunded",
    statusPending: isAr ? "قيد المعالجة" : isTr ? "İşleniyor" : isFr ? "En cours" : "Processing",

    exportCsv: t.account.exportPaymentsCsv,

    tableTitle: t.account.paymentLedgerTitle,
    tableSub: t.account.paymentLedgerSub,
    transactionCount: isAr ? "معاملة" : isTr ? "işlem" : isFr ? "transactions" : "transactions",

    emptySearchTitle: isAr ? "لا توجد معاملات مطابقة للبحث أو الفلتر" : isTr ? "Arama veya filtreyle eşleşen işlem bulunamadı" : isFr ? "Aucune transaction correspondante" : "No transactions match your search or filter",
    emptySearchSub: isAr ? "جرب تعديل كلمات البحث أو اختيار جميع الخدمات" : isTr ? "Arama terimlerini değiştirmeyi veya tüm hizmetleri seçmeyi deneyin" : isFr ? "Modifiez vos filtres ou sélectionnez tous les services" : "Try adjusting your search terms or choosing all services",

    colInvoice: isAr ? "رقم الفاتورة" : isTr ? "Fatura No" : isFr ? "N° Facture" : "Invoice #",
    colService: isAr ? "الخدمة والبيان" : isTr ? "Hizmet & Açıklama" : isFr ? "Service & Description" : "Service & Description",
    colPnr: isAr ? "رمز PNR" : isTr ? "PNR Kodu" : isFr ? "Code PNR" : "PNR Code",
    colDate: isAr ? "التاريخ" : isTr ? "Tarih" : isFr ? "Date" : "Date",
    colMethod: isAr ? "وسيلة الدفع" : isTr ? "Ödeme Yöntemi" : isFr ? "Mode de Paiement" : "Payment Method",
    colDiscounts: isAr ? "الخصومات" : isTr ? "İndirimler" : isFr ? "Remises" : "Discounts",
    colAmount: isAr ? "المبلغ المسدد" : isTr ? "Ödenen Tutar" : isFr ? "Montant Payé" : "Amount Paid",
    colStatus: isAr ? "حالة الدفع" : isTr ? "Ödeme Durumu" : isFr ? "Statut" : "Payment Status",
    colAction: isAr ? "الفاتورة الرسمية" : isTr ? "Resmi Fatura" : isFr ? "Facture Officielle" : "Official Invoice",

    badgePaid: isAr ? "مسدد ومؤكد" : isTr ? "Ödendi & Onaylandı" : isFr ? "Payé & Confirmé" : "Paid & Confirmed",
    badgeRefunded: isAr ? "مسترد للعميل" : isTr ? "İade Edildi" : isFr ? "Remboursé" : "Refunded",
    badgePending: isAr ? "قيد المراجعة" : isTr ? "İncelemede" : isFr ? "En cours de révision" : "In Review",
    btnViewInvoice: isAr ? "عرض الفاتورة الرسمية" : isTr ? "Resmi Faturayı Görüntüle" : isFr ? "Voir la facture officielle" : "View Official Invoice",

    paginationShowing: isAr ? "عرض" : isTr ? "Gösterilen" : isFr ? "Affichage de" : "Showing",
    paginationOf: isAr ? "من أصل" : isTr ? "/" : isFr ? "sur" : "of",
    btnPrev: isAr ? "السابق" : isTr ? "Önceki" : isFr ? "Précédent" : "Previous",
    btnNext: isAr ? "التالي" : isTr ? "Sonraki" : isFr ? "Suivant" : "Next",

    modalTitle: isAr ? "فاتورة ضريبية رسمية معتمدة" : isTr ? "Resmi Onaylı Vergi Faturası" : isFr ? "Facture Fiscale Officielle Agréée" : "Official Verified Tax Invoice",
    modalInvPrefix: isAr ? "رقم الفاتورة:" : isTr ? "Fatura No:" : isFr ? "N° Facture :" : "Invoice #:",
    btnSendWA: isAr ? "إرسال للواتساب والبريد" : isTr ? "WhatsApp & E-posta ile Gönder" : isFr ? "Envoyer par WhatsApp & E-mail" : "Send to WhatsApp & Email",
    btnDownloadPdf: isAr ? "تنزيل PDF فوري" : isTr ? "Anında PDF İndir" : isFr ? "Télécharger PDF Direct" : "Instant PDF Download",
    btnPrint: isAr ? "طباعة" : isTr ? "Yazdır" : isFr ? "Imprimer" : "Print",
    btnClose: isAr ? "إغلاق" : isTr ? "Kapat" : isFr ? "Fermer" : "Close",

    sendSuccess: isAr
      ? "تم إرسال الفاتورة والباركود بنجاح إلى رقم الواتساب والبريد الإلكتروني المسجل!"
      : isTr
        ? "Fatura ve barkod kayıtlı WhatsApp numarasına ve e-postaya başarıyla gönderildi!"
        : isFr
          ? "Facture et code-barres envoyés avec succès à votre WhatsApp et e-mail !"
          : "Invoice and barcode successfully sent to your verified WhatsApp and email!",
    sendPending: isAr
      ? "تم تسجيل طلب الإرسال وجارٍ تسليم الرسالة."
      : isTr
        ? "Gönderim talebi kaydedildi, mesaj iletiliyor."
        : isFr
          ? "Demande d'envoi enregistrée, remise en cours."
          : "Dispatch request registered and being delivered.",
    sendFailed: isAr
      ? "تعذر إرسال الإشعار، يرجى المحاولة لاحقاً."
      : isTr
        ? "Bildirim gönderilemedi, lütfen daha sonra tekrar deneyin."
        : isFr
          ? "Échec de l'envoi, veuillez réessayer plus tard."
          : "Could not send notification, please try again later.",

    companyName: isAr ? "شركة لوناليزا للسياحة والسفر المحدودة" : "LONALIZA TOURISM & TRAVEL LLC",
    taxInvoiceTag: isAr ? "فاتورة ضريبية رسمية (TAX INVOICE)" : "OFFICIAL TAX INVOICE",
    dateIssued: isAr ? "تاريخ الإصدار:" : isTr ? "Düzenleme Tarihi:" : isFr ? "Date d'émission :" : "Issue Date:",

    customerTitle: isAr ? "اسم العميل (CUSTOMER)" : isTr ? "MÜŞTERİ ADI (CUSTOMER)" : isFr ? "NOM DU CLIENT (CUSTOMER)" : "CUSTOMER NAME",
    emailTitle: isAr ? "البريد الإلكتروني" : isTr ? "E-posta" : isFr ? "E-mail" : "Email",
    phoneTitle: isAr ? "رقم الهاتف / الواتساب" : isTr ? "Telefon / WhatsApp" : isFr ? "Téléphone / WhatsApp" : "Phone / WhatsApp",

    badgeFlightConfirmed: isAr ? "تذكرة طيران مؤكدة" : isTr ? "Onaylı Uçak Bileti" : isFr ? "Billet d'avion confirmé" : "Confirmed Flight Ticket",
    badgeHotelConfirmed: isAr ? "حجز إقامة معتمد" : isTr ? "Onaylı Otel Rezervasyonu" : isFr ? "Réservation d'hôtel confirmée" : "Confirmed Accommodation",

    bookingRefLabel: isAr ? "رمز الحجز:" : isTr ? "Rezervasyon Kodu:" : isFr ? "Réf. Réservation :" : "Booking Ref:",
    paymentMethodLabel: isAr ? "طريقة الدفع:" : isTr ? "Ödeme Yöntemi:" : isFr ? "Mode de Paiement :" : "Payment Method:",
    transactionStatusLabel: isAr ? "حالة المعاملة:" : isTr ? "İşlem Durumu:" : isFr ? "Statut :" : "Status:",
    fullyPaidStatus: isAr ? "مسدد ومقبول بالكامل" : isTr ? "Tam Ödendi & Kabul Edildi" : isFr ? "Intégralement payé & validé" : "Fully Paid & Accepted",

    basePriceLabel: isAr ? "السعر الأساسي للخدمة:" : isTr ? "Temel Hizmet Fiyatı:" : isFr ? "Prix de base du service :" : "Base Service Price:",
    couponDiscountLabel: isAr ? "خصم الكوبون" : isTr ? "Kupon İndirimi" : isFr ? "Remise Coupon" : "Coupon Discount",
    totalPaidLabel: isAr ? "المبلغ الكلي المدفوع:" : isTr ? "Ödenen Toplam Tutar:" : isFr ? "Montant Total Payé :" : "Total Amount Paid:",

    verifiedQrTitle: isAr ? "كود التوثيق المالي المشفر (Verified QR)" : isTr ? "Şifreli Finansal Doğrulama Kodu (Doğrulanmış QR)" : isFr ? "Code QR de Vérification Cryptographique" : "Cryptographic Verified QR Code",
    verifiedQrDesc: isAr
      ? "امسح الكود بكاميرا الهاتف للتحقق الفوري من صحة الفاتورة دون الحاجة لتسجيل الدخول، برابط فريد وموقع مشفر يثبت صحة المعاملة."
      : isTr
        ? "Giriş yapmadan faturanın geçerliliğini doğrulamak için telefon kameranızla tarayın. Benzersiz ve şifreli bağlantı işlemi onaylar."
        : isFr
          ? "Scannez avec l'appareil photo pour vérifier l'authenticité de la facture sans connexion, via un lien chiffré unique."
          : "Scan with your phone camera to instantly verify invoice authenticity without logging in, with a tamper-proof encrypted URL.",

    openOfficialPage: isAr ? "فتح صفحة الفاتورة الرسمية" : isTr ? "Resmi Fatura Sayfasını Aç" : isFr ? "Ouvrir la page officielle" : "Open Official Invoice Page",
    sendToWhatsAppDirect: isAr ? "إرسال مباشر للواتساب" : isTr ? "Doğrudan WhatsApp'a Gönder" : isFr ? "Partager sur WhatsApp" : "Direct WhatsApp Share",

    officialSeal: isAr
      ? "هذه الفاتورة وثيقة رسمية مشفرة ومعتمدة صادرة عن شركة لوناليزا للسياحة والسفر المحدودة."
      : isTr
        ? "Bu fatura, Lonaliza Turizm ve Seyahat Ltd. Şti. tarafından düzenlenen resmi ve şifreli bir belgedir."
        : isFr
          ? "Cette facture est un document officiel chiffré et agréé émis par Lonaliza Tourism & Travel LLC."
          : "This invoice is an official encrypted and verified document issued by Lonaliza Tourism & Travel LLC.",
    loadingData: isAr
      ? "جارٍ تحميل سجل المدفوعات ولوحة الإحصاءات..."
      : isTr
        ? "Ödeme geçmişi ve istatistik paneli yükleniyor..."
        : isFr
          ? "Chargement du grand livre des paiements et des statistiques..."
          : "Loading payment ledger and financial analytics...",
  };

  const formatPrice = (amount: number, source = "USD") => {
    const n = convert(amount, source || "USD");
    return `${currency.symbol}${n.toLocaleString(locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getServiceBadge = (type: PaymentLedgerItem["serviceType"]) => {
    switch (type) {
      case "flight":
        return {
          label: isAr ? "حجز طيران" : isTr ? "Uçak Bileti" : isFr ? "Vol" : "Flight",
          icon: <Plane size={13} />,
          color: "bg-purple-100 text-purple-900 border-purple-200",
        };
      case "hotel":
        return {
          label: isAr ? "حجز فندقي" : isTr ? "Otel Rezervasyonu" : isFr ? "Hôtel" : "Hotel",
          icon: <Hotel size={13} />,
          color: "bg-blue-50 text-blue-900 border-blue-200",
        };
      case "car":
        return {
          label: isAr ? "تأجير سيارة" : isTr ? "Araç Kiralama" : isFr ? "Location de voiture" : "Car Rental",
          icon: <Car size={13} />,
          color: "bg-amber-50 text-amber-900 border-amber-300",
        };
      case "transfer":
        return {
          label: isAr ? "ترانسفير VIP" : isTr ? "VIP Transfer" : isFr ? "Transfert VIP" : "VIP Transfer",
          icon: <Bus size={13} />,
          color: "bg-emerald-50 text-emerald-900 border-emerald-200",
        };
      case "tour":
      case "package":
        return {
          label: isAr ? "برنامج سياحي" : isTr ? "Tur Paketi" : isFr ? "Circuit Touristique" : "Tour Package",
          icon: <MapPin size={13} />,
          color: "bg-indigo-50 text-indigo-900 border-indigo-200",
        };
      default:
        return {
          label: isAr ? "خدمة سفر" : isTr ? "Seyahat Hizmeti" : isFr ? "Service de Voyage" : "Travel Service",
          icon: <FileText size={13} />,
          color: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  const getPaymentMethodLabel = (method: PaymentLedgerItem["paymentMethod"]) => {
    switch (method) {
      case "card":
        return { label: isAr ? "بطاقة بنكية" : isTr ? "Banka/Kredi Kartı" : isFr ? "Carte Bancaire" : "Bank Card", icon: "💳" };
      case "binance_usdt":
        return { label: "USDT (Binance)", icon: "⚡" };
      case "wallet":
        return { label: isAr ? "رصيد المحفظة" : isTr ? "Cüzdan Bakiyesi" : isFr ? "Solde Portefeuille" : "Wallet Balance", icon: "👛" };
      case "whatsapp":
        return { label: isAr ? "تحويل مباشر" : isTr ? "Doğrudan Havale" : isFr ? "Virement Direct" : "Direct Transfer", icon: "💬" };
      default:
        return { label: isAr ? "إلكتروني" : isTr ? "Elektronik" : isFr ? "Électronique" : "Electronic", icon: "💳" };
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (serviceFilter !== "all" && p.serviceType !== serviceFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesInv = p.invoiceNumber.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesPnr = p.pnr.toLowerCase().includes(q);
        const matchesVoucher = p.voucherCode.toLowerCase().includes(q);
        if (!matchesInv && !matchesTitle && !matchesPnr && !matchesVoucher) return false;
      }
      return true;
    });
  }, [payments, serviceFilter, statusFilter, searchQuery]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, currentPage]);

  // Load official invoice with cryptographic QR code
  const openInvoiceModal = async (item: PaymentLedgerItem) => {
    setSelectedInvoice(item);
    setLoadingInvoice(true);
    setDispatchStatus("");
    try {
      const res = await fetch(`/api/account/invoices/${item.bookingId}`);
      const data = await res.json();
      setInvoiceDetails(data);
    } catch {
      /* ignore */
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Dispatch invoice to WhatsApp & Email
  const handleSendInvoice = async () => {
    if (!selectedInvoice) return;
    setIsDispatching(true);
    setDispatchStatus("");
    try {
      const res = await fetch("/api/account/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: selectedInvoice.bookingId, channel: "both" }),
      });
      const data = await res.json();
      if (data.ok) {
        setDispatchStatus(pI18n.sendSuccess);
      } else {
        setDispatchStatus(pI18n.sendPending);
      }
    } catch {
      setDispatchStatus(pI18n.sendFailed);
    } finally {
      setIsDispatching(false);
    }
  };

  // Export CSV
  const exportPaymentsToCsv = () => {
    const headers = isAr
      ? [
          "رقم الفاتورة",
          "رقم الحجز المرجعي",
          "نوع الخدمة",
          "البيان / المسار",
          "رمز PNR",
          "التاريخ والوقت",
          "وسيلة الدفع",
          "كود الخصم",
          "قيمة الخصم",
          "المبلغ الصافي",
          "العملة",
          "حالة المعاملة",
        ]
      : [
          "Invoice Number",
          "Booking Reference",
          "Service Type",
          "Description",
          "PNR Code",
          "Date & Time",
          "Payment Method",
          "Discount Code",
          "Discount Amount",
          "Net Amount",
          "Currency",
          "Status",
        ];

    const rows = filteredPayments.map((p) => [
      `"${p.invoiceNumber}"`,
      `"${p.bookingId}"`,
      `"${p.serviceType}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.pnr}"`,
      `"${p.date}"`,
      `"${getPaymentMethodLabel(p.paymentMethod).label}"`,
      `"${p.voucherCode || "-"}"`,
      `"${p.discountAmount}"`,
      `"${p.amount}"`,
      `"${p.currency}"`,
      `"${p.status === "paid" ? pI18n.badgePaid : p.status === "refunded" ? pI18n.badgeRefunded : pI18n.badgePending}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lonaliza-payments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-md">
        <Loader2 className="mx-auto animate-spin text-[#280e46]" size={32} />
        <p className="mt-3 text-xs font-bold text-slate-600">{pI18n.loadingData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. FINANCIAL KPI DASHBOARD (4 STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Paid */}
        <div className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-[#1c0836] via-[#260d49] to-[#120524] p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">{pI18n.totalPaidTitle}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <CreditCard size={18} />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl sm:text-3xl font-black text-amber-300">
            {formatPrice(stats.totalPaid, stats.currency)}
          </p>
          <p className="mt-1 text-[11px] text-purple-200/80">{pI18n.totalPaidSub}</p>
        </div>

        {/* Successful Transactions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{pI18n.completedTitle}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl sm:text-3xl font-black text-slate-900">
            {stats.completedCount} <span className="text-sm font-sans font-bold text-slate-500">{pI18n.completedUnit}</span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">{pI18n.completedSub}</p>
        </div>

        {/* Discounts & Vouchers Total */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{pI18n.discountsTitle}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-900">
              <Tag size={18} />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl sm:text-3xl font-black text-[#18082e]">
            {formatPrice(stats.discountsTotal, stats.currency)}
          </p>
          <p className="mt-1 text-[11px] text-purple-700 font-medium">{pI18n.discountsSub}</p>
        </div>

        {/* Refunded Total */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{pI18n.refundedTitle}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <RotateCcw size={18} />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl sm:text-3xl font-black text-rose-600">
            {formatPrice(stats.refundedTotal, stats.currency)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">{pI18n.refundedSub}</p>
        </div>
      </div>

      {/* 2. FILTERS, SEARCH & CSV EXPORT TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={pI18n.searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 ps-10 pe-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-amber-400 focus:bg-white focus:ring-1 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">{pI18n.allServices}</option>
            <option value="flight">{pI18n.svcFlight}</option>
            <option value="hotel">{pI18n.svcHotel}</option>
            <option value="car">{pI18n.svcCar}</option>
            <option value="transfer">{pI18n.svcTransfer}</option>
            <option value="tour">{pI18n.svcTour}</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">{pI18n.allStatuses}</option>
            <option value="paid">{pI18n.statusPaid}</option>
            <option value="refunded">{pI18n.statusRefunded}</option>
            <option value="pending">{pI18n.statusPending}</option>
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportPaymentsToCsv}
            disabled={filteredPayments.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-700" />
            <span>{pI18n.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* 3. PROFESSIONAL PAYMENTS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
        <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/40 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#280e46] text-amber-300 shadow-sm">
              <Receipt size={15} />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">{pI18n.tableTitle}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{pI18n.tableSub}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 border border-purple-200 rounded-xl px-2.5 py-1">
            {filteredPayments.length} {pI18n.transactionCount}
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertCircle size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">{pI18n.emptySearchTitle}</p>
            <p className="text-xs text-slate-400">{pI18n.emptySearchSub}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colInvoice}</th>
                  <th className="p-4 text-start">{pI18n.colService}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colPnr}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colDate}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colMethod}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colDiscounts}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colAmount}</th>
                  <th className="p-4 text-start whitespace-nowrap">{pI18n.colStatus}</th>
                  <th className="p-4 text-center whitespace-nowrap">{pI18n.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {paginatedPayments.map((p) => {
                  const sInfo = getServiceBadge(p.serviceType);
                  const mInfo = getPaymentMethodLabel(p.paymentMethod);
                  return (
                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                      {/* Invoice # */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-black text-[#18082e] text-xs bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
                          {p.invoiceNumber}
                        </span>
                      </td>

                      {/* Service & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border", sInfo.color)}>
                            {sInfo.icon}
                            <span>{sInfo.label}</span>
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">{p.title}</p>
                      </td>

                      {/* PNR */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-amber-950 bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5">
                          {p.pnr}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          <Calendar size={12} className="text-purple-700" />
                          <span>{p.date ? p.date.slice(0, 10) : "2026-09-02"}</span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span>{mInfo.icon}</span>
                          <span>{mInfo.label}</span>
                        </div>
                      </td>

                      {/* Voucher & Discounts */}
                      <td className="p-4 whitespace-nowrap">
                        {p.discountAmount > 0 ? (
                          <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            -{formatPrice(p.discountAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="p-4 whitespace-nowrap font-mono font-black text-slate-900 text-sm">
                        {formatPrice(p.amount, p.currency)}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {p.status === "paid" ? (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[11px]">
                            {pI18n.badgePaid}
                          </Badge>
                        ) : p.status === "refunded" ? (
                          <Badge className="bg-rose-50 text-rose-800 border-rose-200 font-bold text-[11px]">
                            {pI18n.badgeRefunded}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-[11px]">
                            {pI18n.badgePending}
                          </Badge>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => openInvoiceModal(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] hover:bg-[#391563] text-amber-300 px-3.5 py-2 text-xs font-bold border border-amber-400/30 shadow-sm transition-all cursor-pointer"
                        >
                          <Receipt size={13} />
                          <span>{pI18n.btnViewInvoice}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. PAGINATION (10 ITEMS PER PAGE) */}
      {filteredPayments.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
          <p className="text-xs font-bold text-slate-500">
            {pI18n.paginationShowing}{" "}
            <span className="text-slate-900 font-mono font-black">
              {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredPayments.length)}
            </span>{" "}
            {pI18n.paginationOf} <span className="text-purple-950 font-mono font-black">{filteredPayments.length}</span> {pI18n.transactionCount}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              <span>{pI18n.btnPrev}</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-mono font-black transition-all cursor-pointer",
                  currentPage === num
                    ? "bg-[#280e46] text-amber-300 shadow-md border border-amber-400/40"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-purple-50"
                )}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <span>{pI18n.btnNext}</span>
              {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL FULL-FEATURED INVOICE MODAL WITH VERIFIED QR CODE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Top Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-900 font-bold">
                  <Receipt size={18} />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{pI18n.modalTitle}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {pI18n.modalInvPrefix} {selectedInvoice.invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  disabled={isDispatching}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDispatching ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>{pI18n.btnSendWA}</span>
                </button>

                {/* Direct PDF Download */}
                <a
                  href={`/api/account/invoices/${selectedInvoice.bookingId}/pdf?lang=${locale}`}
                  download
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-[#18082e] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>{pI18n.btnDownloadPdf}</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#280e46] hover:bg-[#391563] px-3.5 py-2 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>{pI18n.btnPrint}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {pI18n.btnClose}
                </button>
              </div>
            </div>

            {/* Notification alert on send */}
            {dispatchStatus && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{dispatchStatus}</span>
              </div>
            )}

            {/* Official Printable Invoice Canvas */}
            <div id="printable-official-invoice" className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 space-y-6 text-xs">
              {/* Company Header & Brand info */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18082e] text-amber-300 font-black text-lg shadow-sm">
                      LL
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#18082e]">{pI18n.companyName}</h2>
                      <p className="text-[11px] font-bold text-slate-500 font-mono">LONALIZA TOURISM & TRAVEL LLC</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                    <p className="font-semibold">TÜRSAB Belge No: 14892 · IATA Agency: 42-2 9821</p>
                    <p>VKN: 6090871234 / Vergi Dairesi: Beyoğlu, Istanbul, Turkey</p>
                    <p>Tel: +90 501 570 9201 · Email: support@lonaliza.com</p>
                  </div>
                </div>

                <div className="text-start sm:text-end space-y-1">
                  <div className="inline-block bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-lg text-purple-950 font-bold text-[11px]">
                    {pI18n.taxInvoiceTag}
                  </div>
                  <p className="font-mono text-sm font-black text-purple-950 mt-1">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {pI18n.dateIssued} {selectedInvoice.date?.slice(0, 10)}
                  </p>
                  <p className="text-[11px] text-amber-900 font-mono font-bold">
                    PNR: {selectedInvoice.pnr}
                  </p>
                </div>
              </div>

              {/* Billed To / Customer Details */}
              <div className="grid sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{pI18n.customerTitle}</span>
                  <p className="font-black text-slate-900 text-sm mt-0.5">ferdos elhayat</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{pI18n.emailTitle}</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">elhayatferdos@gmail.com</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{pI18n.phoneTitle}</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">+905015709201</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-sm">{selectedInvoice.title}</span>
                  <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg text-[11px]">
                    {selectedInvoice.serviceType === "flight" ? pI18n.badgeFlightConfirmed : pI18n.badgeHotelConfirmed}
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 pt-1 text-slate-600 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">{pI18n.bookingRefLabel}</span>
                    <span className="font-mono font-bold text-slate-900">{selectedInvoice.pnr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{pI18n.paymentMethodLabel}</span>
                    <span className="font-bold text-slate-900">
                      {getPaymentMethodLabel(selectedInvoice.paymentMethod).label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{pI18n.transactionStatusLabel}</span>
                    <span className="font-bold text-emerald-700">{pI18n.fullyPaidStatus}</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown & Live QR Code */}
              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>{pI18n.basePriceLabel}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatPrice(selectedInvoice.amount + (selectedInvoice.discountAmount || 0))}
                    </span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{pI18n.couponDiscountLabel} ({selectedInvoice.voucherCode || "-"}):</span>
                      <span className="font-mono">-{formatPrice(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>{pI18n.totalPaidLabel}</span>
                    <span className="font-mono text-base text-[#18082e]">
                      {formatPrice(selectedInvoice.amount, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>

                {/* Scannable Verification Link & QR Info */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border border-purple-300 shadow-sm p-1.5">
                    {invoiceDetails?.invoice?.qrCodeDataUrl || invoiceDetails?.invoice?.qrCodeDataUri ? (
                      <img
                        src={invoiceDetails.invoice.qrCodeDataUrl || invoiceDetails.invoice.qrCodeDataUri}
                        alt="Official Verification QR Code"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=18-8-46&data=${encodeURIComponent(
                          `https://lonaliza.com/invoice/verify?id=${selectedInvoice.bookingId}&inv=${selectedInvoice.invoiceNumber}`
                        )}`}
                        alt="Verification QR"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-start flex-1">
                    <p className="font-black text-purple-950 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>{pI18n.verifiedQrTitle}</span>
                    </p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {pI18n.verifiedQrDesc}
                    </p>
                    {invoiceDetails?.invoice?.verifyUrl && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        <a
                          href={invoiceDetails.invoice.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-900 bg-white border border-purple-300 hover:bg-purple-100 rounded-lg px-2.5 py-1 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>{pI18n.openOfficialPage}</span>
                        </a>
                        <a
                          href={`https://wa.me/905015709201?text=${encodeURIComponent(
                            `🧾 ${selectedInvoice.invoiceNumber}\n${invoiceDetails.invoice.verifyUrl}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 hover:bg-emerald-200 rounded-lg px-2.5 py-1 transition-colors"
                        >
                          <MessageCircle size={12} />
                          <span>{pI18n.sendToWhatsAppDirect}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Seal Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400">
                <p>{pI18n.officialSeal}</p>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck size={14} />
                  <span>SEAL OF AUTHENTICITY · VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
