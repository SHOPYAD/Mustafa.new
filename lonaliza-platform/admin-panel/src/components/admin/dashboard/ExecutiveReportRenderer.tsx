"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Car,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Search,
  Check,
  Send,
} from "lucide-react";

export interface ToolExecutionStep {
  id: string;
  stepNumber: number;
  toolName: string;
  targetAgent?: string;
  actionType: "tool_call" | "agent_directive" | "db_query" | "mcp_call" | "ai_reasoning";
  status: "running" | "completed" | "failed";
  descriptionAr: string;
  timestamp: string;
  details?: string;
}

export interface ChatAction {
  id: string;
  label: string;
  url?: string;
  prompt?: string;
  variant?: "primary" | "secondary" | "outline";
}

interface ExecutiveReportRendererProps {
  content: string;
  executionSteps?: ToolExecutionStep[];
  actions?: ChatAction[];
  suggestedPrompts?: string[];
  isExpandedSteps?: boolean;
  onToggleSteps?: () => void;
  onSendPrompt?: (prompt: string) => void;
}

export default function ExecutiveReportRenderer({
  content,
  executionSteps = [],
  actions = [],
  suggestedPrompts = [],
  isExpandedSteps = false,
  onToggleSteps,
  onSendPrompt,
}: ExecutiveReportRendererProps) {
  // Parse content into blocks (paragraphs, tables, lists, headers)
  const parsedBlocks = useMemo(() => {
    const lines = content.split("\n");
    const blocks: Array<
      | { type: "header"; level: number; text: string }
      | { type: "table"; headers: string[]; rows: string[][] }
      | { type: "list"; items: string[] }
      | { type: "paragraph"; text: string }
    > = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // Check Header
      if (line.startsWith("### ")) {
        blocks.push({ type: "header", level: 3, text: line.replace(/^###\s+/, "") });
        i++;
        continue;
      }
      if (line.startsWith("## ")) {
        blocks.push({ type: "header", level: 2, text: line.replace(/^##\s+/, "") });
        i++;
        continue;
      }
      if (line.startsWith("# ")) {
        blocks.push({ type: "header", level: 1, text: line.replace(/^#\s+/, "") });
        i++;
        continue;
      }

      // Check Callout / Quote (starts with > )
      if (line.startsWith("> ")) {
        blocks.push({
          type: "callout" as any,
          text: line.replace(/^>\s*/, ""),
        } as any);
        i++;
        continue;
      }

      // Check Code / JSON Block (starts with ``` )
      if (line.startsWith("```")) {
        i++;
        const codeLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith("```")) {
          i++;
        }
        const rawCode = codeLines.join("\n").trim();
        // Try parsing as JSON
        try {
          const parsed = JSON.parse(rawCode);
          if (parsed.packages || parsed.returnedPackages) {
            const list = parsed.packages || parsed.returnedPackages || [];
            blocks.push({
              type: "packages_grid" as any,
              packages: list,
            } as any);
            continue;
          }
          if (parsed.cars) {
            blocks.push({
              type: "cars_grid" as any,
              cars: parsed.cars,
            } as any);
            continue;
          }
        } catch (_) {
          // not valid JSON, treat as code
        }

        blocks.push({
          type: "code" as any,
          code: rawCode,
        } as any);
        continue;
      }

      // Check Table
      if (line.startsWith("|") && line.endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (r: string) =>
            r
              .split("|")
              .slice(1, -1)
              .map((cell) => cell.trim());

          const headers = parseRow(tableLines[0]);
          const startIdx = tableLines[1].includes("---") ? 2 : 1;
          const rows: string[][] = [];
          for (let r = startIdx; r < tableLines.length; r++) {
            rows.push(parseRow(tableLines[r]));
          }
          blocks.push({ type: "table", headers, rows });
          continue;
        }
      }

      // Check bullet list
      if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith("- ") ||
            lines[i].trim().startsWith("* ") ||
            lines[i].trim().startsWith("• "))
        ) {
          listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
          i++;
        }
        blocks.push({ type: "list", items: listItems });
        continue;
      }

      // Default paragraph
      blocks.push({ type: "paragraph", text: line });
      i++;
    }

    return blocks;
  }, [content]);

  // Extract quick metrics from text if detected
  const extractedKpis = useMemo(() => {
    const kpis: Array<{ label: string; value: string; icon: React.ReactNode; tone: string }> = [];

    const fleetMatch = content.match(/(\d+)\s*(?:سيارة|مركبة|سيارات)/);
    if (fleetMatch) {
      kpis.push({
        label: "الأسطول المعتمد",
        value: `${fleetMatch[1]} مركبات`,
        icon: <Car size={15} className="text-emerald-500" />,
        tone: "emerald",
      });
    }

    const priceMatch = content.match(/\$(\d+)\s*(?:إلى|-)?\s*(?:\$(\d+))?/);
    if (priceMatch) {
      const priceStr = priceMatch[2] ? `$${priceMatch[1]} - $${priceMatch[2]}` : `$${priceMatch[1]}`;
      kpis.push({
        label: "نطاق الأسعار",
        value: priceStr,
        icon: <TrendingUp size={15} className="text-primary" />,
        tone: "amber",
      });
    }

    const pkgMatch = content.match(/(\d+)\s*(?:باقة|برنامجاً|برنامج)/);
    if (pkgMatch && Number(pkgMatch[1]) > 10) {
      kpis.push({
        label: "الباقات المنشورة",
        value: `${pkgMatch[1]} برنامجاً`,
        icon: <Package size={15} className="text-cyan-500" />,
        tone: "cyan",
      });
    }

    const readinessMatch = content.match(/(?:الجاهزية|نسبة)\s*:?\s*(\d+)%/);
    if (readinessMatch) {
      kpis.push({
        label: "جاهزية المنصة",
        value: `${readinessMatch[1]}%`,
        icon: <Layers size={15} className="text-emerald-500" />,
        tone: "emerald",
      });
    }

    return kpis;
  }, [content]);

  return (
    <div className="space-y-4 text-xs">
      {/* Real Tool Execution Inspector Drawer */}
      {executionSteps && executionSteps.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 p-3 shadow-xs">
          <button
            type="button"
            onClick={onToggleSteps}
            className="flex items-center justify-between w-full text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <Cpu size={14} />
              </span>
              <span>
                سجل العمليات التنفيذية والأدوات المستدعاة حياً ({executionSteps.length} إجراءات منفذة):
              </span>
            </span>
            <span className="text-[11px] font-semibold flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              {isExpandedSteps ? (
                <>
                  <span>إخفاء التفاصيل</span>
                  <ChevronUp size={13} />
                </>
              ) : (
                <>
                  <span>عرض مسار الأدوات والبيانات الحية</span>
                  <ChevronDown size={13} />
                </>
              )}
            </span>
          </button>

          {isExpandedSteps && (
            <div className="mt-3 pt-3 border-t border-emerald-500/20 space-y-2">
              {executionSteps.map((step) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl bg-card border border-border/80 text-[11px] space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2 font-bold text-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-black">
                        {step.stepNumber}
                      </span>
                      <span className="font-mono text-primary font-bold">[{step.toolName}]</span>
                      {step.targetAgent && (
                        <span className="text-muted-foreground font-normal">
                          → الأداة المنفذة: <strong className="text-foreground">{step.targetAgent}</strong>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-foreground font-medium">{step.descriptionAr}</p>
                  {step.details && (
                    <div className="p-2 rounded-lg bg-muted/50 border border-border/50 text-[10px] text-muted-foreground font-mono text-right leading-relaxed overflow-x-auto">
                      <strong className="text-emerald-600 dark:text-emerald-400">✓ مخرجات الأداة:</strong>{" "}
                      {step.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top KPI Metrics Tiles if extracted */}
      {extractedKpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          {extractedKpis.map((kpi, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card/80 border border-border/80 shadow-2xs"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-muted-foreground font-medium truncate">
                  {kpi.label}
                </span>
                <span className="block text-xs font-black text-foreground font-mono tracking-tight">
                  {kpi.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structured Report Blocks */}
      <div className="space-y-3.5 leading-relaxed text-foreground">
        {parsedBlocks.map((block: any, idx) => {
          if (block.type === "header") {
            return (
              <div key={idx} className="pt-2 pb-1 border-b border-border/60 flex items-center gap-2">
                <Sparkles size={14} className="text-primary shrink-0" />
                <h3 className="font-black text-sm text-foreground tracking-wide">{block.text}</h3>
              </div>
            );
          }

          if (block.type === "callout") {
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs my-2.5 leading-relaxed flex items-start gap-2.5"
              >
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 font-medium">{renderFormattedText(block.text)}</div>
              </div>
            );
          }

          if (block.type === "packages_grid") {
            return (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                {block.packages.map((pkg: any, pIdx: number) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/50 transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          📍 {pkg.destination || "تركيا"}
                        </span>
                        <span className="text-[11px] font-bold text-amber-500 font-mono">
                          ⭐ {pkg.rating || "4.8"}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-foreground leading-snug group-hover:text-primary transition-colors">
                        {pkg.titleAr || pkg.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                        <span>⏱️ {pkg.durationDays} أيام</span>
                        <span className="font-bold text-primary font-mono text-xs">
                          💰 ${Number(pkg.priceUSD || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={pkg.liveUrl || `/package/${pkg.slug}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted/80 hover:bg-primary hover:text-primary-foreground font-bold text-[11px] transition-all shadow-2xs"
                    >
                      <span>معاينة وتفاصيل الباقة</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === "cars_grid") {
            return (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                {block.cars.map((car: any, cIdx: number) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/50 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          `{car.category}`
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          🟢 نشط
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-foreground">
                        {car.nameAr || car.name}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>👤 {car.passengers} ركاب</span>
                        <span>🧳 {car.luggage} حقائب</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground">السعر اليومي</span>
                      <span className="text-xs font-black font-mono text-primary">
                        ${car.pricePerDayUSD}/اليوم
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === "code") {
            return (
              <div
                key={idx}
                className="my-2.5 rounded-2xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono overflow-x-auto text-left shadow-inner"
                dir="ltr"
              >
                <pre>{block.code}</pre>
              </div>
            );
          }

          if (block.type === "table") {
            return (
              <div
                key={idx}
                className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs my-2.5"
              >
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/60 text-muted-foreground font-bold">
                      {block.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-3.5 py-2.5 text-[11px] tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {block.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-muted/40 transition-colors even:bg-muted/15">
                        {row.map((cell: string, cIdx: number) => {
                          const isPrice = /\$\d+/.test(cell);
                          const isSuccess =
                            cell.includes("نشط") ||
                            cell.includes("مكتمل") ||
                            cell.includes("جاهزة") ||
                            cell.includes("ممتاز");
                          const isWarning =
                            cell.includes("متصل جزئياً") ||
                            cell.includes("يتطلب") ||
                            cell.includes("غير مضبوط");

                          return (
                            <td key={cIdx} className="px-3.5 py-2.5 text-foreground leading-relaxed">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={10} />
                                  {cell.replace(/\*\*/g, "")}
                                </span>
                              ) : isWarning ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                  <AlertCircle size={10} />
                                  {cell.replace(/\*\*/g, "")}
                                </span>
                              ) : isPrice ? (
                                <span className="font-mono font-bold text-primary dark:text-primary">
                                  {renderFormattedText(cell)}
                                </span>
                              ) : (
                                renderFormattedText(cell)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.type === "list") {
            return (
              <ul key={idx} className="space-y-1.5 pl-2 my-2">
                {block.items.map((item: string, lIdx: number) => (
                  <li key={lIdx} className="flex items-start gap-2 text-foreground font-normal">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{renderFormattedText(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={idx} className="text-foreground leading-relaxed">
              {renderFormattedText(block.text)}
            </p>
          );
        })}
      </div>

      {/* Integrated Interactive Action Buttons */}
      {actions && actions.length > 0 && (
        <div className="pt-2 border-t border-border/80 flex flex-wrap items-center gap-2">
          {actions.map((act) => {
            const isPrimary = act.variant === "primary";
            const isSecondary = act.variant === "secondary";

            if (act.url && act.url !== "#") {
              return (
                <Link
                  key={act.id}
                  href={act.url}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                    isPrimary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : isSecondary
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{act.label}</span>
                  <ExternalLink size={12} />
                </Link>
              );
            }

            return (
              <button
                key={act.id}
                type="button"
                onClick={() => onSendPrompt?.(act.prompt || act.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border text-foreground hover:bg-muted transition-all shadow-2xs"
              >
                <Zap size={12} className="text-primary" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Suggested Follow-up Quick Prompts */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground font-semibold shrink-0">مقترحات المتابعة:</span>
          {suggestedPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => onSendPrompt?.(prompt)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 text-[11px] text-foreground font-medium transition-colors"
            >
              <span>{prompt}</span>
              <Send size={10} className="text-muted-foreground rotate-180" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  if (linkRegex.test(text)) {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(renderBasicTokens(text.substring(lastIndex, match.index)));
      }
      const label = match[1];
      const url = match[2];
      elements.push(
        <Link
          key={match.index}
          href={url}
          target="_blank"
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:text-primary/80 mx-1"
        >
          {label} <ExternalLink size={10} />
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      elements.push(renderBasicTokens(text.substring(lastIndex)));
    }
    return elements;
  }
  return renderBasicTokens(text);
}

function renderBasicTokens(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

