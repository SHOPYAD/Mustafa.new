"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { CarExtra, RentalCar, RentalCarInput } from "@/types/car";
import {
  CAR_CATEGORIES,
  CAR_TRANSMISSIONS,
  defaultCarExtras,
} from "@/types/car";
import {
  TURKEY_LOCATIONS,
  locationDisplayName,
} from "@/lib/cars/turkey-locations";
import { carCategoryLabel, carExtraLabel, carTransmissionLabel } from "@/lib/cars/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CarFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: RentalCarInput) => void;
  editItem?: RentalCar | null;
};

const emptyForm = {
  name: "",
  nameAr: "",
  nameTr: "",
  slug: "",
  category: "sedan" as RentalCar["category"],
  passengers: 5,
  transmission: "automatic" as RentalCar["transmission"],
  airConditioning: true,
  doors: 4,
  luggage: 2,
  image: "",
  pricePerDay: 40,
  nationwide: false,
  pickupLocationIds: [] as string[],
  extras: defaultCarExtras(),
  isActive: true,
};

const inputClass =
  "w-full px-4 py-2.5 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm";

export default function CarFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}: CarFormModalProps) {
  const { locale } = useLocale();
  const [form, setForm] = useState(emptyForm);
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setForm({
        name: editItem.name,
        nameAr: editItem.nameAr,
        nameTr: editItem.nameTr,
        slug: editItem.slug,
        category: editItem.category,
        passengers: editItem.passengers,
        transmission: editItem.transmission,
        airConditioning: editItem.airConditioning,
        doors: editItem.doors,
        luggage: editItem.luggage,
        image: editItem.image,
        pricePerDay: editItem.pricePerDay,
        nationwide: editItem.pickupLocationIds.includes("*"),
        pickupLocationIds: editItem.pickupLocationIds.filter((id) => id !== "*"),
        extras: editItem.extras.length ? editItem.extras : defaultCarExtras(),
        isActive: editItem.isActive,
      });
    } else {
      setForm({
        ...emptyForm,
        extras: defaultCarExtras(),
        pickupLocationIds: [],
      });
    }
    setLocationQuery("");
  }, [editItem, isOpen]);

  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return TURKEY_LOCATIONS.slice(0, 40);
    return TURKEY_LOCATIONS.filter((loc) => {
      return (
        loc.id.includes(q) ||
        loc.slug.includes(q) ||
        loc.iata?.toLowerCase().includes(q) ||
        loc.names.en.toLowerCase().includes(q) ||
        loc.names.tr.toLowerCase().includes(q) ||
        loc.names.ar.includes(locationQuery)
      );
    }).slice(0, 50);
  }, [locationQuery]);

  if (!isOpen) return null;

  const toggleLocation = (id: string) => {
    setForm((prev) => ({
      ...prev,
      pickupLocationIds: prev.pickupLocationIds.includes(id)
        ? prev.pickupLocationIds.filter((item) => item !== id)
        : [...prev.pickupLocationIds, id],
    }));
  };

  const updateExtra = (key: CarExtra["key"], patch: Partial<CarExtra>) => {
    setForm((prev) => ({
      ...prev,
      extras: prev.extras.map((extra) =>
        extra.key === key ? { ...extra, ...patch } : extra
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      nameAr: form.nameAr || form.name,
      nameTr: form.nameTr || form.name,
      slug: form.slug,
      category: form.category,
      passengers: form.passengers,
      transmission: form.transmission,
      airConditioning: form.airConditioning,
      doors: form.doors,
      luggage: form.luggage,
      image: form.image,
      pricePerDay: form.pricePerDay,
      pickupLocationIds: form.nationwide ? ["*"] : form.pickupLocationIds,
      extras: form.extras,
      isActive: form.isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-slate-900 border border-admin-border-subtle rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground font-bold text-lg">
            {editItem ? "Edit car" : "Add car"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-admin-bg-subtle hover:bg-muted text-muted-foreground flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Name (EN)</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Name (AR)</label>
            <input
              className={inputClass}
              value={form.nameAr}
              onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Name (TR)</label>
            <input
              className={inputClass}
              value={form.nameTr}
              onChange={(e) => setForm((p) => ({ ...p, nameTr: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Image URL</label>
            <input
              className={inputClass}
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Category</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value as RentalCar["category"],
                }))
              }
            >
              {CAR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {carCategoryLabel(cat, locale)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Transmission</label>
            <select
              className={inputClass}
              value={form.transmission}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  transmission: e.target.value as RentalCar["transmission"],
                }))
              }
            >
              {CAR_TRANSMISSIONS.map((item) => (
                <option key={item} value={item}>
                  {carTransmissionLabel(item, locale)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Price / day (USD)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.pricePerDay}
              onChange={(e) =>
                setForm((p) => ({ ...p, pricePerDay: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Passengers</label>
            <input
              type="number"
              min={1}
              max={16}
              className={inputClass}
              value={form.passengers}
              onChange={(e) =>
                setForm((p) => ({ ...p, passengers: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Doors</label>
            <input
              type="number"
              min={2}
              max={6}
              className={inputClass}
              value={form.doors}
              onChange={(e) =>
                setForm((p) => ({ ...p, doors: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs text-admin-text-muted mb-1.5">Luggage</label>
            <input
              type="number"
              min={0}
              max={12}
              className={inputClass}
              value={form.luggage}
              onChange={(e) =>
                setForm((p) => ({ ...p, luggage: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.airConditioning}
              onChange={(e) =>
                setForm((p) => ({ ...p, airConditioning: e.target.checked }))
              }
            />
            Air conditioning
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.nationwide}
              onChange={(e) =>
                setForm((p) => ({ ...p, nationwide: e.target.checked }))
              }
            />
            All Turkey locations
          </label>
        </div>

        {!form.nationwide ? (
          <div className="mt-5">
            <label className="block text-xs text-admin-text-muted mb-1.5">
              Pickup cities / airports ({form.pickupLocationIds.length} selected)
            </label>
            <input
              className={`${inputClass} mb-3`}
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search Istanbul, IST, Antalya..."
            />
            <div className="max-h-40 overflow-y-auto rounded-xl border border-admin-border-subtle p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLocations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    checked={form.pickupLocationIds.includes(loc.id)}
                    onChange={() => toggleLocation(loc.id)}
                  />
                  <span className="truncate">
                    {locationDisplayName(loc, locale)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-2">
          <p className="text-xs text-admin-text-muted uppercase tracking-wider">
            Extras (USD / day)
          </p>
          {form.extras.map((extra) => (
            <div
              key={extra.key}
              className="grid grid-cols-12 gap-3 items-center"
            >
              <label className="col-span-6 text-sm text-muted-foreground">
                {carExtraLabel(extra.key, locale)}
              </label>
              <label className="col-span-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={extra.included}
                  onChange={(e) =>
                    updateExtra(extra.key, { included: e.target.checked })
                  }
                />
                Included
              </label>
              <input
                type="number"
                min={0}
                className={`${inputClass} col-span-3`}
                value={extra.pricePerDay}
                onChange={(e) =>
                  updateExtra(extra.key, {
                    pricePerDay: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl"
          >
            Save car
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-admin-bg-subtle text-muted-foreground font-medium rounded-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
