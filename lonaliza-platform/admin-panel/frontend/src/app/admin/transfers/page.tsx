"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  RotateCcw,
  Search,
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
import {
  AdminEmpty,
  AdminKpi,
  AdminKpiStrip,
  AdminModule,
  AdminPage,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin/layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    setTransfers((prev) => prev.filter((t) => t.id !== id));
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
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        icon={<Car className="size-5" />}
        title="Transfers & VIP Tours"
        description="Manage airport transfers, VIP tours, and WhatsApp booking"
        actions={
          provider === "internal" ? (
            <>
              <button type="button" onClick={() => setShowResetConfirm(true)} className="admin-btn-secondary">
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsModalOpen(true);
                }}
                className="admin-btn-primary"
              >
                <Plus size={18} />
                Add Service
              </button>
            </>
          ) : undefined
        }
      />

      <AdminModule>
        <TransfersProviderPanel onProviderChange={setProvider} />
      </AdminModule>

      {provider === "internal" ? (
      <>
      <ServiceImportChat
        serviceType="transfer"
        onApply={(item) => {
          addTransfer(normalizeImportedTransfer(item) as TransferInput);
          refresh();
        }}
      />

      <AdminKpiStrip cols={4}>
        <AdminKpi label="Total" value={transfers.length} />
        <AdminKpi label="Transfers" value={transfers.filter((t) => t.type === "transfer").length} />
        <AdminKpi label="VIP Tours" value={transfers.filter((t) => t.type === "vip_tour").length} />
        <AdminKpi label="Active" value={transfers.filter((t) => t.isActive).length} />
      </AdminKpiStrip>

      <AdminToolbar>
        <div className="relative flex-1 min-w-[12rem]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, vehicle, type, or WhatsApp..."
            className="w-full pl-10 pr-4 py-2.5 bg-[color:var(--admin-input-bg,var(--admin-bg-subtle))] border border-[color:var(--admin-border-subtle)] rounded-xl text-[color:var(--admin-text-primary)] placeholder:text-[color:var(--admin-text-faint)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-gold)]/40"
          />
        </div>
      </AdminToolbar>

      <AdminModule className="overflow-hidden p-0">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-admin-border-subtle text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-3">Service</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Vehicle</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">{t.common.featured}</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <AdminEmpty icon={<Car size={40} />} title="No transfers found" />
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-admin-border-subtle hover:bg-white/[0.02] transition-colors ${
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
                  <p className="text-foreground font-medium text-sm truncate">{item.titleEn}</p>
                  <p className="text-muted-foreground text-xs truncate">{item.titleAr}</p>
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
                <span className="text-muted-foreground text-sm">
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
                  className={`admin-tap w-11 min-h-11 rounded-full flex items-center transition-all text-foreground ${
                    item.isFeatured ? "bg-amber-500 justify-end" : "bg-admin-bg-subtle justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                </button>
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className={`admin-tap w-11 min-h-11 rounded-full flex items-center transition-all text-foreground ${
                    item.isActive ? "bg-purple-600 justify-end" : "bg-admin-bg-subtle justify-start"
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
                  className="admin-tap w-11 h-11 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-700 dark:text-purple-300 transition-all"
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
                  className="admin-tap w-11 h-11 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 transition-all"
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
                      className="px-3 py-1.5 bg-admin-bg-subtle hover:bg-muted rounded-lg text-muted-foreground text-xs transition-all"
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
      </AdminModule>

      {showResetConfirm ? (
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset All Transfers</DialogTitle>
              <DialogDescription>Restore default services. All custom transfer data will be lost. This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={handleReset}>Reset All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

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
    </AdminPage>
  );
}
