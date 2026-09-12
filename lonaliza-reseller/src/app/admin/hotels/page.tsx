"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Hotel,
  RotateCcw,
  Search,
  AlertTriangle,
  Star,
  MessageCircle,
} from "lucide-react";
import {
  getHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  resetHotels,
} from "@/data/hotels";
import type { Hotel as HotelType, HotelInput } from "@/types/hotel";
import HotelFormModal from "@/components/admin/HotelFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import HotelsProviderPanel from "@/components/admin/HotelsProviderPanel";
import type { HotelProvider } from "@/lib/hotels-config";
import { normalizeImportedHotel } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AdminHotelsPage() {
  const { t } = useLocale();
  const [catalogProvider, setCatalogProvider] = useState<HotelProvider>("booking");
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setHotels(getHotels());
  }, []);

  const refresh = () => setHotels(getHotels());

  const handleAdd = (data: HotelInput) => {
    addHotel(data);
    refresh();
  };

  const handleUpdate = (data: HotelInput) => {
    if (editingHotel) {
      updateHotel(editingHotel.id, data);
      setEditingHotel(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    deleteHotel(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetHotels();
    setShowResetConfirm(false);
    refresh();
  };

  const toggleActive = (hotel: HotelType) => {
    updateHotel(hotel.id, { isActive: !hotel.isActive });
    refresh();
  };

  const toggleFeatured = (hotel: HotelType) => {
    updateHotel(hotel.id, { isFeatured: !hotel.isFeatured });
    refresh();
  };

  const filtered = hotels.filter(
    (h) =>
      h.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.nameAr.includes(searchQuery) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.whatsappNumber.includes(searchQuery.replace(/\D/g, ""))
  );

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Hotel className="text-amber-400" size={28} />
            Hotel Management
          </h1>
          <p className="text-white/50 mt-1">
            Manage hotels, rooms, and WhatsApp booking
          </p>
        </div>
        {catalogProvider === "internal" ? (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => {
              setEditingHotel(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Hotel
          </button>
        </div>
        ) : null}
      </div>

      <HotelsProviderPanel onProviderChange={setCatalogProvider} />

      {catalogProvider === "internal" ? (
      <div className="mb-6">
        <ServiceImportChat
          serviceType="hotel"
          onApply={(item) => {
            addHotel(normalizeImportedHotel(item) as HotelInput);
            refresh();
          }}
        />
      </div>
      ) : (
      <p className="mb-8 text-sm text-white/45">
        البحث العام يتبع وضع التشغيل ونقاط النهاية المحفوظة أعلاه. الكتالوج الداخلي ({hotels.length} فندق) يظهر فقط في الوضع الداخلي.
      </p>
      )}

      {catalogProvider === "internal" ? (
      <>
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, city, or WhatsApp..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="text-white/40">
          Total: <span className="text-white font-semibold">{hotels.length}</span>
        </span>
        <span className="text-white/40">
          Active:{" "}
          <span className="text-emerald-400 font-semibold">
            {hotels.filter((h) => h.isActive).length}
          </span>
        </span>
        <span className="text-white/40">
          {t.common.featured}:{" "}
          <span className="text-amber-400 font-semibold">
            {hotels.filter((h) => h.isFeatured).length}
          </span>
        </span>
      </div>

      <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
          <div className="col-span-3">{t.admin.hotels}</div>
          <div className="col-span-1">{t.hotels.location}</div>
          <div className="col-span-1">{t.hotels.stars}</div>
          <div className="col-span-1">{t.hotels.rooms}</div>
          <div className="col-span-2">WhatsApp</div>
          <div className="col-span-1">{t.common.featured}</div>
          <div className="col-span-1">{t.common.active}</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Hotel size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30 text-lg">No hotels found</p>
          </div>
        ) : (
          filtered.map((hotel) => (
            <div
              key={hotel.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                !hotel.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="col-span-3 flex items-center gap-3">
                {hotel.images[0] && (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hotel.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {hotel.nameEn}
                  </p>
                  <p className="text-white/30 text-xs truncate">{hotel.nameAr}</p>
                </div>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-white/60 text-sm">{hotel.city}</span>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-white/60 text-sm">{hotel.stars}</span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-white/60 text-sm">{hotel.rooms.length}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                <MessageCircle size={12} className="text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400/80 text-xs font-mono truncate">
                  {hotel.whatsappNumber}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  onClick={() => toggleFeatured(hotel)}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${
                    hotel.isFeatured
                      ? "bg-amber-500 justify-end"
                      : "bg-white/10 justify-start"
                  }`}
                  title="Toggle featured"
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  onClick={() => toggleActive(hotel)}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${
                    hotel.isActive
                      ? "bg-emerald-500 justify-end"
                      : "bg-white/10 justify-start"
                  }`}
                  title="Toggle active"
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingHotel(hotel);
                    setIsModalOpen(true);
                  }}
                  className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                {deleteConfirmId === hotel.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(hotel.id)}
                    className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </>
      ) : null}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Reset All Hotels</h3>
                <p className="text-white/40 text-sm">Restore 5 Dubai seed hotels</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-6">
              All custom hotel data will be lost. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <HotelFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHotel(null);
        }}
        onSubmit={editingHotel ? handleUpdate : handleAdd}
        editHotel={editingHotel}
      />
    </div>
  );
}
