// src/components/admin/PackageFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Package, MapPin, DollarSign, Star, Image as ImageIcon, FileText, Plus, Trash2 } from "lucide-react";
import { type HolidayPackage } from "@/types/package";
import AdminCurrencySelect from "@/components/admin/AdminCurrencySelect";

interface PackageFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pkg: Omit<HolidayPackage, "id">) => void;
    editPackage?: HolidayPackage | null;
}

const emptyForm = {
    title: "",
    slug: "",
    destination: "",
    country: "",
    durationDays: 5,
    price: 0,
    currency: "USD",
    rating: 4.5,
    imageUrl: "",
    imageAlt: "",
    amenities: "",
    isFeatured: true,
    description: "",
    inclusions: "",
    exclusions: "",
};

export default function PackageFormModal({
    isOpen,
    onClose,
    onSubmit,
    editPackage,
}: PackageFormModalProps) {
    const [formData, setFormData] = useState(emptyForm);
    const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([]);

    useEffect(() => {
        if (editPackage) {
            setFormData({
                title: editPackage.title,
                slug: editPackage.slug,
                destination: editPackage.destination,
                country: editPackage.country,
                durationDays: editPackage.durationDays,
                price: editPackage.price,
                currency: editPackage.currency,
                rating: editPackage.rating || 4.5,
                imageUrl: editPackage.images[0]?.url || "",
                imageAlt: editPackage.images[0]?.alt || "",
                amenities: editPackage.amenities.join(", "),
                isFeatured: editPackage.isFeatured || false,
                description: editPackage.description || "",
                inclusions: (editPackage.inclusions || []).join("\n"),
                exclusions: (editPackage.exclusions || []).join("\n"),
            });
            setItinerary(editPackage.itinerary || []);
        } else {
            setFormData(emptyForm);
            setItinerary([]);
        }
    }, [editPackage, isOpen]);

    const generateSlug = (title: string, days: number) => {
        return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}-${days}-days`;
    };

    const handleTitleChange = (value: string) => {
        setFormData({
            ...formData,
            title: value,
            slug: generateSlug(value, formData.durationDays),
        });
    };

    const addItineraryDay = () => {
        setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }]);
    };

    const removeItineraryDay = (idx: number) => {
        setItinerary(itinerary.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));
    };

    const updateItineraryDay = (idx: number, field: "title" | "description", value: string) => {
        setItinerary(itinerary.map((d, i) => i === idx ? { ...d, [field]: value } : d));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: formData.title,
            slug: formData.slug,
            destination: formData.destination,
            country: formData.country,
            durationDays: formData.durationDays,
            price: formData.price,
            currency: formData.currency,
            rating: formData.rating,
            images: formData.imageUrl
                ? [{ url: formData.imageUrl, alt: formData.imageAlt || formData.title, width: 800, height: 600 }]
                : [],
            amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
            isFeatured: formData.isFeatured,
            description: formData.description || undefined,
            inclusions: formData.inclusions ? formData.inclusions.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
            exclusions: formData.exclusions ? formData.exclusions.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
            itinerary: itinerary.length > 0 ? itinerary : undefined,
        });
        onClose();
    };

    if (!isOpen) return null;

    const inputClass =
        "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all";
    const labelClass = "block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Package size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {editPackage ? "Edit Package" : "Add New Package"}
                            </h2>
                            <p className="text-xs text-white/40">
                                {editPackage ? `Editing ${editPackage.title}` : "Fill in package details"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title & Slug */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={14} className="text-emerald-400" />
                            <span className="text-sm font-semibold text-white/70">Basic Info</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Package Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Dubai City Escape" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Slug (auto)</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={`${inputClass} text-white/40`} />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-blue-400" />
                            <span className="text-sm font-semibold text-white/70">Location</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Destination</label>
                                <input type="text" required value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="e.g. Dubai" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Country</label>
                                <input type="text" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="e.g. UAE" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Duration */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign size={14} className="text-amber-400" />
                            <span className="text-sm font-semibold text-white/70">Pricing & Duration</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className={labelClass}>Price</label>
                                <input type="number" required min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} placeholder="1299" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Currency</label>
                                <AdminCurrencySelect
                                    value={formData.currency}
                                    onChange={(code) => setFormData({ ...formData, currency: code })}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Days</label>
                                <input type="number" required min={1} value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Rating</label>
                                <input type="number" step={0.1} min={0} max={5} value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ImageIcon size={14} className="text-purple-400" />
                            <span className="text-sm font-semibold text-white/70">Image</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Image URL</label>
                                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Image Alt Text</label>
                                <input type="text" value={formData.imageAlt} onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })} placeholder="Description..." className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Amenities & Featured */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={14} className="text-yellow-400" />
                            <span className="text-sm font-semibold text-white/70">Amenities & Status</span>
                        </div>
                        <div>
                            <label className={labelClass}>Amenities (comma-separated)</label>
                            <input type="text" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="5-Star Hotel, Airport Transfer, City Tour" className={inputClass} />
                        </div>
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
                            <span className="text-sm text-white/60">Featured Package</span>
                        </label>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={14} className="text-cyan-400" />
                            <span className="text-sm font-semibold text-white/70">Description</span>
                        </div>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this package..."
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Inclusions & Exclusions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Inclusions (one per line)</label>
                            <textarea
                                rows={4}
                                value={formData.inclusions}
                                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                                placeholder={"Return Flights\nHotel Stay\nBreakfast"}
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Exclusions (one per line)</label>
                            <textarea
                                rows={4}
                                value={formData.exclusions}
                                onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                                placeholder={"Personal expenses\nLunch & Dinner\nTips"}
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-orange-400" />
                                <span className="text-sm font-semibold text-white/70">Itinerary</span>
                            </div>
                            <button
                                type="button"
                                onClick={addItineraryDay}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg transition-all"
                            >
                                <Plus size={12} />
                                Add Day
                            </button>
                        </div>
                        <div className="space-y-3">
                            {itinerary.map((day, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-orange-400 uppercase">Day {day.day}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItineraryDay(idx)}
                                            className="text-white/30 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={day.title}
                                        onChange={(e) => updateItineraryDay(idx, "title", e.target.value)}
                                        placeholder="Day title..."
                                        className={`${inputClass} py-2`}
                                    />
                                    <textarea
                                        rows={2}
                                        value={day.description}
                                        onChange={(e) => updateItineraryDay(idx, "description", e.target.value)}
                                        placeholder="Day description..."
                                        className={`${inputClass} resize-none py-2`}
                                    />
                                </div>
                            ))}
                            {itinerary.length === 0 && (
                                <p className="text-white/20 text-sm text-center py-4">No itinerary days added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
                            {editPackage ? "Update Package" : "Add Package"}
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
