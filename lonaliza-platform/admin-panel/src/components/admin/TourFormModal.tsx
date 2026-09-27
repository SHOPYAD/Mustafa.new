// src/components/admin/TourFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, MapPin, DollarSign, Star, Clock, Sunrise, Sunset, Moon } from "lucide-react";
import { type Tour } from "@/data/tours";

interface TourFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tour: Omit<Tour, "id">) => void;
    editTour?: Tour | null;
}

const CATEGORIES = ["Adventure", "City Tours", "Cruises", "Day Trips", "Attractions", "Luxury"];

export default function TourFormModal({ isOpen, onClose, onSubmit, editTour }: TourFormModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        image: "",
        duration: "",
        timing: "morning" as "morning" | "afternoon" | "evening",
        rating: 4.5,
        reviewCount: 0,
        price: 0,
        originalPrice: "",
        highlights: "",
        category: "Adventure",
        popular: false,
        isActive: true,
    });

    useEffect(() => {
        if (editTour) {
            setFormData({
                title: editTour.title,
                image: editTour.image,
                duration: editTour.duration,
                timing: editTour.timing,
                rating: editTour.rating,
                reviewCount: editTour.reviewCount,
                price: editTour.price,
                originalPrice: editTour.originalPrice?.toString() || "",
                highlights: editTour.highlights.join(", "),
                category: editTour.category,
                popular: editTour.popular || false,
                isActive: editTour.isActive !== false,
            });
        } else {
            setFormData({
                title: "",
                image: "",
                duration: "",
                timing: "morning",
                rating: 4.5,
                reviewCount: 0,
                price: 0,
                originalPrice: "",
                highlights: "",
                category: "Adventure",
                popular: false,
                isActive: true,
            });
        }
    }, [editTour, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: formData.title,
            image: formData.image,
            duration: formData.duration,
            timing: formData.timing,
            rating: formData.rating,
            reviewCount: formData.reviewCount,
            price: formData.price,
            originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
            highlights: formData.highlights.split(",").map((h) => h.trim()).filter(Boolean),
            category: formData.category,
            popular: formData.popular,
            isActive: formData.isActive,
        });
        onClose();
    };

    if (!isOpen) return null;

    const inputClass =
        "w-full px-4 py-3 bg-card/5 border border-border rounded-xl text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-admin-btn-secondary-border/50 focus:border-admin-btn-secondary-border/50 transition-all";
    const labelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

    const TimingIcon = formData.timing === "morning" ? Sunrise : formData.timing === "afternoon" ? Sunset : Moon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className='absolute inset-0 bg-foreground/5 backdrop-blur-sm' onClick={onClose} />
            <div className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl'>
                {/* Header */}
                <div className='sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border rounded-t-3xl px-6 py-4 flex items-center justify-between z-10'>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <MapPin size={18} className='text-foreground' />
                        </div>
                        <div>
                            <h2 className='text-lg font-bold text-foreground'>
                                {editTour ? "Edit Tour" : "Add New Tour"}
                            </h2>
                            <p className='text-xs text-muted-foreground'>
                                {editTour ? `Editing ${editTour.title}` : "Fill in tour details"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className='w-8 h-8 rounded-lg bg-card/5 hover:bg-card/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all'>
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title & Image */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-orange-400" />
                            <span className='text-sm font-semibold text-muted-foreground'>Basic Info</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className={labelClass}>Tour Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Desert Safari with BBQ Dinner" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Image URL</label>
                                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Duration & Timing */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-blue-400" />
                            <span className='text-sm font-semibold text-muted-foreground'>Schedule</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Duration</label>
                                <input type="text" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 6 Hours" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Timing</label>
                                <div className="flex gap-2">
                                    {(["morning", "afternoon", "evening"] as const).map((t) => (
                                        <button key={t} type="button" onClick={() => setFormData({ ...formData, timing: t })} className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border ${formData.timing === t ? "bg-secondary/20 border-admin-btn-secondary-border/50 text-secondary" : "bg-card/5 border-border text-muted-foreground hover:bg-card/10"}`}>
                                            {t === "morning" && <Sunrise size={14} />}
                                            {t === "afternoon" && <Sunset size={14} />}
                                            {t === "evening" && <Moon size={14} />}
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className={labelClass}>Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${formData.category === cat ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "bg-card/5 border-border text-muted-foreground hover:bg-card/10"}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign size={14} className='text-secondary' />
                            <span className='text-sm font-semibold text-muted-foreground'>Pricing</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Price (AED)</label>
                                <input type="number" required min={0} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} placeholder="150" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Original Price (AED, optional)</label>
                                <input type="number" min={0} value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="220 (for discounts)" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={14} className="text-yellow-400" />
                            <span className='text-sm font-semibold text-muted-foreground'>Rating & Reviews</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Rating (0-5)</label>
                                <input type="number" step={0.1} min={0} max={5} value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Review Count</label>
                                <input type="number" min={0} value={formData.reviewCount || ""} onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className={labelClass}>Highlights (comma-separated)</label>
                        <input type="text" value={formData.highlights} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} placeholder="Dune Bashing, Camel Ride, BBQ Dinner" className={inputClass} />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className='w-4 h-4 rounded border-border bg-card/5 text-secondary' />
                            <span className='text-sm text-muted-foreground'>Mark as Popular</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className='w-4 h-4 rounded border-border bg-card/5 text-emerald-500' />
                            <span className='text-sm text-muted-foreground'>Active</span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" className='flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-foreground font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all'>
                            {editTour ? "Update Tour" : "Add Tour"}
                        </button>
                        <button type="button" onClick={onClose} className='px-6 py-3.5 bg-card/5 hover:bg-card/10 text-muted-foreground font-medium rounded-xl transition-all'>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
