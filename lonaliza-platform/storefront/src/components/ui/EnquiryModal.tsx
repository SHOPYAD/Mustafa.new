"use client";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  MapPin,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking, type BookingType } from "@/data/bookings";
import { trackLeadEnquiry } from "@/lib/tracking";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
  destination?: string;
  bookingType?: BookingType;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  packageName,
  destination,
  bookingType = "package",
}: EnquiryModalProps) {
  const { t, locale } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsSuccess(false);
        setError("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createBooking({
        type: bookingType,
        packageName: packageName,
        destination: destination,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      trackLeadEnquiry("package_enquiry");
      setIsSuccess(true);
      setTimeout(() => onClose(), 2500);
    } catch {
      setError(
        locale === "ar"
          ? "حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب."
          : "Something went wrong. Please try again or contact us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-0 z-[101] flex items-center justify-center p-4 transition-all duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300",
            isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
        >
          <div className="relative bg-gradient-to-r from-[#1e3a5f] to-[#c8922a] rounded-t-2xl p-6 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 end-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={t.common.cancel}
            >
              <X size={20} />
            </button>

            <h2 id="enquiry-modal-title" className="text-2xl font-bold mb-1 pe-8">
              {t.enquiry.title}
            </h2>
            <p className="text-white/85 text-sm">{t.enquiry.subtitle}</p>
          </div>

          <div className="p-6">
            {(packageName || destination) && !isSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
                {packageName && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Package size={16} className="text-[#c8922a] shrink-0" />
                    <span className="text-slate-500">{t.enquiry.packageLabel}:</span>
                    <span className="font-medium">{packageName}</span>
                  </p>
                )}
                {destination && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <MapPin size={16} className="text-[#1e3a5f] shrink-0" />
                    <span className="text-slate-500">{t.enquiry.destinationLabel}:</span>
                    <span className="font-medium">{destination}</span>
                  </p>
                )}
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {t.enquiry.successTitle}
                </h3>
                <p className="text-slate-600">{t.enquiry.successBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative">
                  <label htmlFor="enquiry-name" className="sr-only">
                    {t.enquiry.name}
                  </label>
                  <User
                    size={18}
                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="enquiry-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t.enquiry.namePlaceholder}
                    required
                    className="w-full ps-12 pe-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-[#c8922a]/20 focus:border-[#c8922a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="enquiry-email" className="sr-only">
                    {t.enquiry.email}
                  </label>
                  <Mail
                    size={18}
                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="enquiry-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.enquiry.emailPlaceholder}
                    required
                    className="w-full ps-12 pe-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-[#c8922a]/20 focus:border-[#c8922a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="enquiry-phone" className="sr-only">
                    {t.enquiry.phone}
                  </label>
                  <Phone
                    size={18}
                    className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="enquiry-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.enquiry.phonePlaceholder}
                    required
                    className="w-full ps-12 pe-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-[#c8922a]/20 focus:border-[#c8922a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="enquiry-message" className="sr-only">
                    {t.enquiry.message}
                  </label>
                  <MessageSquare
                    size={18}
                    className="absolute start-4 top-4 text-slate-400"
                  />
                  <textarea
                    id="enquiry-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.enquiry.messagePlaceholder}
                    rows={4}
                    className="w-full ps-12 pe-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-[#c8922a]/20 focus:border-[#c8922a] outline-none transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-4 bg-gradient-to-r from-[#1e3a5f] to-[#c8922a] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-xl hover:-translate-y-0.5"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.enquiry.submitting}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t.enquiry.submit}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
