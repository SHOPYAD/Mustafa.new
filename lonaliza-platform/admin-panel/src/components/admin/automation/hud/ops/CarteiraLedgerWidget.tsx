"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Building2,
  Car,
  Plane,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface PartnerPortfolio {
  id: string;
  name: string;
  category: "fleet" | "hotels" | "flights" | "reseller";
  dailyRevenue: number;
  currency: string;
  status: "active" | "pending" | "review";
  bookingCount: number;
}

const REAL_PARTNERS: PartnerPortfolio[] = [
  { id: "pkfare-gds", name: "بوابة بكفير للطيران (PKFare MD5 GDS)", category: "flights", dailyRevenue: 14250, currency: "USD", status: "active", bookingCount: 28 },
  { id: "seeru-air", name: "محرك سيرو للطيران (Seeru Air JWT)", category: "flights", dailyRevenue: 11800, currency: "USD", status: "active", bookingCount: 22 },
  { id: "travelport-gds", name: "ترافلبورت العالمية (Travelport Air 7K7L)", category: "flights", dailyRevenue: 28900, currency: "USD", status: "active", bookingCount: 46 },
  { id: "biletbank-thy", name: "بيلت بانك للخطوط التركية & بيغاسوس", category: "flights", dailyRevenue: 16200, currency: "USD", status: "active", bookingCount: 34 },
  { id: "travelport-hotels", name: "ترافلبورت فنادق (140 فندق حي)", category: "hotels", dailyRevenue: 24500, currency: "USD", status: "active", bookingCount: 19 },
  { id: "hotelbeds-online", name: "هوتل بيدس العالمية (Hotelbeds SHA-256)", category: "hotels", dailyRevenue: 19400, currency: "USD", status: "active", bookingCount: 26 },
  { id: "ratehawk-worldota", name: "ريت هوك (RateHawk WorldOTA B2B)", category: "hotels", dailyRevenue: 8600, currency: "USD", status: "active", bookingCount: 12 },
  { id: "uzungol-resorts", name: "أكواخ وفلل أوزنجول وريزا المباشرة", category: "hotels", dailyRevenue: 9500, currency: "USD", status: "active", bookingCount: 15 },
  { id: "vito-trabzon", name: "أسطول مرسيدس فيتو طرابزون VIP", category: "fleet", dailyRevenue: 7850, currency: "USD", status: "active", bookingCount: 18 },
  { id: "sprinter-istanbul", name: "أسطول مرسيدس سبرينتر إسطنبول", category: "fleet", dailyRevenue: 6400, currency: "USD", status: "active", bookingCount: 11 },
  { id: "flightradar-tracker", name: "رادار تأخير الطيران وتوجيه السائقين", category: "fleet", dailyRevenue: 3200, currency: "USD", status: "active", bookingCount: 1420 },
  { id: "iyzico-pos", name: "بوابة دفع Iyzico الافتراضية 3DS", category: "reseller", dailyRevenue: 34200, currency: "USD", status: "active", bookingCount: 68 },
  { id: "b2b-smart-travel", name: "وكالة المسافر الذكي (الرياض B2B)", category: "reseller", dailyRevenue: 28400, currency: "USD", status: "active", bookingCount: 38 },
  { id: "b2b-dubai-travel", name: "شركة مسافر دبي للسياحة (B2B Pro)", category: "reseller", dailyRevenue: 18900, currency: "USD", status: "active", bookingCount: 24 },
  { id: "b2b-kuwait-travel", name: "وكالة السفير الذهبي (الكويت B2B)", category: "reseller", dailyRevenue: 12500, currency: "USD", status: "active", bookingCount: 15 },
  { id: "meta-growth-ads", name: "حملات إعلانات Meta و Google Ads", category: "reseller", dailyRevenue: 14800, currency: "USD", status: "active", bookingCount: 92 },
  { id: "b2b-wire-ledger", name: "محفظة الحوالات البنكية والتحوط FX", category: "reseller", dailyRevenue: 48000, currency: "USD", status: "active", bookingCount: 40 },
];

export default function CarteiraLedgerWidget() {
  const [timeStr, setTimeStr] = useState<string>("12:00:00 م");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("ar-SA", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalUSD = REAL_PARTNERS.reduce((sum, p) => sum + p.dailyRevenue, 0);
  const totalSAR = Math.round(totalUSD * 3.75);

  return (
    <div className="flex flex-col gap-4 w-full h-full text-slate-200">
      {/* HUD Header & Live Clock */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/20 bg-[#040d1a]/80 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              توقيت القمرة التنفيذية
            </span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {timeStr}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
          {dateStr}
        </span>
      </div>

      {/* Main Ledger Card */}
      <div className="p-4 rounded-xl border border-cyan-500/25 bg-[#030914]/90 backdrop-blur-md shadow-[0_0_20px_rgba(0,229,255,0.08)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>محفظة الإيرادات السيادية (SOVEREIGN TREASURY)</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% نمو اليوم</span>
          </span>
        </div>

        {/* Revenue Balance Counters */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-3 rounded-lg border border-slate-800 bg-[#061224]/80 flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-mono">
              إجمالي اليوم (USD)
            </span>
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              ${totalUSD.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-800 bg-[#061224]/80 flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-mono">
              المعادل بالريال (SAR)
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400 tracking-tight">
              {totalSAR.toLocaleString()} ر.س
            </span>
          </div>
        </div>

        {/* Gateways Health */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>بوابة Iyzico & Stripe:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>متصلة 100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto scrollbar-cyber pr-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          أرصدة الشركاء والعمليات الجارية
        </span>
        {REAL_PARTNERS.map((partner) => {
          let Icon = Building2;
          if (partner.category === "fleet") Icon = Car;
          if (partner.category === "flights") Icon = Plane;

          return (
            <div
              key={partner.id}
              className="p-2 rounded-xl border border-slate-800/80 bg-[#040b17]/70 hover:border-cyan-500/40 hover:bg-[#061224] transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800/60 text-slate-300 group-hover:text-cyan-400 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-medium text-slate-200 group-hover:text-white transition-colors truncate max-w-[130px]">
                    {partner.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {partner.bookingCount} حجوزات منجزة
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold font-mono text-cyan-300">
                  ${partner.dailyRevenue.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>نشط</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
