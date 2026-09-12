"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  X,
  Bot,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import SalesChatPanel from "@/components/chat/SalesChatPanel";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useSiteContact } from "@/hooks/useSiteContact";
import {
  getPrimaryPhone,
  phoneToTelHref,
} from "@/data/site-contact";
import { trackLeadEnquiry } from "@/lib/tracking";

export default function FloatingActionHub() {
  const pathname = usePathname();
  const { t } = useLocale();
  const contact = useSiteContact();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"menu" | "chat" | null>(null);

  const primaryPhone = getPrimaryPhone(contact);

  const menuItems = useMemo(
    () => [
      {
        icon: MessageCircle,
        label: t.home.chatWithUs,
        color: "bg-green-500",
        action: () => {
          trackLeadEnquiry("floating_chat");
          setActiveMode("chat");
        },
      },
      {
        icon: Phone,
        label: t.home.callNow,
        color: "bg-blue-500",
        href: phoneToTelHref(primaryPhone),
      },
      {
        icon: Mail,
        label: t.home.emailUs,
        color: "bg-purple-500",
        href: contact.email ? `mailto:${contact.email}` : "mailto:info@lonaliza.com",
      },
      {
        icon: Bot,
        label: t.nav.aiChat,
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        action: () => {
          trackLeadEnquiry("floating_ai_chat");
          setActiveMode("chat");
        },
      },
    ],
    [t, primaryPhone, contact.email]
  );

  if (pathname?.startsWith("/flights/redirect")) return null;

  return (
    <>
      <motion.div
        className="fixed bottom-6 end-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />

        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setActiveMode("menu");
            else setActiveMode(null);
          }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl transition-shadow hover:shadow-green-500/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Help"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircle size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed z-50 end-4 sm:end-6 ${
              activeMode === "chat"
                ? "bottom-24 w-[min(100vw-2rem,420px)] h-[min(70vh,640px)]"
                : "bottom-28 w-80 sm:w-96"
            }`}
          >
            {activeMode === "menu" && (
              <motion.div
                className="overflow-hidden rounded-2xl bg-white shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <h3 className="mb-1 text-xl font-bold">
                    {t.home.chatWithUs}
                  </h3>
                  {contact.supportHours && (
                    <p className="text-sm text-green-100 whitespace-pre-line">
                      {contact.supportHours}
                    </p>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {"href" in item && item.href ? (
                        <a
                          href={item.href}
                          className="group flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${item.color}`}
                          >
                            <item.icon size={22} />
                          </div>
                          <span className="font-medium text-slate-700">
                            {item.label}
                          </span>
                        </a>
                      ) : (
                        <button
                          onClick={"action" in item ? item.action : undefined}
                          className="group flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-slate-50"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${item.color}`}
                          >
                            <item.icon size={22} />
                          </div>
                          <span className="font-medium text-slate-700">
                            {item.label}
                          </span>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="border-t bg-slate-50 px-4 py-3">
                  <Link
                    href="/ai-chat"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveMode(null);
                    }}
                    className="flex items-center justify-center gap-1.5 text-xs text-slate-500 transition hover:text-amber-600"
                  >
                    <ExternalLink size={12} />
                    {t.nav.aiChat}
                  </Link>
                </div>
              </motion.div>
            )}

            {activeMode === "chat" && (
              <motion.div
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SalesChatPanel
                  embedded
                  className="h-full"
                  onClose={() => setActiveMode("menu")}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
