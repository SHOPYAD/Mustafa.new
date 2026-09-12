// src/app/admin/tours/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    MapPin,
    RotateCcw,
    Search,
    AlertTriangle,
    Star,
    Sunrise,
    Sunset,
    Moon,
} from "lucide-react";
import { addTour, updateTour, deleteTour, resetTours, fetchAdminTours, type Tour } from "@/data/tours";
import TourFormModal from "@/components/admin/TourFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTour } from "@/lib/import-normalize";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";

export default function AdminToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        void fetchAdminTours().then(setTours);
    }, []);

    const refresh = () => {
        void fetchAdminTours().then(setTours);
    };

    const handleAdd = (data: Omit<Tour, "id">) => {
        addTour(data);
        refresh();
    };

    const handleUpdate = (data: Omit<Tour, "id">) => {
        if (editingTour) {
            updateTour(editingTour.id, data);
            setEditingTour(null);
            refresh();
        }
    };

    const handleToggle = (tour: Tour) => {
        updateTour(tour.id, { isActive: tour.isActive === false ? true : false });
        refresh();
    };

    const handleDelete = async (id: string) => {
        setTours((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
        try {
            await fetch(`/api/admin/tours?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
        } catch (e) {
            console.error("Delete tour error:", e);
        }
        deleteTour(id);
        refresh();
    };

    const handleReset = async () => {
        try {
            await fetch("/api/admin/tours", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" }),
            });
        } catch (e) {
            console.error("Reset tours error:", e);
        }
        resetTours();
        setShowResetConfirm(false);
        refresh();
    };

    const filtered = tours.filter(
        (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const TimingBadge = ({ timing }: { timing: string }) => {
        const Icon = timing === "morning" ? Sunrise : timing === "afternoon" ? Sunset : Moon;
        const color = timing === "morning" ? "text-yellow-400" : timing === "afternoon" ? "text-orange-400" : "text-indigo-400";
        return (
            <span className={`flex items-center gap-1 text-xs ${color}`}>
                <Icon size={12} />
                {timing.charAt(0).toUpperCase() + timing.slice(1)}
            </span>
        );
    };

    return (
        <div className="admin-page w-full max-w-none min-w-0">
            <WhiteLabelUpgradeOverlay moduleName="الجولات والرحلات اليومية">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MapPin className="text-orange-400" size={28} />
                        Tour Management
                    </h1>
                    <p className="text-white/50 mt-1">Manage UAE tours, timings, and pricing</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium rounded-xl transition-all flex items-center gap-2 text-sm">
                        <RotateCcw size={14} />
                        Reset
                    </button>
                    <button onClick={() => { setEditingTour(null); setIsModalOpen(true); }} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
                        <Plus size={18} />
                        Add Tour
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <ServiceImportChat
                    serviceType="tour"
                    onApply={(item) => {
                        addTour(normalizeImportedTour(item));
                        refresh();
                    }}
                />
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or category..." className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <span className="text-white/40">Total: <span className="text-white font-semibold">{tours.length}</span></span>
                <span className="text-white/40">Active: <span className="text-emerald-400 font-semibold">{tours.filter((t) => t.isActive !== false).length}</span></span>
                <span className="text-white/40">Popular: <span className="text-amber-400 font-semibold">{tours.filter((t) => t.popular).length}</span></span>
            </div>

            {/* Table */}
            <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
                    <div className="col-span-3">Tour</div>
                    <div className="col-span-1">Category</div>
                    <div className="col-span-1">Duration</div>
                    <div className="col-span-1">Timing</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-1">Rating</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <MapPin size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-white/30 text-lg">No tours found</p>
                    </div>
                ) : (
                    filtered.map((tour) => (
                        <div key={tour.id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${tour.isActive === false ? "opacity-50" : ""}`}>
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={tour.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{tour.title}</p>
                                    {tour.popular && <span className="text-[10px] text-red-400 font-semibold uppercase">Popular</span>}
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <span className="text-white/40 text-xs px-2 py-0.5 bg-white/5 rounded-full">{tour.category}</span>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <span className="text-white/60 text-sm">{tour.duration}</span>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <TimingBadge timing={tour.timing} />
                            </div>
                            <div className="col-span-1 flex items-center gap-1">
                                <span className="text-amber-400 font-bold text-sm">AED {tour.price}</span>
                                {tour.originalPrice && <span className="text-white/30 text-xs line-through">{tour.originalPrice}</span>}
                            </div>
                            <div className="col-span-1 flex items-center gap-1">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <span className="text-white/60 text-sm">{tour.rating}</span>
                            </div>
                            <div className="col-span-1 flex items-center">
                                <button onClick={() => handleToggle(tour)} className={`w-10 h-5 rounded-full flex items-center transition-all ${tour.isActive !== false ? "bg-emerald-500 justify-end" : "bg-white/10 justify-start"}`}>
                                    <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                                </button>
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-2">
                                <button onClick={() => { setEditingTour(tour); setIsModalOpen(true); }} className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all" title="Edit">
                                    <Pencil size={14} />
                                </button>
                                {deleteConfirmId === tour.id ? (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDelete(tour.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all">Confirm</button>
                                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setDeleteConfirmId(tour.id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all" title="Delete">
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
                                <h3 className="text-white font-bold">Reset All Tours</h3>
                                <p className="text-white/40 text-sm">Restore default tours</p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm mb-6">All custom tour data will be lost. This cannot be undone.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all">Reset All</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            </WhiteLabelUpgradeOverlay>

            <TourFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTour(null); }}
                onSubmit={editingTour ? handleUpdate : handleAdd}
                editTour={editingTour}
            />
        </div>
    );
}
