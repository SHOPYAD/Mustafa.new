"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
  headerClassName?: string;
}

export interface EnterpriseDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField?: keyof T | ((row: T) => string | number);
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  batchActions?: React.ReactNode;
  pageSize?: number;
  showPagination?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function EnterpriseDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = "id",
  isLoading = false,
  emptyTitle = "لا توجد بيانات متاحة",
  emptyDescription = "لم يتم العثور على أي نتائج تطابق معايير البحث الحالية.",
  emptyAction,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  pageSize = 10,
  showPagination = true,
  batchActions,
  className,
  onRowClick,
}: EnterpriseDataTableProps<T>) {
  const { dir, locale } = useLocale();
  const isRtl = locale === "ar" || dir === "rtl";
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const getRowKey = (row: T, idx: number): string | number => {
    if (typeof keyField === "function") return keyField(row);
    return (row[keyField] as string | number) ?? idx;
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const pagedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (validPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validPage, pageSize, showPagination]);

  const allPagedKeys = useMemo(
    () => pagedData.map((row, i) => getRowKey(row, i)),
    [pagedData]
  );

  const isAllSelected =
    allPagedKeys.length > 0 && allPagedKeys.every((k) => selectedKeys.has(k));
  const isSomeSelected =
    allPagedKeys.some((k) => selectedKeys.has(k)) && !isAllSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (isAllSelected) {
      allPagedKeys.forEach((k) => next.delete(k));
    } else {
      allPagedKeys.forEach((k) => next.add(k));
    }
    onSelectionChange(next);
  };

  const handleSelectRow = (key: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  };

  return (
    <div className={cn("relative space-y-3", className)}>
      {/* Floating Batch Actions Bar */}
      {selectable && selectedKeys.size > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 backdrop-blur-xl shadow-lg shadow-primary/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <CheckSquare size={16} />
            <span>تم تحديد {selectedKeys.size} عنصر</span>
          </div>
          <div className="flex items-center gap-2">{batchActions}</div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xs transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-xs font-semibold text-muted-foreground">
                {selectable && (
                  <th className="w-12 px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={isAllSelected ? "إلغاء التحديد" : "تحديد الكل"}
                    >
                      {isAllSelected ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : isSomeSelected ? (
                        <MinusSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 transition-colors whitespace-nowrap",
                        col.align === "center"
                          ? "text-center"
                          : col.align === "end"
                          ? "text-end"
                          : "text-start",
                        col.sortable ? "cursor-pointer select-none hover:text-foreground hover:bg-muted/50" : "",
                        col.headerClassName
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          col.align === "center" ? "justify-center" : col.align === "end" ? "justify-end" : "justify-start"
                        )}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="shrink-0 text-muted-foreground/60">
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <ChevronUp size={14} className="text-primary" />
                              ) : (
                                <ChevronDown size={14} className="text-primary" />
                              )
                            ) : (
                              <ChevronsUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {selectable && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="mx-auto h-4 w-4 rounded bg-muted/70" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div className="h-4 w-3/4 rounded bg-muted/60" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12 px-4 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                        <Inbox size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">{emptyTitle}</h3>
                        <p className="text-xs text-muted-foreground">{emptyDescription}</p>
                      </div>
                      {emptyAction && <div className="pt-1">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row, index) => {
                  const rowKey = getRowKey(row, index);
                  const isSelected = selectedKeys.has(rowKey);

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "group transition-colors duration-150",
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/40",
                        onRowClick ? "cursor-pointer" : ""
                      )}
                    >
                      {selectable && (
                        <td
                          className="px-4 py-3 text-center"
                          onClick={(e) => handleSelectRow(rowKey, e)}
                        >
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3 text-foreground/90 transition-colors",
                            col.align === "center"
                              ? "text-center"
                              : col.align === "end"
                              ? "text-end"
                              : "text-start",
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(row, index)
                            : (row[col.key] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {showPagination && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="tabular-nums">
              عرض{" "}
              <span className="font-semibold text-foreground">
                {Math.min(sortedData.length, (validPage - 1) * pageSize + 1)}
              </span>{" "}
              إلى{" "}
              <span className="font-semibold text-foreground">
                {Math.min(sortedData.length, validPage * pageSize)}
              </span>{" "}
              من إجمالي{" "}
              <span className="font-semibold text-foreground">{sortedData.length}</span> سجل
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="الصفحة السابقة"
              >
                <PrevIcon size={14} />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && validPage > 3) {
                    pageNum = validPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  const isActive = validPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/60 bg-background/80 text-foreground hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="الصفحة التالية"
              >
                <NextIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
