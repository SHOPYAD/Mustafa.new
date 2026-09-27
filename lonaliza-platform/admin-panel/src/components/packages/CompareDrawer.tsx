// src/components/packages/CompareDrawer.tsx
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    X,
    Scale,
    Check,
    Minus,
    Star,
    Clock,
    Users,
    ChevronUp,
    Share2,
    Trash2,
} from "lucide-react";
import { HolidayPackage } from "@/types/package";

interface CompareContextType {
    compareList: HolidayPackage[];
    addToCompare: (pkg: HolidayPackage) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function useCompare() {
    const context = useContext(CompareContext);
    if (!context) {
        return {
            compareList: [],
            addToCompare: () => { },
            removeFromCompare: () => { },
            clearCompare: () => { },
            isInCompare: () => false,
        };
    }
    return context;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<HolidayPackage[]>([]);

    const addToCompare = (pkg: HolidayPackage) => {
        if (compareList.length >= 3) {
            alert("You can compare up to 3 packages at a time");
            return;
        }
        if (!compareList.find((p) => p.id === pkg.id)) {
            setCompareList([...compareList, pkg]);
        }
    };

    const removeFromCompare = (id: string) => {
        setCompareList(compareList.filter((p) => p.id !== id));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (id: string) => {
        return compareList.some((p) => p.id === id);
    };

    return (
        <CompareContext.Provider
            value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export default function CompareDrawer() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    const attributes = [
        { key: "durationDays", label: "Duration", format: (v: number) => `${v} Days` },
        { key: "price", label: "Price", format: (v: number) => `$${v.toLocaleString()}` },
        { key: "rating", label: "Rating", format: (v: number) => `${v} / 5` },
        { key: "destination", label: "Destination", format: (v: string) => v },
        { key: "country", label: "Country", format: (v: string) => v },
    ];

    const handleShare = () => {
        const url = `${window.location.origin}/compare?ids=${compareList.map((p) => p.id).join(",")}`;
        navigator.clipboard.writeText(url);
        alert("Comparison link copied to clipboard!");
    };

    return (
        <>
            {/* Floating Compare Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50"
            >
                {/* Mini Bar */}
                <div className="bg-slate-900 border-t border-slate-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-3">
                            {/* Left: Compare Items Preview */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-white">
                                    <Scale size={20} className="text-orange-400" />
                                    <span className="font-semibold">
                                        Compare ({compareList.length}/3)
                                    </span>
                                </div>

                                {/* Package Thumbnails */}
                                <div className="hidden sm:flex items-center gap-2">
                                    {compareList.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="relative w-12 h-12 rounded-lg overflow-hidden group"
                                        >
                                            <Image
                                                src={pkg.images[0]?.url || ""}
                                                alt={pkg.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => removeFromCompare(pkg.id)}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} className="text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Empty Slots */}
                                    {[...Array(3 - compareList.length)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center"
                                        >
                                            <span className="text-slate-600 text-xs">+</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={clearCompare}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                    title="Share comparison"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Compare Now
                                    <ChevronUp
                                        size={16}
                                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Comparison Table */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white border-t border-slate-200 overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {/* Header */}
                                        <thead>
                                            <tr>
                                                <th className="w-40 p-4 text-left text-sm font-medium text-slate-500">
                                                    Feature
                                                </th>
                                                {compareList.map((pkg) => (
                                                    <th key={pkg.id} className="p-4 min-w-[200px]">
                                                        <div className="relative">
                                                            {/* Package Card */}
                                                            <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                                                                <Image
                                                                    src={pkg.images[0]?.url || ""}
                                                                    alt={pkg.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                                <button
                                                                    onClick={() => removeFromCompare(pkg.id)}
                                                                    className="absolute top-2 right-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                                                >
                                                                    <X size={14} className="text-white" />
                                                                </button>
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 text-sm">
                                                                {pkg.title}
                                                            </h4>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        {/* Body */}
                                        <tbody>
                                            {attributes.map((attr, index) => (
                                                <tr
                                                    key={attr.key}
                                                    className={index % 2 === 0 ? "bg-slate-50" : ""}
                                                >
                                                    <td className="p-4 text-sm font-medium text-slate-600">
                                                        {attr.label}
                                                    </td>
                                                    {compareList.map((pkg) => {
                                                        const value = (pkg as unknown as Record<string, unknown>)[attr.key];
                                                        const formattedValue = attr.format(value as never);

                                                        // Find best value for highlighting
                                                        const allValues = compareList.map(
                                                            (p) => (p as unknown as Record<string, unknown>)[attr.key]
                                                        );
                                                        const isBest =
                                                            attr.key === "price"
                                                                ? value === Math.min(...(allValues as number[]))
                                                                : attr.key === "rating"
                                                                    ? value === Math.max(...(allValues as number[]))
                                                                    : attr.key === "durationDays"
                                                                        ? value === Math.max(...(allValues as number[]))
                                                                        : false;

                                                        return (
                                                            <td key={pkg.id} className="p-4 text-center">
                                                                <span
                                                                    className={`text-sm font-semibold ${isBest
                                                                        ? "text-green-600 bg-green-100 px-2 py-1 rounded-full"
                                                                        : "text-slate-700"
                                                                        }`}
                                                                >
                                                                    {formattedValue}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                            {/* Amenities Row */}
                                            <tr className="bg-slate-50">
                                                <td className="p-4 text-sm font-medium text-slate-600">
                                                    Amenities
                                                </td>
                                                {compareList.map((pkg) => (
                                                    <td key={pkg.id} className="p-4">
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            {pkg.amenities?.map((amenity, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                                                                >
                                                                    {amenity}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* CTA Row */}
                                            <tr>
                                                <td className="p-4"></td>
                                                {compareList.map((pkg) => (
                                                    <td key={pkg.id} className="p-4 text-center">
                                                        <Link
                                                            href={`/package/${pkg.slug}`}
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
                                                        >
                                                            Book Now
                                                        </Link>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
