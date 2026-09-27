"use client";

import React, { useState } from "react";
import { Search, X, SlidersHorizontal, LayoutGrid, List, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface EnterpriseFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  tabs?: FilterTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  filtersSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  viewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalResults?: number;
  className?: string;
}

export function EnterpriseFilterBar({
  searchPlaceholder = "بحث...",
  searchValue = "",
  onSearchChange,
  tabs,
  activeTab,
  onTabChange,
  filtersSlot,
  actionsSlot,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing = false,
  totalResults,
  className,
}: EnterpriseFilterBarProps) {
  const [internalSearch, setInternalSearch] = useState(searchValue);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    onSearchChange?.(val);
  };

  const handleClear = () => {
    setInternalSearch("");
    onSearchChange?.("");
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-4 backdrop-blur-xl transition-all shadow-xs",
        className
      )}
    >
      {/* Top row: Search + Filters slot + View toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
          />
          <input
            type="text"
            value={onSearchChange ? searchValue : internalSearch}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-border/60 bg-background/80 ps-10 pe-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
          />
          {(onSearchChange ? searchValue : internalSearch) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters and View Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
          {filtersSlot}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw size={15} className={cn(isRefreshing && "animate-spin text-primary")} />
            </button>
          )}

          {viewMode && onViewModeChange && (
            <div className="flex items-center rounded-xl border border-border/60 bg-background/80 p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors",
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="عرض جدولي"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="عرض بطاقات"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          )}

          {actionsSlot}
        </div>
      </div>

      {/* Bottom row: Tabs and Result count */}
      {(tabs || totalResults !== undefined) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/30">
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 select-none",
                      isActive
                        ? "bg-primary/15 text-primary font-bold border border-primary/30 shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                    )}
                  >
                    {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-semibold",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {totalResults !== undefined && (
            <div className="text-[11px] sm:text-xs text-muted-foreground sm:text-end shrink-0 tabular-nums">
              إجمالي النتائج: <span className="font-bold text-foreground">{totalResults}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
