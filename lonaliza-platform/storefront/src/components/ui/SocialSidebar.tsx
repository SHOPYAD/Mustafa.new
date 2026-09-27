// src/components/ui/SocialSidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Music2,
  Twitter,
  Linkedin,
  Ghost,
  type LucideIcon,
} from "lucide-react";
import { useSiteContact } from "@/hooks/useSiteContact";
import {
  getEnabledSocialLinks,
  resolveSocialHref,
} from "@/data/site-contact";
import type { SocialNetworkId } from "@/types/site-contact";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const ICONS: Record<SocialNetworkId, LucideIcon> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  twitter: Twitter,
  linkedin: Linkedin,
  snapchat: Ghost,
};

const COLORS: Record<SocialNetworkId, string> = {
  whatsapp: "bg-green-500 hover:bg-green-600",
  instagram: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
  facebook: "bg-blue-600 hover:bg-blue-700",
  youtube: "bg-red-600 hover:bg-red-700",
  tiktok: "bg-black hover:bg-slate-800",
  twitter: "bg-slate-800 hover:bg-slate-900",
  linkedin: "bg-sky-700 hover:bg-sky-800",
  snapchat: "bg-yellow-400 hover:bg-yellow-500 text-slate-900",
};

export default function SocialSidebar() {
  const pathname = usePathname();
  const contact = useSiteContact();
  const { t } = useLocale();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const socialLinks = useMemo(() => {
    return getEnabledSocialLinks(contact)
      .filter((s) => s.enabled === true && ICONS[s.id])
      .map((s) => ({
        id: s.id,
        name: t.contactSettings[s.id],
        icon: ICONS[s.id],
        href: resolveSocialHref(s, contact.whatsappNumber),
        color: COLORS[s.id],
        followers: s.handle || t.contactSettings[s.id],
      }));
  }, [contact, t.contactSettings]);

  if (
    pathname === "/" ||
    pathname?.startsWith("/partners") ||
    pathname?.startsWith("/flights/redirect") ||
    pathname?.startsWith("/ai-chat")
  ) {
    return null;
  }
  if (socialLinks.length === 0) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-1"
    >
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.id}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`relative flex items-center gap-3 ${social.color} text-white transition-all duration-300 rounded-l-xl overflow-hidden`}
          style={
            social.id === "whatsapp"
              ? { backgroundColor: "var(--brand-whatsapp)" }
              : undefined
          }
          whileHover={{ x: -5 }}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <social.icon size={22} />
          </div>

          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex flex-col pr-4 whitespace-nowrap overflow-hidden"
              >
                <span className="text-sm font-semibold">{social.name}</span>
                <span className="text-xs text-white/80">{social.followers}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap hidden lg:block"
      >
        {t.callback.connectWithUs}
      </motion.div>
    </motion.div>
  );
}
