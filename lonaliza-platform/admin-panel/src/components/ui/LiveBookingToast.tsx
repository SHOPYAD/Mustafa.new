// src/components/ui/LiveBookingToast.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, CheckCircle } from "lucide-react";

interface Booking {
  id: number;
  name: string;
  location: string;
  destination: string;
  timeAgo: string;
  avatar: string;
}

const mockBookings: Booking[] = [
  {
    id: 1,
    name: "Ahmed K.",
    location: "Riyadh",
    destination: "Istanbul Bosphorus Package",
    timeAgo: "2 mins ago",
    avatar: "👨",
  },
  {
    id: 2,
    name: "Sara M.",
    location: "Kuwait",
    destination: "Cappadocia Balloon Escape",
    timeAgo: "5 mins ago",
    avatar: "👩",
  },
  {
    id: 3,
    name: "Omar H.",
    location: "Doha",
    destination: "Antalya Beach Stay",
    timeAgo: "8 mins ago",
    avatar: "🧔",
  },
  {
    id: 4,
    name: "Noura A.",
    location: "Dubai",
    destination: "Trabzon & Ayder Nature",
    timeAgo: "12 mins ago",
    avatar: "👱‍♀️",
  },
  {
    id: 5,
    name: "Yousef R.",
    location: "Jeddah",
    destination: "Sapanca Day Trip",
    timeAgo: "15 mins ago",
    avatar: "👨‍💼",
  },
  {
    id: 6,
    name: "Layla S.",
    location: "Abu Dhabi",
    destination: "Bursa & Uludağ Tour",
    timeAgo: "18 mins ago",
    avatar: "👩‍🦰",
  },
];

export default function LiveBookingToast() {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [bookingIndex, setBookingIndex] = useState(0);

  const showNextBooking = (index: number) => {
    setCurrentBooking(mockBookings[index % mockBookings.length]);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 4500);
  };

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNextBooking(0);
    }, 5000);

    const interval = setInterval(() => {
      setBookingIndex((prev) => {
        const next = prev + 1;
        showNextBooking(next);
        return next;
      });
    }, 14000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentBooking && (
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="fixed bottom-6 start-6 z-50 max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex gap-3 items-start">
            <div className="text-2xl">{currentBooking.avatar}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-1">
                <CheckCircle size={14} />
                Just booked
              </div>
              <p className="text-slate-900 font-semibold text-sm truncate">
                {currentBooking.name}
              </p>
              <p className="text-slate-600 text-sm truncate">
                {currentBooking.destination}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {currentBooking.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  {currentBooking.timeAgo}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
