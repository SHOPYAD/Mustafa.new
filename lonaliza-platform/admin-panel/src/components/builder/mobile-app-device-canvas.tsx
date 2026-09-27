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
  Building2,
  Plane,
  Package,
  Compass,
  Car,
  FileText,
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

const BOTTOM_TABS: { id: MobileAppTab; label: string; icon: typeof Home; path: string }[] = [
  { id: "home", label: "الرئيسية", icon: Home, path: "/" },
  { id: "wallet", label: "المحفظة", icon: Wallet, path: "/account?tab=wallet" },
  { id: "community", label: "الريلز", icon: PlayCircle, path: "/community" },
  { id: "account", label: "حسابي", icon: User, path: "/account" },
  { id: "more", label: "المزيد", icon: LayoutGrid, path: "/menu" },
];

const SCREEN_SHORTCUTS = [
  { label: "الرئيسية", path: "/", icon: Home },
  { label: "الفنادق", path: "/hotels", icon: Building2 },
  { label: "الطيران", path: "/flights", icon: Plane },
  { label: "الباقات", path: "/packages", icon: Package },
  { label: "الجولات", path: "/tours", icon: Compass },
  { label: "السيارات", path: "/cars", icon: Car },
  { label: "التأشيرات", path: "/visas", icon: FileText },
  { label: "حسابي", path: "/account", icon: User },
];

function buildShellUrl(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}app=1&shell=flutter&preview=mobile`;
}

export function MobileAppDeviceCanvas({
  initialPath = "/",
  themeColor = "#7C3AED",
  royalPurple = "#2E1065",
  amberColor = "#F59E0B",
  className,
  children,
}: Props) {
  const [activeBottomTab, setActiveBottomTab] = useState<MobileAppTab>("home");
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

  const navigateTo = (path: string, tabId?: MobileAppTab) => {
    if (tabId) setActiveBottomTab(tabId);
    setCurrentPath(path);
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = buildShellUrl(path);
    }
  };

  const handleReload = () => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = buildShellUrl(currentPath);
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-2 select-none", className)}>
      {/* Top Toolbar */}
      <div className="mb-2.5 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-muted-foreground font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-foreground font-bold text-xs">معاينة فلاتر شيل المباشرة (Flutter Shell)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReload}
            title="إعادة تحميل المعاينة"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <a
            href={buildShellUrl(currentPath)}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح في تبويب مستقل"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Screen Shortcut Switcher Pills */}
      <div className="mb-3.5 flex items-center gap-1.5 overflow-x-auto max-w-[420px] w-full px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {SCREEN_SHORTCUTS.map((screen) => {
          const Icon = screen.icon;
          const isActive = currentPath === screen.path;
          return (
            <button
              key={screen.path}
              type="button"
              onClick={() => navigateTo(screen.path)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={12} />
              <span>{screen.label}</span>
            </button>
          );
        })}
      </div>

      {/* Realistic Smartphone Chassis Frame */}
      <div
        className="relative w-[375px] sm:w-[390px] h-[790px] rounded-[50px] p-[10px] shadow-2xl transition-all duration-300 ring-1 ring-slate-900/15"
        style={{
          background: "linear-gradient(145deg, #18092e 0%, #0d041a 100%)",
          boxShadow: "0 25px 50px -12px rgba(46, 16, 101, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
        }}
      >
        {/* Inner Screen Bezel */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-card flex flex-col">
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
          <div className="relative flex-1 w-full bg-background overflow-hidden">
            {children ? (
              <div className="w-full h-full overflow-y-auto lonaliza-app-shell">{children}</div>
            ) : (
              <iframe
                ref={iframeRef}
                src={buildShellUrl(currentPath)}
                onLoad={() => setLoading(false)}
                className="w-full h-full border-0 lonaliza-app-frame"
                style={{ scrollbarWidth: "none" }}
                title="Lonaliza Mobile App Preview"
              />
            )}
          </div>

          {/* Luxury Native 5-Tab Bottom Navigation Bar */}
          <div className="h-16 w-full shrink-0 border-t border-border bg-card/98 backdrop-blur-md px-2 flex items-center justify-around z-20 shadow-lg">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeBottomTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateTo(tab.path, tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer",
                    active
                      ? "text-primary scale-105 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-transform",
                      active ? "stroke-[2.5]" : "stroke-[1.8]"
                    )}
                  />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home Indicator Bar */}
          <div className="h-4 w-full bg-card flex items-center justify-center pb-1">
            <span className="h-1 w-32 rounded-full bg-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
