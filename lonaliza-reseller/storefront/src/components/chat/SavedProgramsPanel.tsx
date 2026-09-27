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
        className="group w-full overflow-hidden rounded-2xl border border-violet-200 bg-white text-start shadow-sm transition hover:border-[#7C3AED]/40 hover:shadow-violet-200/60"
      >
        <div className="relative h-24 overflow-hidden bg-violet-100">
          {program.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.thumbnail}
              alt=""
              className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 to-amber-50">
              <Bookmark className="text-[#7C3AED]" size={22} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
        </div>
        <div className="space-y-1.5 p-3">
          <p className="line-clamp-2 text-sm font-bold text-[#2E1065]">{title}</p>
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin size={11} className="text-[#7C3AED]" />
            {program.destination}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
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
            <p className="text-sm font-bold text-[#7C3AED]">
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
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-violet-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C3AED]">
                  {t.chat.programsTitle}
                </p>
                <h3 className="mt-1 text-xl font-bold text-[#2E1065]">
                  {tContent(selected, "title", locale)}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} className="text-[#7C3AED]" />
                  {selected.destination}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-[#2E1065]"
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

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-violet-50 px-3 py-1">
                {t.chat.nightsLabel.replace("{n}", String(selected.nights || 0))}
              </span>
              {selected.people ? (
                <span className="rounded-full bg-violet-50 px-3 py-1">
                  {t.chat.peopleLabel.replace("{n}", String(selected.people))}
                </span>
              ) : null}
              {selected.priceFromUsd > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
                  {t.chat.priceFrom} {formatPrice(selected.priceFromUsd, "USD")}
                </span>
              )}
            </div>

            {(selected.includesAr.length > 0 || selected.includesEn.length > 0) && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                      className="rounded-lg border border-violet-100 bg-[#F8F7FC] px-3 py-1.5 text-sm text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.itinerary?.days && selected.itinerary.days.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <CalendarDays size={13} />
                  {t.admin.itineraryLabel}
                </p>
                {selected.itinerary.days.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-xl border border-violet-100 bg-[#F8F7FC] px-3 py-2.5"
                  >
                    <p className="text-xs font-bold text-[#7C3AED]">
                      {t.admin.dayLabel.replace("{n}", String(day.day))} —{" "}
                      {tContent(day, "title", locale)}
                    </p>
                    {(day.detailAr || day.detailEn) && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
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

            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800">
              {t.chat.priceEstimateNote}
            </p>

            <a
              href={buildWhatsAppLink(
                resolveWhatsApp(),
                locale === "ar"
                  ? `أرغب بحجز برنامج: ${tContent(selected, "title", locale)}\nالوجهة: ${selected.destination}\nالليالي: ${selected.nights}\nالسعر التقديري: ${formatPrice(selected.priceFromUsd, "USD")}\n${t.chat.priceEstimateNote}`
                  : `I want to book this program: ${tContent(selected, "title", locale)}\nDestination: ${selected.destination}\nNights: ${selected.nights}\nEstimated price: ${formatPrice(selected.priceFromUsd, "USD")}\n${t.chat.priceEstimateNote}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
            >
              <MessageCircle size={18} />
              {t.chat.confirmOnWhatsApp}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === "chips") {
    if (programs.length === 0) return null;
    return (
      <>
        <div>
          <div className="lonaliza-advisor-suggest lonaliza-suggest-carousel pb-1">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              data-keep-color="true"
              className="lonaliza-advisor-pill inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <Bookmark size={13} className="text-[#7C3AED]" />
              {t.chat.openPrograms}
              {programs.length > 0 && (
                <span
                  data-keep-color="true"
                  className="rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white"
                >
                  {programs.length}
                </span>
              )}
            </button>
            {programs.map((program) => (
              <button
                key={program.id}
                type="button"
                onClick={() => setOpenId(program.id)}
                data-keep-color="true"
                className="lonaliza-advisor-pill h-8 shrink-0 rounded-full border border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {tContent(program, "title", locale)}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {drawer && (
            <motion.div
              className="fixed inset-0 z-[70] bg-black/40"
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
                className="absolute inset-y-0 end-0 w-[min(100%,360px)] overflow-y-auto border-s border-violet-100 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#2E1065]">
                    {t.chat.programsTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDrawer(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {programs.length ? cards : (
                    <p className="text-sm text-slate-400">{t.chat.programsEmpty}</p>
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
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white">
        <div className="border-b border-violet-100 px-4 py-3">
          <h2 className="text-sm font-bold text-[#2E1065]">{t.chat.programsTitle}</h2>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {programs.length ? cards : (
            <p className="px-2 py-8 text-center text-sm text-slate-400">
              {t.chat.programsEmpty}
            </p>
          )}
        </div>
      </div>
      {modal}
    </>
  );
}
