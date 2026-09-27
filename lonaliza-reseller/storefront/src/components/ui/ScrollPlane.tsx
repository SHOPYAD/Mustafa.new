// src/components/ui/ScrollPlane.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Plane } from "lucide-react";

export default function ScrollPlane() {
    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();

    // Transform scroll progress to plane position
    // Plane moves from bottom-left to top-right
    const x = useTransform(scrollYProgress, [0, 0.3], ["-20%", "120%"]);
    const y = useTransform(scrollYProgress, [0, 0.3], ["100%", "-20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.25, 0.3], [0, 1, 1, 0]);

    useEffect(() => {
        // Show plane after initial load
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Plane */}
            <motion.div
                style={{
                    x,
                    y,
                    opacity,
                }}
                className="absolute left-0 top-0"
            >
                {/* Vapor Trail */}
                <motion.div
                    className="absolute -right-32 top-1/2 -translate-y-1/2 w-80 h-1"
                    style={{
                        background:
                            "linear-gradient(to left, transparent, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 0.2) 40%, transparent)",
                        filter: "blur(2px)",
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                />

                {/* Dotted Trail */}
                <motion.div
                    className="absolute -right-32 top-1/2 -translate-y-1/2 flex gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.6 }}
                >
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-white/50"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.6 }}
                            transition={{ delay: i * 0.03, duration: 0.3 }}
                        />
                    ))}
                </motion.div>

                {/* Plane Icon Container */}
                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-xl scale-150" />

                    {/* Plane */}
                    <motion.div
                        className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50"
                        animate={{
                            rotate: [0, -2, 2, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Plane
                            className="text-white rotate-45"
                            size={32}
                            strokeWidth={2}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
