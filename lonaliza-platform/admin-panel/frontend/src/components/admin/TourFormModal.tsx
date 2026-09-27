// src/components/admin/TourFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Sunrise, Sunset, Moon } from "lucide-react";
import { type Tour } from "@/data/tours";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
        "w-full px-4 py-3 bg-admin-bg-subtle border border-admin-border-subtle rounded-xl text-foreground placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all";
    const labelClass = "block text-xs font-bold text-admin-text-muted uppercase tracking-wider mb-1.5";

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="left" className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{editTour ? "Edit Tour" : "Add New Tour"}</SheetTitle>
                    <SheetDescription>
                        {editTour ? `Editing ${editTour.title}` : "Fill in tour details"}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid gap-3 px-4 pb-4">
                    <details open className="rounded-lg border bg-card p-3">
                        <summary className="cursor-pointer text-sm font-semibold">Basic Info</summary>
                        <div className="mt-3 grid grid-cols-1 gap-4">
                            <div>
                                <label className={labelClass}>Tour Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Desert Safari with BBQ Dinner" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Image URL</label>
                                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className={inputClass} />
                            </div>
                        </div>
                    </details>
                    <details className="rounded-lg border bg-card p-3">
                        <summary className="cursor-pointer text-sm font-semibold">Schedule</summary>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Duration</label>
                                <input type="text" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 6 Hours" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Timing</label>
                                <div className="flex gap-2">
                                    {(["morning", "afternoon", "evening"] as const).map((t) => (
                                        <button key={t} type="button" onClick={() => setFormData({ ...formData, timing: t })} className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border ${formData.timing === t ? "bg-primary/15 border-primary/50 text-primary" : "bg-admin-bg-subtle border-admin-border-subtle text-admin-text-muted hover:bg-muted"}`}>
                                            {t === "morning" && <Sunrise size={14} />}
                                            {t === "afternoon" && <Sunset size={14} />}
                                            {t === "evening" && <Moon size={14} />}
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </details>
                    <details className="rounded-lg border bg-card p-3">
                        <summary className="cursor-pointer text-sm font-semibold">Category & pricing</summary>
                        <div className="mt-3 space-y-4">
                        <div>
                            <label className={labelClass}>Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${formData.category === cat ? "bg-primary/15 border-primary/50 text-primary" : "bg-admin-bg-subtle border-admin-border-subtle text-admin-text-muted hover:bg-muted"}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
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
                    </details>
                    <details className="rounded-lg border bg-card p-3">
                        <summary className="cursor-pointer text-sm font-semibold">Rating & flags</summary>
                        <div className="mt-3 space-y-4">
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
                        <div>
                            <label className={labelClass}>Highlights (comma-separated)</label>
                            <input type="text" value={formData.highlights} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} placeholder="Dune Bashing, Camel Ride, BBQ Dinner" className={inputClass} />
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-admin-bg-subtle text-amber-500" />
                                <span className="text-sm text-muted-foreground">Mark as Popular</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-admin-bg-subtle text-emerald-500" />
                                <span className="text-sm text-muted-foreground">Active</span>
                            </label>
                        </div>
                        </div>
                    </details>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{editTour ? "Update Tour" : "Add Tour"}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

