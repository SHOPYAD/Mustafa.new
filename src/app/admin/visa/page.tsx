// src/app/admin/visa/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Globe,
    RotateCcw,
    Search,
    AlertTriangle,
    ChevronDown,
    FileText,
} from "lucide-react";
import {
    getVisaData,
    addVisaCountry,
    updateVisaCountry,
    deleteVisaCountry,
    resetVisaData,
    type VisaCountry,
} from "@/data/visa";
import VisaFormModal from "@/components/admin/VisaFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedVisa } from "@/lib/import-normalize";

export default function AdminVisaPage() {
    const [visaData, setVisaData] = useState<VisaCountry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<VisaCountry | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        setVisaData(getVisaData());
    }, []);

    const refresh = () => setVisaData(getVisaData());

    const handleAdd = (data: Omit<VisaCountry, "id">) => {
        addVisaCountry(data);
        refresh();
    };

    const handleUpdate = (data: Omit<VisaCountry, "id">) => {
        if (editingCountry) {
            updateVisaCountry(editingCountry.id, data);
            setEditingCountry(null);
            refresh();
        }
    };

    const handleToggle = (country: VisaCountry) => {
        updateVisaCountry(country.id, { isActive: country.isActive === false ? true : false });
        refresh();
    };

    const handleDelete = (id: string) => {
        deleteVisaCountry(id);
        setDeleteConfirmId(null);
        refresh();
    };

    const handleReset = () => {
        resetVisaData();
        setShowResetConfirm(false);
        refresh();
    };

    const filtered = visaData.filter(
        (v) => v.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalVisaTypes = visaData.reduce((sum, c) => sum + c.types.length, 0);

    return (
        <div className="admin-page w-full max-w-none min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-blue-400" size={28} />
                        Visa Management
                    </h1>
                    <p className="text-white/50 mt-1">Manage visa services, prices, and processing times</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium rounded-xl transition-all flex items-center gap-2 text-sm">
                        <RotateCcw size={14} />
                        Reset
                    </button>
                    <button onClick={() => { setEditingCountry(null); setIsModalOpen(true); }} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Plus size={18} />
                        Add Country
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <ServiceImportChat
                    serviceType="visa"
                    onApply={(item) => {
                        const { id: _id, ...visaInput } = normalizeImportedVisa(item);
                        addVisaCountry(visaInput);
                        refresh();
                    }}
                />
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by country name..." className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm">
                <span className="text-white/40">Countries: <span className="text-white font-semibold">{visaData.length}</span></span>
                <span className="text-white/40">Active: <span className="text-amber-400 font-semibold">{visaData.filter((v) => v.isActive !== false).length}</span></span>
                <span className="text-white/40">Visa Types: <span className="text-blue-400 font-semibold">{totalVisaTypes}</span></span>
            </div>

            {/* Country Cards */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-16 text-center">
                        <Globe size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-white/30 text-lg">No countries found</p>
                    </div>
                ) : (
                    filtered.map((country) => (
                        <div key={country.id} className={`bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden transition-all ${country.isActive === false ? "opacity-50" : ""}`}>
                            {/* Country Row */}
                            <div className="flex items-center justify-between px-6 py-4">
                                <button onClick={() => setExpandedId(expandedId === country.id ? null : country.id)} className="flex items-center gap-4 flex-1 text-left">
                                    <span className="text-3xl">{country.flag}</span>
                                    <div>
                                        <p className="text-white font-semibold">{country.country}</p>
                                        <p className="text-white/40 text-sm">{country.types.length} visa type{country.types.length !== 1 ? "s" : ""}</p>
                                    </div>
                                    <ChevronDown size={18} className={`text-white/30 transition-transform ${expandedId === country.id ? "rotate-180" : ""}`} />
                                </button>
                                <div className="flex items-center gap-2 ml-4">
                                    <button onClick={() => handleToggle(country)} className={`w-10 h-5 rounded-full flex items-center transition-all ${country.isActive !== false ? "bg-purple-600 justify-end" : "bg-white/10 justify-start"}`}>
                                        <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
                                    </button>
                                    <button onClick={() => { setEditingCountry(country); setIsModalOpen(true); }} className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all" title="Edit">
                                        <Pencil size={14} />
                                    </button>
                                    {deleteConfirmId === country.id ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleDelete(country.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all">Confirm</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirmId(country.id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Visa Types */}
                            {expandedId === country.id && (
                                <div className="border-t border-white/5 px-6 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {country.types.map((visa, idx) => (
                                            <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText size={14} className="text-blue-400" />
                                                    <span className="text-white/80 font-medium text-sm">{visa.name}</span>
                                                </div>
                                                <p className="text-blue-400 font-semibold text-sm mb-1">{visa.duration}</p>
                                                <p className="text-white font-bold text-lg">{visa.price}</p>
                                                <p className="text-white/40 text-xs mt-1">{visa.processingTime}</p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {visa.features.map((f, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400/70 rounded-full">{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                <h3 className="text-white font-bold">Reset All Visa Data</h3>
                                <p className="text-white/40 text-sm">Restore default visa data</p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm mb-6">All custom visa data will be lost. This cannot be undone.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all">Reset All</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <VisaFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCountry(null); }}
                onSubmit={editingCountry ? handleUpdate : handleAdd}
                editCountry={editingCountry}
            />
        </div>
    );
}
