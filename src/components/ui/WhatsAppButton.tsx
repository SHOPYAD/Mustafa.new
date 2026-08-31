// src/components/ui/WhatsAppButton.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildWhatsAppLink, cn } from "@/lib/utils";
import { useSiteContact } from "@/hooks/useSiteContact";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { trackLeadEnquiry } from "@/lib/tracking";

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

export default function WhatsAppButton({
    phoneNumber,
    message = "Hi! I'm interested in your travel packages. Can you help me plan my trip?",
}: WhatsAppButtonProps) {
    const contact = useSiteContact();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const resolvedNumber =
        phoneNumber || contact.whatsappNumber || DEFAULT_SITE_WHATSAPP;

    // Show button after page loads with delay
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const whatsappUrl = buildWhatsAppLink(resolvedNumber, message);

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-500",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            )}
        >
            {/* Chat Bubble */}
            <div
                className={cn(
                    "transition-all duration-300 origin-bottom-right",
                    isOpen
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                )}
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-80">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Alrayyan Tourism</h4>
                                    <p className="text-sm text-white/80">
                                        Typically replies in minutes
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        <div className="bg-slate-100 rounded-xl p-3 mb-4">
                            <p className="text-sm text-slate-700">
                                👋 Hi there! Need help planning your perfect trip? Our travel
                                experts are here to assist you 24/7!
                            </p>
                        </div>

                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackLeadEnquiry("whatsapp_cta")}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Start Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl",
                    isOpen
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-green-500 hover:bg-green-600"
                )}
            >
                {/* Pulse Animation */}
                {!isOpen && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-20"></span>
                    </>
                )}

                {/* Icon */}
                <span className="relative flex items-center justify-center">
                    {isOpen ? (
                        <X size={28} className="text-white" />
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            fill="white"
                            className="w-8 h-8"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    )}
                </span>

                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}
