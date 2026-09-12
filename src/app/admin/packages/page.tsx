// src/app/admin/packages/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Package,
    RotateCcw,
    Search,
    AlertTriangle,
    Star,
} from "lucide-react";
import { deletePackage, resetPackages, savePackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import {
    deleteAdminPackage,
    persistAdminPackage,
    resetAdminPackages,
    syncLocalPackagesToServer,
} from "@/data/packages-admin";
import { type HolidayPackage } from "@/types/package";
import PackageFormModal from "@/components/admin/PackageFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedPackage } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";

export default function AdminPackagesPage() {
    const { t, locale } = useLocale();
    const [packages, setPackages] = useState<HolidayPackage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<HolidayPackage | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const synced = await syncLocalPackagesToServer();
                setPackages(synced);
            } catch {
                const fallback = await fetchPublishedPackages();
                setPackages(fallback);
            }
        })();
    }, []);

    const refresh = () => {
        void fetchPublishedPackages().then((list) => {
            savePackages(list);
            setPackages(list);
        });
    };

    const handleAdd = async (data: Omit<HolidayPackage, "id">) => {
        await persistAdminPackage({
            ...data,
            isPublished: true,
            createdAt: new Date().toISOString(),
        });
        refresh();
    };

    const handleUpdate = async (data: Omit<HolidayPackage, "id">) => {
        if (!editingPkg) return;
        await persistAdminPackage({ ...editingPkg, ...data, id: editingPkg.id });
        setEditingPkg(null);
        refresh();
    };

    const handleDelete = async (id: string) => {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
        try {
            await deleteAdminPackage(id);
        } catch (e) {
            console.error("Delete package error:", e);
        }
        deletePackage(id);
        refresh();
    };

    const handleReset = async () => {
        try {
            await resetAdminPackages();
        } catch {
            /* keep local reset */
        }
        resetPackages();
        setShowResetConfirm(false);
        refresh();
    };

    const filtered = packages.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-page w-full max-w-none min-w-0">
            <WhiteLabelUpgradeOverlay moduleName="البرامج السياحية">
            <div className="mb-6">
                <ServiceImportChat
                    serviceType="package"
                    onApply={async (item) => {
                        const normalized = normalizeImportedPackage(item);
                        await persistAdminPackage({
                            ...normalized,
                            isPublished: true,
                            isFeatured: normalized.isFeatured !== false,
                            createdAt: new Date().toISOString(),
                        });
                        refresh();
                    }}
                />
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, destination, or country..." className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <span className="text-white/40">Total: <span className="text-white font-semibold">{packages.length}</span></span>
                <span className="text-white/40">{t.common.featured}: <span className="text-emerald-400 font-semibold">{packages.filter((p) => p.isFeatured).length}</span></span>
                <span className="text-white/40">Countries: <span className="text-blue-400 font-semibold">{new Set(packages.map((p) => p.country)).size}</span></span>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
                    <div className="col-span-3">Package</div>
                    <div className="col-span-2">Destination</div>
                    <div className="col-span-1">{t.common.days}</div>
                    <div className="col-span-1">{t.common.price}</div>
                    <div className="col-span-1">Rating</div>
                    <div className="col-span-2">Amenities</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Package size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-white/30 text-lg">No packages found</p>
                    </div>
                ) : (
                    filtered.map((pkg) => (
                        <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <div className="col-span-3 flex items-center gap-3">
                                {pkg.images[0] && (
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={pkg.images[0].url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{tContent(pkg, "title", locale) || pkg.title}</p>
                                    {pkg.isFeatured && <span className="text-[10px] text-emerald-400 font-semibold uppercase">{t.common.featured}</span>}
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <span className="text-white/60 text-sm">{tContent(pkg, "destination", locale) || pkg.destination}, {tContent(pkg, "country", locale) || pkg.country}</span>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <span className="text-white/60 text-sm">{pkg.durationDays} {t.common.days}</span>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <span className="text-amber-400 font-bold text-sm">${pkg.price.toLocaleString()}</span>
                            </div>
                            <div className="col-span-1 flex items-center gap-1">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <span className="text-white/60 text-sm">{pkg.rating}</span>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <span className="text-white/40 text-xs truncate">{pkg.amenities.join(", ")}</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <button onClick={() => { setEditingPkg(pkg); setIsModalOpen(true); }} className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all" title="Edit">
                                    <Pencil size={14} />
                                </button>
                                {deleteConfirmId === pkg.id ? (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDelete(pkg.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all">Confirm</button>
                                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setDeleteConfirmId(pkg.id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reset Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Reset All Packages</h3>
                                <p className="text-white/40 text-sm">Restore default packages</p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm mb-6">All custom package data will be lost. This cannot be undone.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all">Reset All</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            </WhiteLabelUpgradeOverlay>

            <PackageFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingPkg(null); }}
                onSubmit={editingPkg ? handleUpdate : handleAdd}
                editPackage={editingPkg}
            />
        </div>
    );
}
