// src/components/ui/SmoothScroll.tsx
"use client";

import { useEffect, useRef, ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface SmoothScrollProps {
    children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProps) {
    return <>{children}</>;
}

// Text reveal animation on scroll
export function TextReveal({ children, className = "" }: { children: string; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.9", "start 0.3"]
    });

    const words = children.split(" ");

    return (
        <div ref={ref} className={className}>
            {words.map((word, i) => {
                const start = i / words.length;
                const end = start + (1 / words.length);
                return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]}>
                        {word}
                    </Word>
                );
            })}
        </div>
    );
}

function Word({ children, progress, range }: { children: string; progress: any; range: [number, number] }) {
    const opacity = useTransform(progress, range, [0.2, 1]);
    const y = useTransform(progress, range, [20, 0]);

    return (
        <motion.span
            style={{ opacity, y }}
            className="inline-block mr-[0.25em] relative"
        >
            {children}
        </motion.span>
    );
}

// Parallax image effect
export function ParallaxImage({
    src,
    alt,
    className = "",
    speed = 0.5
}: {
    src: string;
    alt: string;
    className?: string;
    speed?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.img
                src={src}
                alt={alt}
                style={{ y, scale }}
                className="w-full h-full object-cover"
            />
        </div>
    );
}

// Magnetic button effect
export function MagneticButton({
    children,
    className = "",
    onClick
}: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const ref = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        const button = ref.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    };

    const handleMouseLeave = () => {
        const button = ref.current;
        if (!button) return;
        button.style.transform = 'translate(0, 0)';
    };

    return (
        <button
            ref={ref}
            className={`transition-transform duration-300 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

// Horizontal scroll section
export function HorizontalScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        <section ref={targetRef} className={`relative h-[300vh] ${className}`}>
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-8">
                    {children}
                </motion.div>
            </div>
        </section>
    );
}

// Stagger children animation
export function StaggerContainer({
    children,
    className = "",
    staggerDelay = 0.1
}: {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

// Number counter animation
export function AnimatedCounter({
    value,
    duration = 2,
    prefix = "",
    suffix = ""
}: {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.9", "start 0.5"]
    });

    const springValue = useSpring(0, { duration: duration * 1000 });

    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            if (latest > 0.5) {
                springValue.set(value);
            }
        });
    }, [scrollYProgress, springValue, value]);

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest));
        });
    }, [springValue]);

    return (
        <span ref={ref}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}

import { useState } from "react";
