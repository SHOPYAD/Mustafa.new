"use client";

import { useState, useRef, useEffect } from "react";
import {
  Home,
  Wallet,
  PlayCircle,
  User,
  LayoutGrid,
  RotateCw,
  ExternalLink,
  Wifi,
  Signal,
  Battery,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileAppTab = "home" | "wallet" | "community" | "account" | "more";

interface Props {
  initialPath?: string;
  themeColor?: string;
  royalPurple?: string;
  amberColor?: string;
  className?: string;
  children?: React.ReactNode;
}

const TABS: { id: MobileAppTab; label: string; icon: typeof Home; path: string }[] = [
  { id: "home", label: "الرئيسية", icon: Home, path: "/" },
  { id: "wallet", label: "المحفظة", icon: Wallet, path: "/account?tab=wallet" },
  { id: "community", label: "الريلز", icon: PlayCircle, path: "/community" },
  { id: "account", label: "حسابي", icon: User, path: "/account" },
  { id: "more", label: "المزيد", icon: LayoutGrid, path: "/menu" },
];

export function MobileAppDeviceCanvas({
  initialPath = "/",
  themeColor = "#7C3AED",
  royalPurple = "#2E1065",
  amberColor = "#F59E0B",
  className,
  children,
}: Props) {
  const [activeTab, setActiveTab] = useState<MobileAppTab>("home");
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("9:41");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false })
      );
    };
    updateClock();
    const t = setInterval(updateClock, 30000);
    return () => clearInterval(t);
  }, []);

  const handleTabClick = (tab: typeof TABS[number]) => {
    setActiveTab(tab.id);
    setCurrentPath(tab.path);
    setLoading(true);
    if (iframeRef.current) {
      const sep = tab.path.includes("?") ? "&" : "?";
      iframeRef.current.src = `${tab.path}${sep}app=1`;
    }
  };

  const handleReload = () => {
    setLoading(true);
    if (iframeRef.current) {
      const sep = currentPath.includes("?") ? "&" : "?";
      iframeRef.current.src = `${currentPath}${sep}app=1`;
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-2 select-none", className)}>
      {/* Top Toolbar */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[390px] px-2 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-800 font-bold text-[11px]">معاينة تطبيق الهاتف (Native Shell)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReload}
            title="إعادة تحميل المعاينة"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-purple-600" : ""} />
          </button>
          <a
            href={`${currentPath}${currentPath.includes("?") ? "&" : "?"}app=1`}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح في تبويب مستقل"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Realistic Smartphone Chassis Frame */}
      <div
        className="relative w-[375px] sm:w-[390px] h-[780px] rounded-[50px] p-[10px] shadow-2xl transition-all duration-300 ring-1 ring-slate-900/15"
        style={{
          background: "linear-gradient(145deg, #18092e 0%, #0d041a 100%)",
          boxShadow: "0 25px 50px -12px rgba(46, 16, 101, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
        }}
      >
        {/* Inner Screen Bezel */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-white flex flex-col">
          {/* Native Phone Status Bar */}
          <div
            className="h-11 w-full shrink-0 px-6 flex items-center justify-between text-white text-[12px] font-bold z-20 shadow-xs"
            style={{ backgroundColor: royalPurple }}
          >
            <span>{currentTime}</span>

            {/* Dynamic Island / Front Camera Notch */}
            <div className="h-5 w-24 bg-black rounded-full flex items-center justify-end px-2.5 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-slate-900 border border-slate-700" />
            </div>

            <div className="flex items-center gap-1.5 text-white/90">
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={14} className="rotate-90" />
            </div>
          </div>

          {/* Slim 1.5px Animated Loading Bar */}
          {loading && (
            <div className="h-[2px] w-full bg-purple-950 overflow-hidden z-20">
              <div
                className="h-full w-full animate-pulse"
                style={{
                  background: `linear-gradient(90deg, ${themeColor}, ${amberColor})`,
                }}
              />
            </div>
          )}

          {/* Embedded Viewport / Children Container */}
          <div className="relative flex-1 w-full bg-slate-50 overflow-hidden">
            {children ? (
              <div className="w-full h-full overflow-y-auto lonaliza-app-shell">{children}</div>
            ) : (
              <iframe
                ref={iframeRef}
                src={`${currentPath}${currentPath.includes("?") ? "&" : "?"}app=1`}
                onLoad={() => setLoading(false)}
                className="w-full h-full border-0 lonaliza-app-frame"
                style={{ scrollbarWidth: "none" }}
                title="Lonaliza Mobile App Preview"
              />
            )}
          </div>

          {/* Luxury Native 5-Tab Bottom Navigation Bar */}
          <div
            className="h-16 w-full shrink-0 border-t border-purple-900/10 bg-white/98 backdrop-blur-md px-2 flex items-center justify-around z-20 shadow-lg"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer",
                    active ? "scale-105" : "opacity-60 hover:opacity-90"
                  )}
                >
                  <div
                    className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-200",
                      active
                        ? "text-white shadow-md shadow-purple-950/30 ring-1 ring-amber-400/40"
                        : "text-slate-600"
                    )}
                    style={{
                      backgroundColor: active ? royalPurple : "transparent",
                    }}
                  >
                    <Icon size={18} style={{ color: active ? amberColor : "currentColor" }} />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] tracking-tight transition-colors",
                      active ? "font-black text-purple-950" : "font-semibold text-slate-500"
                    )}
                  >
                    {tab.label}
                  </span>
                  {active && (
                    <span
                      className="absolute -bottom-1 h-0.5 w-5 rounded-full"
                      style={{ backgroundColor: amberColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Home Indicator Bar */}
          <div className="h-3.5 w-full bg-white flex items-center justify-center pb-1">
            <div className="h-1 w-28 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
