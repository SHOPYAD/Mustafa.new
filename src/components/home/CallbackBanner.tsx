// src/components/home/CallbackBanner.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSiteContact } from "@/hooks/useSiteContact";
import { trackLeadEnquiry } from "@/lib/tracking";
import { createBooking } from "@/data/bookings";

const countryCodes = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+966", country: "Saudi", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
];

export default function CallbackBanner() {
  const pathname = usePathname();
  const { t } = useLocale();
  const contact = useSiteContact();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCode, setSelectedCode] = useState(countryCodes[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const displayPhone =
    contact.callbackPhone || contact.customerServicePhones[0] || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setStatus("loading");
    const fullPhone = `${selectedCode.code}${phoneNumber.trim()}`;
    await createBooking({
      type: "callback",
      packageName: "Callback request",
      name: "Callback",
      phone: fullPhone,
      message: `Callback requested at ${fullPhone}`,
      metadata: { source: "callback_banner", countryCode: selectedCode.code },
    });
    trackLeadEnquiry("callback_request");
    setStatus("success");
    setTimeout(() => {
      setIsOpen(false);
      setStatus("idle");
      setPhoneNumber("");
    }, 3000);
  };

  if (pathname?.startsWith("/flights/redirect")) return null;

  return (
    <>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/30 transition-all group md:right-[4.5rem] md:max-w-[calc(100vw-6.5rem)]"
      >
        <div className="relative">
          <Phone size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        <span className="font-semibold">{t.callback.getCallback}</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          {t.callback.eta}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => status === "idle" && setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full min-w-0 max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 end-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Phone size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t.callback.title}</h3>
                      <p className="text-orange-100 flex items-center gap-2 mt-1">
                        <Clock size={14} />
                        {t.callback.subtitle}
                      </p>
                      {displayPhone && (
                        <p className="text-orange-50/90 text-sm mt-1" dir="ltr">
                          {displayPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {status === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-green-500" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        {t.callback.successTitle}
                      </h4>
                      <p className="text-slate-600">
                        {t.callback.successBody}{" "}
                        <span className="font-semibold" dir="ltr">
                          {selectedCode.code} {phoneNumber}
                        </span>
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.callback.phoneLabel}
                      </label>

                      <div dir="ltr" className="mb-4 grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2">
                        <select
                          value={selectedCode.code}
                          onChange={(e) => {
                            const found = countryCodes.find(
                              (c) => c.code === e.target.value
                            );
                            if (found) setSelectedCode(found);
                          }}
                          className="w-[5.5rem] max-w-[5.5rem] shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>

                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={t.callback.phonePlaceholder}
                          className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                          required
                          dir="ltr"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          {t.callback.benefitsTitle}
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className="text-green-500 shrink-0"
                            />
                            {t.callback.benefit1}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className="text-green-500 shrink-0"
                            />
                            {t.callback.benefit2}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className="text-green-500 shrink-0"
                            />
                            {t.callback.benefit3}
                          </li>
                        </ul>
                        {contact.supportHours && (
                          <p className="mt-3 text-xs text-slate-500 whitespace-pre-line">
                            {contact.supportHours}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t.callback.connecting}
                          </>
                        ) : (
                          <>
                            <Phone size={20} />
                            {t.callback.submit}
                          </>
                        )}
                      </button>

                      <p className="text-xs text-slate-500 text-center mt-4">
                        {t.callback.privacyNote}{" "}
                        <a
                          href="/privacy"
                          className="text-orange-600 hover:underline"
                        >
                          {t.common.privacy}
                        </a>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
