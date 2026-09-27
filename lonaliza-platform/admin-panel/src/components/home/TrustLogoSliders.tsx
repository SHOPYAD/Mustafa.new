"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { fillMarqueeItems } from "@/data/partner-logo-catalog";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { postToParent } from "@/lib/visual-editor/protocol";
import {
  addLogoItem,
  logoField,
  LOGO_LIST_SETTING,
  readLogoList,
  serializeLogoList,
  type EditorLogoItem,
  type LogoListKind,
} from "@/lib/visual-editor/logo-lists";

function LogoBox({
  src,
  label,
  builderId,
  field,
  instanceId,
}: {
  src: string;
  label: string;
  builderId?: string;
  field?: string;
  instanceId?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="flex h-16 w-[7.5rem] shrink-0 items-center justify-center rounded-xl bg-white px-2.5 py-2 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.45)]"
      data-builder-id={builderId}
      data-field={field}
      data-builder-field={field}
      data-instance-id={instanceId}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          width={120}
          height={40}
          className="h-10 w-full object-contain object-center"
          loading="eager"
          decoding="async"
          data-builder-id={builderId}
          data-field={field}
          data-builder-field={field}
          data-instance-id={instanceId}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-10 w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          logo
        </span>
      )}
    </div>
  );
}

function emitLogos(instanceId: string, kind: LogoListKind, items: EditorLogoItem[]) {
  const json = serializeLogoList(items);
  postToParent({
    type: "alrayyan-ve-text",
    instanceId,
    field: LOGO_LIST_SETTING[kind],
    locale: "en",
    value: json,
  });
  window.dispatchEvent(
    new CustomEvent("alrayyan:ve-settings", {
      detail: {
        instanceId,
        settings: { [LOGO_LIST_SETTING[kind]]: json },
      },
    })
  );
}

export default function TrustLogoSliders({
  instance,
  editorMode = false,
}: {
  instance?: HomepageSectionInstance;
  editorMode?: boolean;
}) {
  const { locale, t } = useLocale();
  const [remoteAirlines, setRemoteAirlines] = useState<EditorLogoItem[]>([]);
  const [remoteHotels, setRemoteHotels] = useState<EditorLogoItem[]>([]);

  useEffect(() => {
    if (instance?.settings.airlinesLogosJson || instance?.settings.hotelsLogosJson) return;
    let cancelled = false;
    fetch("/api/home/partner-logos")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const nextAirlines = Array.isArray(data.airlines) ? data.airlines : [];
        const nextHotels = Array.isArray(data.hotels) ? data.hotels : [];
        if (nextAirlines.length) {
          setRemoteAirlines(
            nextAirlines.map((row: { iata?: string; name?: string; logoUrl?: string }) => ({
              id: String(row.iata || row.name || "air").toLowerCase(),
              name: String(row.name || row.iata || "Airline"),
              logoUrl: String(row.logoUrl || ""),
              iata: row.iata,
            }))
          );
        }
        if (nextHotels.length) {
          setRemoteHotels(
            nextHotels.map(
              (row: {
                id?: string;
                name?: string;
                nameAr?: string;
                city?: string;
                cityAr?: string;
                stars?: number;
                logoUrl?: string;
              }) => ({
                id: String(row.id || row.name || "hotel"),
                name: String(row.name || "Hotel"),
                nameAr: row.nameAr,
                city: row.city,
                cityAr: row.cityAr,
                stars: row.stars,
                logoUrl: String(row.logoUrl || ""),
              })
            )
          );
        }
      })
      .catch(() => {
        /* bundled catalog */
      });
    return () => {
      cancelled = true;
    };
  }, [instance?.settings.airlinesLogosJson, instance?.settings.hotelsLogosJson]);

  const airlines = useMemo(() => {
    const fromDraft = instance ? readLogoList(instance, "airlines") : [];
    if (instance?.settings.airlinesLogosJson) return fromDraft;
    return remoteAirlines.length ? remoteAirlines : fromDraft;
  }, [instance, remoteAirlines]);

  const hotels = useMemo(() => {
    const fromDraft = instance ? readLogoList(instance, "hotels") : [];
    if (instance?.settings.hotelsLogosJson) return fromDraft;
    return remoteHotels.length ? remoteHotels : fromDraft;
  }, [instance, remoteHotels]);

  const airlineTrack = editorMode ? airlines : fillMarqueeItems(airlines, 24);
  const hotelTrack = editorMode ? hotels : fillMarqueeItems(hotels, 20);

  const add = (kind: LogoListKind, current: EditorLogoItem[]) => {
    if (!instance || !editorMode) return;
    emitLogos(instance.instanceId, kind, addLogoItem(current, kind));
  };

  return (
    <div className="space-y-7">
      <div data-field="airlines" data-builder-field="airlines" data-instance-id={instance?.instanceId}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {t.home.airlinesWeBook}
        </p>
        <div className="relative min-h-16 rounded-2xl border border-white/10 bg-white/5 py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          {editorMode ? (
            <div className="flex flex-wrap items-center gap-3 px-3">
              {airlineTrack.map((airline) => (
                <LogoBox
                  key={airline.id}
                  src={airline.logoUrl}
                  label={airline.name}
                  builderId={instance ? `${instance.instanceId}.${logoField("airlines", airline.id)}` : undefined}
                  field={logoField("airlines", airline.id)}
                  instanceId={instance?.instanceId}
                />
              ))}
              {instance ? (
                <button
                  type="button"
                  data-builder-chrome
                  onClick={() => add("airlines", airlines)}
                  className="inline-flex h-16 items-center gap-1 rounded-xl border border-dashed border-white/30 px-3 text-[11px] font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.editor.inspectorAddLogo}
                </button>
              ) : null}
            </div>
          ) : (
            <InfiniteSlider gap={14} duration={70} className="w-full min-w-0">
              {airlineTrack.map((airline, index) => (
                <LogoBox
                  key={`${airline.id}-${index}`}
                  src={airline.logoUrl}
                  label={airline.name}
                />
              ))}
            </InfiniteSlider>
          )}
        </div>
      </div>

      <div data-field="hotels" data-builder-field="hotels" data-instance-id={instance?.instanceId}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {t.home.hotelsWeBook}
        </p>
        <div className="relative min-h-16 rounded-2xl border border-white/10 bg-white/5 py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          {editorMode ? (
            <div className="flex flex-wrap items-center gap-3 px-3">
              {hotelTrack.map((hotel) => {
                const title = locale === "ar" ? hotel.nameAr || hotel.name : hotel.name;
                return (
                  <div key={hotel.id} className="flex w-[10.75rem] shrink-0 flex-col items-center gap-1.5">
                    <LogoBox
                      src={hotel.logoUrl}
                      label={title}
                      builderId={instance ? `${instance.instanceId}.${logoField("hotels", hotel.id)}` : undefined}
                      field={logoField("hotels", hotel.id)}
                      instanceId={instance?.instanceId}
                    />
                    <p className="line-clamp-1 w-full text-center text-[11px] font-semibold text-white">{title}</p>
                  </div>
                );
              })}
              {instance ? (
                <button
                  type="button"
                  data-builder-chrome
                  onClick={() => add("hotels", hotels)}
                  className="inline-flex h-16 items-center gap-1 rounded-xl border border-dashed border-white/30 px-3 text-[11px] font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.editor.inspectorAddLogo}
                </button>
              ) : null}
            </div>
          ) : (
            <InfiniteSlider gap={16} duration={55} reverse className="w-full min-w-0">
              {hotelTrack.map((hotel, index) => {
                const title = locale === "ar" ? hotel.nameAr || hotel.name : hotel.name;
                const city = locale === "ar" ? hotel.cityAr || hotel.city : hotel.city;
                return (
                  <div key={`${hotel.id}-${index}`} className="flex w-[10.75rem] shrink-0 flex-col items-center gap-1.5">
                    <LogoBox src={hotel.logoUrl} label={title} />
                    <p className="line-clamp-1 w-full text-center text-[11px] font-semibold text-white">{title}</p>
                    <p className="text-[10px] text-white/55">
                      {city} · {"★".repeat(hotel.stars || 5)}
                    </p>
                  </div>
                );
              })}
            </InfiniteSlider>
          )}
        </div>
      </div>
    </div>
  );
}
