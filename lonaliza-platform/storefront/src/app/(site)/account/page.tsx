"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Copy,
  Loader2,
  MessageCircle,
  Share2,
  UserRound,
  Wallet,
  Coins,
  Download,
  Check,
  Camera,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  Sparkles,
  DollarSign,
  Ticket,
  Clock,
  TrendingUp,
  Gift,
  ExternalLink,
  Award,
  Plane,
  HeartCrack,
  AlertTriangle,
  Trash2,
  FileText,
  MapPin,
  Calendar,
  Heart,
  Bot,
  ArrowRight,
} from "lucide-react";
import AccountBookings from "@/components/account/AccountBookings";
import AccountReviews from "@/components/account/AccountReviews";
import AccountPayments from "@/components/account/AccountPayments";
import AccountOverview from "@/components/account/AccountOverview";
import AccountShell, { isAccountTab, type AccountTab } from "@/components/account/AccountShell";
import LonalizaAccountFeatures from "@/components/account/LonalizaAccountFeatures";
import CustomerTiersSection from "@/components/account/CustomerTiersSection";
import SocialProfileSection from "@/components/account/SocialProfileSection";
import { isClientAppMode } from "@/lib/mobile/app-mode";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import TermsModal from "@/components/auth/TermsModal";
import EmptyStateCard from "@/components/chrome/EmptyStateCard";

function money(n: number) {
  return `$${Math.round((Number(n) || 0) * 100) / 100}`;
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-md shadow-purple-950/5 min-w-0 max-w-full overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  subtitle,
}: {
  label: string;
  value: string;
  accent?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-4 sm:p-5 shadow-sm transition-all min-w-0 max-w-full overflow-hidden",
        accent
          ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 text-slate-900 shadow-md ring-1 ring-amber-400/40"
          : "border border-slate-200 bg-white text-slate-900 hover:border-purple-300 hover:shadow-md"
      )}
    >
      <p className="text-xs font-bold text-slate-600 truncate">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 font-mono truncate">{value}</p>
      {subtitle ? <p className="mt-1 text-[11px] font-semibold text-slate-500 truncate">{subtitle}</p> : null}
    </div>
  );
}

function AccountDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, openAuth } = useCustomerAuth();
  const { t, locale } = useLocale();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<AccountTab>(isAccountTab(tabParam) ? tabParam : "overview");

  // Summary State for Account Header
  const [profileSummary, setProfileSummary] = useState<{
    name: string;
    email: string;
    avatarUrl: string;
    phone: string;
    walletBalance: number;
    loyaltyPoints: number;
    activeBookingsCount: number;
    tierBadge: string;
  }>({
    name: "",
    email: "",
    avatarUrl: "",
    phone: "",
    walletBalance: 0,
    loyaltyPoints: 0,
    activeBookingsCount: 0,
    tierBadge: "🥉",
  });

  const [loadingSummary, setLoadingSummary] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      const [profRes, bookRes, loyRes] = await Promise.all([
        fetch("/api/account/profile", { cache: "no-store" }),
        fetch("/api/account/bookings", { cache: "no-store" }),
        fetch("/api/account/loyalty", { cache: "no-store" }),
      ]);

      const prof = await profRes.json();
      const books = await bookRes.json();
      const loy = await loyRes.json();

      const activeCount = Array.isArray(books?.bookings)
        ? books.bookings.filter((b: any) => b.status === "paid" || b.status === "confirmed").length
        : 0;

      const points = Number(loy?.points) || 0;
      let badge = "🥉";
      if (points >= 15000) badge = "👑";
      else if (points >= 5000) badge = "💎";
      else if (points >= 2000) badge = "🥇";
      else if (points >= 500) badge = "🥈";

      const p = prof?.profile || prof?.customer || {};
      setProfileSummary({
        name: p.name || "",
        email: p.email || "",
        avatarUrl: p.avatarUrl || "",
        phone: p.phone || "",
        walletBalance: Number(loy?.usd) || 0,
        loyaltyPoints: points,
        activeBookingsCount: activeCount,
        tierBadge: badge,
      });
    } catch {
      // ignore
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadSummary();
    }
  }, [user, loadSummary]);

  useEffect(() => {
    if (tabParam && isAccountTab(tabParam) && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam, tab]);

  const handleTabChange = (nextTab: AccountTab) => {
    setTab(nextTab);
    const p = new URLSearchParams(params.toString());
    p.set("tab", nextTab);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isApp =
    params?.get("app") === "1" ||
    params?.get("view_mode") === "app" ||
    isClientAppMode();

  if (!user) {
    return (
      <div className={`mx-auto max-w-lg px-4 ${isApp ? "lonaliza-safe-top pt-6 pb-24" : "py-24"}`}>
        {/* Luxury Login Card */}
        <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-b from-white to-purple-50/40 p-6 sm:p-8 text-center shadow-lg shadow-purple-950/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E1065] to-[#4c1d95] text-amber-400 shadow-md shadow-purple-950/20">
            <UserRound className="h-7 w-7 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t.account.title}</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {t.account.loginNotice || "سجّل دخولك لمتابعة حجوزاتك، كسب نقاط المكافآت، وإدارة رصيد محفظتك"}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2E1065] via-[#3b1277] to-[#2E1065] py-3.5 text-sm font-black text-white shadow-md shadow-purple-950/20 transition-all hover:brightness-110 active:scale-98 cursor-pointer"
            >
              <span>{t.account.loginCta || "تسجيل الدخول"}</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("register")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-purple-200 bg-white py-3 text-sm font-black text-purple-900 transition-all hover:bg-purple-50 active:scale-98 cursor-pointer"
            >
              <span>إنشاء حساب جديد</span>
            </button>
          </div>
        </div>

        {/* In-App Legal & Settings List (Visible to all mobile users) */}
        {isApp && (
          <div className="mt-6 space-y-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-1">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                معلومات وسياسات التطبيق
              </h3>
              <Link
                href="/privacy"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50 transition-colors"
              >
                <span>سياسة الخصوصية وحماية البيانات</span>
                <span className="text-slate-400 text-[10px]">←</span>
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50 transition-colors"
              >
                <span>شروط الاستخدام والأحكام</span>
                <span className="text-slate-400 text-[10px]">←</span>
              </Link>
              <Link
                href="/gdpr"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50 transition-colors"
              >
                <span>حقوق الخصوصية الأوروبية (GDPR)</span>
                <span className="text-slate-400 text-[10px]">←</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50 transition-colors"
              >
                <span>خدمة العملاء والدعم الفني 24/7</span>
                <span className="text-slate-400 text-[10px]">←</span>
              </Link>
              <div className="pt-2 px-3 flex items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-100">
                <span>إصدار التطبيق</span>
                <span className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">v1.0.0 Enterprise</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AccountShell
      tab={tab}
      onTabChange={handleTabChange}
      userName={profileSummary.name || user?.name || t.account.title}
      userEmail={profileSummary.email || user?.email || ""}
      avatarUrl={profileSummary.avatarUrl}
      tierBadge={profileSummary.tierBadge}
      walletBalance={profileSummary.walletBalance}
      loyaltyPoints={profileSummary.loyaltyPoints}
      activeBookingsCount={profileSummary.activeBookingsCount}
    >
      {tab === "overview" && (
        <AccountOverview
          onTabChange={handleTabChange}
          userName={profileSummary.name || user?.name}
          userEmail={profileSummary.email || user?.email}
          avatarUrl={profileSummary.avatarUrl}
          tierBadge={profileSummary.tierBadge}
          walletBalance={profileSummary.walletBalance}
          loyaltyPoints={profileSummary.loyaltyPoints}
          activeBookingsCount={profileSummary.activeBookingsCount}
        />
      )}
      {tab === "profile" && <ProfileSection onUpdated={loadSummary} />}
      {tab === "whatsapp" && <WhatsAppSection onUpdated={loadSummary} />}
      {tab === "bookings" && <AccountBookings />}
      {tab === "upcoming" && <LonalizaAccountFeatures feature="upcoming" />}
      {tab === "reviews" && <AccountReviews />}
      {tab === "payments" && <AccountPayments />}
      {tab === "cards" && <LonalizaAccountFeatures feature="cards" />}
      {tab === "wallet" && <WalletAndVouchersSection onNavigateTab={handleTabChange} />}
      {tab === "gifts" && <LonalizaAccountFeatures feature="gifts" />}
      {tab === "affiliate" && <AffiliateSection />}
      {tab === "tiers" && (
        <CustomerTiersSection
          userPoints={profileSummary.loyaltyPoints}
          userName={profileSummary.name || user?.name}
        />
      )}
      {tab === "moments" && <LonalizaAccountFeatures feature="moments" />}
      {tab === "buddies" && <LonalizaAccountFeatures feature="buddies" />}
      {tab === "creator" && <LonalizaAccountFeatures feature="creator" />}
      {tab === "social" && (
        <SocialProfileSection
          userName={profileSummary.name || user?.name}
          userEmail={profileSummary.email || user?.email}
          avatarUrl={profileSummary.avatarUrl}
        />
      )}
      {tab === "messages" && <LonalizaAccountFeatures feature="inbox" />}
      {tab === "chats" && <ChatsSection />}
      {tab === "programs" && <ProgramsSection />}
      {tab === "about" && <LonalizaAccountFeatures feature="about" />}
    </AccountShell>
  );
}

/* =========================================================================
   1. PROFILE SECTION (Name, Email, Phone, Avatar Upload, Password Change, GDPR)
   ========================================================================= */
function ProfileSection({ onUpdated }: { onUpdated?: () => void }) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const pText = {
    profileNav: isAr ? "الملف الشخصي والأمان" : isTr ? "Profil ve Güvenlik" : isFr ? "Profil & Sécurité" : "Profile & Security",
    profileSub: isAr
      ? "إدارة وتحديث بياناتك الشخصية وصورة الحساب"
      : isTr
        ? "Kişisel bilgilerinizi ve profil fotoğrafınızı yönetin"
        : isFr
          ? "Gérez vos informations personnelles et photo de profil"
          : "Manage and update your personal details and account photo",
    avatarTitle: isAr ? "الصورة الشخصية" : isTr ? "Profil Fotoğrafı" : isFr ? "Photo de profil" : "Profile Picture",
    avatarHint: isAr
      ? "اختر صورة واضحة بصيغة JPG أو PNG لا يتجاوز حجمها 5 ميجابايت"
      : isTr
        ? "5MB'tan küçük net bir JPG veya PNG fotoğrafı seçin"
        : isFr
          ? "Choisissez une image JPG ou PNG nette de moins de 5 Mo"
          : "Choose a clear JPG or PNG image under 5MB",
    avatarChange: isAr ? "تغيير الصورة الشخصية" : isTr ? "Fotoğrafı Değiştir" : isFr ? "Changer la photo" : "Change Profile Picture",
    avatarUploading: isAr ? "جارٍ الرفع..." : isTr ? "Yükleniyor..." : isFr ? "Téléchargement..." : "Uploading...",
    avatarSuccess: isAr ? "تم تحديث صورتك الشخصية بنجاح" : isTr ? "Profil fotoğrafınız başarıyla güncellendi" : isFr ? "Photo de profil mise à jour avec succès" : "Profile photo updated successfully",
    avatarFailed: isAr ? "فشل رفع الصورة الشخصية" : isTr ? "Fotoğraf yüklenemedi" : isFr ? "Échec du téléchargement" : "Failed to upload photo",
    avatarUploadError: isAr ? "حدث خطأ أثناء رفع الصورة" : isTr ? "Fotoğraf yüklenirken bir hata oluştu" : isFr ? "Erreur lors du téléchargement" : "An error occurred while uploading photo",

    nameLabel: isAr ? "الاسم الكامل" : isTr ? "Ad Soyad" : isFr ? "Nom Complet" : "Full Name",
    emailLabel: isAr ? "البريد الإلكتروني (معرف الحساب)" : isTr ? "E-posta (Hesap Kimliği)" : isFr ? "E-mail (Identifiant)" : "Email (Account ID)",
    phoneLabel: isAr ? "رقم الهاتف المعتمد بالحساب" : isTr ? "Kayıtlı Telefon Numarası" : isFr ? "Numéro de téléphone vérifié" : "Verified Account Phone",
    saveProfileBtn: isAr ? "حفظ تعديلات الملف الشخصي" : isTr ? "Profil Değişikliklerini Kaydet" : isFr ? "Enregistrer les modifications" : "Save Profile Changes",
    profileSavedSuccess: isAr ? "تم حفظ بيانات الملف الشخصي بنجاح" : isTr ? "Profil bilgileri başarıyla kaydedildi" : isFr ? "Profil enregistré avec succès" : "Profile details saved successfully",

    // Password
    securityTitle: isAr ? "أمان الحساب وتغيير كلمة المرور" : isTr ? "Hesap Güvenliği ve Şifre Değiştirme" : isFr ? "Sécurité du Compte & Mot de passe" : "Account Security & Change Password",
    securitySub: isAr
      ? "تحديث كلمة المرور لحماية حجوزاتك وبياناتك المالية"
      : isTr
        ? "Rezervasyonlarınızı ve finansal bilgilerinizi korumak için şifrenizi güncelleyin"
        : isFr
          ? "Mettez à jour votre mot de passe pour protéger vos réservations"
          : "Update your password to safeguard your bookings and financial data",
    currPasswordLabel: isAr ? "كلمة المرور الحالية" : isTr ? "Mevcut Şifre" : isFr ? "Mot de passe actuel" : "Current Password",
    newPasswordLabel: isAr ? "كلمة المرور الجديدة" : isTr ? "Yeni Şifre" : isFr ? "Nouveau mot de passe" : "New Password",
    newPasswordHint: isAr ? "لا تقل عن 8 أحرف" : isTr ? "En az 8 karakter" : isFr ? "Au moins 8 caractères" : "At least 8 characters",
    confPasswordLabel: isAr ? "تأكيد كلمة المرور الجديدة" : isTr ? "Yeni Şifreyi Onayla" : isFr ? "Confirmer le nouveau mot de passe" : "Confirm New Password",
    confPasswordHint: isAr ? "أعد إدخال كلمة المرور" : isTr ? "Şifreyi tekrar girin" : isFr ? "Retapez le mot de passe" : "Re-enter password",
    updatePasswordBtn: isAr ? "تحديث كلمة المرور" : isTr ? "Şifreyi Güncelle" : isFr ? "Mettre à jour le mot de passe" : "Update Password",
    pwdSuccess: isAr ? "تم تغيير كلمة المرور بنجاح وحماية حسابك" : isTr ? "Şifreniz başarıyla değiştirildi ve hesabınız korundu" : isFr ? "Mot de passe modifié avec succès" : "Password changed successfully and your account is secured",
    pwdErrCurrentReq: isAr ? "يرجى إدخال كلمة المرور الحالية" : isTr ? "Lütfen mevcut şifrenizi girin" : isFr ? "Veuillez entrer le mot de passe actuel" : "Please enter your current password",
    pwdErrLength: isAr ? "يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف" : isTr ? "Yeni şifre en az 8 karakter olmalıdır" : isFr ? "Le nouveau mot de passe doit comporter au moins 8 caractères" : "New password must be at least 8 characters",
    pwdErrMatch: isAr ? "كلمة المرور الجديدة وتأكيدها غير متطابقين" : isTr ? "Yeni şifreler birbiriyle eşleşmiyor" : isFr ? "Les nouveaux mots de passe ne correspondent pas" : "New passwords do not match",
    pwdErrInvalidCurrent: isAr ? "كلمة المرور الحالية غير صحيحة" : isTr ? "Mevcut şifre yanlış" : isFr ? "Le mot de passe actuel est incorrect" : "Current password is incorrect",

    // GDPR
    gdprTitle: isAr ? "حماية البيانات واللائحة الأوروبية العامة (GDPR)" : isTr ? "Veri Koruma ve Avrupa Genel Yönetmeliği (GDPR)" : isFr ? "Protection des Données & RGPD" : "Data Protection & GDPR Compliance",
    gdprSub: isAr
      ? "حقوقك القانونية في الوصول للبيانات، تصديرها، أو طلب الحذف والنسيان"
      : isTr
        ? "Verilerinize erişme, dışa aktarma veya silinmesini talep etme haklarınız"
        : isFr
          ? "Vos droits d'accès, d'exportation ou de suppression de données"
          : "Your legal rights to access, export, or permanently delete your data",
    gdprBadge: isAr ? "متوافق مع EU GDPR 2016/679" : isTr ? "EU GDPR 2016/679 Uyumlu" : isFr ? "Conforme RGPD UE 2016/679" : "EU GDPR 2016/679 Compliant",
    gdprDesc: isAr
      ? "نلتزم في منصة لوناليزا (Lonaliza) بأعلى معايير حماية البيانات الإلكترونية واللائحة العامة للاتحاد الأوروبي (GDPR). يحق لك في أي وقت ممارسة حقوقك في الوصول لبياناتك الشخصية، تعديلها، تنزيل نسخة رقمية منها (Data Portability)، أو ممارسة حق المحو والنسيان التام."
      : isTr
        ? "Lonaliza platformunda en yüksek elektronik veri koruma ve AB Genel Veri Koruma Yönetmeliği (GDPR) standartlarına uyuyoruz. Verilerinize erişme, düzeltme, dijital bir kopyasını indirme (Veri Taşınabilirliği) veya tamamen silinme hakkına sahipsiniz."
        : isFr
          ? "Chez Lonaliza, nous adhérons aux normes les plus strictes de protection des données et au RGPD de l'UE. Vous pouvez à tout moment accéder à vos données personnelles, les exporter (portabilité) ou exercer votre droit à l'effacement complet."
          : "At Lonaliza, we adhere to the highest standards of data protection and the EU GDPR. You have the right to access your personal data, export a digital copy (Data Portability), or exercise your right to permanent erasure at any time.",

    gdprExportTitle: isAr ? "تصدير وتنزيل نسخة من بياناتي (المادة 20)" : isTr ? "Verilerimi Dışa Aktar ve İndir (Madde 20)" : isFr ? "Exporter et Télécharger mes données (Art. 20)" : "Export & Download My Data (Art. 20)",
    gdprExportDesc: isAr
      ? "تنزيل ملف رقمي شامل (JSON) يتضمن كافة تفاصيل ملفك الشخصي وسجل حجوزاتك ومراسلاتك المعتمدة."
      : isTr
        ? "Profil bilgilerinizi, rezervasyon geçmişinizi ve onaylanmış kayıtlarınızı içeren kapsamlı bir JSON dosyası indirin."
        : isFr
          ? "Téléchargez un fichier JSON complet comprenant vos données de profil, votre historique de réservations et vos échanges."
          : "Download a comprehensive digital JSON file containing all your profile details, booking history, and verified records.",
    gdprExportBtn: isAr ? "تحميل ملف البيانات الشخصية" : isTr ? "Kişisel Veri Dosyasını İndir" : isFr ? "Télécharger le fichier de données" : "Download Personal Data File",

    gdprPolicyTitle: isAr ? "شروط وسياسة حماية البيانات الأوروبية" : isTr ? "Avrupa Veri Koruma Şartları" : isFr ? "Conditions de Protection des Données" : "European Data Protection Terms",
    gdprPolicyDesc: isAr
      ? "الاطلاع على البنود والشروط المعتمدة لمعالجة بيانات حجوزات الطيران والفنادق ونقل البيانات عبر الحدود."
      : isTr
        ? "Uçuş ve otel rezervasyonu verilerinin işlenmesi ve sınır ötesi veri transferi kurallarını inceleyin."
        : isFr
          ? "Consultez les conditions approuvées pour le traitement des réservations de vols, hôtels et transferts internationaux."
          : "Review the approved terms and conditions for processing flight and hotel reservation data and cross-border transfers.",
    gdprPolicyBtn: isAr ? "قراءة ميثاق GDPR الخاص بنا" : isTr ? "GDPR Şartlarımızı Oku" : isFr ? "Lire notre charte RGPD" : "Read Our GDPR Charter",

    dangerZoneTitle: isAr ? "منطقة الخطر: حذف الحساب نهائياً (الحق في النسيان بموجب GDPR)" : isTr ? "Tehlike Bölgesi: Hesabı Kalıcı Olarak Sil (GDPR Unutulma Hakkı)" : isFr ? "Zone de Danger: Suppression définitive du compte (Droit à l'oubli RGPD)" : "Danger Zone: Permanent Account Deletion (GDPR Right to Erasure)",
    dangerZoneDesc: isAr
      ? "عند حذف حسابك، سيتم إلغاء تفعيل حسابك ومحو بياناتك الشخصية وحذف سجل الولاء ورصيد المحفظة غير المستخدم."
      : isTr
        ? "Hesabınızı sildiğinizde, hesabınız devre dışı bırakılır, kişisel verileriniz, sadakat geçmişiniz ve kullanılmayan cüzdan bakiyeniz kalıcı olarak silinir."
        : isFr
          ? "En supprimant votre compte, vos données personnelles, historique de fidélité et solde de portefeuille non utilisé seront définitivement effacés."
          : "Deleting your account permanently deactivates your profile and erases all personal details, loyalty points, and unused wallet balance.",
    startDeleteBtn: isAr ? "بدء إجراءات حذف الحساب" : isTr ? "Hesap Silme İşlemini Başlat" : isFr ? "Initier la suppression du compte" : "Initiate Account Deletion",

    // Deletion Modal
    delTitle1: isAr ? "سنفتقدك كثيراً في عائلة لوناليزا..." : isTr ? "Lonaliza ailesinde sizi çok özleyeceğiz..." : isFr ? "Vous allez beaucoup nous manquer..." : "We will miss you deeply in the Lonaliza family...",
    delSub1: isAr
      ? "هل أنت متأكد حقاً من مغادرتنا؟ وجودك معنا مهم جداً ويسعدنا دائماً خدمتك!"
      : isTr
        ? "Bizden ayrılmak istediğinizden gerçekten emin misiniz? Varlığınız bizim için çok değerli!"
        : isFr
          ? "Êtes-vous vraiment sûr de vouloir nous quitter ? Votre présence nous est précieuse !"
          : "Are you really sure you want to leave us? Your presence means a lot to us!",
    delWarnTitle: isAr ? "قبل أن تتخذ قرارك، يرجى تذكر ما ستفقده نهائياً:" : isTr ? "Karar vermeden önce kalıcı olarak kaybedeceklerinizi hatırlayın:" : isFr ? "Avant de décider, rappelez-vous de ce que vous perdrez définitivement :" : "Before you decide, please remember what you will permanently lose:",
    delWarn1: isAr ? "رصيد المحفظة ونقاط الولاء التراكمية المتاحة لديك." : isTr ? "Mevcut cüzdan bakiyeniz ve birikmiş sadakat puanlarınız." : isFr ? "Votre solde de portefeuille et points de fidélité accumulés." : "Available wallet balance and accumulated loyalty points.",
    delWarn2: isAr ? "سجل جميع رحلاتك وتذاكرك السابقة وقسائم الفنادق المعتمدة." : isTr ? "Geçmiş tüm seyahatleriniz, biletleriniz ve onaylı otel kuponlarınız." : isFr ? "Historique de tous vos voyages passés, billets et bons d'hôtels." : "History of all past trips, tickets, and confirmed hotel vouchers.",
    delWarn3: isAr ? "شارة العضوية المتميزة ومستوى الخصومات الحصري لك." : isTr ? "Ayrıcalıklı üyelik rozetiniz ve size özel indirim seviyeniz." : isFr ? "Badge de membre exclusif et niveau de réductions réservé." : "Premium membership badge and your exclusive discount tier.",
    delWarn4: isAr ? "أرباح وروابط التسويق بالعمولة (Affiliate Hub)." : isTr ? "Ortaklık (Affiliate) kazançlarınız ve özel bağlantılarınız." : isFr ? "Vos gains et liens d'affiliation (Affiliate Hub)." : "Affiliate marketing earnings and referral links.",
    delHelpTip: isAr ? "💡 إذا كنت تواجه أي صعوبة، فريق الدعم ومستشار السفر الخاص بك جاهز لمساعدتك فوراً!" : isTr ? "💡 Herhangi bir sorun yaşarsanız, destek ekibimiz ve seyahat danışmanınız yardıma hazır!" : isFr ? "💡 En cas de difficulté, notre équipe et votre conseiller voyage sont prêts à vous aider !" : "💡 If you face any issues, our support team and dedicated travel advisor are ready to assist you immediately!",
    stayBtn: isAr ? "البقاء معنا وإلغاء فكرة الحذف ❤️" : isTr ? "Bizimle kalın ve silmekten vazgeçin ❤️" : isFr ? "Rester avec nous et annuler ❤️" : "Stay with us & cancel deletion ❤️",
    proceedDeleteBtn: isAr ? "ما زلت أرغب في حذف الحساب... 😔" : isTr ? "Yine de hesabımı silmek istiyorum... 😔" : isFr ? "Je souhaite toujours supprimer mon compte... 😔" : "I still wish to delete my account... 😔",

    delTitle2: isAr ? "تأكيد حذف الحساب نهائياً" : isTr ? "Kalıcı Silmeyi Onaylayın" : isFr ? "Confirmer la suppression définitive" : "Confirm Permanent Deletion",
    delSub2: isAr ? "هذا الإجراء نهائي ولا يمكن التراجع عنه بموجب GDPR" : isTr ? "Bu işlem nihaidir ve GDPR kapsamında geri alınamaz" : isFr ? "Cette action est irréversible en vertu du RGPD" : "This action is final and irreversible under GDPR",
    delTypePrompt: isAr ? "يرجى كتابة كلمة 'حذف الحساب' أو 'DELETE' للتأكيد:" : isTr ? "Onaylamak için 'DELETE' veya 'SIL' yazın:" : isFr ? "Tapez 'DELETE' ou 'SUPPRIMER' pour confirmer :" : "Please type 'DELETE' to confirm:",
    delReasonPrompt: isAr ? "ما سبب رغبتك في المغادرة؟ (سنعمل جاهدين على تحسين خدماتنا):" : isTr ? "Ayrılma nedeniniz nedir? (Hizmetlerimizi geliştirmek için çalışacağız):" : isFr ? "Pourquoi partez-vous ? (Nous nous efforçons d'améliorer nos services) :" : "What is the reason for leaving? (We will strive to improve our services):",
    delReasonPlaceholder: isAr ? "أخبرنا بما يمكننا تحسينه..." : isTr ? "Neyi geliştirebileceğimizi bize bildirin..." : isFr ? "Dites-nous ce que nous pouvons améliorer..." : "Tell us what we can improve...",
    delConfirmBtn: isAr ? "تأكيد الحذف النهائي لحسابي" : isTr ? "Hesabımı Kalıcı Olarak Sil" : isFr ? "Confirmer la suppression définitive" : "Confirm Permanent Deletion",
    delCancelBtn: isAr ? "تراجع" : isTr ? "Vazgeç" : isFr ? "Annuler" : "Cancel",

    delTitle3: isAr ? "نحن حزينون جداً لفقدانك..." : isTr ? "Ayrıldığınız için çok üzgünüz..." : isFr ? "Nous sommes très tristes de votre départ..." : "We are deeply saddened to see you leave...",
    delSub3: isAr
      ? "كانت رحلتك معنا تجربة نعتز بها كثيراً. ونتمنى عودتك لنا في أقرب وقت. ستكون أبواب لوناليزا مفتوحة لك دائماً وسنكون مسرورين وفخورين جداً بانضمامك لنا مجدداً في أي وقت."
      : isTr
        ? "Bizimle olan yolculuğunuz değer verdiğimiz bir deneyimdi. En kısa sürede geri dönmenizi dileriz. Lonaliza kapıları size her zaman açık olacaktır."
        : isFr
          ? "Votre expérience avec nous a été précieuse. Nous espérons vous revoir très bientôt. Les portes de Lonaliza vous seront toujours ouvertes."
          : "Your journey with us was truly cherished. We hope to welcome you back soon. Lonaliza's doors will always remain open for you.",
    returnHomeBtn: isAr ? "العودة إلى الصفحة الرئيسية للوناليزا" : isTr ? "Lonaliza Ana Sayfasına Dön" : isFr ? "Retour à l'accueil Lonaliza" : "Return to Lonaliza Home",

    stayToastTitle: isAr ? "يسعدنا جداً بقاؤك معنا في عائلة لوناليزا!" : isTr ? "Lonaliza ailesinde kaldığınız için çok mutluyuz!" : isFr ? "Nous sommes ravis que vous restiez dans la famille Lonaliza !" : "We are delighted that you are staying with the Lonaliza family!",
    stayToastSub: isAr ? "رحلتنا معاً مستمرة وسنحرص دائماً على تقديم أفضل تجربة سفر لك." : isTr ? "Birlikte yolculuğumuz devam ediyor, her zaman en iyi seyahat deneyimini sunacağız." : isFr ? "Notre voyage ensemble continue avec les meilleures expériences de voyage." : "Our journey together continues, providing you with premier travel experiences.",
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Change password states
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  // GDPR & Account Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
  const [stayCelebration, setStayCelebration] = useState(false);

  const loadProfile = useCallback(() => {
    void fetch("/api/account/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setName(d.profile.name || "");
          setEmail(d.profile.email || "");
          setPhone(d.profile.phone || "");
          setAvatarUrl(d.profile.avatarUrl || "");
        }
      });
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setErr("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error || pText.avatarFailed);
        return;
      }
      setAvatarUrl(data.avatarUrl);
      setMsg(pText.avatarSuccess);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("customer:profile-updated", {
            detail: { avatarUrl: data.avatarUrl },
          })
        );
      }
      if (onUpdated) onUpdated();
    } catch {
      setErr(pText.avatarUploadError);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(t.account.profileFailed);
        return;
      }
      setMsg(pText.profileSavedSuccess);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("customer:profile-updated", {
            detail: { avatarUrl, name },
          })
        );
      }
      if (onUpdated) onUpdated();
    } catch {
      setErr(t.account.profileFailed);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg("");
    setPwdErr("");

    if (!currPassword) {
      setPwdErr(pText.pwdErrCurrentReq);
      setPwdSaving(false);
      return;
    }
    if (newPassword.length < 8) {
      setPwdErr(pText.pwdErrLength);
      setPwdSaving(false);
      return;
    }
    if (newPassword !== confPassword) {
      setPwdErr(pText.pwdErrMatch);
      setPwdSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currPassword,
          newPassword,
          confirmPassword: confPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "invalid_current_password") {
          setPwdErr(pText.pwdErrInvalidCurrent);
        } else {
          setPwdErr(data.error || pText.pwdErrInvalidCurrent);
        }
        return;
      }
      setPwdMsg(pText.pwdSuccess);
      setCurrPassword("");
      setNewPassword("");
      setConfPassword("");
    } catch {
      setPwdErr(pText.pwdErrInvalidCurrent);
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Basic Profile & Avatar */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{pText.profileNav}</h2>
              <p className="text-xs text-slate-500">{pText.profileSub}</p>
            </div>
          </div>
        </div>

        {/* Avatar change block */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-amber-400/30 shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#250d44] via-[#3a156b] to-[#d97706] text-3xl font-black text-amber-300 ring-4 ring-amber-400/30 shadow-md">
                {(name || "U")[0]?.toUpperCase()}
              </div>
            )}
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title={pText.avatarChange}
            >
              {uploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="text-center sm:text-start flex-1">
            <p className="text-sm font-bold text-slate-900">{pText.avatarTitle}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {pText.avatarHint}
            </p>
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Camera size={14} className="text-amber-600" />
              <span>{uploadingAvatar ? pText.avatarUploading : pText.avatarChange}</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-700">
            {pText.nameLabel}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </label>

          <label className="text-xs font-bold text-slate-700">
            {pText.emailLabel}
            <div className="relative mt-1.5">
              <input
                value={email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-mono text-slate-500 cursor-not-allowed"
              />
              <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400 rtl:right-3.5 rtl:left-auto" />
            </div>
          </label>

          <label className="text-xs font-bold text-slate-700 sm:col-span-2">
            {pText.phoneLabel}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+905015709201"
              dir="ltr"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </label>
        </div>

        {msg ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-900">
            <CheckCircle2 size={16} className="text-amber-600" />
            <span>{msg}</span>
          </div>
        ) : null}

        {err ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => void saveProfile()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#280e46] hover:bg-[#381461] px-6 py-3 text-xs font-bold text-amber-300 border border-amber-400/40 shadow-md transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>{pText.saveProfileBtn}</span>
          </button>
        </div>
      </Card>

      {/* 2. Change Password & Security Card */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{pText.securityTitle}</h2>
              <p className="text-xs text-slate-500">{pText.securitySub}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{pText.currPasswordLabel}</label>
            <input
              type="password"
              value={currPassword}
              onChange={(e) => setCurrPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{pText.newPasswordLabel}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={pText.newPasswordHint}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{pText.confPasswordLabel}</label>
              <input
                type="password"
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
                placeholder={pText.confPasswordHint}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {pwdMsg ? (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-900">
              <CheckCircle2 size={16} className="text-amber-600" />
              <span>{pwdMsg}</span>
            </div>
          ) : null}

          {pwdErr ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              <AlertCircle size={16} />
              <span>{pwdErr}</span>
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pwdSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 px-6 py-3 text-xs font-black text-[#18082e] shadow-md shadow-amber-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {pwdSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>{pText.updatePasswordBtn}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* 3. GDPR Compliance & Data Privacy Rights */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{pText.gdprTitle}</h2>
              <p className="text-xs text-slate-500">{pText.gdprSub}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
            {pText.gdprBadge}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {pText.gdprDesc}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Download size={15} className="text-purple-700" />
                <span>{pText.gdprExportTitle}</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {pText.gdprExportDesc}
              </p>
              <a
                href="/api/account/export"
                download
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-900 transition-colors shadow-sm"
              >
                <Download size={13} />
                <span>{pText.gdprExportBtn}</span>
              </a>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileText size={15} className="text-purple-700" />
                <span>{pText.gdprPolicyTitle}</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {pText.gdprPolicyDesc}
              </p>
              <Link
                href="/gdpr"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors shadow-sm"
              >
                <ExternalLink size={13} />
                <span>{pText.gdprPolicyBtn}</span>
              </Link>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <Trash2 size={16} className="text-rose-600" />
                  <span>{pText.dangerZoneTitle}</span>
                </h4>
                <p className="text-[11px] text-rose-800/80 mt-1 leading-relaxed">
                  {pText.dangerZoneDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteStep(1);
                  setDeleteConfirmText("");
                  setDeleteErr("");
                  setDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{pText.startDeleteBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Celebratory Stay Toast */}
      {stayCelebration && (
        <div className="fixed bottom-6 end-6 z-[350] flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#280e46] to-[#18082e] p-4 text-white shadow-2xl border border-amber-400/40 animate-bounce">
          <span className="text-2xl">❤️🎉</span>
          <div>
            <p className="text-sm font-bold text-amber-300">{pText.stayToastTitle}</p>
            <p className="text-xs text-purple-200/90">{pText.stayToastSub}</p>
          </div>
        </div>
      )}

      {/* Sad Emotional Account Deletion Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-200">
            {deleteStep === 1 && (
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-5xl shadow-inner border border-amber-200/80">
                  🥺💔
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{pText.delTitle1}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {pText.delSub1}
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-4 text-start text-xs space-y-2 text-slate-700">
                  <p className="font-bold text-purple-950 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <span>{pText.delWarnTitle}</span>
                  </p>
                  <ul className="list-disc ps-5 space-y-1 text-slate-600 text-[11px]">
                    <li>{pText.delWarn1}</li>
                    <li>{pText.delWarn2}</li>
                    <li>{pText.delWarn3}</li>
                    <li>{pText.delWarn4}</li>
                  </ul>
                  <p className="text-[11px] text-purple-900 font-semibold pt-1 border-t border-purple-200/60">
                    {pText.delHelpTip}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setStayCelebration(true);
                      setTimeout(() => setStayCelebration(false), 4000);
                    }}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 py-3.5 text-sm font-black text-[#18082e] shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    {pText.stayBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    {pText.proceedDeleteBtn}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{pText.delTitle2}</h3>
                    <p className="text-xs text-slate-500">{pText.delSub2}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {pText.delTypePrompt}
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-rose-500 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {pText.delReasonPrompt}
                  </label>
                  <textarea
                    rows={2}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder={pText.delReasonPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs outline-none focus:border-rose-500"
                  />
                </div>

                {deleteErr && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                    <AlertCircle size={15} />
                    <span>{deleteErr}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={deleteLoading || (deleteConfirmText.trim().toUpperCase() !== "DELETE" && deleteConfirmText.trim() !== "حذف الحساب" && deleteConfirmText.trim().toUpperCase() !== "SIL")}
                    onClick={async () => {
                      const txt = deleteConfirmText.trim().toUpperCase();
                      if (txt !== "DELETE" && txt !== "حذف الحساب" && txt !== "SIL") {
                        setDeleteErr(isAr ? "يرجى كتابة كلمة 'DELETE' للتأكيد" : "Please type 'DELETE' to confirm");
                        return;
                      }
                      setDeleteLoading(true);
                      setDeleteErr("");
                      try {
                        const res = await fetch("/api/account/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ reason: deleteReason }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.ok) {
                          setDeleteErr(data.error || (isAr ? "تعذر إتمام عملية الحذف حالياً" : "Failed to delete account"));
                          return;
                        }
                        setDeleteStep(3);
                      } catch {
                        setDeleteErr(isAr ? "حدث خطأ في الاتصال بالخادم" : "Server connection error");
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                    className="flex-1 rounded-2xl bg-rose-700 hover:bg-rose-800 py-3 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    <span>{pText.delConfirmBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {pText.delCancelBtn}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 3 && (
              <div className="text-center space-y-4 py-3">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-5xl shadow-inner border border-rose-200">
                  😢💔
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{pText.delTitle3}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
                    {pText.delSub3}
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    className="w-full rounded-2xl bg-[#280e46] hover:bg-[#381461] py-3.5 text-xs font-black text-amber-300 shadow-md transition-all cursor-pointer"
                  >
                    {pText.returnHomeBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. WHATSAPP & COMMUNICATIONS HUB (Persistent Checkboxes & OTP)
   ========================================================================= */
function WhatsAppSection({ onUpdated }: { onUpdated?: () => void }) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const waText = {
    prefsSaved: isAr
      ? "تم تحديث تفضيلات الإشعارات وحفظها في الحساب"
      : isTr
        ? "Bildirim tercihleri güncellendi ve hesabınıza kaydedildi"
        : isFr
          ? "Préférences de notification enregistrées avec succès"
          : "Notification preferences updated and saved",
    completeTitle: isAr
      ? `${t.auth.completeProfileTitle} (التحقق بالواتساب OTP)`
      : isTr
        ? `${t.auth.completeProfileTitle} (WhatsApp OTP Doğrulama)`
        : isFr
          ? `${t.auth.completeProfileTitle} (Vérification WhatsApp OTP)`
          : `${t.auth.completeProfileTitle} (WhatsApp OTP Verification)`,
    sendOtpBtn: isAr
      ? "إرسال كود التحقق (WhatsApp OTP)"
      : isTr
        ? "Doğrulama Kodu Gönder (WhatsApp OTP)"
        : isFr
          ? "Envoyer le code OTP WhatsApp"
          : "Send Verification Code (WhatsApp OTP)",
    confirmOtpBtn: isAr
      ? "تأكيد الكود واعتماد الرقم"
      : isTr
        ? "Kodu Onayla ve Numarayı Kaydet"
        : isFr
          ? "Confirmer le code et valider"
          : "Confirm Code & Verify Phone",
    prefsTitle: isAr
      ? "تفضيلات الرسائل والإشعارات المعتمدة:"
      : isTr
        ? "Onaylı Mesaj ve Bildirim Tercihleri:"
        : isFr
          ? "Préférences de messages & notifications :"
          : "Approved Messaging & Notification Preferences:",
  };

  const [phone, setPhone] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [optInOtp, setOptInOtp] = useState(true);
  const [optInBooking, setOptInBooking] = useState(true);
  const [optInMarketing, setOptInMarketing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const loadProfile = useCallback(() => {
    void fetch("/api/account/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setPhone(d.profile.phone || "");
          setNewPhone(d.profile.phone || "");
          setWhatsappConnected(Boolean(d.profile.whatsappConnected));
          setOptInOtp(d.profile.whatsappOptInOtp !== false);
          setOptInBooking(d.profile.whatsappOptInBooking !== false);
          setOptInMarketing(d.profile.whatsappOptInMarketing === true);
        }
      });
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const togglePreference = async (key: "otp" | "booking" | "marketing", value: boolean) => {
    if (key === "otp") setOptInOtp(value);
    if (key === "booking") setOptInBooking(value);
    if (key === "marketing") setOptInMarketing(value);

    try {
      await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappOptInOtp: key === "otp" ? value : optInOtp,
          whatsappOptInBooking: key === "booking" ? value : optInBooking,
          whatsappOptInMarketing: key === "marketing" ? value : optInMarketing,
        }),
      });
      setMsg(waText.prefsSaved);
      setTimeout(() => setMsg(""), 3000);
    } catch {
      // rollback
    }
  };

  const requestPhoneOtp = async () => {
    if (!newPhone.trim()) return;
    const digits = newPhone.replace(/\D/g, "");
    if (digits.length < 8) {
      setErr(t.auth.whatsappRequired);
      return;
    }
    setOtpSending(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: newPhone.trim(),
          phone: newPhone.trim(),
          channel: "whatsapp",
          purpose: "phone_update",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error || t.auth.failed);
        return;
      }
      setOtpStep(true);
    } catch {
      setErr(t.auth.failed);
    } finally {
      setOtpSending(false);
    }
  };

  const confirmPhoneOtp = async () => {
    if (!otpCode.trim()) return;
    setOtpSending(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: newPhone.trim(),
          code: otpCode.trim(),
          purpose: "phone_update",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(t.auth.otpFailed);
        return;
      }

      await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim() }),
      });

      setPhone(newPhone.trim());
      setWhatsappConnected(true);
      setIsEditingPhone(false);
      setOtpStep(false);
      setOtpCode("");
      setMsg(t.account.whatsappConnectedSuccess);
      if (onUpdated) onUpdated();
    } catch {
      setErr(t.auth.otpFailed);
    } finally {
      setOtpSending(false);
    }
  };

  const disconnectWhatsapp = async () => {
    if (!confirm(t.account.whatsappDisconnectConfirm)) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect_whatsapp" }),
      });
      const data = await res.json();
      if (data.ok) {
        setPhone("");
        setNewPhone("");
        setWhatsappConnected(false);
        setIsEditingPhone(false);
        setMsg(t.account.whatsappDisconnectedSuccess);
        if (onUpdated) onUpdated();
      }
    } catch {
      setErr(t.account.profileFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100/60">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30 shadow-md">
            <MessageCircle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.account.whatsappHubTitle}</h3>
            <p className="text-xs text-slate-500">{t.account.whatsappHubSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              whatsappConnected
                ? "bg-amber-100 text-amber-950 border border-amber-300"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                whatsappConnected ? "bg-amber-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {whatsappConnected ? t.account.whatsappStatusConnected : t.account.whatsappStatusDisconnected}
          </span>
        </div>
      </div>

      {msg ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-900">
          <CheckCircle2 size={16} className="text-amber-600" />
          <span>{msg}</span>
        </div>
      ) : null}

      {err ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
          <AlertCircle size={16} />
          <span>{err}</span>
        </div>
      ) : null}

      {/* Current Phone or Edit Form */}
      <div className="mt-5">
        {!isEditingPhone ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/40 border border-purple-100/70">
            <div>
              <p className="text-xs font-bold text-slate-500">{t.account.phone} (WhatsApp)</p>
              <p className="text-base font-black font-mono text-slate-900 mt-0.5" dir="ltr">
                {phone || "—"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPhone(true);
                  setOtpStep(false);
                  setNewPhone(phone);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-purple-200 bg-white text-slate-700 hover:bg-purple-50 transition-all shadow-sm"
              >
                {whatsappConnected ? t.account.whatsappChangeNumber : t.account.whatsappReconnectAction}
              </button>

              {whatsappConnected && (
                <button
                  type="button"
                  onClick={() => void disconnectWhatsapp()}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                >
                  {t.account.whatsappDisconnectAction}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#18082e] border border-purple-400/20 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-amber-300">
                {waText.completeTitle}
              </p>
              <button
                type="button"
                onClick={() => setIsEditingPhone(false)}
                className="text-white/60 hover:text-white text-xs font-bold"
              >
                {t.common.cancel}
              </button>
            </div>

            {!otpStep ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+905015709201"
                  className="flex-1 rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => void requestPhoneOtp()}
                  disabled={otpSending}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 font-black text-xs text-[#18082e] disabled:opacity-60 transition-all shadow-md shadow-amber-500/20"
                >
                  {otpSending ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{waText.sendOtpBtn}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t.auth.otpCode}
                  className="flex-1 rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => void confirmPhoneOtp()}
                  disabled={otpSending}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 font-black text-xs text-[#18082e] disabled:opacity-60 transition-all shadow-md shadow-amber-500/20"
                >
                  {otpSending ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{waText.confirmOtpBtn}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Persistent Notification Preferences */}
        <div className="mt-5 space-y-3 pt-5 border-t border-purple-100/60">
          <p className="text-xs font-bold text-slate-800">{waText.prefsTitle}</p>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <label className="flex items-start gap-2.5 text-slate-700 cursor-pointer p-3 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 transition-colors">
              <input
                type="checkbox"
                checked={optInOtp}
                onChange={(e) => void togglePreference("otp", e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>{t.account.whatsappOptInOtp}</span>
            </label>

            <label className="flex items-start gap-2.5 text-slate-700 cursor-pointer p-3 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 transition-colors">
              <input
                type="checkbox"
                checked={optInBooking}
                onChange={(e) => void togglePreference("booking", e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>{t.account.whatsappOptInBooking}</span>
            </label>

            <label className="flex items-start gap-2.5 text-slate-700 cursor-pointer p-3 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 transition-colors">
              <input
                type="checkbox"
                checked={optInMarketing}
                onChange={(e) => void togglePreference("marketing", e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>{t.account.whatsappOptInMarketing}</span>
            </label>
          </div>
        </div>

        <div className="mt-4 text-end">
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline"
          >
            {t.auth.termsLink}
          </button>
        </div>
      </div>

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </Card>
  );
}

/* =========================================================================
   3. WALLET & VOUCHERS SECTION (Points breakdown, Voucher Generator, USDT Withdraw)
   ========================================================================= */
function WalletAndVouchersSection({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: AccountTab) => void;
}) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const wText = {
    walletTitle: isAr ? "رصيد المحفظة المالي" : isTr ? "Cüzdan Finansal Bakiyesi" : isFr ? "Solde du Portefeuille" : "Wallet Financial Balance",
    walletSub: isAr ? "رصيد نقدي متاح للاستخدام أو السحب" : isTr ? "Kullanılabilir veya çekilebilir nakit bakiye" : isFr ? "Solde disponible pour réservation ou retrait" : "Available cash balance for use or withdrawal",
    loyaltyTitle: isAr ? "إجمالي نقاط الولاء" : isTr ? "Toplam Sadakat Puanı" : isFr ? "Points de Fidélité Totaux" : "Total Loyalty Points",
    pendingTitle: isAr ? "النقاط المعلقة" : isTr ? "Bekleyen Puanlar" : isFr ? "Points en attente" : "Pending Points",
    pendingSub: isAr ? "تُعتمد تلقائياً بعد إتمام الرحلة" : isTr ? "Seyahat tamamlandıktan sonra otomatik onaylanır" : isFr ? "Validés automatiquement après le voyage" : "Auto-approved after trip completion",
    affApprovedTitle: isAr ? "الأرباح المعتمدة (أفلييت)" : isTr ? "Onaylanan Kazançlar (Ortaklık)" : isFr ? "Gains Validés (Affiliation)" : "Approved Earnings (Affiliate)",
    affApprovedSub: isAr ? "من عمولات الإحالة والتسويق" : isTr ? "Tavsiye ve pazarlama komisyonlarından" : isFr ? "Commissions de parrainage et de vente" : "From referral and marketing commissions",

    sourcesTitle: isAr ? "تفصيل مصادر نقاط الولاء والأرباح" : isTr ? "Sadakat Puanı ve Kazanç Kaynakları" : isFr ? "Détail des Sources de Points & Gains" : "Points & Earnings Breakdown",
    sourcesSub: isAr ? "كشف تفصيلي يوضح كيفية حصولك على النقاط" : isTr ? "Puanlarınızı nasıl kazandığınızı gösteren döküm" : isFr ? "Détail de l'obtention de vos points" : "Detailed breakdown of your earned points",
    sourceBooking: isAr ? "مكافآت الحجوزات" : isTr ? "Rezervasyon Ödülleri" : isFr ? "Récompenses Réservations" : "Booking Rewards",
    sourceBookingSub: isAr ? "نقاط مكتسبة من حجوزات الطيران والفنادق السابقة" : isTr ? "Geçmiş uçuş ve otel rezervasyonlarından kazanılan" : isFr ? "Points acquis sur les vols et hôtels précédents" : "Earned from previous flights and hotel bookings",
    sourceAffiliate: isAr ? "عمولات التسويق (أفلييت)" : isTr ? "Ortaklık Komisyonları" : isFr ? "Commissions d'Affiliation" : "Affiliate Commissions",
    sourceAffiliateSub: isAr ? "من إحالة العملاء ومشترياتهم عبر روابطك" : isTr ? "Bağlantılarınızdan yapılan işlemlerden" : isFr ? "Gains sur les réservations de vos filleuls" : "From referral purchases via your custom links",
    sourceSocial: isAr ? "تفاعل مجتمع السوشيال ميديا" : isTr ? "Sosyal Topluluk Etkileşimi" : isFr ? "Communauté Voyage & Social" : "Travel Community Social Perks",
    sourceSocialSub: isAr ? "من نشر الصور والريلز والإعجابات في المجتمع" : isTr ? "Toplulukta fotoğraf, video ve beğeni paylaşımlarından" : isFr ? "Partage de photos, reels et likes dans la communauté" : "From sharing photos, reels, and community likes",

    engineTitle: isAr ? "محرك استبدال النقاط بفوتشرات حجز فورية" : isTr ? "Puanları Anında İndirim Kuponuna Dönüştür" : isFr ? "Convertisseur de Points en Bons de Réduction" : "Instant Points-to-Voucher Engine",
    engineSub: isAr ? "حول نقاطك إلى قسيمة خصم (Booking Voucher) تُخصم مباشرة من قيمة أي حجز طيران أو فندق قادم" : isTr ? "Puanlarınızı bir sonraki uçuş veya otel rezervasyonunuzda doğrudan indirim olarak kullanın" : isFr ? "Convertissez vos points en bon de réduction déductible sur vos prochains vols et hôtels" : "Convert your points into booking vouchers applied instantly to upcoming flights & hotels",
    convertMinPrefix: isAr ? "عدد النقاط المراد تحويلها (الحد الأدنى:" : isTr ? "Dönüştürülecek puan sayısı (Minimum:" : isFr ? "Nombre de points à convertir (Min :" : "Points to convert (Min:",
    convertPointsPlaceholder: isAr ? "أدخل عدد النقاط، مثلاً: 200 أو 500" : isTr ? "Örn: 200 veya 500 puan girin" : isFr ? "Entrez les points, ex: 200 ou 500" : "Enter points, e.g. 200 or 500",
    convertBtn: isAr ? "توليد قسيمة الحجز" : isTr ? "Kupon Oluştur" : isFr ? "Générer le bon" : "Generate Booking Voucher",
    convertSuccessTitle: isAr ? "تهانينا! تم توليد فوتشر الحجز بنجاح:" : isTr ? "Tebrikler! Rezervasyon kuponunuz oluşturuldu:" : isFr ? "Félicitations ! Bon de réservation généré avec succès :" : "Congratulations! Booking voucher generated successfully:",
    voucherValue: isAr ? "القيمة:" : isTr ? "Değer:" : isFr ? "Valeur :" : "Value:",
    voucherValidUntil: isAr ? "صالحة حتى:" : isTr ? "Geçerlilik:" : isFr ? "Valable jusqu'au :" : "Valid until:",
    copied: isAr ? "تم النسخ" : isTr ? "Kopyalandı" : isFr ? "Copié" : "Copied",
    copyCode: isAr ? "نسخ الكود" : isTr ? "Kodu Kopyala" : isFr ? "Copier le code" : "Copy Code",
    activeVouchersTitle: isAr ? "قسائم الحجز الجاهزة للاستخدام في محفظتك:" : isTr ? "Cüzdanınızdaki Kullanıma Hazır Rezervasyon Kuponları:" : isFr ? "Bons de réduction disponibles dans votre portefeuille :" : "Active Booking Vouchers Ready in Your Wallet:",

    binanceNoticeTitle: isAr ? "سحب الأرباح النقدية عبر شبكة USDT (Binance Pay)" : isTr ? "USDT (Binance Pay) ile Nakit Kazanç Çekme" : isFr ? "Retrait des Gains en USDT (Binance Pay)" : "Cash Payouts via USDT (Binance Pay)",
    binanceNoticeDesc: isAr
      ? "يرجى العلم أن سحب الكاش عبر شبكة USDT (Binance Pay) محصور ومخصص حصرياً لأرباح برنامج التسويق بالعمولة (Affiliate Commissions). رصيد المحفظة المالي ونقاط الولاء مخصصة للخصم الفوري واستبدال قسائم الحجز المباشرة."
      : isTr
        ? "USDT (Binance Pay) ile nakit çekim yalnızca Ortaklık (Affiliate) kazançları için geçerlidir. Sadakat puanları ve cüzdan kredisi doğrudan rezervasyon indirimlerinde kullanılır."
        : isFr
          ? "Les retraits en USDT (Binance Pay) sont réservés aux commissions d'affiliation. Les points fidélité et le portefeuille sont dédiés aux réductions directes sur vos réservations."
          : "USDT (Binance Pay) cash withdrawals are exclusively designated for affiliate commissions. Loyalty points and wallet balance are used for instant discounts on bookings.",
    gotoAffiliateBtn: isAr ? "لوحة التسويق وسحب الأرباح" : isTr ? "Ortaklık & Kazanç Paneli" : isFr ? "Tableau Affiliation & Retrait" : "Affiliate & Payout Hub",

    ledgerTitle: isAr ? "سجل المعاملات والنقاط الأخير (Activity Ledger)" : isTr ? "Son İşlem ve Puan Geçmişi" : isFr ? "Historique Récent des Points & Transactions" : "Activity & Points Ledger",
    noLedger: isAr ? "لا توجد حركات سابقة حتى الآن." : isTr ? "Henüz kayıtlı bir hareket bulunmuyor." : isFr ? "Aucune activité pour le moment." : "No transaction history yet.",
    confirmedStatus: isAr ? "مكتمل" : isTr ? "Tamamlandı" : isFr ? "Confirmé" : "Completed",
    pendingStatus: isAr ? "معلق" : isTr ? "Bekliyor" : isFr ? "En attente" : "Pending",
  };

  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Convert points to voucher state
  const [convertPointsInput, setConvertPointsInput] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertErr, setConvertErr] = useState("");
  const [convertSuccess, setConvertSuccess] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState("");

  const reloadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/loyalty/wallet", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/account/affiliate", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([loyalty, aff]) => {
        setLoyaltyData(loyalty);
        setAffiliateData(aff);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const handleConvertPoints = async () => {
    const pts = Number(convertPointsInput);
    if (!pts || pts <= 0) return;
    setConverting(true);
    setConvertErr("");
    setConvertSuccess(null);

    try {
      const res = await fetch("/api/loyalty/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pts }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setConvertErr(data.error || (isAr ? "تعذر تحويل النقاط، يرجى التحقق من الرصيد والحد الأدنى" : "Unable to convert points, please check balance and minimum threshold"));
        return;
      }
      setConvertSuccess(data.voucher);
      setConvertPointsInput("");
      reloadAll();
    } catch {
      setConvertErr(isAr ? "حدث خطأ في الاتصال أثناء إنشاء القسيمة" : "Network error while generating voucher");
    } finally {
      setConverting(false);
    }
  };

  const copyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  if (loading && !loyaltyData) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-amber-500" />
      </Card>
    );
  }

  const points = loyaltyData?.points || 0;
  const ledger = loyaltyData?.ledger || [];
  const activeVouchers = loyaltyData?.vouchers || [];

  // Points breakdown estimation
  const bookingEarns = ledger.filter((l: any) => l.bookingId && l.kind === "earn");
  const socialEarns = ledger.filter((l: any) => l.id?.startsWith("soc") || l.note?.includes("community"));
  const affiliateEarns = ledger.filter((l: any) => l.note?.includes("affiliate") || l.note?.includes("ref"));

  const bookingPointsTotal = bookingEarns.reduce((acc: number, l: any) => acc + (l.points || 0), 0);
  const socialPointsTotal = socialEarns.reduce((acc: number, l: any) => acc + (l.points || 0), 0);
  const affiliatePointsTotal = affiliateEarns.reduce((acc: number, l: any) => acc + (l.points || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Main Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={wText.walletTitle}
          value={money(affiliateData?.wallet?.balance || loyaltyData?.usd || 0)}
          accent
          subtitle={wText.walletSub}
        />
        <StatCard
          label={wText.loyaltyTitle}
          value={Math.round(points).toLocaleString("en-US")}
          subtitle={`≈ $${loyaltyData?.usd || 0} USD`}
        />
        <StatCard
          label={wText.pendingTitle}
          value={Math.round(loyaltyData?.pendingPoints || 0).toLocaleString("en-US")}
          subtitle={wText.pendingSub}
        />
        <StatCard
          label={wText.affApprovedTitle}
          value={money(affiliateData?.wallet?.approved || 0)}
          subtitle={wText.affApprovedSub}
        />
      </div>

      {/* 2. Points Sources Breakdown Card */}
      <Card>
        <h3 className="text-base font-black text-slate-900 mb-1">{wText.sourcesTitle}</h3>
        <p className="text-xs text-slate-500 mb-4">{wText.sourcesSub}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-bold">
              <Plane size={16} />
              <span>{wText.sourceBooking}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {bookingPointsTotal > 0 ? bookingPointsTotal.toLocaleString() : Math.round(points * 0.6).toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{wText.sourceBookingSub}</p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 text-purple-900 text-xs font-bold">
              <Share2 size={16} />
              <span>{wText.sourceAffiliate}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {affiliatePointsTotal > 0 ? affiliatePointsTotal.toLocaleString() : Math.round(points * 0.25).toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{wText.sourceAffiliateSub}</p>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
              <Sparkles size={16} />
              <span>{wText.sourceSocial}</span>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-700 font-mono">
              {socialPointsTotal > 0 ? socialPointsTotal.toLocaleString() : Math.round(points * 0.15).toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{wText.sourceSocialSub}</p>
          </div>
        </div>
      </Card>

      {/* 3. Voucher Generator Card */}
      <Card className="border-amber-300/70 bg-gradient-to-br from-amber-50/50 via-purple-50/20 to-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30 shadow-md">
            <Ticket size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900">{wText.engineTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {wText.engineSub}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {wText.convertMinPrefix} {loyaltyData?.settings?.minConvertPoints || 100} pts):
            </label>
            <div className="relative">
              <input
                type="number"
                min={loyaltyData?.settings?.minConvertPoints || 100}
                max={points}
                value={convertPointsInput}
                onChange={(e) => setConvertPointsInput(e.target.value)}
                placeholder={wText.convertPointsPlaceholder}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-amber-500 outline-none"
              />
              {convertPointsInput && Number(convertPointsInput) > 0 && (
                <span className="absolute left-4 top-3 text-xs font-bold text-amber-600 rtl:right-auto rtl:left-4">
                  ≈ ${Math.round((Number(convertPointsInput) / (loyaltyData?.settings?.pointsPerUsdRedeem || 20)) * 100) / 100} USD
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={converting || !convertPointsInput}
            onClick={handleConvertPoints}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 px-5 py-3 text-xs font-black text-[#18082e] shadow-md shadow-amber-500/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {converting ? <Loader2 size={15} className="animate-spin" /> : <Gift size={15} />}
            <span>{wText.convertBtn}</span>
          </button>
        </div>

        {convertSuccess && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="text-xs font-bold text-amber-950">{wText.convertSuccessTitle}</p>
              <p className="mt-1 text-lg font-black font-mono text-amber-900 tracking-wider">
                {convertSuccess.code}
              </p>
              <p className="text-[11px] text-amber-800">
                {wText.voucherValue} ${convertSuccess.initialUsd} USD · {wText.voucherValidUntil} {convertSuccess.validTo?.slice(0, 10)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyVoucher(convertSuccess.code)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] px-4 py-2 text-xs font-bold text-amber-300 shadow-sm cursor-pointer"
            >
              {copiedCode === convertSuccess.code ? <Check size={14} className="text-amber-400" /> : <Copy size={14} />}
              <span>{copiedCode === convertSuccess.code ? wText.copied : wText.copyCode}</span>
            </button>
          </div>
        )}

        {convertErr && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <AlertCircle size={15} />
            <span>{convertErr}</span>
          </div>
        )}

        {/* Active Vouchers List */}
        {activeVouchers.length > 0 && (
          <div className="mt-6 border-t border-purple-100/70 pt-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">{wText.activeVouchersTitle}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeVouchers.map((v: any) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-3.5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900">{v.code}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                        ${v.remainingUsd} USD
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">{wText.voucherValidUntil} {v.validTo?.slice(0, 10)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyVoucher(v.code)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    title={wText.copyCode}
                  >
                    {copiedCode === v.code ? <Check size={14} className="text-amber-600" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 4. Informative notice: Binance USDT withdrawals are exclusive to Affiliate earnings */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-purple-50/80 border border-purple-200 p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-2 ring-amber-400/30">
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-purple-950">{wText.binanceNoticeTitle}</h4>
              <p className="mt-1 text-xs text-purple-900/80 leading-relaxed max-w-2xl">
                {wText.binanceNoticeDesc}
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("affiliate")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#280e46] hover:bg-[#381461] px-5 py-2.5 text-xs font-bold text-amber-300 border border-amber-400/40 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>{wText.gotoAffiliateBtn}</span>
              <Share2 size={13} />
            </button>
          )}
        </div>
      </Card>

      {/* 5. Financial Ledger Activity History */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-3">{wText.ledgerTitle}</h3>
        {!ledger.length ? (
          <EmptyStateCard title={wText.noLedger} description={isAr ? "ستظهر هنا حركات النقاط والمحفظة بعد أول عملية." : "Wallet and points activity will appear after your first transaction."} />
        ) : (
          <div className="space-y-2.5">
            {ledger.map((row: any) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold ${
                        row.kind === "earn" ? "text-amber-600" : "text-rose-600"
                      }`}
                    >
                      {row.kind === "earn" ? `+${row.points} pts` : `-${row.points || Math.abs(row.usdValue)}`}
                    </span>
                    <span className="text-slate-600 font-semibold">{row.note || row.kind}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {row.createdAt?.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    row.status === "confirmed"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {row.status === "confirmed" ? wText.confirmedStatus : wText.pendingStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* =========================================================================
   4. AFFILIATE SECTION (Referral codes, custom travel service links, stats)
   ========================================================================= */
function AffiliateSection() {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const affText = {
    visitsSub: isAr ? "إجمالي النقرات على روابطك" : isTr ? "Bağlantılarınıza yapılan toplam tıklama" : isFr ? "Total des clics sur vos liens" : "Total clicks on your referral links",
    pendingSub: isAr ? "في انتظار استكمال الرحلة" : isTr ? "Seyahatin tamamlanmasını bekliyor" : isFr ? "En attente de réalisation du voyage" : "Awaiting travel completion",
    approvedSub: isAr ? "أرباح معتمدة جاهزة للسحب" : isTr ? "Çekime hazır onaylanmış kazanç" : isFr ? "Gains approuvés prêts au retrait" : "Approved earnings ready for withdrawal",
    totalWalletSub: isAr ? "الرصيد النقدي الكلي" : isTr ? "Toplam nakit bakiye" : isFr ? "Solde total en espèces" : "Total cash balance",

    withdrawCardTitle: isAr ? "سحب عمولات وأرباح التسويق عبر USDT (Binance Pay)" : isTr ? "USDT (Binance Pay) ile Ortaklık Kazançlarını Çek" : isFr ? "Retrait des Commissions via USDT (Binance Pay)" : "Withdraw Affiliate Commissions via USDT (Binance Pay)",
    withdrawCardSub: isAr ? "تحويل مباشر للأرباح المعتمدة إلى حسابك في بينانس بعد التدقيق" : isTr ? "Onaylanan kazançlarınızı incelemeden sonra doğrudan Binance hesabınıza aktarın" : isFr ? "Virement direct de vos gains validés sur votre compte Binance" : "Direct transfer of approved earnings to your Binance account upon verification",
    exclusiveBadge: isAr ? "حصري لأرباح التسويق بالعمولة" : isTr ? "Ortaklık Kazançlarına Özel" : isFr ? "Exclusif aux commissions d'affiliation" : "Exclusive to Affiliate Earnings",

    availEarningsLabel: isAr ? "الأرباح المعتمدة المتاحة للسحب الفوري:" : isTr ? "Hemen çekilebilir onaylı kazanç:" : isFr ? "Gains validés disponibles au retrait :" : "Approved earnings available for withdrawal:",
    minWithdrawLabel: isAr ? "الحد الأدنى للسحب:" : isTr ? "Minimum çekim:" : isFr ? "Retrait minimum :" : "Minimum withdrawal:",
    binancePayTip: isAr ? "يتم التحويل عبر Binance Pay ID أو عنوان محفظة USDT" : isTr ? "Binance Pay ID veya USDT cüzdan adresi ile gönderilir" : isFr ? "Transfert via Binance Pay ID ou adresse USDT" : "Transferred via Binance Pay ID or USDT wallet address",

    amountLabel: isAr ? "مبلغ السحب المطلوب (USD):" : isTr ? "Talep Edilen Çekim Tutarı (USD):" : isFr ? "Montant demandé (USD) :" : "Requested Withdrawal Amount (USD):",
    withdrawAllBtn: isAr ? "سحب كامل الأرباح المتاحة" : isTr ? "Tümünü Çek" : isFr ? "Tout retirer" : "Withdraw All Available",
    binanceIdLabel: isAr ? "معرف Binance ID أو عنوان محفظة USDT:" : isTr ? "Binance ID veya USDT Cüzdan Adresi:" : isFr ? "Identifiant Binance ID ou adresse USDT :" : "Binance ID or USDT Wallet Address:",
    binanceIdPlaceholder: isAr ? "مثال: Binance Pay ID أو UID" : "e.g. Binance Pay ID or UID",
    confirmWithdrawBtn: isAr ? "تأكيد طلب سحب الأرباح إلى Binance" : isTr ? "Binance'e Çekim Talebini Onayla" : isFr ? "Confirmer la demande de retrait vers Binance" : "Confirm Withdrawal Request to Binance",

    linksTitle: isAr ? t.account.yourLinks : isTr ? "Özel Seyahat Hizmeti Bağlantılarınız" : isFr ? "Vos Liens de Parrainage Personnalisés" : "Your Custom Referral Links",
    linksSub: isAr ? "روابط إحالة مخصصة لكل خدمة سياحية لكسب عمولات فورية" : isTr ? "Anında komisyon kazanmak için her seyahat hizmetine özel bağlantılar" : isFr ? "Liens dédiés par service pour générer des commissions immédiates" : "Dedicated referral links per travel service to earn instant commissions",
  };

  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState("");

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [binanceId, setBinanceId] = useState("");
  const [withdrawSaving, setWithdrawSaving] = useState(false);
  const [withdrawErr, setWithdrawErr] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  useEffect(() => {
    void fetch("/api/account/affiliate", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSaving(true);
    setWithdrawErr("");
    setWithdrawSuccess("");

    const amt = Number(withdrawAmount);
    const approved = Number(data?.wallet?.approved) || 0;
    const minW = data?.settings?.min_withdraw || 100;

    if (!binanceId.trim()) {
      setWithdrawErr(isAr ? "يرجى إدخال معرف Binance ID أو عنوان المحفظة" : "Please enter Binance ID or wallet address");
      setWithdrawSaving(false);
      return;
    }
    if (amt < minW) {
      setWithdrawErr(isAr ? `الحد الأدنى للسحب هو $${minW} USD` : `Minimum withdrawal is $${minW} USD`);
      setWithdrawSaving(false);
      return;
    }
    if (amt > approved) {
      setWithdrawErr(isAr ? `مبلغ السحب ($${amt}) يتجاوز رصيد الأرباح المعتمدة المتاحة للسحب ($${approved})` : `Withdrawal amount ($${amt}) exceeds approved balance ($${approved})`);
      setWithdrawSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          binance_id: binanceId.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.error === "min_withdraw") setWithdrawErr(`Minimum withdrawal is $${json.min} USD`);
        else if (json.error === "insufficient_balance") setWithdrawErr(isAr ? "رصيد الأرباح المعتمدة غير كافٍ لإتمام السحب" : "Insufficient approved earnings balance");
        else setWithdrawErr(json.error || (isAr ? "فشل تسجيل طلب السحب" : "Failed to record withdrawal request"));
        return;
      }
      setWithdrawSuccess(isAr ? "تم تسجيل طلب سحب العمولات بنجاح وسيتم إيداعه في حسابك بعد التدقيق الإداري" : "Commission withdrawal request submitted successfully and will be credited upon audit");
      setWithdrawAmount("");
      void fetch("/api/account/affiliate", { cache: "no-store" })
        .then((r) => r.json())
        .then(setData);
    } catch {
      setWithdrawErr(isAr ? "حدث خطأ أثناء إرسال طلب السحب" : "Error submitting withdrawal request");
    } finally {
      setWithdrawSaving(false);
    }
  };

  const pageLabel: Record<string, string> = {
    home: isAr ? "الصفحة الرئيسية" : isTr ? "Ana Sayfa" : isFr ? "Accueil" : "Home Page",
    flights: isAr ? "حجوزات الطيران" : isTr ? "Uçuş Rezervasyonları" : isFr ? "Réservations de Vols" : "Flight Bookings",
    hotels: isAr ? "حجوزات الفنادق والمنتجعات" : isTr ? "Otel & Tatil Köyü Rezervasyonları" : isFr ? "Réservations d'Hôtels" : "Hotel & Resort Bookings",
    cars: isAr ? "تأجير السيارات الفاخرة" : isTr ? "Lüks Araç Kiralama" : isFr ? "Location de Voitures" : "Car Rentals",
    transfers: isAr ? "الترانسفير والتوصيل VIP" : isTr ? "VIP Transfer Hizmeti" : isFr ? "Transferts VIP" : "VIP Airport Transfers",
    holidays: isAr ? "الباقات والعطلات السياحية" : isTr ? "Tur ve Tatil Paketleri" : isFr ? "Séjours & Vacances" : "Holiday & Vacation Packages",
    vipTours: isAr ? "الجولات السياحية اليومية" : isTr ? "Günübirlik Özel Turlar" : isFr ? "Visites Guidées VIP" : "Daily VIP Excursions",
  };

  if (!data) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-amber-500" />
      </Card>
    );
  }

  const approvedBalance = Number(data.wallet?.approved) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.account.visits} value={String(data.stats?.visits || 0)} subtitle={affText.visitsSub} />
        <StatCard label={t.account.pendingCommission} value={money(data.wallet?.pending || 0)} subtitle={affText.pendingSub} />
        <StatCard label={t.account.approvedEarnings} value={money(data.wallet?.approved || 0)} accent subtitle={affText.approvedSub} />
        <StatCard label={t.account.walletBalance} value={money(data.wallet?.balance || 0)} subtitle={affText.totalWalletSub} />
      </div>

      {/* Referral Code Card */}
      <Card>
        <p className="text-xs font-bold text-slate-500">{t.account.referralCode}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-3xl font-black tracking-widest text-slate-900 font-mono">
            {data.profile?.code}
          </p>
          <button
            type="button"
            onClick={() => void copy(data.profile?.code || "", "code")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#280e46] px-4 py-2 text-xs font-bold text-amber-300 border border-amber-400/40 shadow-sm cursor-pointer"
          >
            {copied === "code" ? <Check size={13} className="text-amber-400" /> : <Copy size={13} />}
            <span>{copied === "code" ? t.account.copied : t.account.copy}</span>
          </button>
        </div>
      </Card>

      {/* Dedicated Binance USDT Withdrawal for Affiliate Commissions */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-1 ring-amber-400/30">
              <DollarSign size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{affText.withdrawCardTitle}</h3>
              <p className="text-xs text-slate-500">{affText.withdrawCardSub}</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
            {affText.exclusiveBadge}
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold">{affText.availEarningsLabel}</p>
            <p className="text-2xl font-black text-[#18082e] font-mono mt-0.5">{money(data.wallet?.approved || 0)}</p>
          </div>
          <div className="text-xs text-amber-900/80 sm:text-end">
            <p>{affText.minWithdrawLabel} <span className="font-bold font-mono">${data.settings?.min_withdraw || 100} USD</span></p>
            <p className="text-[11px] text-slate-500 mt-0.5">{affText.binancePayTip}</p>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">{affText.amountLabel}</label>
                {approvedBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(approvedBalance))}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    {affText.withdrawAllBtn}
                  </button>
                )}
              </div>
              <input
                type="number"
                min={data.settings?.min_withdraw || 100}
                max={approvedBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Min $${data.settings?.min_withdraw || 100}`}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{affText.binanceIdLabel}</label>
              <input
                value={binanceId}
                onChange={(e) => setBinanceId(e.target.value)}
                placeholder={affText.binanceIdPlaceholder}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-mono focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {withdrawSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{withdrawSuccess}</span>
            </div>
          )}

          {withdrawErr && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{withdrawErr}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={withdrawSaving || !withdrawAmount || !binanceId || Number(withdrawAmount) > approvedBalance}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#280e46] hover:bg-[#381461] px-6 py-3 text-xs font-bold text-amber-300 border border-amber-400/40 transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              {withdrawSaving ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
              <span>{affText.confirmWithdrawBtn}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Share Links Card */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-1">{affText.linksTitle}</h3>
        <p className="text-xs text-slate-500 mb-4">{affText.linksSub}</p>
        <div className="space-y-3">
          {(data.links || []).map((link: any) => (
            <div
              key={link.key}
              className="flex flex-col gap-2.5 rounded-2xl bg-purple-50/40 p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between border border-purple-200/80 min-w-0 max-w-full overflow-hidden"
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {pageLabel[link.key] || link.path}
                </p>
                <p className="truncate text-xs font-mono text-purple-700/80 mt-0.5 select-all break-all">{link.url}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void copy(link.url, link.key)}
                  className="rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-50 shadow-sm"
                >
                  {copied === link.key ? t.account.copied : t.account.copy}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(link.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 px-3.5 py-1.5 text-xs font-black text-[#18082e] shadow-sm shadow-amber-500/20"
                >
                  <Share2 size={13} />
                  <span>{t.account.shareWhatsApp}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   5. CHATS SECTION & 6. PROGRAMS SECTION (Redesigned Luxury Interactive Hub)
   ========================================================================= */
const DESTINATION_FALLBACK_IMAGES: Record<string, string> = {
  trabzon: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop&q=80",
  طرابزون: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&auto=format&fit=crop&q=80",
  riyadh: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80",
  الرياض: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&auto=format&fit=crop&q=80",
  istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80",
  اسطنبول: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80",
  إسطنبول: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
  باريس: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
  دبي: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
  antalya: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
  أنطاليا: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
  لندن: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
  bursa: "https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?w=800&auto=format&fit=crop&q=80",
  بورصة: "https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?w=800&auto=format&fit=crop&q=80",
};

function resolveDestinationPhoto(dest?: string, thumb?: string): string {
  if (thumb && thumb.trim().length > 5) return thumb;
  const key = (dest || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(DESTINATION_FALLBACK_IMAGES)) {
    if (key.includes(k.toLowerCase())) return url;
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80";
}

function ChatsSection() {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [items, setItems] = useState<
    Array<{
      id: string;
      title: string;
      preview: string;
      lastReply?: string;
      messageCount?: number;
      updated: string;
      expiresInDays?: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/account/conversations", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteChat(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذه المحادثة من سجلك؟" : "Delete this conversation?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/account/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <Card className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#7C3AED] h-8 w-8" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E0B38] via-[#2E1065] to-[#4C1D95] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-black text-amber-300 border border-amber-300/30">
              <Sparkles size={14} className="text-amber-300" />
              <span>{isAr ? "مستشار السفر الذكي من لوناليزا" : "Lonaliza AI Travel Advisor"}</span>
            </div>
            <h2 className="mt-2.5 text-xl sm:text-2xl font-black text-white">
              {isAr ? "سجل محادثاتي واستشاراتي السياحية" : "My Travel Consultations"}
            </h2>
            <p className="mt-1 text-xs text-purple-200/90 max-w-xl">
              {isAr
                ? "تُحفظ محادثاتك السياحية التفاعلية تلقائياً لمدة 30 يوماً لتتمكن من استكمال التخطيط، طلب العروض، والحجز في أي وقت."
                : "Your interactive travel chats are preserved for 30 days so you can seamlessly continue planning and booking."}
            </p>
          </div>
          <Link
            href="/ai-chat"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-[#1E0B38] hover:bg-amber-300 transition-all shadow-lg hover:scale-102 shrink-0"
          >
            <Sparkles size={16} />
            <span>{isAr ? "بدء استشارة جديدة الآن" : "Start New Travel Chat"}</span>
          </Link>
        </div>
      </div>

      {!items.length ? (
        <Card className="text-center py-16">
          <MessageCircle className="mx-auto text-[#7C3AED]" size={36} />
          <p className="mt-3 text-slate-800 text-base font-bold">{t.account.noChats}</p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? "لم تقم بإجراء أي محادثة سياحية بعد. تواصل مع مستشار السفر الذكي لتخطيط برنامجك القادم مجاناً."
              : "No travel chats recorded yet. Start a consultation with our AI travel advisor to plan your itinerary."}
          </p>
          <Link
            href="/ai-chat"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] hover:bg-[#3B1582] px-6 py-3 text-xs font-black text-amber-300 border border-amber-400/40 transition-all shadow-md"
          >
            <Sparkles size={16} />
            <span>{t.account.chatWithAssistant}</span>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((c) => {
            const daysRemaining = c.expiresInDays || 30;
            return (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm hover:border-[#7C3AED]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div>
                  {/* Top Bar: Title & 30-Day Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED] border border-purple-100 group-hover:bg-[#2E1065] group-hover:text-amber-300 transition-colors">
                        <Bot size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-slate-900 group-hover:text-[#2E1065] transition-colors">
                          {c.title || (isAr ? "استشارة سياحية" : "Travel Consultation")}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 font-mono">
                          {c.updated
                            ? new Date(c.updated).toLocaleDateString(
                                locale === "ar" ? "ar-EG" : "en-GB",
                                { day: "numeric", month: "long", year: "numeric" }
                              )
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* 30-Day Retention Badge */}
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-800 border border-amber-200">
                      <Clock size={11} className="text-amber-600" />
                      <span>{isAr ? `متبقي ${daysRemaining} يوماً` : `${daysRemaining}d retention`}</span>
                    </span>
                  </div>

                  {/* Preview Snippet */}
                  <div className="mt-4 rounded-2xl bg-purple-50/50 p-3.5 border border-purple-100/60 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                      <span className="shrink-0 font-black text-[#7C3AED]">{isAr ? "طلبك:" : "Query:"}</span>
                      <p className="line-clamp-2">{c.preview || (isAr ? "استفسار عن أسعار الفنادق والجولات السياحية" : "Travel inquiry")}</p>
                    </div>
                    {c.lastReply && (
                      <div className="flex items-start gap-2 text-xs text-slate-500 font-normal leading-relaxed pt-1.5 border-t border-purple-100/50">
                        <span className="shrink-0 font-black text-amber-700">{isAr ? "المستشار:" : "Advisor:"}</span>
                        <p className="line-clamp-1">{c.lastReply}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                    <MessageCircle size={13} className="text-[#7C3AED]" />
                    <span>{c.messageCount ? `${c.messageCount} ${isAr ? "رسائل" : "messages"}` : (isAr ? "محادثة نشطة" : "Active")}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => void handleDeleteChat(c.id, e)}
                      disabled={deletingId === c.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title={isAr ? "حذف المحادثة" : "Delete Chat"}
                    >
                      {deletingId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>

                    <Link
                      href={`/account/chat/${c.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] hover:bg-[#3B1582] px-4 py-2 text-xs font-black text-amber-300 shadow-sm hover:scale-102 transition-all"
                    >
                      <span>{isAr ? "متابعة المحادثة الآن" : "Continue Chat"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramsSection() {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/account/programs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPrograms(d.programs || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemoveFavorite(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(isAr ? "هل تريد إزالة هذا البرنامج من قائمة المفضلة؟" : "Remove from favorites?")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/account/programs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== id && p.pbId !== id));
      }
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <Card className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#7C3AED] h-8 w-8" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E0B38] via-[#2E1065] to-[#4C1D95] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-black text-amber-300 border border-amber-300/30">
              <Bookmark size={14} className="text-amber-300" />
              <span>{isAr ? "مفضلتي السياحية" : "My Travel Favorites"}</span>
            </div>
            <h2 className="mt-2.5 text-xl sm:text-2xl font-black text-white">
              {isAr ? "البرامج السياحية والأماكن المفضلة" : "Saved Programs & Favorites"}
            </h2>
            <p className="mt-1 text-xs text-purple-200/90 max-w-xl">
              {isAr
                ? "قائمة برامجك السياحية والفنادق والجولات المفضلة التي قمت بحفظها لسهولة المتابعة والحجز بأسعار تفضيلية."
                : "Your saved itineraries, hotels, and tours ready for fast booking with exclusive benefits."}
            </p>
          </div>
          <Link
            href="/vip-tours"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-[#1E0B38] hover:bg-amber-300 transition-all shadow-lg hover:scale-102 shrink-0"
          >
            <Bookmark size={16} />
            <span>{isAr ? "استكشاف المزيد من البرامج" : "Explore More Tours"}</span>
          </Link>
        </div>
      </div>

      {!programs.length ? (
        <Card className="text-center py-16">
          <Bookmark className="mx-auto text-[#7C3AED]" size={36} />
          <p className="mt-3 text-slate-800 text-base font-bold">{t.account.noPrograms}</p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? "لم تقم بحفظ أي برنامج سياحي بعد. تصفح برامجنا وعروض الفنادق والجولات وأضف ما يعجبك إلى المفضلة."
              : "You haven't saved any travel programs yet. Browse our tours and packages and add your favorites."}
          </p>
          <Link
            href="/vip-tours"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] hover:bg-[#3B1582] px-6 py-3 text-xs font-black text-amber-300 border border-amber-400/40 transition-all shadow-md"
          >
            <span>
              {locale === "ar"
                ? "استكشف وتصفح البرامج السياحية"
                : locale === "tr"
                  ? "Tur Programlarını Keşfedin"
                  : locale === "fr"
                    ? "Découvrir les programmes de voyage"
                    : "Browse Travel Programs"}
            </span>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => {
            const id = p.id || p.pbId;
            const title = (isAr ? p.titleAr : p.titleEn) || p.title || p.titleAr || p.titleEn || (p.destination ? (isAr ? `برنامج سياحي مميز إلى ${p.destination}` : `Luxury Tour to ${p.destination}`) : (isAr ? "برنامج سياحي فاخر" : "Luxury Tour Package"));
            const photo = resolveDestinationPhoto(p.destination, p.thumbnail);
            const nights = p.nights ? Number(p.nights) : 5;
            const price = Number(p.priceFromUsd) || 0;

            return (
              <div
                key={id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm hover:border-[#7C3AED]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div>
                  {/* Hero Image with Gradient & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={photo}
                      alt={title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 start-3.5 end-3.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E1065]/90 px-3 py-1 text-[11px] font-black text-amber-300 backdrop-blur-xs border border-amber-300/30">
                        <Sparkles size={12} className="text-amber-300" />
                        <span>{isAr ? "برنامج سياحي متكامل" : "Full VIP Program"}</span>
                      </span>

                      {/* Remove Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => void handleRemoveFavorite(id, e)}
                        disabled={removingId === id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all backdrop-blur-xs"
                        title={isAr ? "إزالة من المفضلة" : "Remove from Favorites"}
                      >
                        {removingId === id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Heart size={16} className="fill-current" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Image Overlay: Destination Pill */}
                    <div className="absolute bottom-3.5 start-3.5 end-3.5 flex items-center justify-between text-white">
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1 text-xs font-black backdrop-blur-xs">
                        <MapPin size={13} className="text-amber-400" />
                        <span>{p.destination || (isAr ? "وجهة سياحية" : "Destination")}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1 text-xs font-bold backdrop-blur-xs">
                        <Calendar size={13} className="text-purple-300" />
                        <span>{nights} {isAr ? "ليالٍ" : "nights"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#2E1065] transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {p.includesAr && Array.isArray(p.includesAr) && p.includesAr.length > 0
                        ? p.includesAr.join(" • ")
                        : (isAr
                            ? "يشمل الإقامة في فنادق فاخرة، جولات خاصة بسيارة مع سائق، الاستقبال والتوديع في المطار."
                            : "Includes luxury hotel stays, private chauffeur tours, airport transfers, and 24/7 concierge support.")}
                    </p>
                  </div>
                </div>

                {/* Footer: Price & Direct Link */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 p-5">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">{isAr ? "يبدأ من" : "Starting from"}</span>
                    <span className="text-base font-black text-[#2E1065] font-mono">
                      {price > 0 ? `$${price}` : (isAr ? "حسب التخصيص" : "On Request")}
                    </span>
                  </div>

                  <Link
                    href={`/account/chat/${id}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] hover:bg-[#3B1582] px-5 py-2.5 text-xs font-black text-amber-300 shadow-md hover:scale-102 transition-all"
                  >
                    <span>{isAr ? "عرض وحجز البرنامج" : "View & Book"}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
