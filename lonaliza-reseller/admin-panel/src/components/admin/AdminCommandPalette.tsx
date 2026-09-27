"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildAdminNav, type NavLeaf } from "@/components/admin/admin-nav";
import type { Dictionary } from "@/lib/i18n/types";
import { isOriginClient } from "@/lib/public-config";

type AdminCommandPaletteProps = {
  t: Dictionary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AdminCommandPalette({
  t,
  open,
  onOpenChange,
}: AdminCommandPaletteProps) {
  const router = useRouter();
  const isOrigin = isOriginClient();

  const groups = useMemo(() => {
    const all = buildAdminNav(t.admin);
    return isOrigin ? all : all.filter((g) => g.id !== "resale");
  }, [t.admin, isOrigin]);

  const run = useCallback(
    (item: NavLeaf) => {
      onOpenChange(false);
      router.push(item.href);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.admin.panel}
      description={t.admin.searchTabs || "Search"}
    >
      <CommandInput placeholder={t.common.search} />
      <CommandList>
        <CommandEmpty>{t.search.noResults}</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.id} heading={group.label}>
            {group.branches.flatMap((branch) =>
              branch.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.href} ${item.description || ""} ${group.label}`}
                  onSelect={() => run(item)}
                >
                  <item.icon data-icon="inline-start" />
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function AdminCommandTrigger({
  label,
  onOpen,
}: {
  label: string;
  onOpen: () => void;
}) {
  const [mod, setMod] = useState("⌘");

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
    setMod(isMac ? "⌘" : "Ctrl");
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="admin-tap admin-chrome hidden sm:inline-flex min-h-11 items-center gap-2 rounded-xl border border-admin-border-subtle bg-admin-bg-subtle px-3 text-sm text-admin-text-muted transition-colors hover:bg-muted hover:text-admin-text-primary lg:min-h-9 lg:h-9"
    >
      <Search className="size-4 shrink-0" />
      <span className="max-w-[12rem] truncate">{label}</span>
      <kbd className="ms-2 hidden rounded-md border border-admin-border-subtle bg-admin-bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold text-admin-text-muted md:inline-flex">
        {mod}K
      </kbd>
    </button>
  );
}

export function useAdminCommandShortcut(onOpen: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onOpen]);
}
