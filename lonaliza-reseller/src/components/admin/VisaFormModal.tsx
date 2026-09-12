// src/components/admin/VisaFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Globe, Plus, Trash2 } from "lucide-react";
import { type VisaCountry, type VisaSubType } from "@/data/visa";

interface VisaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (country: Omit<VisaCountry, "id">) => void;
    editCountry?: VisaCountry | null;
}

const emptyVisaType: VisaSubType = {
    name: "",
    duration: "",
    price: "",
    processingTime: "",
    features: [],
};

export default function VisaFormModal({ isOpen, onClose, onSubmit, editCountry }: VisaFormModalProps) {
    const [country, setCountry] = useState("");
    const [flag, setFlag] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [visaTypes, setVisaTypes] = useState<(VisaSubType & { featuresStr: string })[]>([
        { ...emptyVisaType, featuresStr: "" },
    ]);

    useEffect(() => {
        if (editCountry) {
            setCountry(editCountry.country);
            setFlag(editCountry.flag);
            setIsActive(editCountry.isActive !== false);
            setVisaTypes(
                editCountry.types.map((t) => ({
                    ...t,
                    featuresStr: t.features.join(", "),
                }))
            );
        } else {
            setCountry("");
            setFlag("");
            setIsActive(true);
            setVisaTypes([{ ...emptyVisaType, featuresStr: "" }]);
        }
    }, [editCountry, isOpen]);

    const addVisaType = () => {
        setVisaTypes([...visaTypes, { ...emptyVisaType, featuresStr: "" }]);
    };

    const removeVisaType = (index: number) => {
        setVisaTypes(visaTypes.filter((_, i) => i !== index));
    };

    const updateVisaType = (index: number, field: string, value: string) => {
        const updated = [...visaTypes];
        updated[index] = { ...updated[index], [field]: value };
        setVisaTypes(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            country,
            flag,
            isActive,
            types: visaTypes.map(({ featuresStr, ...rest }) => ({
                ...rest,
                features: featuresStr.split(",").map((f) => f.trim()).filter(Boolean),
            })),
        });
        onClose();
    };

    if (!isOpen) return null;

    const inputClass =
        "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
    const labelClass = "block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {editCountry ? "Edit Country" : "Add Country"}
                            </h2>
                            <p className="text-xs text-white/40">
                                {editCountry ? `Editing ${editCountry.country}` : "Add country and visa types"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Country Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Country Name</label>
                            <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Arab Emirates" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Flag Emoji</label>
                            <input type="text" required value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="🇦🇪" className={inputClass} />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500" />
                        <span className="text-sm text-white/60">Active</span>
                    </label>

                    {/* Visa Types */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-white/70">Visa Types</span>
                            <button type="button" onClick={addVisaType} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                                <Plus size={12} />
                                Add Type
                            </button>
                        </div>

                        <div className="space-y-4">
                            {visaTypes.map((vt, idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 relative">
                                    {visaTypes.length > 1 && (
                                        <button type="button" onClick={() => removeVisaType(idx)} className="absolute top-3 right-3 w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-all">
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className={labelClass}>Visa Name</label>
                                            <input type="text" required value={vt.name} onChange={(e) => updateVisaType(idx, "name", e.target.value)} placeholder="e.g. Tourist Visa" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Duration</label>
                                            <input type="text" required value={vt.duration} onChange={(e) => updateVisaType(idx, "duration", e.target.value)} placeholder="e.g. 30 Days" className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className={labelClass}>Price</label>
                                            <input type="text" required value={vt.price} onChange={(e) => updateVisaType(idx, "price", e.target.value)} placeholder="e.g. AED 350" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Processing Time</label>
                                            <input type="text" required value={vt.processingTime} onChange={(e) => updateVisaType(idx, "processingTime", e.target.value)} placeholder="e.g. 2-3 Working Days" className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Features (comma-separated)</label>
                                        <input type="text" value={vt.featuresStr} onChange={(e) => updateVisaType(idx, "featuresStr", e.target.value)} placeholder="Single Entry, Valid for 60 days from issue" className={inputClass} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                            {editCountry ? "Update Country" : "Add Country"}
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
