"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Hotel,
  MapPin,
  Star,
  Image as ImageIcon,
  Plus,
  Trash2,
  BedDouble,
  MessageCircle,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Hotel as HotelType, HotelInput, HotelRoom } from "@/types/hotel";
import AdminCurrencySelect from "@/components/admin/AdminCurrencySelect";
import { slugify, buildWhatsAppLink } from "@/lib/utils";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

interface HotelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hotel: HotelInput) => void;
  editHotel?: HotelType | null;
}

type RoomForm = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  beds: string;
  capacity: number;
  sizeSqm: number;
  price: number;
  currency: string;
  amenities: string;
  images: string;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
};

type FormState = {
  nameAr: string;
  nameEn: string;
  slug: string;
  city: string;
  country: string;
  neighborhoodAr: string;
  neighborhoodEn: string;
  addressAr: string;
  addressEn: string;
  lat: number;
  lng: number;
  descriptionAr: string;
  descriptionEn: string;
  images: string;
  amenities: string;
  highlightsAr: string;
  highlightsEn: string;
  policiesAr: string;
  policiesEn: string;
  checkIn: string;
  checkOut: string;
  stars: number;
  rating: number;
  reviewCount: number;
  whatsappNumber: string;
  whatsappMessageAr: string;
  whatsappMessageEn: string;
  phone: string;
  website: string;
  isFeatured: boolean;
  isActive: boolean;
};

const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

const emptyRoom = (): RoomForm => ({
  id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  beds: "1 King",
  capacity: 2,
  sizeSqm: 40,
  price: 0,
  currency: "USD",
  amenities: "",
  images: "",
  breakfastIncluded: false,
  freeCancellation: true,
});

const emptyForm = (): FormState => ({
  nameAr: "",
  nameEn: "",
  slug: "",
  city: "Dubai",
  country: "UAE",
  neighborhoodAr: "",
  neighborhoodEn: "",
  addressAr: "",
  addressEn: "",
  lat: 25.2048,
  lng: 55.2708,
  descriptionAr: "",
  descriptionEn: "",
  images: "",
  amenities: "",
  highlightsAr: "",
  highlightsEn: "",
  policiesAr: "",
  policiesEn: "",
  checkIn: "15:00",
  checkOut: "12:00",
  stars: 5,
  rating: 4.5,
  reviewCount: 0,
  whatsappNumber: DEFAULT_WA,
  whatsappMessageAr: "",
  whatsappMessageEn: "",
  phone: "",
  website: "",
  isFeatured: false,
  isActive: true,
});

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function HotelFormModal({
  isOpen,
  onClose,
  onSubmit,
  editHotel,
}: HotelFormModalProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [rooms, setRooms] = useState<RoomForm[]>([emptyRoom()]);

  useEffect(() => {
    if (!isOpen) return;

    if (editHotel) {
      setFormData({
        nameAr: editHotel.nameAr,
        nameEn: editHotel.nameEn,
        slug: editHotel.slug,
        city: editHotel.city,
        country: editHotel.country,
        neighborhoodAr: editHotel.neighborhoodAr,
        neighborhoodEn: editHotel.neighborhoodEn,
        addressAr: editHotel.addressAr,
        addressEn: editHotel.addressEn,
        lat: editHotel.lat,
        lng: editHotel.lng,
        descriptionAr: editHotel.descriptionAr,
        descriptionEn: editHotel.descriptionEn,
        images: editHotel.images.join(", "),
        amenities: editHotel.amenities.join(", "),
        highlightsAr: editHotel.highlightsAr.join("\n"),
        highlightsEn: editHotel.highlightsEn.join("\n"),
        policiesAr: editHotel.policiesAr.join("\n"),
        policiesEn: editHotel.policiesEn.join("\n"),
        checkIn: editHotel.checkIn,
        checkOut: editHotel.checkOut,
        stars: editHotel.stars,
        rating: editHotel.rating,
        reviewCount: editHotel.reviewCount,
        whatsappNumber: editHotel.whatsappNumber,
        whatsappMessageAr: editHotel.whatsappMessageAr,
        whatsappMessageEn: editHotel.whatsappMessageEn,
        phone: editHotel.phone || "",
        website: editHotel.website || "",
        isFeatured: editHotel.isFeatured,
        isActive: editHotel.isActive,
      });
      setRooms(
        editHotel.rooms.length > 0
          ? editHotel.rooms.map((r) => ({
              id: r.id,
              nameAr: r.nameAr,
              nameEn: r.nameEn,
              descriptionAr: r.descriptionAr,
              descriptionEn: r.descriptionEn,
              beds: r.beds,
              capacity: r.capacity,
              sizeSqm: r.sizeSqm,
              price: r.price,
              currency: r.currency,
              amenities: r.amenities.join(", "),
              images: r.images.join(", "),
              breakfastIncluded: r.breakfastIncluded,
              freeCancellation: r.freeCancellation,
            }))
          : [emptyRoom()]
      );
    } else {
      setFormData(emptyForm());
      setRooms([emptyRoom()]);
    }
  }, [editHotel, isOpen]);

  const waPreview = useMemo(
    () =>
      buildWhatsAppLink(
        formData.whatsappNumber,
        formData.whatsappMessageEn || formData.whatsappMessageAr
      ),
    [formData.whatsappNumber, formData.whatsappMessageEn, formData.whatsappMessageAr]
  );

  const handleNameEnChange = (value: string) => {
    setFormData({
      ...formData,
      nameEn: value,
      slug: editHotel ? formData.slug : slugify(value),
      whatsappMessageEn:
        formData.whatsappMessageEn ||
        (editHotel
          ? formData.whatsappMessageEn
          : `Hello Alrayyan Tourism, I would like to book a stay at ${value}. Please share availability and rates.`),
    });
  };

  const updateRoom = (
    idx: number,
    field: keyof RoomForm,
    value: string | number | boolean
  ) => {
    setRooms(rooms.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const addRoom = () => setRooms([...rooms, emptyRoom()]);

  const removeRoom = (idx: number) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRooms: HotelRoom[] = rooms.map((r, i) => ({
      id: r.id || `r${Date.now()}-${i}`,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      beds: r.beds,
      capacity: Number(r.capacity) || 1,
      sizeSqm: Number(r.sizeSqm) || 0,
      price: Number(r.price) || 0,
      currency: r.currency || "USD",
      amenities: splitList(r.amenities),
      images: splitList(r.images),
      breakfastIncluded: r.breakfastIncluded,
      freeCancellation: r.freeCancellation,
    }));

    const payload: HotelInput = {
      slug: formData.slug || slugify(formData.nameEn),
      nameAr: formData.nameAr,
      nameEn: formData.nameEn,
      city: formData.city,
      country: formData.country,
      neighborhoodAr: formData.neighborhoodAr,
      neighborhoodEn: formData.neighborhoodEn,
      stars: Number(formData.stars) || 5,
      rating: Number(formData.rating) || 0,
      reviewCount: Number(formData.reviewCount) || 0,
      addressAr: formData.addressAr,
      addressEn: formData.addressEn,
      descriptionAr: formData.descriptionAr,
      descriptionEn: formData.descriptionEn,
      highlightsAr: splitList(formData.highlightsAr),
      highlightsEn: splitList(formData.highlightsEn),
      images: splitList(formData.images),
      amenities: splitList(formData.amenities),
      rooms: parsedRooms,
      lat: Number(formData.lat) || 0,
      lng: Number(formData.lng) || 0,
      checkIn: formData.checkIn || "15:00",
      checkOut: formData.checkOut || "12:00",
      policiesAr: splitList(formData.policiesAr),
      policiesEn: splitList(formData.policiesEn),
      whatsappNumber: formData.whatsappNumber.replace(/[^\d]/g, "") || DEFAULT_WA,
      whatsappMessageAr:
        formData.whatsappMessageAr ||
        `مرحباً لوناليزا للسياحة والسفر، أرغب بحجز إقامة في ${formData.nameAr}.`,
      whatsappMessageEn:
        formData.whatsappMessageEn ||
        `Hello Alrayyan Tourism, I would like to book a stay at ${formData.nameEn}.`,
      phone: formData.phone.trim() || undefined,
      website: formData.website.trim() || undefined,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all";
  const labelClass =
    "block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Hotel size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editHotel ? "Edit Hotel" : "Add New Hotel"}
              </h2>
              <p className="text-xs text-white/40">
                {editHotel
                  ? `Editing ${editHotel.nameEn}`
                  : "Full hotel profile with WhatsApp booking"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Hotel size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-white/70">Basic Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name (English)</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  placeholder="Atlantis The Palm Dubai"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Name (Arabic)</label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => {
                    const nameAr = e.target.value;
                    setFormData({
                      ...formData,
                      nameAr,
                      whatsappMessageAr:
                        formData.whatsappMessageAr ||
                        (editHotel
                          ? formData.whatsappMessageAr
                          : `مرحباً لوناليزا للسياحة والسفر، أرغب بحجز إقامة في ${nameAr}.`),
                    });
                  }}
                  placeholder="أتلانتس النخلة دبي"
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Slug (auto)</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`${inputClass} text-white/50`}
                />
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
          </section>

          {/* Location */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-white/70">Location</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Neighborhood (EN)</label>
                <input
                  type="text"
                  value={formData.neighborhoodEn}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhoodEn: e.target.value })
                  }
                  placeholder="Palm Jumeirah"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Neighborhood (AR)</label>
                <input
                  type="text"
                  value={formData.neighborhoodAr}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhoodAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Address (EN)</label>
                <input
                  type="text"
                  value={formData.addressEn}
                  onChange={(e) =>
                    setFormData({ ...formData, addressEn: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address (AR)</label>
                <input
                  type="text"
                  value={formData.addressAr}
                  onChange={(e) =>
                    setFormData({ ...formData, addressAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Media & amenities */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={14} className="text-purple-400" />
              <span className="text-sm font-semibold text-white/70">Media & Amenities</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Images (comma-separated URLs)</label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Amenities (CSV)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  placeholder="Pool, Spa, WiFi, Beach"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Highlights EN (newline or CSV)</label>
                  <textarea
                    rows={3}
                    value={formData.highlightsEn}
                    onChange={(e) =>
                      setFormData({ ...formData, highlightsEn: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Highlights AR (newline or CSV)</label>
                  <textarea
                    rows={3}
                    value={formData.highlightsAr}
                    onChange={(e) =>
                      setFormData({ ...formData, highlightsAr: e.target.value })
                    }
                    className={inputClass}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Policies & rating */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-sky-400" />
              <span className="text-sm font-semibold text-white/70">
                Policies, Check-in & Rating
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Policies EN (newline or CSV)</label>
                <textarea
                  rows={3}
                  value={formData.policiesEn}
                  onChange={(e) =>
                    setFormData({ ...formData, policiesEn: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Policies AR (newline or CSV)</label>
                <textarea
                  rows={3}
                  value={formData.policiesAr}
                  onChange={(e) =>
                    setFormData({ ...formData, policiesAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className={labelClass}>
                  <Clock size={10} className="inline me-1" />
                  Check-in
                </label>
                <input
                  type="text"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  placeholder="15:00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Check-out</label>
                <input
                  type="text"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  placeholder="12:00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Stars</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={formData.stars}
                  onChange={(e) =>
                    setFormData({ ...formData, stars: parseInt(e.target.value) || 5 })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Review Count</label>
                <input
                  type="number"
                  min={0}
                  value={formData.reviewCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reviewCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col justify-end gap-2 pb-1">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelClass}>Phone (optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 4 ..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Website (optional)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* WhatsApp booking */}
          <section className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                WhatsApp Booking (required)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>WhatsApp Number (country code, digits)</label>
                <input
                  type="text"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  placeholder="905321796763"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prefilled Message (EN)</label>
                <textarea
                  rows={3}
                  required
                  value={formData.whatsappMessageEn}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappMessageEn: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prefilled Message (AR)</label>
                <textarea
                  rows={3}
                  required
                  value={formData.whatsappMessageAr}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappMessageAr: e.target.value })
                  }
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Preview Link</label>
                <a
                  href={waPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm hover:bg-emerald-500/20 transition-all break-all"
                >
                  <ExternalLink size={14} className="flex-shrink-0" />
                  {waPreview}
                </a>
              </div>
            </div>
          </section>

          {/* Rooms */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BedDouble size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white/70">Rooms</span>
              </div>
              <button
                type="button"
                onClick={addRoom}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus size={12} />
                Add Room
              </button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, idx) => (
                <div
                  key={room.id}
                  className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                      <Star size={10} className="text-amber-400" />
                      Room {idx + 1}
                    </span>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(idx)}
                        className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Name (EN)</label>
                      <input
                        type="text"
                        required
                        value={room.nameEn}
                        onChange={(e) => updateRoom(idx, "nameEn", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Name (AR)</label>
                      <input
                        type="text"
                        required
                        value={room.nameAr}
                        onChange={(e) => updateRoom(idx, "nameAr", e.target.value)}
                        className={inputClass}
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Beds</label>
                      <input
                        type="text"
                        value={room.beds}
                        onChange={(e) => updateRoom(idx, "beds", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Capacity</label>
                      <input
                        type="number"
                        min={1}
                        value={room.capacity}
                        onChange={(e) =>
                          updateRoom(idx, "capacity", parseInt(e.target.value) || 1)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Size (sqm)</label>
                      <input
                        type="number"
                        min={0}
                        value={room.sizeSqm || ""}
                        onChange={(e) =>
                          updateRoom(idx, "sizeSqm", parseInt(e.target.value) || 0)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Price</label>
                      <input
                        type="number"
                        min={0}
                        value={room.price || ""}
                        onChange={(e) =>
                          updateRoom(idx, "price", parseInt(e.target.value) || 0)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Currency</label>
                      <AdminCurrencySelect
                        value={room.currency}
                        onChange={(code) => updateRoom(idx, "currency", code)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      />
                    </div>
                    <div className="flex items-end gap-4 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={room.breakfastIncluded}
                          onChange={(e) =>
                            updateRoom(idx, "breakfastIncluded", e.target.checked)
                          }
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                        Breakfast
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={room.freeCancellation}
                          onChange={(e) =>
                            updateRoom(idx, "freeCancellation", e.target.checked)
                          }
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        Free cancel
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Amenities (CSV)</label>
                      <input
                        type="text"
                        value={room.amenities}
                        onChange={(e) => updateRoom(idx, "amenities", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Images (URLs CSV)</label>
                      <input
                        type="text"
                        value={room.images}
                        onChange={(e) => updateRoom(idx, "images", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description (EN)</label>
                      <textarea
                        rows={2}
                        value={room.descriptionEn}
                        onChange={(e) => updateRoom(idx, "descriptionEn", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description (AR)</label>
                      <textarea
                        rows={2}
                        value={room.descriptionAr}
                        onChange={(e) => updateRoom(idx, "descriptionAr", e.target.value)}
                        className={inputClass}
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              {editHotel ? "Update Hotel" : "Create Hotel"}
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
