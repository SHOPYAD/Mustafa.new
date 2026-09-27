"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function FAQSection() {
  const { locale } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const loc = (ar: string, en: string, fr?: string, tr?: string) => {
    if (locale === "ar") return ar;
    if (locale === "fr") return fr || en;
    if (locale === "tr") return tr || en;
    return en;
  };

  const faqs = [
    {
      q: loc(
        "كيف يتم تسليم السيرفر والموقع خلال 12 إلى 24 ساعة؟",
        "How is the server and site delivered within 12 to 24 hours?",
        "Comment le serveur et le site sont-ils livrés en 12 à 24 heures ?",
        "Sunucu ve site 12 ila 24 saat içinde nasıl teslim edilir?"
      ),
      a: loc(
        "فور إتمام شراء باقة الترخيص من بوابة الشركات، يتم حجز وتجهيز سيرفر Contabo VPS الخاص بك وتثبيت لوحة aaPanel ونقل نسخة منظومة لوناليزا (Lonaliza) بعلامتك التجارية، وتزويدك ببيانات السيرفر وتوجيهات ربط الدومين مع Cloudflare ليعمل الموقع حياً ومباشراً فوراً.",
        "Once you purchase the license in the Partner Portal, your dedicated Contabo VPS is provisioned with aaPanel, the Lonaliza platform is deployed under your brand, and DNS binding instructions are provided for immediate launch.",
        "Dès l'achat de la licence sur le Portail Partenaires, votre VPS Contabo dédié est configuré avec aaPanel, la plateforme Lonaliza est déployée sous votre marque et les instructions DNS vous sont remises pour un lancement immédiat.",
        "Acente Portalı üzerinden lisans satın alımınız tamamlandığı anda özel Contabo VPS sunucunuz aaPanel ile hazırlanır, Lonaliza platformu markanızla kurulur ve sitenizin anında yayına girmesi için DNS yönlendirme bilgileri teslim edilir."
      ),
    },
    {
      q: loc(
        "هل توجد أي عمولات أو نسب تقتطعها منصة لوناليزا من حجوزاتي؟",
        "Are there any commissions or hidden fees taken from my bookings?",
        "Y a-t-il des commissions ou des frais déduits de mes réservations ?",
        "Rezervasyonlarımdan Lonaliza platformu herhangi bir komisyon kesiyor mu?"
      ),
      a: loc(
        "إطلاقاً. لا توجد أي نسب أو عمولات مقتطعة من أرباحك نهائياً؛ كافة المبالغ وهوامش الأرباح التي تحددها في لوحة التحكم تعود لشركتك 100% وتودع في حساباتك البنكية وبوابات دفعك الخاصة.",
        "Zero percent. Lonaliza takes 0% commission on your bookings; 100% of profit markups and customer revenue flow directly into your own bank accounts and merchant processors.",
        "Absolument aucune. Lonaliza ne prélève aucune commission sur vos réservations ; 100 % des marges et des revenus clients sont versés directement sur vos comptes bancaires et passerelles de paiement.",
        "Kesinlikle hayır. Kârınızdan veya rezervasyonlarınızdan hiçbir komisyon alınmaz; belirlediğiniz kâr marjları ve tahsilatların %100'ü doğrudan kendi banka hesabınıza ve ödeme sanal poslarınıza aktarılır."
      ),
    },
    {
      q: loc(
        "كيف يعمل ترخيص الدومين المشفر؟ وماذا يحدث لو تم نسخ الكود؟",
        "How does the encrypted domain licensing work?",
        "Comment fonctionne la licence de domaine chiffrée ?",
        "Şifreli alan adı lisansı nasıl çalışır?"
      ),
      a: loc(
        "يتم تفعيل مفتاح الترخيص المشفر بالربط التلقائي بدومين شركتك المسجل حصراً؛ ويعمل النظام بمبدأ الحماية الصارمة (Fail-Closed)، بحيث إذا حاول أي طرف تشغيل الكود على نطاق آخر أو التلاعب بملفات الترخيص، يتوقف النظام تلقائياً لحماية حقوقك وأمان بياناتك.",
        "The license key binds to your designated company domain upon initial activation with fail-closed security, preventing unauthorized replication on other domains.",
        "La clé de licence est automatiquement associée au nom de domaine exclusif de votre entreprise avec une sécurité fail-closed, empêchant toute exécution non autorisée sur un autre domaine.",
        "Şifreli lisans anahtarı ilk aktivasyonda yalnızca tescilli şirket alan adınıza bağlanır. Sistem fail-closed koruma protokolüyle çalışarak kodun başka bir alan adında çalıştırılmasını veya kopyalanmasını anında engeller."
      ),
    },
    {
      q: loc(
        "هل اشتراك التحديثات الشهري ($50) إجباري أم اختياري؟",
        "Is the $50/month nightly update subscription mandatory?",
        "L'abonnement de mise à jour mensuel (50 $/mois) est-il obligatoire ?",
        "Aylık 50$'lık güncelleme aboneliği zorunlu mu?"
      ),
      a: loc(
        "اشتراك التحديثات اختياري 100%. إذا اخترت عدم الاشتراك، سيبقى موقعك وسيرفرك يعملان بكامل الميزات الحالية دون أي توقف، ويمكنك تفعيل أو إيقاف اشتراك التحديثات متى شئت من لوحة الشركاء.",
        "The $50/mo update subscription is 100% optional. Your platform continues operating permanently with all acquired features even if you choose not to subscribe.",
        "L'abonnement aux mises à jour est 100 % facultatif. Votre plateforme continue de fonctionner indéfiniment avec toutes les fonctionnalités acquises même sans abonnement.",
        "Güncelleme aboneliği %100 isteğe bağlıdır. Abone olmasanız dahi siteniz ve sunucunuz mevcut tüm özellikleriyle ömür boyu kesintisiz çalışmaya devam eder."
      ),
    },
    {
      q: loc(
        "هل يمكنني حذف محتوى وبيانات الديمو والبدء ببياناتي الخاصة فوراً؟",
        "Can I purge demo content and start with my own data immediately?",
        "Puis-je purger le contenu de démonstration et démarrer directement ?",
        "Demo içerikleri temizleyip doğrudan kendi verilerimle başlayabilir miyim?"
      ),
      a: loc(
        "نعم، توفر لك لوحة الأدمن شريطاً تفاعلياً للحذف الجماعي لجميع الرحلات والمقالات والحجوزات التجريبية بضغطة زر واحدة، مع الإبقاء على كافة محركات وتكاملات الفنادق والطيران جاهزة للعمل.",
        "Yes, the admin panel includes a 1-click Demo Seed Purge banner to clear all demo trips and blogs while keeping all RapidAPI and GDS connections active.",
        "Oui, le panneau d'administration comprend une fonction de purge en 1 clic pour effacer tous les voyages et blogs de démonstration tout en conservant actives les connexions GDS et RapidAPI.",
        "Evet, yönetici panelinde tek tıkla tüm demo turları, blogları ve rezervasyonları sıfırlayan temizleme aracı mevcuttur; tüm otel ve GDS motor bağlantılarınız çalışır halde kalır."
      ),
    },
    {
      q: loc(
        "كيف أستفيد من أدوات الذكاء الاصطناعي وبوت تيليجرام «انشر»؟",
        "How do I leverage the AI Studio and Telegram «Publish» bot?",
        "Comment utiliser le studio IA et le bot Telegram « Publier » ?",
        "Yapay zeka stüdyosu ve Telegram «Yayınla» botundan nasıl faydalanırım?"
      ),
      a: loc(
        "ببساطة تربط حساب تيليجرام الخاص بك من لوحة الأتمتة؛ يقوم النظام بإنشاء خطة المنشورات وتوليد الصور وفيديوهات الريلز تلقائياً وإرسال بطاقة موافقة إلى تيليجرام، وبمجرد الرد بكلمة «انشر» يتم النشر الفوري على كافة شبكات التواصل المتصلة.",
        "Connect your Telegram in the automation settings; the AI engine generates weekly visuals/reels, sends approval alerts, and publishes immediately across all social channels when you reply with «Publish».",
        "Liez simplement votre compte Telegram dans les paramètres d'automatisation ; le moteur IA conçoit des visuels/reels, vous envoie une alerte d'approbation et publie instantanément sur tous vos réseaux lorsque vous répondez « Publier ».",
        "Otomasyon ayarlarından Telegram hesabınızı bağlamanız yeterlidir; yapay zeka haftalık reels ve görselleri üretir, Telegram'ınıza onay kartı gönderir ve siz «Yayınla» dediğiniz anda tüm sosyal ağlara anında paylaşır."
      ),
    },
  ];

  return (
    <section id="faq" className="relative py-24 bg-slate-50/80 border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <HelpCircle className="h-3.5 w-3.5 text-purple-700" />
            <span>
              {loc("إجابات وافية وشفافة", "Frequently Asked Questions", "Réponses Précises & Transparentes", "Sıkça Sorulan Sorular")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {loc(
              "الأسئلة الشائعة حول منصة لوناليزا والترخيص",
              "Frequently Asked Questions About Lonaliza Platform",
              "Questions Fréquentes sur la Plateforme Lonaliza",
              "Lonaliza Platformu ve Lisanslama Hakkında SSS"
            )}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-start gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-purple-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
