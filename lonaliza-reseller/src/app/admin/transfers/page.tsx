"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  RotateCcw,
  Search,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import {
  getTransfers,
  addTransfer,
  updateTransfer,
  deleteTransfer,
  resetTransfers,
} from "@/data/transfers";
import type { TransferService, TransferInput } from "@/types/transfer";
import TransferFormModal from "@/components/admin/TransferFormModal";
import TransfersProviderPanel from "@/components/admin/TransfersProviderPanel";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTransfer } from "@/lib/import-normalize";
import { type TransferProvider } from "@/lib/transfers-config";
import { buildWhatsAppLink } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AdminTransfersPage() {
  const { t } = useLocale();
  const [transfers, setTransfers] = useState<TransferService[]>([]);
  const [provider, setProvider] = useState<TransferProvider>("internal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransferService | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setTransfers(getTransfers());
  }, []);

  const refresh = () => setTransfers(getTransfers());

  const handleAdd = (data: TransferInput) => {
    addTransfer(data);
    refresh();
  };

  const handleUpdate = (data: TransferInput) => {
    if (editing) {
      updateTransfer(editing.id, data);
      setEditing(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    deleteTransfer(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetTransfers();
    setShowResetConfirm(false);
    refresh();
  };

  const toggleActive = (item: TransferService) => {
    updateTransfer(item.id, { isActive: !item.isActive });
    refresh();
  };

  const toggleFeatured = (item: TransferService) => {
    updateTransfer(item.id, { isFeatured: !item.isFeatured });
    refresh();
  };

  const filtered = transfers.filter(
    (t) =>
      t.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titleAr.includes(searchQuery) ||
      t.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.includes(searchQuery.toLowerCase()) ||
      t.whatsappNumber.includes(searchQuery)
  );

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Car className="text-sky-400" size={28} />
            Transfers & VIP Tours
          </h1>
          <p className="text-white/50 mt-1">
            Manage airport transfers, VIP tours, and WhatsApp booking
          </p>
        </div>
        {provider === "internal" ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>
        ) : null}
      </div>

      <TransfersProviderPanel onProviderChange={setProvider} />

      {provider === "internal" ? (
      <>
      <div className="mb-6">
        <ServiceImportChat
          serviceType="transfer"
          onApply={(item) => {
            addTransfer(normalizeImportedTransfer(item) as TransferInput);
            refresh();
          }}
        />
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, vehicle, type, or WhatsApp..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
        <span className="text-white/40">
          Total: <span className="text-white font-semibold">{transfers.length}</span>
        </span>
        <span className="text-white/40">
          Transfers:{" "}
          <span className="text-sky-400 font-semibold">
            {transfers.filter((t) => t.type === "transfer").length}
          </span>
        </span>
        <span className="text-white/40">
          VIP Tours:{" "}
          <span className="text-violet-400 font-semibold">
            {transfers.filter((t) => t.type === "vip_tour").length}
          </span>
        </span>
        <span className="text-white/40">
          Active:{" "}
          <span className="text-emerald-400 font-semibold">
            {transfers.filter((t) => t.isActive).length}
          </span>
        </span>
      </div>

      <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
          <div className="col-span-3">Service</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Vehicle</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">{t.common.featured}</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Car size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30 text-lg">No transfers found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                !item.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="col-span-3 flex items-center gap-3">
                {item.images[0] && (
                  <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{item.titleEn}</p>
                  <p className="text-white/30 text-xs truncate">{item.titleAr}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    item.type === "transfer"
                      ? "bg-sky-500/10 text-sky-400"
                      : "bg-violet-500/10 text-violet-400"
                  }`}
                >
                  {item.type === "transfer" ? "Transfer" : "VIP Tour"}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-white/60 text-sm">
                  {item.vehicleName} · {item.seats} seats
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-amber-400 font-bold text-sm">
                  {item.currency} {item.price}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => toggleFeatured(item)}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${
                    item.isFeatured ? "bg-amber-500 justify-end" : "bg-white/10 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${
                    item.isActive ? "bg-emerald-500 justify-end" : "bg-white/10 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <a
                  href={buildWhatsAppLink(item.whatsappNumber, item.whatsappMessageEn)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(item);
                    setIsModalOpen(true);
                  }}
                  className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all"
                >
                  <Pencil size={14} />
                </button>
                {deleteConfirmId === item.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
                <h3 className="text-white font-bold">Reset All Transfers</h3>
                <p className="text-white/40 text-sm">Restore default services</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mb-6">
              All custom transfer data will be lost. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <TransferFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleAdd}
        editItem={editing}
      />
      </>
      ) : null}
    </div>
  );
}
