"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import SearchAgentMode, { SearchAiModeSwitch } from "@/components/search/SearchAgentMode";
import type { SearchTabKey } from "@/data/search-tabs";
import {
  loadSearchAgentSession,
  SEARCH_AGENT_MODE_KEY,
  searchAgentCopy,
  type SearchAgentPage,
} from "@/lib/search-agent";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  tab: SearchTabKey;
  page?: SearchAgentPage;
  context?: string;
  className?: string;
  tone?: "dark" | "light" | "brand";
  /** When true, AI Mode hides children and shows the live agent instead of the form. */
  replace?: boolean;
  children?: ReactNode;
};

function SearchAgentResultsDockInner({
  tab,
  page = "results",
  context,
  className,
  tone = "dark",
  replace = false,
  children,
}: Props) {
  const params = useSearchParams();
  const { locale } = useLocale();
  const copy = useMemo(() => searchAgentCopy(locale), [locale]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("ai") === "1" || params.get("asid")) {
      setOpen(true);
      try {
        localStorage.setItem(SEARCH_AGENT_MODE_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      if (localStorage.getItem(SEARCH_AGENT_MODE_KEY) === "1") {
        setOpen(true);
        return;
      }
    } catch {
      /* ignore */
    }
    if (!replace) {
      const session = loadSearchAgentSession();
      if (session && Date.now() - session.updatedAt < 1000 * 60 * 90) setOpen(true);
    }
  }, [params, replace]);

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      localStorage.setItem(SEARCH_AGENT_MODE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("flex items-center", replace ? "justify-between gap-3" : "justify-end")}>
        {replace ? (
          <p
            className={cn(
              "min-w-0 text-[11px] font-semibold",
              tone === "light" ? "text-slate-500" : "text-white/65"
            )}
          >
            {open ? copy.liveWith : copy.liveHint}
          </p>
        ) : null}
        <SearchAiModeSwitch on={open} onChange={toggle} label={copy.mode} tone={tone} />
      </div>
      {replace ? (
        open ? <SearchAgentMode tab={tab} page={page} context={context} /> : children
      ) : (
        <>
          {children}
          {open ? <SearchAgentMode tab={tab} page={page} context={context} compact /> : null}
        </>
      )}
    </div>
  );
}

export default function SearchAgentResultsDock(props: Props) {
  return (
    <Suspense fallback={props.children || null}>
      <SearchAgentResultsDockInner {...props} />
    </Suspense>
  );
}
