"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function FAQSection() {
  const { locale } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q:
        locale === "ar"
          ? "كيف يتم تسليم السيرفر والموقع خلال 12 إلى 24 ساعة؟"
          : "How is the server and site delivered within 12 to 24 hours?",
      a:
        locale === "ar"
          ? "فور إتمام شراء باقة الترخيص من بوابة الشركات، يتم حجز وتجهيز سيرفر Contabo VPS الخاص بك وتثبيت لوحة aaPanel ونقل نسخة منظومة لوناليزا (Lonaliza) بعلامتك التجارية، وتزويدك ببيانات السيرفر وتوجيهات ربط الدومين مع Cloudflare ليعمل الموقع حياً ومباشراً فوراً."
          : "Once you purchase the license in the Partner Portal, your dedicated Contabo VPS is provisioned with aaPanel, the Lonaliza platform is deployed under your brand, and DNS binding instructions are provided for immediate launch.",
    },
    {
      q:
        locale === "ar"
          ? "هل توجد أي عمولات أو نسب تقتطعها منصة لوناليزا من حجوزاتي؟"
          : "Are there any commissions or hidden fees taken from my bookings?",
      a:
        locale === "ar"
          ? "إطلاقاً. لا توجد أي نسب أو عمولات مقتطعة من أرباحك نهائياً؛ كافة المبالغ وهوامش الأرباح التي تحددها في لوحة التحكم تعود لشركتك 100% وتودع في حساباتك البنكية وبوابات دفعك الخاصة."
          : "Zero percent. Lonaliza takes 0% commission on your bookings; 100% of profit markups and customer revenue flow directly into your own bank accounts and merchant processors.",
    },
    {
      q:
        locale === "ar"
          ? "كيف يعمل ترخيص الدومين المشفر؟ وماذا يحدث لو تم نسخ الكود؟"
          : "How does the encrypted domain licensing work?",
      a:
        locale === "ar"
          ? "يتم تفعيل مفتاح الترخيص المشفر بالربط التلقائي بدومين شركتك المسجل حصراً؛ ويعمل النظام بمبدأ الحماية الصارمة (Fail-Closed)، بحيث إذا حاول أي طرف تشغيل الكود على نطاق آخر أو التلاعب بملفات الترخيص، يتوقف النظام تلقائياً لحماية حقوقك وأمان بياناتك."
          : "The license key binds to your designated company domain upon initial activation with fail-closed security, preventing unauthorized replication on other domains.",
    },
    {
      q:
        locale === "ar"
          ? "هل اشتراك التحديثات الشهري ($50) إجباري أم اختياري؟"
          : "Is the $50/month nightly update subscription mandatory?",
      a:
        locale === "ar"
          ? "اشتراك التحديثات اختياري 100%. إذا اخترت عدم الاشتراك، سيبقى موقعك وسيرفرك يعملان بكامل الميزات الحالية دون أي توقف، ويمكنك تفعيل أو إيقاف اشتراك التحديثات متى شئت من لوحة الشركاء."
          : "The $50/mo update subscription is 100% optional. Your platform continues operating permanently with all acquired features even if you choose not to subscribe.",
    },
    {
      q:
        locale === "ar"
          ? "هل يمكنني حذف محتوى وبيانات الديمو والبدء ببياناتي الخاصة فوراً؟"
          : "Can I purge demo content and start with my own data immediately?",
      a:
        locale === "ar"
          ? "نعم، توفر لك لوحة الأدمن شريطاً تفاعلياً للحذف الجماعي لجميع الرحلات والمقالات والحجوزات التجريبية بضغطة زر واحدة، مع الإبقاء على كافة محركات وتكاملات الفنادق والطيران جاهزة للعمل."
          : "Yes, the admin panel includes a 1-click Demo Seed Purge banner to clear all demo trips and blogs while keeping all RapidAPI and GDS connections active.",
    },
    {
      q:
        locale === "ar"
          ? "كيف أستفيد من أدوات الذكاء الاصطناعي وبوت تيليجرام «انشر»؟"
          : "How do I leverage the AI Studio and Telegram «Publish» bot?",
      a:
        locale === "ar"
          ? "ببساطة تربط حساب تيليجرام الخاص بك من لوحة الأتمتة؛ يقوم النظام بإنشاء خطة المنشورات وتوليد الصور وفيديوهات الريلز تلقائياً وإرسال بطاقة موافقة إلى تيليجرام، وبمجرد الرد بكلمة «انشر» يتم النشر الفوري على كافة شبكات التواصل المتصلة."
          : "Connect your Telegram in the automation settings; the AI engine generates weekly visuals/reels, sends approval alerts, and publishes immediately across all social channels when you reply with «Publish».",
    },
  ];

  return (
    <section id="faq" className="relative py-24 bg-slate-950 border-t border-white/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
            <HelpCircle className="h-3.5 w-3.5 text-teal-400" />
            <span>
              {locale === "ar" ? "إجابات وافية وشفافة" : "Frequently Asked Questions"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "الأسئلة الشائعة حول منصة لوناليزا والترخيص"
              : "Frequently Asked Questions About Lonaliza Platform"}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-start gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-base font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-white/5">
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
