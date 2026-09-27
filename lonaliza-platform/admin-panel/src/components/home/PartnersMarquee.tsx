"use client";

/* Agent B: public homepage content */
/* Agent L2: live inspector bind */

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { EditableText } from "@/components/home/template/primitives";
import { postToParent } from "@/lib/visual-editor/protocol";
import {
  addLogoItem,
  logoField,
  LOGO_LIST_SETTING,
  readLogoList,
  serializeLogoList,
} from "@/lib/visual-editor/logo-lists";

function PartnerTile({
  name,
  logoUrl,
  builderId,
  field,
  instanceId,
}: {
  name: string;
  logoUrl: string;
  builderId?: string;
  field?: string;
  instanceId?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-4 py-3 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.35)]"
      data-builder-id={builderId}
      data-field={field}
      data-builder-field={field}
      data-instance-id={instanceId}
    >
      {logoUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={name}
          className="h-12 w-full object-contain object-center"
          data-builder-id={builderId}
          data-field={field}
          data-builder-field={field}
          data-instance-id={instanceId}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-12 w-full items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          data-builder-id={builderId}
          data-field={field}
        >
          {name ? name.slice(0, 1) : "+"}
        </span>
      )}
      <span className="text-[11px] font-semibold text-slate-600">{name}</span>
    </div>
  );
}

export default function PartnersMarquee({
  instance,
  editorMode = false,
}: {
  instance?: HomepageSectionInstance;
  editorMode?: boolean;
}) {
  const { t } = useLocale();
  const partners = readLogoList(instance, "partners");

  const fallbackStats = [
    { value: "200+", label: t.home.partnerHotels, valueField: "statHotels", labelField: "statHotelsLabel" },
    { value: "50+", label: t.home.airlines, valueField: "statAirlines", labelField: "statAirlinesLabel" },
    { value: "180+", label: t.home.countries, valueField: "statCountries", labelField: "statCountriesLabel" },
    { value: "24/7", label: t.home.support247, valueField: "statSupport", labelField: "statSupportLabel" },
  ];

  const addPartner = () => {
    if (!instance || !editorMode) return;
    const json = serializeLogoList(addLogoItem(partners, "partners"));
    postToParent({
      type: "alrayyan-ve-text",
      instanceId: instance.instanceId,
      field: LOGO_LIST_SETTING.partners,
      locale: "en",
      value: json,
    });
    window.dispatchEvent(
      new CustomEvent("alrayyan:ve-settings", {
        detail: {
          instanceId: instance.instanceId,
          settings: { [LOGO_LIST_SETTING.partners]: json },
        },
      })
    );
  };

  return (
    <div className="relative">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-white">{t.home.partnersTitle}</h3>
        <p className="mt-2 text-white/60">{t.home.partnersSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {partners.map((partner) => (
          <PartnerTile
            key={partner.id}
            name={partner.name}
            logoUrl={partner.logoUrl}
            builderId={instance ? `${instance.instanceId}.${logoField("partners", partner.id)}` : undefined}
            field={logoField("partners", partner.id)}
            instanceId={instance?.instanceId}
          />
        ))}
        {editorMode && instance ? (
          <button
            type="button"
            data-builder-chrome
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addPartner();
            }}
            className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/30 bg-white/5 text-white/80"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[11px] font-semibold">{t.editor.inspectorAddLogo}</span>
          </button>
        ) : null}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fallbackStats.map((stat) => (
          <div
            key={stat.valueField}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center"
            data-builder-id={instance ? `${instance.instanceId}.${stat.valueField}` : undefined}
            data-field={stat.valueField}
            data-builder-field={stat.valueField}
            data-instance-id={instance?.instanceId}
          >
            {instance ? (
              <>
                <EditableText
                  instance={instance}
                  field={stat.valueField}
                  editorMode={editorMode}
                  as="div"
                  className="text-2xl font-bold text-emerald-300"
                  fallback={stat.value}
                />
                <EditableText
                  instance={instance}
                  field={stat.labelField}
                  editorMode={editorMode}
                  as="div"
                  className="mt-1 text-xs text-white/60"
                  fallback={stat.label}
                />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-300">{stat.value}</div>
                <div className="mt-1 text-xs text-white/60">{stat.label}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
