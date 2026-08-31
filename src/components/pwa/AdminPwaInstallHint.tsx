"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
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
import type { PwaPublicConfig } from "@/data/pwa";

const DISMISS_KEY = "alrayyan_admin_pwa_hint_dismissed";

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

export default function AdminPwaInstallHint() {
  const { t } = useLocale();
  const copy = t.pwa;
  const [config, setConfig] = useState<PwaPublicConfig | null>(null);
  const [hidden, setHidden] = useState(true);
  const [iosOpen, setIosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPwaConfig().then((next) => {
      if (cancelled) return;
      setConfig(next);
      const show =
        next.enabledAdmin &&
        next.showBanner &&
        !isStandaloneDisplay() &&
        !readDismissed();
      setHidden(!show);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      !shouldCaptureInstallPrompt({
        enabled: Boolean(config?.enabledAdmin),
        showBanner: Boolean(config?.showBanner),
        standalone: isStandaloneDisplay(),
        dismissed: readDismissed(),
      }) ||
      !canUseBeforeInstallPrompt()
    ) {
      return;
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [config?.enabledAdmin, config?.showBanner]);

  const dismiss = useCallback(() => {
    writeDismissed();
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
        /* closed */
      }
      setDeferred(null);
      return;
    }
    setMenuOpen((open) => !open);
  }, [deferred, dismiss]);

  if (hidden || !config) return null;

  const ios = isIosDevice();

  return (
    <div className="sticky top-0 z-30 border-b border-emerald-500/20 bg-gradient-to-l from-emerald-500/15 via-[#0a1628] to-[#051741] text-white">
      <div className="flex items-center gap-2 px-3 py-1.5 lg:px-6">
        <Download size={14} className="shrink-0 text-emerald-300" />
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">
          {copy.adminHint}
        </p>
        <button
          type="button"
          onClick={() => void onDownload()}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-400"
        >
          {copy.download}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          aria-label={copy.dismiss}
        >
          <X size={14} />
        </button>
      </div>
      {menuOpen && !ios ? (
        <p className="border-t border-white/10 px-3 py-2 text-[11px] text-white/70 lg:px-6">
          {copy.menuHint}
        </p>
      ) : null}
      {ios && iosOpen ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-3 py-2 text-[11px] text-white/80 lg:px-6">
          <span className="font-semibold text-emerald-200">{copy.iosTitle}</span>
          <span className="inline-flex items-center gap-1">
            <Share size={12} className="text-sky-300" />
            {copy.iosShare}
          </span>
          <span className="inline-flex items-center gap-1">
            <SquarePlus size={12} className="text-emerald-300" />
            {copy.iosAdd}
          </span>
        </div>
      ) : null}
    </div>
  );
}
