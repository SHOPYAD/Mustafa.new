"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  MapPin,
  Hotel,
  Palmtree,
  Shield,
  Tag,
  ArrowRightLeft,
  Car,
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  resolveVisibleSearchTabs,
  type SearchTabKey,
} from "@/data/search-tabs";
import { useSearchTabs } from "@/components/search/SearchTabsProvider";
import { SearchTabGlyph, useUiIconsFile } from "@/components/search/search-tab-icons";
import type { UiIconsFile } from "@/lib/ui-icons-store";
import { buildFlightSearchParam } from "@/lib/travelpayouts-utils";
import LocationAutocomplete from "@/components/cars/LocationAutocomplete";
import LiveFlightSearchPanel from "@/components/flights/LiveFlightSearchPanel";
import AirportAutocomplete from "@/components/flights/AirportAutocomplete";
import { flightCopy } from "@/components/flights/copy";
import type { AirportPick } from "@/components/flights/types";
import { useCarsConfig } from "@/hooks/useCarsConfig";
import { useFlightsConfig } from "@/hooks/useFlightsConfig";
import { isLiveFlightProvider } from "@/lib/flights-config";
import { hotelSearchToParams, type GeoPlaceHit } from "@/lib/hotel-search";
import { nightsBetween } from "@/lib/hotel-display";
import DateField from "@/components/search/DateField";
import GuestsField from "@/components/search/GuestsField";
import PlaceAutocomplete from "@/components/search/PlaceAutocomplete";
import SearchSubmitButton from "@/components/search/SearchSubmitButton";
import SegmentPills, { PillToggle } from "@/components/search/SegmentPills";
import TimeField from "@/components/search/TimeField";

export type SearchWidgetAppearance = {
  tabBarBg?: string;
  tabActiveBg?: string;
  tabActiveText?: string;
  tabIdleText?: string;
  panelBg?: string;
  tabVisibility?: Partial<Record<SearchTabKey, boolean>>;
  tabIcons?: Partial<Record<SearchTabKey, string>>;
  /* Agent L2: live inspector bind */
  tabLabels?: Partial<Record<SearchTabKey, string>>;
};

export type SearchWidgetProps = {
  builderMode?: boolean;
  appearance?: SearchWidgetAppearance;
  variant?: "default" | "hero";
  /* Agent L2: live inspector bind */
  sectionInstanceId?: string;
};

function isCustomIconSrc(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

function TabIcon({
  tab,
  store,
  override,
}: {
  tab: SearchTabKey;
  store: UiIconsFile;
  override?: string;
}) {
  /* Agent L2: live inspector bind */
  if (override && isCustomIconSrc(override)) {
    return (
      <span
        data-builder-icon=""
        className="relative inline-flex h-4 w-4 shrink-0 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={override} alt="" className="h-4 w-4 object-contain" />
      </span>
    );
  }
  if (override && /^(isax|fa-|fab |fas |far |fal |fad )/i.test(override)) {
    return (
      <span data-builder-icon="" className="inline-flex h-4 w-4 items-center justify-center">
        <i className={override} />
      </span>
    );
  }
  if (override && !/^[a-z0-9-]+$/i.test(override)) {
    return (
      <span data-builder-icon="" className="inline-flex h-4 w-4 items-center justify-center text-sm leading-none">
        {override}
      </span>
    );
  }
  if (override) {
    return (
      <span data-builder-icon="" className="inline-flex">
        <DynamicIcon
          name={override as IconName}
          size={16}
          fallback={() => <SearchTabGlyph tab={tab} size={16} store={store} />}
        />
      </span>
    );
  }
  return (
    <span data-builder-icon="" className="inline-flex">
      <SearchTabGlyph tab={tab} size={16} store={store} />
    </span>
  );
}

const TAB_LABEL: Record<
  SearchTabKey,
  (t: { search: Record<string, string> }) => string
> = {
  flight: (t) => t.search.flights,
  holiday: (t) => t.search.holidays,
  hotel: (t) => t.search.hotels,
  tours: (t) => t.search.tours,
  transfers: (t) => t.search.transfers,
  cars: (t) => t.search.cars,
  insurance: (t) => t.search.insurance,
  visa: (t) => t.search.visa,
  offers: (t) => t.search.offers,
};

function fieldsGridClass(tab: SearchTabKey, carsInternal: boolean): string {
  switch (tab) {
    case "hotel":
      return "xl:grid-cols-[minmax(12rem,1.3fr)_minmax(12rem,1.2fr)_minmax(10rem,1fr)_auto]";
    case "tours":
    case "holiday":
      return "xl:grid-cols-[minmax(12rem,1.4fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_auto]";
    case "insurance":
      return "xl:grid-cols-[minmax(12rem,1.3fr)_minmax(11rem,1.1fr)_minmax(9rem,0.8fr)_auto]";
    case "visa":
      return "xl:grid-cols-[minmax(12rem,1fr)_auto]";
    case "transfers":
      return "xl:grid-cols-[minmax(10rem,1.1fr)_minmax(10rem,1.1fr)_minmax(9rem,0.9fr)_minmax(7.5rem,0.7fr)_minmax(8rem,0.8fr)_auto]";
    case "cars":
      return carsInternal
        ? "xl:grid-cols-[minmax(10rem,1.1fr)_minmax(10rem,1.1fr)_minmax(11rem,1.2fr)_minmax(8rem,0.8fr)_auto]"
        : "xl:grid-cols-[minmax(12rem,1.3fr)_minmax(12rem,1.2fr)_auto]";
    case "flight":
      return "xl:grid-cols-[minmax(12rem,1.15fr)_minmax(11rem,0.95fr)_auto]";
    case "offers":
      return "";
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

function SearchTabButton({
  tab,
  active,
  onSelect,
  label,
  store,
  appearance,
  iconOverride,
  builderMode,
  sectionInstanceId,
}: {
  tab: SearchTabKey;
  active: boolean;
  onSelect: () => void;
  label: string;
  store: UiIconsFile;
  appearance?: SearchWidgetAppearance;
  iconOverride?: string;
  builderMode?: boolean;
  sectionInstanceId?: string;
}) {
  const activeBg = appearance?.tabActiveBg || "var(--theme-tab-active-bg)";
  const activeText = appearance?.tabActiveText || "var(--theme-tab-active-text)";
  const idleText = appearance?.tabIdleText || "var(--theme-tab-idle-text)";
  return (
    <button
      type="button"
      onClick={onSelect}
      data-builder-field={`search.tab.${tab}`}
      data-field={`search.tab.${tab}`}
      data-builder-id={`search.tab.${tab}`}
      data-instance-id={sectionInstanceId}
      data-search-tab={tab}
      role="tab"
      aria-selected={active}
      className={cn(
        /* Agent D: mobile + search tabs */
        "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 sm:min-h-[2.35rem] sm:px-3.5 sm:text-sm",
        !active && "hover:bg-[var(--theme-nav-hover)]"
      )}
      style={
        active
          ? { backgroundColor: activeBg, color: activeText }
          : { color: idleText, backgroundColor: "var(--theme-tab-idle-bg)" }
      }
    >
      <TabIcon tab={tab} store={store} override={iconOverride} />
      <span data-builder-text="">{label}</span>
      {builderMode ? <span className="sr-only">edit tab</span> : null}
    </button>
  );
}

function formatAirport(pick: AirportPick | null): string {
  if (!pick) return "";
  const code = pick.iata || pick.skyId;
  const city = pick.city || pick.name;
  return code ? `${city} (${code})` : city;
}

export default function SearchWidget({
  builderMode = false,
  appearance,
  variant = "default",
  sectionInstanceId,
}: SearchWidgetProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const flightLabels = useMemo(() => flightCopy(locale), [locale]);
  const { config: carsConfig } = useCarsConfig();
  const { config: flightsConfig } = useFlightsConfig();
  const carsInternal = carsConfig.provider === "internal";
  const liveFlights = isLiveFlightProvider(flightsConfig.provider);
  const iconStore = useUiIconsFile();
  const searchTabs = useSearchTabs();

  const initialTab = (searchParams.get("type") as SearchTabKey) || "holiday";
  const [activeTab, setActiveTab] = useState<SearchTabKey>(initialTab);

  const [destination, setDestination] = useState(searchParams.get("q") || "");
  const [hotelGeoId, setHotelGeoId] = useState("");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [guests, setGuests] = useState(Number(searchParams.get("guests") || "2") || 2);

  const [flightType, setFlightType] = useState<"one-way" | "round-trip" | "multi-city">(
    "round-trip"
  );
  const [fromCity, setFromCity] = useState(searchParams.get("from") || "");
  const [originPick, setOriginPick] = useState<AirportPick | null>(null);
  const [destPick, setDestPick] = useState<AirportPick | null>(null);
  const [directOnly, setDirectOnly] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);

  const [toCity, setToCity] = useState(searchParams.get("to") || "");
  const [pickupTime, setPickupTime] = useState(searchParams.get("time") || "10:00");
  const [pickupLocation, setPickupLocation] = useState(
    searchParams.get("pickup") ||
      searchParams.get("from") ||
      searchParams.get("location") ||
      ""
  );
  const [dropoffLocation, setDropoffLocation] = useState(
    searchParams.get("dropoff") || searchParams.get("to") || ""
  );

  /* Agent D: mobile + search tabs — same visibility source on every breakpoint.
     Hidden tabs are omitted from the DOM; no CSS display reset can resurrect them. */
  const visibleTabs = useMemo(
    () =>
      resolveVisibleSearchTabs(
        searchTabs.visibility,
        appearance?.tabVisibility,
        searchTabs.order
      ),
    [appearance?.tabVisibility, searchTabs.order, searchTabs.visibility]
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] ?? "holiday");
    }
  }, [visibleTabs, activeTab]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (builderMode) return;
      const params = new URLSearchParams();

      switch (activeTab) {
        case "hotel": {
          router.push(
            `/hotels?${hotelSearchToParams({
              q: destination,
              geoId: hotelGeoId,
              destId: "",
              checkIn,
              checkOut,
              adults: guests,
              children: 0,
              rooms,
              childrenAges: [],
            })}`
          );
          return;
        }
        case "tours": {
          if (destination) params.set("q", destination);
          if (date) params.set("date", date);
          if (guests) params.set("guests", String(guests));
          router.push(params.toString() ? `/vip-tours?${params}` : "/vip-tours");
          return;
        }
        case "transfers": {
          if (fromCity) params.set("from", fromCity);
          if (toCity) params.set("to", toCity);
          if (date) params.set("date", date);
          if (pickupTime) params.set("time", pickupTime);
          if (guests) params.set("guests", String(guests));
          router.push(params.toString() ? `/transfers?${params}` : "/transfers");
          return;
        }
        case "cars": {
          if (carsInternal) {
            if (pickupLocation) params.set("pickup", pickupLocation);
            if (dropoffLocation) params.set("dropoff", dropoffLocation);
          } else if (destination) {
            params.set("location", destination);
          }
          if (date) params.set("date", date);
          if (returnDate) params.set("returnDate", returnDate);
          if (guests) params.set("guests", String(guests));
          router.push(params.toString() ? `/cars?${params}` : "/cars");
          return;
        }
        case "visa": {
          router.push(destination ? `/visa?q=${encodeURIComponent(destination)}` : "/visa");
          return;
        }
        case "insurance": {
          if (destination) params.set("q", destination);
          params.set("type", "insurance");
          if (date) params.set("date", date);
          if (returnDate) params.set("returnDate", returnDate);
          if (guests) params.set("guests", String(guests));
          router.push(`/search?${params}`);
          return;
        }
        case "offers":
        case "holiday": {
          if (destination) params.set("q", destination);
          params.set("type", activeTab);
          if (date) params.set("date", date);
          if (guests) params.set("guests", String(guests));
          router.push(`/search?${params}`);
          return;
        }
        case "flight": {
          const from = formatAirport(originPick) || fromCity;
          const to = formatAirport(destPick) || destination;
          const flightParams = new URLSearchParams();
          if (from) flightParams.set("from", originPick?.iata || from);
          if (to) flightParams.set("to", destPick?.iata || to);
          if (date) flightParams.set("date", date);
          if (returnDate) flightParams.set("returnDate", returnDate);
          flightParams.set("guests", String(guests));
          flightParams.set("adults", String(guests));
          flightParams.set("flightType", flightType);
          flightParams.set("class", cabinClass);
          if (directOnly) flightParams.set("directOnly", "1");
          const flightSearch = buildFlightSearchParam({
            from: originPick?.iata || from,
            to: destPick?.iata || to,
            date,
            returnDate,
            guests: String(guests),
            flightType,
            class: cabinClass,
          });
          if (flightSearch) flightParams.set("flightSearch", flightSearch);
          router.push(flightParams.toString() ? `/flights?${flightParams}` : "/flights");
          return;
        }
        default: {
          const _exhaustive: never = activeTab;
          return _exhaustive;
        }
      }
    },
    [
      destination,
      hotelGeoId,
      activeTab,
      date,
      guests,
      flightType,
      fromCity,
      originPick,
      destPick,
      directOnly,
      returnDate,
      cabinClass,
      checkIn,
      checkOut,
      rooms,
      toCity,
      pickupTime,
      pickupLocation,
      dropoffLocation,
      carsInternal,
      router,
      builderMode,
    ]
  );

  const onPlace = (setter: (v: string) => void, geoSetter?: (id: string) => void) => {
    return (value: string, place?: GeoPlaceHit) => {
      setter(value);
      geoSetter?.(place?.geoId || "");
    };
  };

  const guestsSummary = `${guests} ${t.search.guests}`;
  const hotelSummary = `${rooms} ${t.search.rooms} · ${guests} ${t.search.guests}`;
  const hotelNights = nightsBetween(checkIn, checkOut);
  const applyLabel = t.hotels.applyOccupancy;
  const doneLabel = t.hotels.doneOccupancy;

  const cabinExtra = (
    <div className="mt-2 grid grid-cols-2 gap-1.5">
      {(
        [
          ["economy", "Economy"],
          ["premium", "Premium"],
          ["business", "Business"],
          ["first", "First"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setCabinClass(value)}
          className={cn(
            "rounded-xl border px-3 py-2 text-xs font-semibold transition",
            cabinClass === value
              ? "border-[var(--brand-primary)] bg-[var(--theme-chip-hover)] text-[var(--navy)]"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "flight":
        return (
          <>
            <div className="col-span-full flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <SegmentPills
                value={flightType}
                onChange={setFlightType}
                options={[
                  { value: "round-trip", label: t.search.roundTrip },
                  { value: "one-way", label: t.search.oneWay },
                  { value: "multi-city", label: t.search.multiCity },
                ]}
              />
              <PillToggle
                checked={directOnly}
                onChange={setDirectOnly}
                label={flightLabels.nonstopOnly}
              />
            </div>
            <div className="relative col-span-full flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr]">
              <AirportAutocomplete
                label={flightLabels.departureAirport}
                value={originPick}
                copy={flightLabels}
                onChange={(origin) => {
                  setOriginPick(origin);
                  setFromCity(formatAirport(origin));
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setOriginPick(destPick);
                  setDestPick(originPick);
                  setFromCity(formatAirport(destPick));
                  setDestination(formatAirport(originPick));
                }}
                className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-[color:var(--theme-input-border)] bg-[var(--theme-card-bg)] text-[var(--navy)] shadow-sm transition hover:border-[var(--brand-primary)] hover:bg-[var(--theme-chip-hover)] md:my-auto"
                aria-label={flightLabels.swap}
              >
                <ArrowRightLeft size={16} className="rotate-90 md:rotate-0" />
              </button>
              <AirportAutocomplete
                label={flightLabels.arrivalAirport}
                value={destPick}
                copy={flightLabels}
                onChange={(next) => {
                  setDestPick(next);
                  setDestination(formatAirport(next));
                }}
              />
            </div>
            <DateField
              mode={flightType === "round-trip" ? "range" : "single"}
              start={date}
              end={returnDate}
              startLabel={t.search.departure}
              endLabel={t.search.return}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.departure}
              selectEnd={t.search.return}
              doneLabel={doneLabel}
              onChange={(start, end) => {
                setDate(start);
                if (end) setReturnDate(end);
              }}
            />
            <GuestsField
              label={`${t.search.guestsLabel} & ${t.search.class}`}
              summary={`${guestsSummary} · ${cabinClass}`}
              applyLabel={applyLabel}
              extra={cabinExtra}
              rows={[
                {
                  key: "guests",
                  label: t.search.guests,
                  value: guests,
                  min: 1,
                  max: 9,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "hotel":
        return (
          <>
            <PlaceAutocomplete
              value={destination}
              onChange={onPlace(setDestination, setHotelGeoId)}
              label={t.search.destination}
              placeholder={t.hotels.destinationPlaceholder}
              icon={Hotel}
            />
            <DateField
              mode="range"
              start={checkIn}
              end={checkOut}
              startLabel={t.search.checkIn}
              endLabel={t.search.checkOut}
              placeholder={t.hotels.selectDates}
              selectStart={t.hotels.selectCheckIn}
              selectEnd={t.hotels.selectCheckOut}
              doneLabel={doneLabel}
              nightsLabel={t.hotels.nightsStay(hotelNights)}
              onChange={(start, end) => {
                setCheckIn(start);
                setCheckOut(end || "");
              }}
            />
            <GuestsField
              label={`${t.search.rooms} & ${t.search.guests}`}
              summary={hotelSummary}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "rooms",
                  label: t.search.rooms,
                  value: rooms,
                  min: 1,
                  max: 8,
                  onChange: setRooms,
                },
                {
                  key: "guests",
                  label: t.hotels.adults,
                  value: guests,
                  min: 1,
                  max: 16,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "tours":
        return (
          <>
            <PlaceAutocomplete
              value={destination}
              onChange={onPlace(setDestination)}
              label={t.search.destination}
              placeholder={t.hotels.destinationPlaceholder}
              icon={Palmtree}
            />
            <DateField
              mode="single"
              start={date}
              startLabel={t.search.date}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.date}
              doneLabel={doneLabel}
              onChange={setDate}
            />
            <GuestsField
              label={t.search.guests}
              summary={guestsSummary}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "guests",
                  label: t.search.guests,
                  value: guests,
                  min: 1,
                  max: 12,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "insurance":
        return (
          <>
            <PlaceAutocomplete
              value={destination}
              onChange={onPlace(setDestination)}
              label={t.search.destination}
              placeholder={t.hotels.destinationPlaceholder}
              icon={Shield}
            />
            <DateField
              mode="range"
              start={date}
              end={returnDate}
              startLabel={t.search.date}
              endLabel={t.search.return}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.date}
              selectEnd={t.search.return}
              doneLabel={doneLabel}
              onChange={(start, end) => {
                setDate(start);
                if (end) setReturnDate(end);
              }}
            />
            <GuestsField
              label={t.search.guests}
              summary={guestsSummary}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "guests",
                  label: t.search.guests,
                  value: guests,
                  min: 1,
                  max: 9,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "visa":
        return (
          <PlaceAutocomplete
            value={destination}
            onChange={onPlace(setDestination)}
            label={t.search.visa}
            placeholder={
              locale === "ar" ? "تركيا، شنغن، الإمارات…" : "Turkey, Schengen, UAE…"
            }
            icon={FileText}
          />
        );

      case "offers":
        return (
          <div className="col-span-full py-3 text-center">
            <Tag size={36} className="mx-auto mb-2 text-[var(--brand-primary)]" />
            <h3 className="mb-1 text-lg font-bold text-[var(--navy)]">{t.search.offers}</h3>
            <p className="mb-3 text-sm text-slate-600">{t.search.trustBestPrice}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-[var(--theme-badge-bg)] px-3 py-1 text-xs font-semibold text-[var(--theme-badge-text)]">
                Turkey packages
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                {t.search.trustSupport}
              </span>
            </div>
          </div>
        );

      case "holiday":
        return (
          <>
            <PlaceAutocomplete
              value={destination}
              onChange={onPlace(setDestination)}
              label={t.search.destination}
              placeholder={t.hotels.destinationPlaceholder}
              icon={MapPin}
            />
            <DateField
              mode="single"
              start={date}
              startLabel={t.search.date}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.date}
              doneLabel={doneLabel}
              onChange={setDate}
            />
            <GuestsField
              label={t.search.guests}
              summary={guestsSummary}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "guests",
                  label: t.search.guests,
                  value: guests,
                  min: 1,
                  max: 12,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "transfers":
        return (
          <>
            <PlaceAutocomplete
              value={fromCity}
              onChange={onPlace(setFromCity)}
              label={t.search.from}
              placeholder={
                locale === "ar" ? "مطار / مدينة المغادرة" : "Airport / city"
              }
              icon={MapPin}
            />
            <PlaceAutocomplete
              value={toCity}
              onChange={onPlace(setToCity)}
              label={t.search.to}
              placeholder={
                locale === "ar" ? "مطار / مدينة الوصول" : "Airport / city"
              }
              icon={Car}
            />
            <DateField
              mode="single"
              start={date}
              startLabel={t.search.date}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.date}
              doneLabel={doneLabel}
              onChange={setDate}
            />
            <TimeField
              value={pickupTime}
              onChange={setPickupTime}
              label={t.search.time}
              placeholder="10:00"
            />
            <GuestsField
              label={t.search.guests}
              summary={guestsSummary}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "guests",
                  label: t.search.guests,
                  value: guests,
                  min: 1,
                  max: 8,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        );

      case "cars":
        return carsInternal ? (
          <>
            <LocationAutocomplete
              variant="widget"
              label={t.cars.pickup}
              value={pickupLocation}
              onChange={setPickupLocation}
              placeholder={t.cars.pickupPlaceholder}
              icon={Car}
            />
            <LocationAutocomplete
              variant="widget"
              label={t.cars.dropoff}
              value={dropoffLocation}
              onChange={setDropoffLocation}
              placeholder={t.cars.dropoffPlaceholder}
              icon={MapPin}
            />
            <DateField
              mode="range"
              start={date}
              end={returnDate}
              startLabel={t.cars.pickupDate}
              endLabel={t.cars.dropoffDate}
              placeholder={t.hotels.selectDates}
              selectStart={t.cars.pickupDate}
              selectEnd={t.cars.dropoffDate}
              doneLabel={doneLabel}
              onChange={(start, end) => {
                setDate(start);
                if (end) setReturnDate(end);
              }}
            />
            <GuestsField
              label={t.cars.passengers}
              summary={String(guests)}
              applyLabel={applyLabel}
              rows={[
                {
                  key: "guests",
                  label: t.cars.passengers,
                  value: guests,
                  min: 1,
                  max: 8,
                  onChange: setGuests,
                },
              ]}
            />
          </>
        ) : (
          <>
            <PlaceAutocomplete
              value={destination}
              onChange={onPlace(setDestination)}
              label={t.search.destination}
              placeholder={t.hotels.destinationPlaceholder}
              icon={Car}
            />
            <DateField
              mode="range"
              start={date}
              end={returnDate}
              startLabel={t.search.checkIn}
              endLabel={t.search.checkOut}
              placeholder={t.hotels.selectDates}
              selectStart={t.search.checkIn}
              selectEnd={t.search.checkOut}
              doneLabel={doneLabel}
              onChange={(start, end) => {
                setDate(start);
                if (end) setReturnDate(end);
              }}
            />
          </>
        );

      default: {
        const _exhaustive: never = activeTab;
        return _exhaustive;
      }
    }
  };

  const tabBarBg = appearance?.tabBarBg || "var(--brand-header)";
  const panelBg = appearance?.panelBg || "var(--theme-search-glass)";
  const isHero = variant === "hero";

  return (
    <div
      className={cn("mx-auto w-full", isHero ? "max-w-7xl" : "max-w-6xl")}
      data-builder-field="search.widget"
    >
      <div
        className="alrayyan-search-widget overflow-hidden rounded-[var(--radius-card)]"
        style={{ backgroundColor: panelBg, boxShadow: "var(--theme-shadow-lg)" }}
      >
        <div
          className="px-2 py-2 sm:px-3 sm:py-2"
          style={{ backgroundColor: tabBarBg }}
          data-builder-field="search.tabBar"
        >
          <div
            className="flex gap-1 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch]"
            role="tablist"
            aria-label={t.search.search}
          >
            {visibleTabs.map((tab) => (
              <SearchTabButton
                key={tab}
                tab={tab}
                active={activeTab === tab}
                onSelect={() => setActiveTab(tab)}
                label={appearance?.tabLabels?.[tab] || TAB_LABEL[tab](t)}
                store={iconStore}
                appearance={appearance}
                iconOverride={appearance?.tabIcons?.[tab]}
                builderMode={builderMode}
                sectionInstanceId={sectionInstanceId}
              />
            ))}
          </div>
        </div>

        <div className="overflow-visible p-3 sm:p-3.5 md:p-4" style={{ backgroundColor: panelBg }}>
          {liveFlights && activeTab === "flight" ? (
            <LiveFlightSearchPanel variant="embedded" />
          ) : (
            <form onSubmit={handleSearch} className="overflow-visible">
              <div
                className={cn(
                  "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5",
                  fieldsGridClass(activeTab, carsInternal)
                )}
              >
                {renderTabContent()}
                {activeTab !== "offers" ? (
                  <SearchSubmitButton
                    label={t.search.search}
                    className="col-span-full w-full whitespace-nowrap text-white sm:col-span-2 xl:col-span-1 xl:w-auto"
                  />
                ) : null}
              </div>
            </form>
          )}

          {!(liveFlights && activeTab === "flight") ? (
            <div className="mt-3 flex items-center justify-start gap-4 overflow-x-auto border-t border-slate-100 pt-3 text-xs text-slate-500 scrollbar-hide sm:flex-wrap sm:justify-center">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
                <span>{t.search.trustSecure}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--brand-primary)]">24/7</span>
                <span>{t.search.trustSupport}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[var(--navy)]">★</span>
                <span>{t.search.trustBestPrice}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
