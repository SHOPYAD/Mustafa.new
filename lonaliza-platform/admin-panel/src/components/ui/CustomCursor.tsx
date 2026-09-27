// src/components/ui/CustomCursor.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [hoverText, setHoverText] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check for interactive elements
            if (target.closest('a, button, [data-cursor]')) {
                setIsHovering(true);
                const cursorText = target.closest('[data-cursor]')?.getAttribute('data-cursor');
                setHoverText(cursorText || 'View');
            }
        };

        const handleMouseOut = () => {
            setIsHovering(false);
            setHoverText("");
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [cursorX, cursorY]);

    // Only show on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        return null;
    }

    return (
        <>
            {/* Main cursor dot */}
            <motion.div
                className="fixed top-0 left-0 w-3 h-3 bg-blue-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: isVisible ? 1 : 0,
                }}
            />

            {/* Cursor ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: isVisible ? 1 : 0,
                }}
                animate={{
                    width: isHovering ? 80 : 40,
                    height: isHovering ? 80 : 40,
                    backgroundColor: isHovering ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    borderColor: isHovering ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.3)",
                }}
                transition={{ duration: 0.2 }}
            >
                <div
                    className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isHovering ? 'border-blue-500' : 'border-blue-500/30'
                        }`}
                >
                    {isHovering && hoverText && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-bold text-blue-500 uppercase tracking-wider"
                        >
                            {hoverText}
                        </motion.span>
                    )}
                </div>
            </motion.div>
        </>
    );
}
