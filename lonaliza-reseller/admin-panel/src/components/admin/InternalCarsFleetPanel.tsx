"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Car,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { RentalCar, RentalCarInput } from "@/types/car";
import CarFormModal from "@/components/admin/CarFormModal";
import { carCategoryLabel } from "@/lib/cars/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatUsd } from "@/lib/cars/matching";

export default function InternalCarsFleetPanel() {
  const { locale } = useLocale();
  const [cars, setCars] = useState<RentalCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<RentalCar | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cars", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.cars)) {
        setCars(data.cars as RentalCar[]);
      }
    } catch {
      setMessage("Failed to load fleet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCar = async (input: RentalCarInput) => {
    const isEdit = Boolean(editing);
    const res = await fetch("/api/admin/cars", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...input, id: editing?.id } : input),
    });
    const data = await res.json();
    if (!data?.ok) {
      setMessage(data?.error || "Save failed");
      return;
    }
    setEditing(null);
    await load();
  };

  const toggleActive = async (car: RentalCar) => {
    await fetch("/api/admin/cars", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: car.id, name: car.name, isActive: !car.isActive }),
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/cars?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setDeleteConfirmId(null);
    await load();
  };

  const handleReset = async () => {
    await fetch("/api/admin/cars", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setShowResetConfirm(false);
    await load();
  };

  const filtered = cars.filter((car) => {
    const q = searchQuery.toLowerCase();
    return (
      car.name.toLowerCase().includes(q) ||
      car.nameAr.includes(searchQuery) ||
      car.nameTr.toLowerCase().includes(q) ||
      car.category.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10">
        <Loader2 size={18} className="animate-spin" />
        Loading fleet…
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-muted-foreground text-sm">
          {cars.length} cars · {cars.filter((c) => c.isActive).length} active · prices in USD
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-admin-bg-subtle hover:bg-muted text-admin-text-muted hover:text-admin-text-primary font-medium rounded-xl min-h-11 transition-all flex items-center gap-2 text-sm"
          >
            <RotateCcw size={14} />
            Reset seed fleet
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Add car
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fleet…"
          className="w-full pl-12 pr-4 py-3 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {message ? <p className="text-sm text-amber-300 mb-4">{message}</p> : null}

      <div className="bg-admin-bg-surface border border-admin-border-subtle rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-admin-border-subtle text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">Vehicle</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">USD / day</div>
          <div className="col-span-1">Seats</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Car size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-muted-foreground text-lg">No cars in the internal fleet</p>
          </div>
        ) : (
          filtered.map((car) => (
            <div
              key={car.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-admin-border-subtle hover:bg-white/[0.02] ${
                !car.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="col-span-4 flex items-center gap-3">
                {car.image ? (
                  <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={car.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="text-foreground font-medium text-sm truncate">{car.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{car.nameAr}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400">
                  {carCategoryLabel(car.category, locale)}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-amber-400 font-bold text-sm">
                  {formatUsd(car.pricePerDay)}
                </span>
              </div>
              <div className="col-span-1 flex items-center text-muted-foreground text-sm">
                {car.passengers}
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => void toggleActive(car)}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${
                    car.isActive ? "bg-emerald-500 justify-end" : "bg-admin-bg-subtle justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(car);
                    setIsModalOpen(true);
                  }}
                  className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"
                >
                  <Pencil size={14} />
                </button>
                {deleteConfirmId === car.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleDelete(car.id)}
                      className="px-3 py-1.5 bg-red-500/20 rounded-lg text-red-400 text-xs font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-admin-bg-subtle rounded-lg text-muted-foreground text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(car.id)}
                    className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showResetConfirm ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-slate-900 border border-admin-border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">Reset seed fleet</h3>
                <p className="text-admin-text-muted text-sm">Restore the 13 starter vehicles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleReset()}
                className="flex-1 py-2.5 bg-red-500/20 text-red-400 font-semibold rounded-xl"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-admin-bg-subtle text-muted-foreground font-medium rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CarFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={(item) => void saveCar(item)}
        editItem={editing}
      />
    </div>
  );
}
