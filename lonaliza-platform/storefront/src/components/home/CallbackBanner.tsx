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
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+966", country: "Saudi", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
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
    contact.callbackPhone || contact.customerServicePhones[0] || "+90 531 359 13 94";

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

  const isOrigin = (process.env.NEXT_PUBLIC_DEPLOYMENT_ROLE || "origin") !== "client";
  if (isOrigin && (pathname === "/" || pathname?.startsWith("/partners"))) return null;
  if (pathname?.startsWith("/flights/redirect")) return null;
  if (pathname?.startsWith("/community")) return null;
  if (pathname?.startsWith("/ai-chat")) return null;
  if (contact.callbackBannerEnabled === false) return null;

  const posClass =
    contact.callbackBannerPosition === "left"
      ? "left-4 md:left-[4.5rem]"
      : contact.callbackBannerPosition === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-4 md:right-[4.5rem]";

  const bottomStyle = { bottom: `${contact.callbackBannerBottomPx ?? 24}px` };

  return (
    <>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsOpen(true)}
        style={bottomStyle}
        className={`fixed z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-[#2e1065] via-[#3b1275] to-[#4c1d95] text-amber-300 font-black rounded-full shadow-[0_12px_32px_-8px_rgba(46,16,101,0.6)] border border-amber-400/30 hover:brightness-110 transition-all group md:max-w-[calc(100vw-6.5rem)] cursor-pointer ${posClass}`}
      >
        <div className="relative">
          <Phone size={20} className="text-amber-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 ring-2 ring-amber-300 rounded-full animate-pulse" />
        </div>
        <span className="font-black text-amber-300 text-sm">{t.callback.getCallback}</span>
        <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full min-w-0 max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-br from-[#120324] via-[#240a4a] to-[#3b1275] p-6 text-white relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 end-4 p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
                      <Phone size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{t.callback.title}</h3>
                      <p className="text-slate-200 flex items-center gap-2 mt-1 text-sm font-medium">
                        <Clock size={14} className="text-amber-300" />
                        {t.callback.subtitle}
                      </p>
                      {displayPhone && (
                        <p className="text-white/90 text-sm mt-1 font-semibold" dir="ltr">
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
                          className="w-[5.5rem] max-w-[5.5rem] shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
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
                          className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-400"
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
                              className="text-amber-500 shrink-0"
                            />
                            {t.callback.benefit1}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className="text-amber-500 shrink-0"
                            />
                            {t.callback.benefit2}
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle
                              size={14}
                              className="text-amber-500 shrink-0"
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
                        className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 size={20} className="animate-spin text-slate-950" />
                            {t.callback.connecting}
                          </>
                        ) : (
                          <>
                            <Phone size={20} className="text-slate-950" />
                            {t.callback.submit}
                          </>
                        )}
                      </button>

                      <p className="text-xs text-slate-500 text-center mt-4">
                        {t.callback.privacyNote}{" "}
                        <a
                          href="/privacy"
                          className="text-purple-700 font-bold hover:underline"
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
