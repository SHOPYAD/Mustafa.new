"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Car,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import type { TransferService, TransferInput, TransferType } from "@/types/transfer";
import AdminCurrencySelect from "@/components/admin/AdminCurrencySelect";
import { slugify, buildWhatsAppLink } from "@/lib/utils";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: TransferInput) => void;
  editItem?: TransferService | null;
}

const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

const emptyForm = {
  titleAr: "",
  titleEn: "",
  slug: "",
  type: "transfer" as TransferType,
  descriptionAr: "",
  descriptionEn: "",
  vehicleName: "",
  vehicleType: "Sedan",
  vehicleClass: "Luxury",
  seats: 3,
  luggage: 2,
  price: 0,
  currency: "USD",
  durationHours: 1,
  routeFrom: "",
  routeTo: "",
  routeFromAr: "",
  routeToAr: "",
  highlightsAr: "",
  highlightsEn: "",
  includesAr: "",
  includesEn: "",
  images: "",
  whatsappNumber: DEFAULT_WA,
  whatsappMessageAr: "",
  whatsappMessageEn: "",
  isFeatured: false,
  isActive: true,
};

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TransferFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}: TransferFormModalProps) {
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setFormData({
        titleAr: editItem.titleAr,
        titleEn: editItem.titleEn,
        slug: editItem.slug,
        type: editItem.type,
        descriptionAr: editItem.descriptionAr,
        descriptionEn: editItem.descriptionEn,
        vehicleName: editItem.vehicleName,
        vehicleType: editItem.vehicleType,
        vehicleClass: editItem.vehicleClass,
        seats: editItem.seats,
        luggage: editItem.luggage,
        price: editItem.price,
        currency: editItem.currency,
        durationHours: editItem.durationHours || 1,
        routeFrom: editItem.routeFrom || "",
        routeTo: editItem.routeTo || "",
        routeFromAr: editItem.routeFromAr || "",
        routeToAr: editItem.routeToAr || "",
        highlightsAr: editItem.highlightsAr.join(", "),
        highlightsEn: editItem.highlightsEn.join(", "),
        includesAr: editItem.includesAr.join(", "),
        includesEn: editItem.includesEn.join(", "),
        images: editItem.images.join(", "),
        whatsappNumber: editItem.whatsappNumber || DEFAULT_WA,
        whatsappMessageAr: editItem.whatsappMessageAr || "",
        whatsappMessageEn: editItem.whatsappMessageEn || "",
        isFeatured: editItem.isFeatured,
        isActive: editItem.isActive,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editItem, isOpen]);

  const previewLink = useMemo(
    () =>
      buildWhatsAppLink(
        formData.whatsappNumber || DEFAULT_WA,
        formData.whatsappMessageEn || formData.whatsappMessageAr
      ),
    [
      formData.whatsappNumber,
      formData.whatsappMessageEn,
      formData.whatsappMessageAr,
    ]
  );

  const handleTitleEnChange = (value: string) => {
    setFormData({
      ...formData,
      titleEn: value,
      slug: editItem ? formData.slug : slugify(value),
      whatsappMessageEn: editItem
        ? formData.whatsappMessageEn
        : formData.whatsappMessageEn ||
          `Hello Alrayyan Tourism, I would like to book: ${value}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      slug: formData.slug || slugify(formData.titleEn),
      type: formData.type,
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      descriptionAr: formData.descriptionAr,
      descriptionEn: formData.descriptionEn,
      vehicleName: formData.vehicleName,
      vehicleType: formData.vehicleType,
      vehicleClass: formData.vehicleClass,
      seats: Number(formData.seats) || 1,
      luggage: Number(formData.luggage) || 0,
      price: Number(formData.price) || 0,
      currency: formData.currency,
      durationHours: Number(formData.durationHours) || undefined,
      routeFrom: formData.routeFrom || undefined,
      routeTo: formData.routeTo || undefined,
      routeFromAr: formData.routeFromAr || undefined,
      routeToAr: formData.routeToAr || undefined,
      highlightsAr: splitCsv(formData.highlightsAr),
      highlightsEn: splitCsv(formData.highlightsEn),
      includesAr: splitCsv(formData.includesAr),
      includesEn: splitCsv(formData.includesEn),
      images: splitCsv(formData.images),
      whatsappNumber: formData.whatsappNumber || DEFAULT_WA,
      whatsappMessageAr:
        formData.whatsappMessageAr ||
        `مرحباً الريان للسياحة، أرغب بالحجز: ${formData.titleAr}`,
      whatsappMessageEn:
        formData.whatsappMessageEn ||
        `Hello Alrayyan Tourism, I would like to book: ${formData.titleEn}`,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    });
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all";
  const labelClass =
    "block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editItem ? "Edit Transfer / VIP" : "Add Transfer / VIP Tour"}
              </h2>
              <p className="text-xs text-white/40">
                {editItem ? `Editing ${editItem.titleEn}` : "Fill in service & WhatsApp booking"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car size={14} className="text-sky-400" />
              <span className="text-sm font-semibold text-white/70">Basic Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Title (English)</label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  placeholder="DXB Airport → Dubai Marina Luxury Sedan"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Title (Arabic)</label>
                <input
                  type="text"
                  required
                  value={formData.titleAr}
                  onChange={(e) => {
                    const titleAr = e.target.value;
                    setFormData({
                      ...formData,
                      titleAr,
                      whatsappMessageAr: editItem
                        ? formData.whatsappMessageAr
                        : formData.whatsappMessageAr ||
                          `مرحباً الريان للسياحة، أرغب بالحجز: ${titleAr}`,
                    });
                  }}
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`${inputClass} text-white/50`}
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as TransferType })
                  }
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="transfer" className="bg-slate-900">
                    Airport Transfer
                  </option>
                  <option value="vip_tour" className="bg-slate-900">
                    VIP Tour
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle & Route */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-white/70">Vehicle & Route</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Vehicle Name</label>
                <input
                  type="text"
                  required
                  value={formData.vehicleName}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleName: e.target.value })
                  }
                  placeholder="Mercedes E-Class"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Sedan" className="bg-slate-900">
                    Sedan
                  </option>
                  <option value="SUV" className="bg-slate-900">
                    SUV
                  </option>
                  <option value="Van" className="bg-slate-900">
                    Van
                  </option>
                  <option value="Sedan / SUV" className="bg-slate-900">
                    Sedan / SUV
                  </option>
                  <option value="Luxury" className="bg-slate-900">
                    Luxury
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Vehicle Class</label>
                <select
                  value={formData.vehicleClass}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleClass: e.target.value })
                  }
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Standard" className="bg-slate-900">
                    Standard
                  </option>
                  <option value="Luxury" className="bg-slate-900">
                    Luxury
                  </option>
                  <option value="Premium" className="bg-slate-900">
                    Premium
                  </option>
                  <option value="Executive" className="bg-slate-900">
                    Executive
                  </option>
                  <option value="VIP" className="bg-slate-900">
                    VIP
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Duration (hours)</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.25}
                  value={formData.durationHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationHours: parseFloat(e.target.value) || 1,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Seats</label>
                <input
                  type="number"
                  min={1}
                  value={formData.seats}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seats: parseInt(e.target.value) || 1,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Luggage</label>
                <input
                  type="number"
                  min={0}
                  value={formData.luggage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      luggage: parseInt(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>From (EN)</label>
                <input
                  type="text"
                  value={formData.routeFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, routeFrom: e.target.value })
                  }
                  placeholder="DXB Airport"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>To (EN)</label>
                <input
                  type="text"
                  value={formData.routeTo}
                  onChange={(e) =>
                    setFormData({ ...formData, routeTo: e.target.value })
                  }
                  placeholder="Dubai Marina"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>From (AR)</label>
                <input
                  type="text"
                  value={formData.routeFromAr}
                  onChange={(e) =>
                    setFormData({ ...formData, routeFromAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>To (AR)</label>
                <input
                  type="text"
                  value={formData.routeToAr}
                  onChange={(e) =>
                    setFormData({ ...formData, routeToAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-white/70">Pricing & Status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <AdminCurrencySelect
                  value={formData.currency}
                  onChange={(code) =>
                    setFormData({ ...formData, currency: code })
                  }
                  className={`${inputClass} appearance-none cursor-pointer`}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  Featured
                </label>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={14} className="text-purple-400" />
              <span className="text-sm font-semibold text-white/70">Details</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Images (comma-separated URLs)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) =>
                    setFormData({ ...formData, images: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Highlights (EN, CSV)</label>
                  <input
                    type="text"
                    value={formData.highlightsEn}
                    onChange={(e) =>
                      setFormData({ ...formData, highlightsEn: e.target.value })
                    }
                    placeholder="Meet & Greet, WiFi, Water"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Highlights (AR, CSV)</label>
                  <input
                    type="text"
                    value={formData.highlightsAr}
                    onChange={(e) =>
                      setFormData({ ...formData, highlightsAr: e.target.value })
                    }
                    className={inputClass}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className={labelClass}>Includes (EN, CSV)</label>
                  <input
                    type="text"
                    value={formData.includesEn}
                    onChange={(e) =>
                      setFormData({ ...formData, includesEn: e.target.value })
                    }
                    placeholder="Chauffeur, Tolls, Insurance"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Includes (AR, CSV)</label>
                  <input
                    type="text"
                    value={formData.includesAr}
                    onChange={(e) =>
                      setFormData({ ...formData, includesAr: e.target.value })
                    }
                    className={inputClass}
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description (EN)</label>
                <textarea
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description (AR)</label>
                <textarea
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white/70">
                WhatsApp Booking
              </span>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="905321796763"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Message (EN)</label>
                <textarea
                  rows={3}
                  value={formData.whatsappMessageEn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappMessageEn: e.target.value,
                    })
                  }
                  placeholder="Hello, I would like to book..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Message (AR)</label>
                <textarea
                  rows={3}
                  value={formData.whatsappMessageAr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappMessageAr: e.target.value,
                    })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">
                  Live Preview Link
                </p>
                <p className="text-xs text-emerald-300/90 truncate font-mono">
                  {previewLink}
                </p>
              </div>
              <a
                href={previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-semibold rounded-xl transition-all"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
            >
              {editItem ? "Update Service" : "Create Service"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
