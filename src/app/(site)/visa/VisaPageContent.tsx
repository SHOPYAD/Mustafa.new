// src/app/visa/VisaPageContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    Clock,
    CheckCircle,
    Search,
    ArrowRight,
    Globe,
    ShieldCheck,
    Sparkles,
    Send,
    User,
    Mail,
    Phone,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getActiveVisaData,
    LEGACY_VISA_STORAGE_KEY,
    VISA_STORAGE_KEY,
    type VisaCountry,
} from "@/data/visa";
import { createBooking } from "@/data/bookings";
import { trackLeadEnquiry } from "@/lib/tracking";

export default function VisaPageContent() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(
        searchParams.get("type")?.split("-")[0] || null
    );
    const [visaData, setVisaData] = useState<VisaCountry[]>([]);

    // Enquiry form state
    const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", destination: "", message: "" });
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [enquiryLoading, setEnquiryLoading] = useState(false);

    useEffect(() => {
        setVisaData(getActiveVisaData());
        const handleStorage = (e: StorageEvent) => {
            if (e.key === VISA_STORAGE_KEY || e.key === LEGACY_VISA_STORAGE_KEY) {
                setVisaData(getActiveVisaData());
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const filteredVisa = visaData.filter((v) =>
        v.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnquiryLoading(true);
        await createBooking({
            type: "visa",
            packageName: enquiryForm.destination || "Visa Enquiry",
            destination: enquiryForm.destination,
            name: enquiryForm.name,
            email: enquiryForm.email,
            phone: enquiryForm.phone,
            message: enquiryForm.message,
        });
        trackLeadEnquiry("visa_enquiry");
        setEnquiryLoading(false);
        setEnquirySubmitted(true);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 text-white text-sm font-semibold rounded-full mb-6">
                        <Sparkles size={16} />
                        Fast &amp; Hassle-Free
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Visa Services
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                        Get your visa processed quickly with our professional service.
                        We handle 50+ countries worldwide.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <Search
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by country..."
                            className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl shadow-xl text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/30"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Clock size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Fast Processing</h3>
                                <p className="text-sm text-slate-600">Same day for UAE visas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">99% Success Rate</h3>
                                <p className="text-sm text-slate-600">Trusted by thousands</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Globe size={24} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">50+ Countries</h3>
                                <p className="text-sm text-slate-600">Worldwide coverage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visa Cards */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredVisa.map((country) => (
                        <div key={country.id} className="mb-12">
                            {/* Country Header */}
                            <button
                                onClick={() =>
                                    setSelectedCountry(
                                        selectedCountry === country.id ? null : country.id
                                    )
                                }
                                className="w-full flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all mb-4"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{country.flag}</span>
                                    <div className="text-left">
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {country.country}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {country.types.length} visa types available
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight
                                    size={20}
                                    className={cn(
                                        "text-slate-400 transition-transform",
                                        selectedCountry === country.id && "rotate-90"
                                    )}
                                />
                            </button>

                            {/* Visa Types */}
                            <div
                                className={cn(
                                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden transition-all duration-500",
                                    selectedCountry === country.id
                                        ? "max-h-[1000px] opacity-100"
                                        : "max-h-0 opacity-0"
                                )}
                            >
                                {country.types.map((visa, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-xl p-6 border-2 border-slate-100 hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText size={20} className="text-blue-600" />
                                            <span className="font-semibold text-slate-900">
                                                {visa.name}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600 mb-1">
                                            {visa.duration}
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900 mb-4">
                                            {visa.price}
                                        </p>

                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                            <Clock size={14} />
                                            <span>{visa.processingTime}</span>
                                        </div>

                                        <ul className="space-y-2 mb-6">
                                            {visa.features.map((feature, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm text-slate-600"
                                                >
                                                    <CheckCircle
                                                        size={14}
                                                        className="text-green-500"
                                                    />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => {
                                                setEnquiryForm((f) => ({ ...f, destination: country.country }));
                                                document.getElementById("visa-enquiry-form")?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Visa Enquiry Form */}
            <section id="visa-enquiry-form" className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3">Get a Free Visa Consultation</h2>
                        <p className="text-white/70">Our visa experts will guide you through the entire process</p>
                    </div>

                    {enquirySubmitted ? (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Enquiry Submitted!</h3>
                            <p className="text-white/70">Our team will contact you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleEnquirySubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your Name"
                                        value={enquiryForm.name}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        value={enquiryForm.email}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone Number"
                                        value={enquiryForm.phone}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Destination Country"
                                        value={enquiryForm.destination}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, destination: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-4 top-4 text-white/40" />
                                <textarea
                                    rows={3}
                                    placeholder="Any specific requirements or questions?"
                                    value={enquiryForm.message}
                                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={enquiryLoading}
                                className="w-full py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {enquiryLoading ? (
                                    <div className="w-5 h-5 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Enquiry
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}
