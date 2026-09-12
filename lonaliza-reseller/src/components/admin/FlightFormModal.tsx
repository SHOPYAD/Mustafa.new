// src/components/admin/FlightFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plane, Clock, DollarSign, MapPin } from "lucide-react";
import { type Flight } from "@/data/flights";

interface FlightFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (flight: Omit<Flight, "id">) => void;
    editFlight?: Flight | null;
}

const airlineEmojis: Record<string, string> = {
    Emirates: "🛫",
    "Etihad Airways": "✈️",
    "Qatar Airways": "🌍",
    Flydubai: "🔵",
    "Air Arabia": "🟠",
    "Oman Air": "🟢",
    "Kuwait Airways": "🔴",
    "Saudia": "🟤",
    default: "✈️",
};

export default function FlightFormModal({
    isOpen,
    onClose,
    onSubmit,
    editFlight,
}: FlightFormModalProps) {
    const [formData, setFormData] = useState({
        airline: "",
        airlineLogo: "✈️",
        flightNumber: "",
        departureTime: "",
        departureCity: "",
        departureAirport: "",
        arrivalTime: "",
        arrivalCity: "",
        arrivalAirport: "",
        duration: "",
        stops: 0,
        price: 0,
        wifi: false,
        meals: false,
        entertainment: false,
        isActive: true,
    });

    useEffect(() => {
        if (editFlight) {
            setFormData({
                airline: editFlight.airline,
                airlineLogo: editFlight.airlineLogo,
                flightNumber: editFlight.flightNumber,
                departureTime: editFlight.departure.time,
                departureCity: editFlight.departure.city,
                departureAirport: editFlight.departure.airport,
                arrivalTime: editFlight.arrival.time,
                arrivalCity: editFlight.arrival.city,
                arrivalAirport: editFlight.arrival.airport,
                duration: editFlight.duration,
                stops: editFlight.stops,
                price: editFlight.price,
                wifi: editFlight.amenities.includes("wifi"),
                meals: editFlight.amenities.includes("meals"),
                entertainment: editFlight.amenities.includes("entertainment"),
                isActive: editFlight.isActive,
            });
        } else {
            setFormData({
                airline: "",
                airlineLogo: "✈️",
                flightNumber: "",
                departureTime: "",
                departureCity: "",
                departureAirport: "",
                arrivalTime: "",
                arrivalCity: "",
                arrivalAirport: "",
                duration: "",
                stops: 0,
                price: 0,
                wifi: false,
                meals: false,
                entertainment: false,
                isActive: true,
            });
        }
    }, [editFlight, isOpen]);

    const handleAirlineChange = (value: string) => {
        setFormData({
            ...formData,
            airline: value,
            airlineLogo: airlineEmojis[value] || airlineEmojis.default,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amenities: string[] = [];
        if (formData.wifi) amenities.push("wifi");
        if (formData.meals) amenities.push("meals");
        if (formData.entertainment) amenities.push("entertainment");

        onSubmit({
            airline: formData.airline,
            airlineLogo: formData.airlineLogo,
            flightNumber: formData.flightNumber,
            departure: {
                time: formData.departureTime,
                city: formData.departureCity,
                airport: formData.departureAirport,
            },
            arrival: {
                time: formData.arrivalTime,
                city: formData.arrivalCity,
                airport: formData.arrivalAirport,
            },
            duration: formData.duration,
            stops: formData.stops,
            price: formData.price,
            amenities,
            isActive: formData.isActive,
        });
        onClose();
    };

    if (!isOpen) return null;

    const inputClass =
        "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all";
    const labelClass = "block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Plane size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {editFlight ? "Edit Flight" : "Add New Flight"}
                            </h2>
                            <p className="text-xs text-white/40">
                                {editFlight
                                    ? `Editing ${editFlight.flightNumber}`
                                    : "Fill in flight details"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Airline Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Plane size={14} className="text-amber-400" />
                            <span className="text-sm font-semibold text-white/70">
                                Airline Information
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Airline Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.airline}
                                    onChange={(e) => handleAirlineChange(e.target.value)}
                                    placeholder="e.g. Emirates"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Flight Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.flightNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, flightNumber: e.target.value })
                                    }
                                    placeholder="e.g. EK500"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Departure */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-emerald-400" />
                            <span className="text-sm font-semibold text-white/70">
                                Departure Details
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.departureTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, departureTime: e.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.departureCity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, departureCity: e.target.value })
                                    }
                                    placeholder="e.g. Dubai"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Airport Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.departureAirport}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            departureAirport: e.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="e.g. DXB"
                                    maxLength={4}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Arrival */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-blue-400" />
                            <span className="text-sm font-semibold text-white/70">
                                Arrival Details
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.arrivalTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, arrivalTime: e.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.arrivalCity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, arrivalCity: e.target.value })
                                    }
                                    placeholder="e.g. London"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Airport Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.arrivalAirport}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            arrivalAirport: e.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="e.g. LHR"
                                    maxLength={4}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Flight Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-purple-400" />
                            <span className="text-sm font-semibold text-white/70">
                                Flight Details
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Duration</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duration: e.target.value })
                                    }
                                    placeholder="e.g. 7h 30m"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Stops</label>
                                <select
                                    value={formData.stops}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stops: parseInt(e.target.value),
                                        })
                                    }
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    <option value={0} className="bg-slate-900">Non-stop</option>
                                    <option value={1} className="bg-slate-900">1 Stop</option>
                                    <option value={2} className="bg-slate-900">2 Stops</option>
                                    <option value={3} className="bg-slate-900">3+ Stops</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Price (AED)</label>
                                <div className="relative">
                                    <DollarSign
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={formData.price || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        placeholder="2500"
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Amenities</label>
                            <div className="flex flex-wrap gap-3 mt-1">
                                {[
                                    { key: "wifi", label: "Wi-Fi" },
                                    { key: "meals", label: "Meals" },
                                    { key: "entertainment", label: "Entertainment" },
                                ].map((a) => (
                                    <label
                                        key={a.key}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData[a.key as "wifi" | "meals" | "entertainment"]
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    [a.key]: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/50"
                                        />
                                        <span className="text-sm text-white/60">{a.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <div className="flex gap-3 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.isActive}
                                        onChange={() =>
                                            setFormData({ ...formData, isActive: true })
                                        }
                                        className="w-4 h-4 text-emerald-500 border-white/20 bg-white/5 focus:ring-emerald-500/50"
                                    />
                                    <span className="text-sm text-emerald-400">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={!formData.isActive}
                                        onChange={() =>
                                            setFormData({ ...formData, isActive: false })
                                        }
                                        className="w-4 h-4 text-red-500 border-white/20 bg-white/5 focus:ring-red-500/50"
                                    />
                                    <span className="text-sm text-red-400">Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all"
                        >
                            {editFlight ? "Update Flight" : "Add Flight"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
