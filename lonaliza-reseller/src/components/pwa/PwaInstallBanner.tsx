"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPwaConfig } from "@/lib/pwa/client";
import {
  canUseBeforeInstallPrompt,
  isIosDevice,
  isStandaloneDisplay,
} from "@/lib/pwa/detect";
import {
  shouldCaptureInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-prompt";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { DEFAULT_PWA_SETTINGS, toPublicPwaConfig, type PwaPublicConfig } from "@/data/pwa";

const DISMISS_KEY = "alrayyan_pwa_banner_dismissed";

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
}

export default function PwaInstallBanner() {
  const { t, locale } = useLocale();
  const copy = t.pwa;
  const [config, setConfig] = useState<PwaPublicConfig>(() =>
    toPublicPwaConfig(DEFAULT_PWA_SETTINGS)
  );
  const [hidden, setHidden] = useState(true);
  const [iosOpen, setIosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    const media = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setStandalone(isStandaloneDisplay());
    media?.addEventListener?.("change", onChange);
    return () => media?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPwaConfig().then((next) => {
      if (!cancelled) setConfig(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const capture = shouldCaptureInstallPrompt({
      enabled: config.enabledPublic,
      showBanner: config.showBanner,
      standalone,
      dismissed: dismissed || readDismissed(),
    });
    if (!capture || !canUseBeforeInstallPrompt()) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [config.enabledPublic, config.showBanner, standalone, dismissed]);

  useEffect(() => {
    const show = shouldCaptureInstallPrompt({
      enabled: config.enabledPublic,
      showBanner: config.showBanner,
      standalone,
      dismissed: dismissed || readDismissed(),
    });
    setHidden(!show);
  }, [config, standalone, dismissed]);

  const dismiss = useCallback(() => {
    writeDismissed();
    setDismissed(true);
    setHidden(true);
    setIosOpen(false);
    setMenuOpen(false);
  }, []);

  const onDownload = useCallback(async () => {
    if (isIosDevice()) {
      setIosOpen((open) => !open);
      setMenuOpen(false);
      return;
    }
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") dismiss();
      } catch {
        /* user closed the sheet */
      }
      setDeferred(null);
      return;
    }
    setMenuOpen((open) => !open);
  }, [deferred, dismiss]);

  if (hidden) return null;

  const appName =
    locale === "en"
      ? config.nameEn || config.nameAr
      : locale === "tr"
        ? config.nameTr || config.nameEn || config.nameAr
        : config.nameAr || config.nameEn;
  const ios = isIosDevice();

  return (
    <div
      className="pwa-install-banner relative isolate overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(105deg, var(--navy, #051741) 0%, #0a2a4a 48%, #0f766e 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(16,185,129,0.35), transparent 55%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 lg:px-8">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
          <Download size={15} className="text-emerald-300" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-tight sm:text-[13px]">
          {copy.bannerTitle.replace("{name}", appName)}
        </p>
        <button
          type="button"
          onClick={() => void onDownload()}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold",
            "bg-emerald-500 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-400"
          )}
        >
          <Download size={13} />
          {copy.download}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          aria-label={copy.dismiss}
        >
          <X size={16} />
        </button>
      </div>
      {menuOpen && !ios ? (
        <p className="relative border-t border-white/10 px-3 py-2 text-[12px] text-white/80 sm:px-6 lg:px-8">
          {copy.menuHint}
        </p>
      ) : null}
      {ios && iosOpen ? (
        <div className="relative border-t border-white/10 px-3 py-2.5 sm:px-6 lg:px-8">
          <p className="mb-2 text-[11px] font-semibold text-emerald-200/90">
            {copy.iosTitle}
          </p>
          <ol className="flex flex-col gap-1.5 text-[12px] text-white/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <li className="inline-flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-white/10">
                1
              </span>
              <Share size={13} className="text-sky-300" />
              {copy.iosShare}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-white/10">
                2
              </span>
              <SquarePlus size={13} className="text-emerald-300" />
              {copy.iosAdd}
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
