// src/app/contact/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  User,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { useSiteContact } from "@/hooks/useSiteContact";
import { phoneToTelHref } from "@/data/site-contact";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { trackLeadEnquiry } from "@/lib/tracking";
import { createBooking } from "@/data/bookings";

export default function ContactPage() {
  const contact = useSiteContact();
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const contactInfo = useMemo(() => {
    const phones =
      contact.customerServicePhones.length > 0
        ? contact.customerServicePhones
        : [`+${contact.whatsappNumber}`];
    const addressLines = (contact.address || t.footer.address)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const hoursLines = (contact.supportHours || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return [
      {
        icon: Phone,
        title: t.admin.callUs,
        details: phones,
        color: "bg-blue-100 text-blue-600",
        href: phoneToTelHref(phones[0]),
      },
      {
        icon: Mail,
        title: t.admin.emailUsTitle,
        details: contact.email ? [contact.email] : ["info@lonaliza.com"],
        color: "bg-purple-100 text-purple-600",
        href: contact.email ? `mailto:${contact.email}` : undefined,
      },
      {
        icon: MapPin,
        title: t.admin.visitUs,
        details: addressLines.length
          ? addressLines
          : ["Istanbul", "Turkey"],
        color: "bg-green-100 text-green-600",
      },
      {
        icon: Clock,
        title: t.admin.workingHours,
        details: hoursLines.length ? hoursLines : ["Mon - Sat: 9AM - 9PM"],
        color: "bg-amber-100 text-amber-600",
      },
    ];
  }, [contact, t.admin.callUs, t.admin.emailUsTitle, t.admin.visitUs, t.admin.workingHours, t.footer.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createBooking({
      type: "contact",
      packageName: formData.subject || "Contact form",
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: [formData.subject, formData.message].filter(Boolean).join("\n\n"),
    });
    trackLeadEnquiry("contact_form");
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSuccess(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-6 border border-white/30">
            <MessageSquare size={16} />
            {t.admin.getInTouch}
          </span>
          <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-7xl">
            {t.nav.contact}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t.admin.contactHeroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow h-full">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      info.color
                    )}
                  >
                    <info.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {info.title}
                  </h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-slate-600" dir="auto">
                      {"href" in info && info.href && i === 0 ? (
                        <a
                          href={info.href}
                          className="hover:text-orange-600 transition-colors"
                        >
                          {detail}
                        </a>
                      ) : (
                        detail
                      )}
                    </p>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t.admin.sendMessage}
              </h2>
              <p className="text-slate-600 mb-8">
                {t.admin.sendMessageSubtitle}
              </p>

              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {t.admin.messageSent}
                  </h3>
                  <p className="text-slate-600">
                    {t.admin.messageSentBody}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t.admin.fieldName}
                      </label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full ps-10 pe-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t.admin.fieldEmail}
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full ps-10 pe-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t.admin.fieldPhone}
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t.admin.fieldSubject}
                    </label>
                    <input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t.admin.fieldMessage}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      t.enquiry.submitting
                    ) : (
                      <>
                        <Send size={18} />
                        {t.admin.sendMessage}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {t.admin.whyUs}
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t.admin.whyUsBody}
              </p>
              {contact.supportHours && (
                <p className="text-sm text-slate-500 whitespace-pre-line">
                  {contact.supportHours}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
