"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  CalendarDays,
  MapPin,
  MessageCircle,
  Moon,
  Users,
  X,
} from "lucide-react";
import SearchCtaCards from "@/components/chat/SearchCtaCards";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  DEFAULT_SITE_WHATSAPP,
  getSiteContact,
} from "@/data/site-contact";
import {
  buildWhatsAppLink,
  cn,
  normalizeWhatsAppNumber,
  tContent,
} from "@/lib/utils";
import type { SavedAiProgramPublic } from "@/types/ai-program";

function resolveWhatsApp(): string {
  return (
    normalizeWhatsAppNumber(getSiteContact().whatsappNumber) ||
    DEFAULT_SITE_WHATSAPP
  );
}


export default function SavedProgramsPanel({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "chips";
}) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [programs, setPrograms] = useState<SavedAiProgramPublic[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-programs", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && Array.isArray(data.programs)) {
        setPrograms(data.programs);
      }
    } catch {
      /* keep previous */
    }
  }, []);

  useEffect(() => {
    void load();
    const onSaved = () => void load();
    window.addEventListener("ai-program-saved", onSaved);
    return () => window.removeEventListener("ai-program-saved", onSaved);
  }, [load]);

  const selected = programs.find((p) => p.id === openId) || null;

  const bookWhatsApp = (program: SavedAiProgramPublic) => {
    const title = tContent(program, "title", locale);
    const message =
      locale === "ar"
        ? `أرغب بحجز برنامج: ${title}\nالوجهة: ${program.destination}\nالليالي: ${program.nights}\nالسعر التقديري: ${formatPrice(program.priceFromUsd, "USD")}\n${t.chat.priceEstimateNote}`
        : `I want to book this program: ${title}\nDestination: ${program.destination}\nNights: ${program.nights}\nEstimated price: ${formatPrice(program.priceFromUsd, "USD")}\n${t.chat.priceEstimateNote}`;
    window.open(
      buildWhatsAppLink(resolveWhatsApp(), message),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const cards = programs.map((program) => {
    const title = tContent(program, "title", locale);
    return (
      <button
        key={program.id}
        type="button"
        onClick={() => {
          setOpenId(program.id);
          setDrawer(false);
        }}
        className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1a2e] text-start shadow-md transition hover:border-emerald-400/35 hover:shadow-emerald-900/20"
      >
        <div className="relative h-24 overflow-hidden bg-slate-900">
          {program.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.thumbnail}
              alt=""
              className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-900/50 to-slate-950">
              <Bookmark className="text-emerald-300/70" size={22} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] to-transparent" />
        </div>
        <div className="space-y-1.5 p-3">
          <p className="line-clamp-2 text-sm font-bold text-white">{title}</p>
          <p className="flex items-center gap-1 text-[11px] text-white/50">
            <MapPin size={11} className="text-emerald-400" />
            {program.destination}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1">
              <Moon size={11} />
              {t.chat.nightsLabel.replace("{n}", String(program.nights || 0))}
            </span>
            {program.people ? (
              <span className="inline-flex items-center gap-1">
                <Users size={11} />
                {t.chat.peopleLabel.replace("{n}", String(program.people))}
              </span>
            ) : null}
          </div>
          {program.priceFromUsd > 0 && (
            <p className="text-sm font-bold text-emerald-300">
              {t.chat.priceFrom} {formatPrice(program.priceFromUsd, "USD")}
            </p>
          )}
        </div>
      </button>
    );
  });

  const modal = (
    <AnimatePresence>
      {selected && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpenId(null)}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-500/20 bg-[#071018] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
                  {t.chat.programsTitle}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {tContent(selected, "title", locale)}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/55">
                  <MapPin size={14} className="text-emerald-400" />
                  {selected.destination}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                aria-label={t.common.cancel}
              >
                <X size={18} />
              </button>
            </div>

            {selected.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.thumbnail}
                alt=""
                className="mb-4 h-40 w-full rounded-2xl object-cover"
              />
            )}

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full bg-white/5 px-3 py-1">
                {t.chat.nightsLabel.replace("{n}", String(selected.nights || 0))}
              </span>
              {selected.people ? (
                <span className="rounded-full bg-white/5 px-3 py-1">
                  {t.chat.peopleLabel.replace("{n}", String(selected.people))}
                </span>
              ) : null}
              {selected.priceFromUsd > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
                  {t.chat.priceFrom} {formatPrice(selected.priceFromUsd, "USD")}
                </span>
              )}
            </div>

            {(selected.includesAr.length > 0 || selected.includesEn.length > 0) && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t.chat.includes}
                </p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {(locale === "ar"
                    ? selected.includesAr.length
                      ? selected.includesAr
                      : selected.includesEn
                    : selected.includesEn.length
                      ? selected.includesEn
                      : selected.includesAr
                  ).map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.itinerary?.days && selected.itinerary.days.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <CalendarDays size={13} />
                  {t.admin.itineraryLabel}
                </p>
                {selected.itinerary.days.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-xl border border-white/8 bg-[#0d1c30] px-3 py-2.5"
                  >
                    <p className="text-xs font-bold text-emerald-300">
                      {t.admin.dayLabel.replace("{n}", String(day.day))} —{" "}
                      {tContent(day, "title", locale)}
                    </p>
                    {(day.detailAr || day.detailEn) && (
                      <p className="mt-1 text-sm leading-relaxed text-white/60">
                        {tContent(day, "detail", locale)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <SearchCtaCards
              flightHref={selected.flightHref}
              transferHref={selected.transferHref}
              carsHref={selected.carsHref}
            />

            <p className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-100/90">
              {t.chat.priceEstimateNote}
            </p>

            <button
              type="button"
              onClick={() => bookWhatsApp(selected)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
            >
              <MessageCircle size={18} />
              {t.chat.confirmOnWhatsApp}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === "chips") {
    return (
      <>
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"
          >
            <Bookmark size={13} />
            {t.chat.openPrograms}
            {programs.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5">
                {programs.length}
              </span>
            )}
          </button>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                onClick={() => setOpenId(program.id)}
                className="shrink-0 rounded-full border border-white/10 bg-[#0c1a2e] px-3 py-1.5 text-xs text-white/80"
              >
                {tContent(program, "title", locale)}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {drawer && (
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            >
              <motion.aside
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 24, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-y-0 end-0 w-[min(100%,360px)] overflow-y-auto border-s border-white/10 bg-[#071018] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">
                    {t.chat.programsTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDrawer(false)}
                    className="rounded-lg p-2 text-white/40"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {programs.length ? cards : (
                    <p className="text-sm text-white/40">{t.chat.programsEmpty}</p>
                  )}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="flex h-full min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-emerald-500/15 bg-[#071018]/95">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-bold text-white">{t.chat.programsTitle}</h2>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {programs.length ? cards : (
            <p className="px-2 py-8 text-center text-sm text-white/40">
              {t.chat.programsEmpty}
            </p>
          )}
        </div>
      </div>
      {modal}
    </>
  );
}
