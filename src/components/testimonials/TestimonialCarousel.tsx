// src/components/testimonials/TestimonialCarousel.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Testimonial } from "@/types/package";
import { cn } from "@/lib/utils";

interface TestimonialCarouselProps {
    testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const next = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const current = testimonials[activeIndex];

    return (
        <div className="relative max-w-4xl mx-auto">
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden">
                {/* Decorative Quote */}
                <Quote
                    size={120}
                    className="absolute -top-4 -left-4 text-orange-100 rotate-180"
                />

                {/* Content */}
                <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={20}
                                className={cn(
                                    i < current.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-200"
                                )}
                            />
                        ))}
                    </div>

                    {/* Quote Text */}
                    <p className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed mb-8">
                        &ldquo;{current.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                            {current.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{current.name}</h4>
                            <p className="text-sm text-slate-500">
                                {current.location} • Trip to {current.tripDestination}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                    <button
                        onClick={prev}
                        className="w-12 h-12 rounded-full bg-slate-100 hover:bg-orange-100 flex items-center justify-center transition-colors group"
                    >
                        <ChevronLeft size={20} className="text-slate-600 group-hover:text-orange-600" />
                    </button>
                    <button
                        onClick={next}
                        className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center transition-colors"
                    >
                        <ChevronRight size={20} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            index === activeIndex
                                ? "bg-orange-600 w-8"
                                : "bg-slate-300 hover:bg-slate-400"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
