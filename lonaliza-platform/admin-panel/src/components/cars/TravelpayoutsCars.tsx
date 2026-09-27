"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  carsSearchBootstrapKey,
  resolveCarsTpScriptUrl,
  type CarsTravelpayoutsConfig,
  type CarsSearchQuery,
} from "@/lib/cars-config";
import {
  applyTpembLabelDictionary,
  injectTpembScript,
  unlockTpembOverflow,
} from "@/lib/tpemb-embed";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import AlrayyanServiceBanner from "@/components/travel/AlrayyanServiceBanner";

type TravelpayoutsCarsProps = {
  config: CarsTravelpayoutsConfig;
};

function tryFillWidgetFields(root: HTMLElement, query: CarsSearchQuery): void {
  const inputs = Array.from(root.querySelectorAll("input, select"));
  const setIfEmpty = (el: Element, value: string) => {
    const input = el as HTMLInputElement;
    if (!value || input.value) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  for (const el of inputs) {
    const name = `${el.getAttribute("name") || ""} ${el.getAttribute("id") || ""} ${el.getAttribute("placeholder") || ""}`.toLowerCase();
    if (query.location && /city|location|pickup|pick/.test(name)) {
      setIfEmpty(el, query.location);
    }
    if (query.date && /date|pickup|from/.test(name) && !/return|drop/.test(name)) {
      setIfEmpty(el, query.date);
    }
    if (query.returnDate && /return|drop|to/.test(name)) {
      setIfEmpty(el, query.returnDate);
    }
  }
}

function readCarsSearchQuery(
  searchParams: ReturnType<typeof useSearchParams>
): CarsSearchQuery {
  return {
    location:
      searchParams.get("location") ||
      searchParams.get("pickup") ||
      searchParams.get("q") ||
      searchParams.get("from") ||
      undefined,
    date: searchParams.get("date") || searchParams.get("checkIn") || undefined,
    returnDate:
      searchParams.get("returnDate") ||
      searchParams.get("checkOut") ||
      undefined,
    country: searchParams.get("country") || undefined,
    city: searchParams.get("city") || undefined,
    guests: searchParams.get("guests") || undefined,
  };
}

export default function TravelpayoutsCars({ config }: TravelpayoutsCarsProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const mountRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<CarsSearchQuery>({});

  const query = useMemo(
    () => readCarsSearchQuery(searchParams),
    [searchParams]
  );
  queryRef.current = query;

  // Pickup/dates only. `lr_car_id` and other widget-owned keys must not remount.
  const bootstrapKey = carsSearchBootstrapKey(query);
  const scriptUrl = resolveCarsTpScriptUrl(config, query);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !scriptUrl) return;

    mount.replaceChildren();
    injectTpembScript(mount, scriptUrl);

    let enhancing = false;
    const enhance = () => {
      const widget = mountRef.current;
      if (enhancing || !widget) return;
      enhancing = true;
      try {
        unlockTpembOverflow(widget);
        applyTpembLabelDictionary(widget);
        tryFillWidgetFields(widget, queryRef.current);
        for (const iframe of widget.querySelectorAll("iframe")) {
          iframe.style.maxWidth = "100%";
          iframe.style.maxHeight = "none";
          iframe.style.overflow = "visible";
          iframe.style.position = "relative";
          iframe.style.background = "#ffffff";
        }
      } finally {
        enhancing = false;
      }
    };

    // childList only — subtree + GT/label rewrites loop and freeze the tab.
    const observer = new MutationObserver(() => enhance());
    observer.observe(mount, { childList: true, subtree: false });

    const timers = [400, 1200, 2500, 5000].map((ms) =>
      window.setTimeout(enhance, ms)
    );

    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      mount.replaceChildren();
    };
  }, [scriptUrl, bootstrapKey]);

  return (
    <section className="pb-16 bg-slate-50 min-h-screen">
      <AlrayyanServiceBanner
        kicker={t.cars.bannerKicker}
        title={t.cars.bannerTitle}
        subtitle={t.cars.bannerSubtitle}
        cta={t.cars.bannerCta}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div
          ref={mountRef}
          id="tp-cars-widget"
          className="tp-cars-widget relative z-30 w-full min-h-[28rem] bg-white"
        />
      </div>
    </section>
  );
}
