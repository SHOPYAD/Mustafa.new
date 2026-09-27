"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, MapPin, Plus, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import {
  HERO_OFFER_KINDS,
  parseHeroPackages,
  serializeHeroPackages,
  type HeroOfferKind,
  type HeroPackageItem,
  type HomepageSectionInstance,
} from "@/lib/visual-editor/schema";
import { postToParent } from "@/lib/visual-editor/protocol";
import { resolveBoundImage } from "@/lib/visual-editor/live-bind";
import { brandButtonClass, brandButtonStyle, SelectableField } from "./primitives";
import {
  catalogKey,
  itemCatalogKey,
  loadOfferCatalog,
  OFFER_KIND_LABEL,
  type OfferCatalogEntry,
} from "./offer-catalog";
import "./hero-cards-motion.css";

type HeroPackagesProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
};

export type ResolvedHeroCard = {
  key: string;
  itemId: string;
  kind: HeroOfferKind;
  title: string;
  tagline: string;
  image: string;
  price: number;
  href: string;
  days?: number;
};

const CARD_HEIGHT_REM = 5.4;
const CARD_GAP_REM = 0.65;
const STATIC_VISIBLE = 3;

type StageStyle = CSSProperties & {
  "--hero-card-duration": string;
  "--hero-card-h": string;
  "--hero-card-gap": string;
};

function emitPackages(instanceId: string, items: HeroPackageItem[]) {
  const json = serializeHeroPackages(items);
  postToParent({
    type: "alrayyan-ve-text",
    instanceId,
    field: "heroPackagesJson",
    locale: "en",
    value: json,
  });
  window.dispatchEvent(
    new CustomEvent("alrayyan:ve-settings", {
      detail: { instanceId, settings: { heroPackagesJson: json, showHeroPackages: true } },
    })
  );
}

function readItems(instance: HomepageSectionInstance): HeroPackageItem[] {
  return parseHeroPackages({
    ...instance.settings,
    heroPackagesJson:
      instance.settings.heroPackagesJson ||
      instance.texts.heroPackagesJson?.en ||
      instance.texts.heroPackagesJson?.ar ||
      "",
  });
}

export function resolveHeroCards(
  items: HeroPackageItem[],
  catalog: OfferCatalogEntry[],
  locale: Locale
): ResolvedHeroCard[] {
  const byKey = new Map(catalog.map((entry) => [catalogKey(entry.kind, entry.liveId), entry]));

  return items
    .map((item) => {
      if (item.source === "live") {
        const live = byKey.get(catalogKey(item.kind || "package", item.liveId || ""));
        if (!live) return null;
        return {
          key: item.id,
          itemId: item.id,
          kind: live.kind,
          title: live.title,
          tagline: live.tagline,
          image: item.image || live.image,
          price: live.price,
          href: live.href,
          days: live.days,
        };
      }
      const title =
        locale === "ar"
          ? item.titleAr || item.titleEn || item.titleTr || ""
          : locale === "tr"
            ? item.titleTr || item.titleEn || item.titleAr || ""
            : item.titleEn || item.titleAr || item.titleTr || "";
      const tagline =
        locale === "ar"
          ? item.taglineAr || item.taglineEn || ""
          : locale === "tr"
            ? item.taglineTr || item.taglineEn || ""
            : item.taglineEn || item.taglineAr || "";
      return {
        key: item.id,
        itemId: item.id,
        kind: item.kind || "package",
        title: title || "Offer",
        tagline,
        image: item.image || "",
        price: item.price || 0,
        href: item.href || "/holidays",
      };
    })
    .filter((card): card is ResolvedHeroCard => Boolean(card));
}

function OfferCard({
  card,
  editorMode,
  instance,
  formatPrice,
  fromLabel,
  onMove,
  onRemove,
  canUp,
  canDown,
}: {
  card: ResolvedHeroCard;
  editorMode: boolean;
  instance: HomepageSectionInstance;
  formatPrice: (n: number) => string;
  fromLabel: string;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <SelectableField
      instance={instance}
      field={`hero-pkg-${card.key}`}
      editorMode={editorMode}
      className="group relative h-[5.4rem] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_20px_-6px_rgba(46,16,101,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:border-purple-400/60 hover:shadow-[0_12px_28px_-6px_rgba(46,16,101,0.2)]"
    >
      <a
        href={card.href}
        onClick={(e) => {
          if (editorMode) e.preventDefault();
        }}
        className="flex h-full items-center gap-3 p-2.5"
      >
        <div className="relative h-[4.15rem] w-[4.85rem] shrink-0 overflow-hidden rounded-xl bg-purple-50 shadow-sm">
          {card.image ? (
            <SafeImage
              src={resolveBoundImage(instance, `hero-pkg-${card.key}`, card.image)}
              alt={card.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              builderId={`${instance.instanceId}.hero-pkg-${card.key}`}
              builderField={`hero-pkg-${card.key}`}
              builderInstanceId={instance.instanceId}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-purple-700">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{card.tagline}</span>
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-[13px] font-black leading-tight text-slate-900">
            {card.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="text-[11px] font-medium text-slate-500">{fromLabel}</span>{" "}
            <span className="text-[13px] font-black text-purple-950">
              {formatPrice(card.price)}
            </span>
            {card.days ? (
              <span className="rounded-md bg-purple-50 text-purple-900 border border-purple-200/60 px-1.5 py-0.5 text-[10px] font-bold">
                {card.days}d
              </span>
            ) : null}
          </p>
        </div>
      </a>
      {editorMode ? (
        <div
          data-builder-chrome
          className="absolute end-1.5 top-1.5 z-[80] flex gap-0.5"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-builder-chrome
            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2e1065] text-white hover:bg-[#3b0764] disabled:opacity-35"
            disabled={!canUp}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMove(-1);
            }}
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            data-builder-chrome
            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2e1065] text-white hover:bg-[#3b0764] disabled:opacity-35"
            disabled={!canDown}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMove(1);
            }}
          >
            <ChevronDown size={12} />
          </button>
          <button
            type="button"
            data-builder-chrome
            className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      ) : null}
    </SelectableField>
  );
}

export function HeroPackageRail({ instance, editorMode }: HeroPackagesProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [catalog, setCatalog] = useState<OfferCatalogEntry[]>([]);
  const [items, setItems] = useState<HeroPackageItem[]>(() => readItems(instance));
  const [paused, setPaused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKind, setPickerKind] = useState<HeroOfferKind>("package");
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    setItems(readItems(instance));
  }, [instance.settings, instance.texts.heroPackagesJson]);

  useEffect(() => {
    let cancelled = false;
    void loadOfferCatalog(locale).then((list) => {
      if (!cancelled) setCatalog(list);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const deskMq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setCanAnimate(!motionMq.matches && deskMq.matches);
    sync();
    motionMq.addEventListener("change", sync);
    deskMq.addEventListener("change", sync);
    return () => {
      motionMq.removeEventListener("change", sync);
      deskMq.removeEventListener("change", sync);
    };
  }, []);

  const cards = useMemo(
    () => resolveHeroCards(items, catalog, locale),
    [catalog, items, locale]
  );

  const used = new Set(
    items.map((item) => itemCatalogKey(item)).filter((key): key is string => Boolean(key))
  );

  const unused = catalog.filter((entry) => !used.has(catalogKey(entry.kind, entry.liveId)));
  const unusedKind = unused.filter((entry) => entry.kind === pickerKind);

  const commit = (next: HeroPackageItem[]) => {
    setItems(next);
    emitPackages(instance.instanceId, next);
  };

  const moveItem = (itemId: string, dir: -1 | 1) => {
    const index = items.findIndex((item) => item.id === itemId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    commit(next);
  };

  if (instance.settings.showHeroPackages === false) return null;

  const useColumnMotion = !editorMode && canAnimate && cards.length >= 1;
  /* Seamless infinite loop: ensure Set A has at least 6-8 items so it always exceeds corridor height, then duplicate for -50% */
  const setRepeat = cards.length <= 1 ? 8 : cards.length === 2 ? 4 : cards.length === 3 ? 3 : 2;
  const loopSet = Array.from({ length: setRepeat }, (_, copy) =>
    cards.map((card, i) => ({
      card,
      loopKey: `c${copy}-i${i}-${card.key}`,
    }))
  ).flat();
  const motionItems = [...loopSet, ...loopSet];
  const durationSec = Math.max(16, Math.min(45, loopSet.length * 3.2));
  const staticCards = editorMode ? cards : cards.slice(0, STATIC_VISIBLE);

  const renderCard = (card: ResolvedHeroCard) => {
    const index = items.findIndex((item) => item.id === card.itemId);
    return (
      <OfferCard
        card={card}
        editorMode={editorMode}
        instance={instance}
        formatPrice={formatPrice}
        fromLabel={t.common.from}
        canUp={index > 0}
        canDown={index >= 0 && index < items.length - 1}
        onMove={(dir) => moveItem(card.itemId, dir)}
        onRemove={() => commit(items.filter((item) => item.id !== card.itemId))}
      />
    );
  };

  return (
    <div
      className={
        editorMode
          ? "flex w-full max-w-[18.5rem] flex-col gap-3 lg:max-w-[21rem]"
          : "alrayyan-hero-cards-rail flex h-auto w-full flex-col gap-3 lg:h-full lg:min-h-0"
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {editorMode ? (
        <div data-builder-chrome className="relative z-30">
          <button
            type="button"
            data-builder-chrome
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/40 bg-[#2e1065]/90 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md shadow-md hover:bg-[#3b0764]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPickerOpen((open) => !open);
            }}
          >
            <Plus size={12} />
            {locale === "ar" ? "عرض للهيرو" : locale === "tr" ? "Hero teklifi" : locale === "fr" ? "Offre Hero" : "Hero offer"}
          </button>
          {pickerOpen ? (
            <div
              data-builder-chrome
              className="absolute start-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-purple-500/30 bg-[#1e1b4b] p-2.5 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex flex-wrap gap-1">
                {HERO_OFFER_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    data-builder-chrome
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={
                      pickerKind === kind
                        ? { backgroundColor: "var(--brand-button)", color: "#fff" }
                        : { backgroundColor: "rgba(255,255,255,0.08)" }
                    }
                    onClick={() => setPickerKind(kind)}
                  >
                    {OFFER_KIND_LABEL[kind][locale] || OFFER_KIND_LABEL[kind].en}
                  </button>
                ))}
              </div>
              <div className="max-h-52 overflow-y-auto rounded-lg bg-white/5">
                {unusedKind.length ? (
                  unusedKind.map((entry) => (
                    <button
                      key={catalogKey(entry.kind, entry.liveId)}
                      type="button"
                      data-builder-chrome
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-start text-xs hover:bg-white/10"
                      onClick={() => {
                        commit([
                          ...items,
                          {
                            id: `live-${entry.kind}-${entry.liveId}-${Date.now().toString(36)}`,
                            source: "live",
                            kind: entry.kind,
                            liveId: entry.liveId,
                          },
                        ]);
                        setPickerOpen(false);
                      }}
                    >
                      <span className="line-clamp-1 flex-1">{entry.title}</span>
                      {entry.price ? (
                        <span className="shrink-0 text-white/60">{formatPrice(entry.price)}</span>
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-3 text-xs text-white/55">
                    {locale === "ar" ? "لا مزيد في هذا النوع" : "Nothing left in this type"}
                  </p>
                )}
              </div>
              <button
                type="button"
                data-builder-chrome
                className={`${brandButtonClass} mt-2 w-full px-3 py-2 text-xs`}
                style={brandButtonStyle()}
                onClick={() => {
                  commit([
                    ...items,
                    {
                      id: `custom-${Date.now().toString(36)}`,
                      source: "custom",
                      kind: "package",
                      titleAr: "عرض مخصص",
                      titleEn: "Custom offer",
                      titleTr: "Özel teklif",
                      taglineAr: "تركيا",
                      taglineEn: "Turkey",
                      taglineTr: "Türkiye",
                      image: "",
                      price: 499,
                      href: "/holidays",
                    },
                  ]);
                  setPickerOpen(false);
                }}
              >
                <Plus size={13} />
                {locale === "ar" ? "بطاقة مخصصة" : "Custom card"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {useColumnMotion ? (
        <div
          className={`alrayyan-hero-cards-motion w-full${paused ? " is-paused" : ""}`}
          style={
            {
              "--hero-card-duration": `${durationSec}s`,
              "--hero-card-h": `${CARD_HEIGHT_REM}rem`,
              "--hero-card-gap": `${CARD_GAP_REM}rem`,
            } as StageStyle
          }
        >
          <div className="alrayyan-hero-cards-stage is-live h-full">
            <div className="alrayyan-hero-cards-track">
              {motionItems.map(({ card, loopKey }) => (
                <div key={loopKey} className="alrayyan-hero-cards-slot">
                  {renderCard(card)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="alrayyan-hero-cards-stage is-static flex flex-col gap-2.5">
          {staticCards.map((card) => (
            <div key={card.key}>{renderCard(card)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
