"use client";

import * as React from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  useReducedMotion,
  useControllableState,
  statusVars,
  scrollIntoViewWithin,
  formatTimestamp as defaultFormatTimestamp,
  type StatusTone,
} from "@/components/ui/processing-timeline-utils/motiq";

export type ProcessingStatus =
  | "pending"
  | "queued"
  | "active"
  | "paused"
  | "completed"
  | "warning"
  | "failed"
  | "skipped"
  | "cancelled";

export interface ProcessingStage {
  id: string;
  label: string;
  description?: string;
  status: ProcessingStatus;
  progress?: number;
  startTime?: Date | number | string;
  endTime?: Date | number | string;
  duration?: number;
  attempt?: number;
  error?: string;
  warning?: string;
  output?: unknown;
  logs?: string[];
  metadata?: Record<string, string | number>;
  skippable?: boolean;
}

export interface ProcessingTimelineProps {
  stages: ProcessingStage[];
  title: string;
  subtitle?: string;
  jobStatus?: ProcessingStatus;
  currentStageId?: string;
  layout?: "vertical" | "horizontal";
  compact?: boolean;
  activeStageId?: string;
  defaultActiveStageId?: string;
  onActiveStageChange?: (id: string) => void;
  followCurrent?: boolean;
  defaultExpanded?: string[] | boolean;
  onRetryStage?: (id: string) => void;
  onSkipStage?: (id: string) => void;
  onCancel?: () => void;
  onRestart?: () => void;
  renderStageOutput?: (stage: ProcessingStage) => React.ReactNode;
  formatTimestamp?: (value: Date | number | string) => string;
  label?: string;
  className?: string;
  completionAction?: React.ReactNode;
}

const EASE: Transition["ease"] = [0.2, 0, 0, 1];

interface StatusMetaEntry {
  label: string;
  tone: StatusTone;
  bar: boolean;
}

const STATUS_META: Record<ProcessingStatus, StatusMetaEntry> = {
  pending: { label: "بانتظار", tone: "neutral", bar: false },
  queued: { label: "في الدور", tone: "neutral", bar: false },
  active: { label: "جارية", tone: "active", bar: true },
  paused: { label: "متوقفة", tone: "warning", bar: true },
  completed: { label: "اكتملت", tone: "success", bar: false },
  warning: { label: "اكتملت بتنبيه", tone: "warning", bar: false },
  failed: { label: "فشلت", tone: "error", bar: false },
  skipped: { label: "تخطّت", tone: "neutral", bar: false },
  cancelled: { label: "أُلغيت", tone: "neutral", bar: false },
};

const IN_FLIGHT: ReadonlySet<ProcessingStatus> = new Set([
  "pending",
  "queued",
  "active",
  "paused",
]);

const RESOLVED: ReadonlySet<ProcessingStatus> = new Set([
  "completed",
  "warning",
  "skipped",
  "cancelled",
  "failed",
]);

const TRAVELLED: ReadonlySet<ProcessingStatus> = new Set([
  "completed",
  "warning",
  "skipped",
  "active",
]);

function stringify(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s % 1 === 0 ? s : s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s - m * 60)}s`;
}

function stageHasDetail(stage: ProcessingStage): boolean {
  return (
    Boolean(stage.description) ||
    stage.output !== undefined ||
    Boolean(stage.error) ||
    Boolean(stage.warning) ||
    (stage.logs?.length ?? 0) > 0 ||
    (stage.metadata != null && Object.keys(stage.metadata).length > 0) ||
    stage.startTime != null ||
    typeof stage.duration === "number"
  );
}

function deriveJobStatus(stages: ProcessingStage[]): ProcessingStatus {
  if (stages.length === 0) return "pending";
  if (stages.some((s) => s.status === "active")) return "active";
  if (stages.some((s) => s.status === "paused")) return "paused";
  if (stages.some((s) => s.status === "failed")) return "failed";
  const allResolved = stages.every((s) => RESOLVED.has(s.status));
  if (allResolved) {
    if (stages.some((s) => s.status === "cancelled")) return "cancelled";
    if (stages.some((s) => s.status === "warning")) return "warning";
    return "completed";
  }
  return "queued";
}

const svgBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function StatusIcon({
  status,
  size = 13,
}: {
  status: ProcessingStatus;
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    ...svgBase,
    strokeWidth: 2.3,
  };
  switch (status) {
    case "completed":
      return (
        <svg {...p}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "warning":
      return (
        <svg {...p}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      );
    case "failed":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      );
    case "paused":
      return (
        <svg {...p}>
          <path d="M9 5v14M15 5v14" />
        </svg>
      );
    case "skipped":
      return (
        <svg {...p}>
          <path d="m7 7 5 5-5 5M13 7l5 5-5 5" />
        </svg>
      );
    case "cancelled":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8" />
        </svg>
      );
    case "active":
      return (
        <svg {...p}>
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 4v5h-5" />
        </svg>
      );
    case "queued":
    case "pending":
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
}

function glyph(path: React.ReactNode, size = 13) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...svgBase}>
      {path}
    </svg>
  );
}
const RetryGlyph = () =>
  glyph(
    <>
      <path d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" />
    </>
  );
const SkipGlyph = () =>
  glyph(
    <>
      <path d="M5 5v14l9-7zM17 5v14" />
    </>
  );
const CancelGlyph = () =>
  glyph(
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  );
const RestartGlyph = () =>
  glyph(
    <>
      <path d="M4 12a8 8 0 1 0 2.3-5.6M4 3v4h4" />
    </>
  );
const ChevronGlyph = () => glyph(<path d="m9 6 6 6-6 6" />, 11);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus,#00f3ff)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080c14]";

const actionBtn = cn(
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-all cursor-pointer",
  "border border-cyan-400/50 bg-cyan-950/70 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.2)]",
  "hover:border-cyan-300 hover:bg-cyan-900/90 hover:text-white disabled:cursor-not-allowed disabled:opacity-45",
  focusRing
);

const dangerBtn = cn(
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
  "border border-red-500/20 bg-red-950/30 text-red-300",
  "hover:border-red-500/60 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-45",
  focusRing
);

function StatusPill({
  status,
  className,
}: {
  status: ProcessingStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const vars = statusVars(meta.tone);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border backdrop-blur-sm",
        className
      )}
      style={{
        color: vars.color,
        background: vars.bg,
        borderColor: vars.border,
      }}
    >
      <StatusIcon status={status} />
      <span>{meta.label}</span>
    </span>
  );
}

function StageMarker({
  status,
  reduce,
  size,
}: {
  status: ProcessingStatus;
  reduce: boolean;
  size: number;
}) {
  const vars = statusVars(STATUS_META[status].tone);
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full border-2"
      style={{
        width: size,
        height: size,
        color: vars.color,
        borderColor: vars.border,
        background:
          status === "pending" || status === "queued"
            ? "#0b121e"
            : vars.bg,
      }}
      aria-hidden
    >
      {status === "active" && !reduce ? (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-current"
          animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
      <StatusIcon status={status} size={Math.round(size * 0.52)} />
    </span>
  );
}

function StageDetail({
  stage,
  formatTs,
  renderStageOutput,
}: {
  stage: ProcessingStage;
  formatTs: (v: Date | number | string) => string;
  renderStageOutput?: (stage: ProcessingStage) => React.ReactNode;
}) {
  const hasMeta =
    stage.metadata != null && Object.keys(stage.metadata).length > 0;
  return (
    <div className="space-y-2.5 rounded-lg border border-white/10 bg-black/50 px-3 py-3 text-[12.5px] backdrop-blur-md">
      {stage.startTime != null ||
      typeof stage.duration === "number" ||
      (stage.attempt ?? 1) > 1 ? (
        <p className="text-[11.5px] text-slate-400 tabular-nums">
          {stage.startTime != null
            ? `بدأ ${formatTs(stage.startTime)}`
            : null}
          {typeof stage.duration === "number"
            ? `${stage.startTime != null ? " · " : ""}استغرق ${formatDuration(stage.duration)}`
            : null}
          {(stage.attempt ?? 1) > 1 ? ` · المحاولة ${stage.attempt}` : null}
        </p>
      ) : null}

      {stage.description ? (
        <p className="text-slate-200">{stage.description}</p>
      ) : null}

      {stage.warning ? (
        <div
          className="flex items-start gap-2 rounded-md px-2.5 py-2 text-amber-200 border border-amber-500/20"
          style={{ background: statusVars("warning").bg }}
        >
          <span
            className="mt-px shrink-0 text-amber-400"
            aria-hidden
          >
            <StatusIcon status="warning" />
          </span>
          <span>
            <span className="sr-only">تنبيه: </span>
            {stage.warning}
          </span>
        </div>
      ) : null}

      {stage.error ? (
        <div
          className="flex items-start gap-2 rounded-md px-2.5 py-2 text-rose-200 border border-rose-500/20"
          style={{ background: statusVars("error").bg }}
        >
          <span
            className="mt-px shrink-0 text-rose-400"
            aria-hidden
          >
            <StatusIcon status="failed" />
          </span>
          <span>
            <span className="sr-only">خطأ: </span>
            {stage.error}
          </span>
        </div>
      ) : null}

      {stage.output !== undefined ? (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-400/80">
            المخرجات التنفيذية (Output)
          </p>
          {renderStageOutput ? (
            renderStageOutput(stage)
          ) : (
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-[#070d17] px-2.5 py-2 font-mono text-[12px] leading-relaxed text-cyan-200">
              {stringify(stage.output)}
            </pre>
          )}
        </div>
      ) : null}

      {stage.logs && stage.logs.length > 0 ? (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            سجل العمليات (Logs)
          </p>
          <ul className="space-y-0.5 rounded-md border border-white/10 bg-[#070d17] px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-slate-300">
            {stage.logs.map((line, i) => (
              <li key={i} className="whitespace-pre-wrap break-words">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasMeta ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11.5px]">
          {Object.entries(stage.metadata ?? {}).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-slate-400">{k}</dt>
              <dd className="truncate font-medium text-cyan-300 font-mono">
                {String(v)}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function StageActions({
  stage,
  onRetryStage,
  onSkipStage,
}: {
  stage: ProcessingStage;
  onRetryStage?: (id: string) => void;
  onSkipStage?: (id: string) => void;
}) {
  const canRetry = onRetryStage && stage.status === "failed";
  const canSkip = onSkipStage && stage.skippable && !RESOLVED.has(stage.status);
  if (!canRetry && !canSkip) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {canRetry ? (
        <button
          type="button"
          className={actionBtn}
          onClick={() => onRetryStage!(stage.id)}
          aria-label={`Retry ${stage.label}`}
        >
          <RetryGlyph /> إعادة المحاولة
        </button>
      ) : null}
      {canSkip ? (
        <button
          type="button"
          className={actionBtn}
          onClick={() => onSkipStage!(stage.id)}
          aria-label={`Skip ${stage.label}`}
        >
          <SkipGlyph /> تخطي
        </button>
      ) : null}
    </div>
  );
}

function StageProgress({
  stage,
  reduce,
}: {
  stage: ProcessingStage;
  reduce: boolean;
}) {
  const meta = STATUS_META[stage.status];
  if (!meta.bar || typeof stage.progress !== "number") return null;
  const vars = statusVars(meta.tone);
  const value = Math.max(0, Math.min(100, Math.round(stage.progress)));
  const isPaused = stage.status === "paused";
  return (
    <div className="mt-2 flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${meta.label} - ${value}%`}
        aria-label={`${stage.label} progress`}
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className={cn(
            "h-full rounded-full",
            reduce ? "" : "transition-[width] duration-300 ease-out"
          )}
          style={{
            width: `${value}%`,
            background: vars.color,
            opacity: isPaused ? 0.55 : 1,
          }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-[11.5px] font-mono font-medium text-cyan-300 tabular-nums">
        {value}%
      </span>
    </div>
  );
}

interface VerticalRowProps {
  stage: ProcessingStage;
  index: number;
  total: number;
  expanded: boolean;
  isCurrent: boolean;
  compact: boolean;
  reduce: boolean;
  formatTs: (v: Date | number | string) => string;
  renderStageOutput?: (stage: ProcessingStage) => React.ReactNode;
  registerHeader: (id: string, el: HTMLButtonElement | null) => void;
  registerRow: (id: string, el: HTMLLIElement | null) => void;
  onToggle: (id: string) => void;
  onRetryStage?: (id: string) => void;
  onSkipStage?: (id: string) => void;
}

function VerticalRow({
  stage,
  index,
  total,
  expanded,
  isCurrent,
  compact,
  reduce,
  formatTs,
  renderStageOutput,
  registerHeader,
  registerRow,
  onToggle,
  onRetryStage,
  onSkipStage,
}: VerticalRowProps) {
  const meta = STATUS_META[stage.status];
  const vars = statusVars(meta.tone);
  const hasDetail = stageHasDetail(stage);
  const isLast = index === total - 1;
  const panelId = `mk-pt-panel-${stage.id}`;
  const errorId = `mk-pt-err-${stage.id}`;
  const isFailed = stage.status === "failed";

  return (
    <motion.li
      ref={(el) => registerRow(stage.id, el)}
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.26, ease: EASE }}
      className="relative flex gap-3"
      data-status={stage.status}
      data-current={isCurrent || undefined}
    >
      <div className="relative flex shrink-0 flex-col items-center">
        <StageMarker
          status={stage.status}
          reduce={reduce}
          size={compact ? 24 : 28}
        />
        {!isLast ? (
          <span
            aria-hidden
            className="mt-1 w-[2px] flex-1 rounded-full"
            style={{
              background: TRAVELLED.has(stage.status)
                ? `color-mix(in oklab, ${vars.color} 55%, rgba(255,255,255,0.1))`
                : "rgba(255,255,255,0.1)",
            }}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "mb-2.5 min-w-0 flex-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md"
        )}
        style={
          isCurrent || isFailed
            ? {
                borderColor: vars.border,
                boxShadow: `0 0 15px ${vars.border}`,
              }
            : undefined
        }
      >
        <div
          className={cn(
            "flex items-start gap-2 pl-3 pr-2",
            compact ? "py-2" : "py-2.5"
          )}
        >
          <button
            type="button"
            ref={(el) => registerHeader(stage.id, el)}
            aria-expanded={hasDetail ? expanded : undefined}
            aria-controls={hasDetail && expanded ? panelId : undefined}
            aria-describedby={isFailed && stage.error ? errorId : undefined}
            aria-current={isCurrent ? "step" : undefined}
            onClick={() => onToggle(stage.id)}
            className={cn(
              "flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left",
              focusRing
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center text-slate-400 transition-transform",
                expanded ? "rotate-90" : "rotate-0",
                !hasDetail && "opacity-0"
              )}
              aria-hidden
            >
              <ChevronGlyph />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className="font-mono text-[11px] text-cyan-400/70"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "min-w-0 truncate font-semibold text-slate-100",
                    compact ? "text-[13px]" : "text-[13.5px]",
                    stage.status === "skipped" || stage.status === "cancelled"
                      ? "line-through text-slate-500"
                      : ""
                  )}
                >
                  {stage.label}
                </span>
                {isCurrent ? (
                  <span className="rounded bg-cyan-500/20 border border-cyan-400/40 px-1.5 py-px text-[10px] font-bold font-mono uppercase tracking-wide text-cyan-300">
                    المرحلة النشطة
                  </span>
                ) : null}
              </span>
              {!compact && stage.description ? (
                <span className="mt-0.5 block truncate text-[12px] text-slate-400">
                  {stage.description}
                </span>
              ) : null}
              {isFailed && stage.error ? (
                <span
                  id={errorId}
                  className="mt-1 block truncate text-[12px] text-rose-400"
                >
                  {stage.error}
                </span>
              ) : null}
            </span>
          </button>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusPill status={stage.status} />
            <StageActions
              stage={stage}
              onRetryStage={onRetryStage}
              onSkipStage={onSkipStage}
            />
          </div>
        </div>

        <div className="px-3 pb-1">
          <StageProgress stage={stage} reduce={reduce} />
        </div>

        <AnimatePresence initial={false}>
          {expanded && hasDetail ? (
            <motion.div
              key="detail"
              id={panelId}
              role="region"
              aria-label={`${stage.label} details`}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.24, ease: EASE }
              }
              className="overflow-hidden"
            >
              <div className="mx-3 mb-3 mt-0.5">
                <StageDetail
                  stage={stage}
                  formatTs={formatTs}
                  renderStageOutput={renderStageOutput}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

function HorizontalNode({
  stage,
  index,
  total,
  selected,
  isCurrent,
  compact,
  reduce,
  registerHeader,
  onSelect,
  panelId,
}: {
  stage: ProcessingStage;
  index: number;
  total: number;
  selected: boolean;
  isCurrent: boolean;
  compact: boolean;
  reduce: boolean;
  registerHeader: (id: string, el: HTMLButtonElement | null) => void;
  onSelect: (id: string) => void;
  panelId: string;
}) {
  const meta = STATUS_META[stage.status];
  const vars = statusVars(meta.tone);
  const isLast = index === total - 1;
  return (
    <li
      className="flex min-w-0 flex-1 items-center"
      data-status={stage.status}
      data-current={isCurrent || undefined}
    >
      <button
        type="button"
        ref={(el) => registerHeader(stage.id, el)}
        aria-controls={panelId}
        aria-current={isCurrent ? "step" : undefined}
        aria-pressed={selected}
        onClick={() => onSelect(stage.id)}
        className={cn(
          "group flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-center transition-colors",
          selected
            ? "bg-cyan-500/10 border border-cyan-400/40"
            : "hover:bg-white/5",
          focusRing
        )}
        style={
          selected ? { boxShadow: `0 0 10px ${vars.border}` } : undefined
        }
      >
        <StageMarker
          status={stage.status}
          reduce={reduce}
          size={compact ? 26 : 30}
        />
        <span className="flex min-w-0 flex-col items-center">
          <span
            className={cn(
              "min-w-0 max-w-full truncate font-medium text-slate-100",
              compact ? "text-[12px]" : "text-[12.5px]"
            )}
          >
            {stage.label}
          </span>
          <span className="text-[10.5px] text-slate-400">
            {meta.label}
          </span>
        </span>
      </button>
      {!isLast ? (
        <span
          aria-hidden
          className="mx-0.5 h-[2px] w-6 shrink-0 rounded-full"
          style={{
            background: TRAVELLED.has(stage.status)
              ? `color-mix(in oklab, ${vars.color} 55%, rgba(255,255,255,0.1))`
              : "rgba(255,255,255,0.1)",
          }}
        />
      ) : null}
    </li>
  );
}

export function ProcessingTimeline({
  stages,
  title,
  subtitle,
  jobStatus,
  currentStageId,
  layout = "vertical",
  compact = false,
  activeStageId,
  defaultActiveStageId,
  onActiveStageChange,
  followCurrent = true,
  defaultExpanded,
  onRetryStage,
  onSkipStage,
  onCancel,
  onRestart,
  renderStageOutput,
  formatTimestamp,
  label,
  className,
  completionAction,
}: ProcessingTimelineProps) {
  const reduce = useReducedMotion();
  const formatTs = React.useMemo(
    () =>
      formatTimestamp ??
      ((v: Date | number | string) => defaultFormatTimestamp(v)),
    [formatTimestamp]
  );

  const [selectedId, setSelectedId] = useControllableState<string>({
    value: activeStageId,
    defaultValue: defaultActiveStageId ?? currentStageId ?? stages[0]?.id ?? "",
    onChange: onActiveStageChange,
  });

  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (defaultExpanded === true) return new Set(stages.map((s) => s.id));
    if (Array.isArray(defaultExpanded)) return new Set(defaultExpanded);
    return new Set();
  });

  const headerRefs = React.useRef<Map<string, HTMLButtonElement | null>>(
    new Map()
  );
  const rowRefs = React.useRef<Map<string, HTMLLIElement | null>>(new Map());
  const registerHeader = React.useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) headerRefs.current.set(id, el);
      else headerRefs.current.delete(id);
    },
    []
  );
  const registerRow = React.useCallback(
    (id: string, el: HTMLLIElement | null) => {
      if (el) rowRefs.current.set(id, el);
      else rowRefs.current.delete(id);
    },
    []
  );

  const handleToggle = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [setSelectedId]
  );

  const handleSelect = React.useCallback(
    (id: string) => setSelectedId(id),
    [setSelectedId]
  );

  const focusHeader = React.useCallback((id: string) => {
    const run = () => headerRefs.current.get(id)?.focus();
    if (typeof requestAnimationFrame === "undefined") run();
    else requestAnimationFrame(run);
  }, []);
  const handleRetry = React.useCallback(
    (id: string) => {
      onRetryStage?.(id);
      focusHeader(id);
    },
    [onRetryStage, focusHeader]
  );
  const handleSkip = React.useCallback(
    (id: string) => {
      onSkipStage?.(id);
      focusHeader(id);
    },
    [onSkipStage, focusHeader]
  );

  const prevCurrent = React.useRef<string | undefined>(currentStageId);
  React.useEffect(() => {
    if (
      !followCurrent ||
      !currentStageId ||
      currentStageId === prevCurrent.current
    ) {
      prevCurrent.current = currentStageId;
      return;
    }
    prevCurrent.current = currentStageId;
    setSelectedId(currentStageId);
    scrollIntoViewWithin(rowRefs.current.get(currentStageId), {
      smooth: !reduce,
    });
  }, [currentStageId, followCurrent, reduce, setSelectedId]);

  const prevStatuses = React.useRef<Map<string, ProcessingStatus>>(new Map());
  const [liveMessage, setLiveMessage] = React.useState("");
  React.useEffect(() => {
    const prev = prevStatuses.current;
    const messages: string[] = [];
    const seen = new Set<string>();
    for (const s of stages) {
      seen.add(s.id);
      const before = prev.get(s.id);
      if (before !== undefined && before !== s.status) {
        if (s.status === "failed")
          messages.push(`${s.label} فشل${s.error ? `: ${s.error}` : ""}`);
        else if (s.status === "warning")
          messages.push(`${s.label} اكتمل مع وجود تنبيه`);
        else
          messages.push(
            `${s.label} ${STATUS_META[s.status].label.toLowerCase()}`
          );
      }
      prev.set(s.id, s.status);
    }
    Array.from(prev.keys()).forEach((id) => {
      if (!seen.has(id)) prev.delete(id);
    });
    if (messages.length) setLiveMessage(messages.join(". "));
  }, [stages]);

  const total = stages.length;
  const summary = React.useMemo(() => {
    let completed = 0,
      failed = 0,
      warnings = 0,
      skipped = 0,
      resolved = 0,
      totalDuration = 0;
    for (const s of stages) {
      if (s.status === "completed") completed++;
      else if (s.status === "warning") {
        completed++;
        warnings++;
      } else if (s.status === "failed") failed++;
      else if (s.status === "skipped") skipped++;
      if (RESOLVED.has(s.status)) resolved++;
      if (typeof s.duration === "number" && Number.isFinite(s.duration))
        totalDuration += s.duration;
    }
    return { completed, failed, warnings, skipped, resolved, totalDuration };
  }, [stages]);

  const pct = total > 0 ? Math.round((summary.resolved / total) * 100) : 0;
  const displayStatus = jobStatus ?? deriveJobStatus(stages);
  const inFlight =
    stages.some((s) => IN_FLIGHT.has(s.status)) &&
    displayStatus !== "cancelled";
  const jobResolved = total > 0 && stages.every((s) => RESOLVED.has(s.status));
  const jobLabel = label ?? `Processing: ${title}`;

  const selectedStage =
    stages.find((s) => s.id === selectedId) ??
    stages.find((s) => s.id === currentStageId) ??
    stages[0];
  const horizontalPanelId = "mk-pt-hpanel";

  return (
    <section
      aria-label={jobLabel}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl bg-[#080d17]/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,243,255,0.15)] backdrop-blur-xl text-slate-100",
        className
      )}
    >
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-white/10 bg-cyan-950/20 px-4 py-3">
        <span
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
          aria-hidden
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            {...svgBase}
            strokeWidth={1.8}
          >
            <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
            <path d="M14 2v4h4M8.5 13l2.5 2.5L15.5 11" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="min-w-0 truncate text-[14px] font-bold text-slate-100 font-mono tracking-tight"
              title={title}
            >
              {title}
            </h3>
            <StatusPill status={displayStatus} />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-slate-400 tabular-nums">
            {subtitle ? <span className="truncate text-cyan-300/80">{subtitle}</span> : null}
            {subtitle ? <span aria-hidden>·</span> : null}
            <span>
              {summary.resolved} من أصل {total} مراحل
            </span>
            {summary.warnings > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-amber-400">
                  {summary.warnings} تنبيه
                </span>
              </>
            ) : null}
            {summary.failed > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-rose-400">
                  {summary.failed} فشل
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {jobResolved && onRestart ? (
            <button
              type="button"
              className={actionBtn}
              onClick={() => onRestart()}
            >
              <RestartGlyph /> إعادة التشغيل
            </button>
          ) : null}
          {inFlight && onCancel ? (
            <button
              type="button"
              className={dangerBtn}
              onClick={() => onCancel()}
            >
              <CancelGlyph /> إلغاء
            </button>
          ) : null}
        </div>
      </header>

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </p>

      {total === 0 ? (
        <p className="px-4 py-8 text-center text-[13px] text-slate-500 font-mono">
          لا توجد مراحل مسجلة في هذا المسار حتى الآن.
        </p>
      ) : layout === "horizontal" ? (
        <div className="flex flex-col gap-3 p-3">
          <ol
            className="hidden items-start gap-0 sm:flex"
            aria-label={`${title} stages`}
          >
            {stages.map((stage, index) => (
              <HorizontalNode
                key={stage.id}
                stage={stage}
                index={index}
                total={total}
                selected={stage.id === selectedId}
                isCurrent={stage.id === currentStageId}
                compact={compact}
                reduce={reduce}
                registerHeader={registerHeader}
                onSelect={handleSelect}
                panelId={horizontalPanelId}
              />
            ))}
          </ol>

          <ol
            className="flex flex-col sm:hidden"
            aria-label={`${title} stages`}
          >
            {stages.map((stage, index) => (
              <VerticalRow
                key={stage.id}
                stage={stage}
                index={index}
                total={total}
                expanded={expanded.has(stage.id)}
                isCurrent={stage.id === currentStageId}
                compact={compact}
                reduce={reduce}
                formatTs={formatTs}
                renderStageOutput={renderStageOutput}
                registerHeader={registerHeader}
                registerRow={registerRow}
                onToggle={handleToggle}
                onRetryStage={handleRetry}
                onSkipStage={handleSkip}
              />
            ))}
          </ol>

          {selectedStage ? (
            <div id={horizontalPanelId} className="hidden sm:block">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-slate-100">
                  {selectedStage.label}
                </span>
                <StatusPill status={selectedStage.status} />
                <div className="ml-auto">
                  <StageActions
                    stage={selectedStage}
                    onRetryStage={handleRetry}
                    onSkipStage={handleSkip}
                  />
                </div>
              </div>
              <StageProgress stage={selectedStage} reduce={reduce} />
              {stageHasDetail(selectedStage) ? (
                <div className="mt-2">
                  <StageDetail
                    stage={selectedStage}
                    formatTs={formatTs}
                    renderStageOutput={renderStageOutput}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <ol
          className="flex flex-col px-3.5 pb-2 pt-3"
          aria-label={`${title} stages`}
        >
          <AnimatePresence initial={false}>
            {stages.map((stage, index) => (
              <VerticalRow
                key={stage.id}
                stage={stage}
                index={index}
                total={total}
                expanded={expanded.has(stage.id)}
                isCurrent={stage.id === currentStageId}
                compact={compact}
                reduce={reduce}
                formatTs={formatTs}
                renderStageOutput={renderStageOutput}
                registerHeader={registerHeader}
                registerRow={registerRow}
                onToggle={handleToggle}
                onRetryStage={handleRetry}
                onSkipStage={handleSkip}
              />
            ))}
          </AnimatePresence>
        </ol>
      )}

      {jobResolved ? (
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 bg-black/60 px-4 py-2.5 text-[12px] text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-cyan-300">
            <StatusIcon status={displayStatus} />
            {displayStatus === "failed"
              ? "فشلت بعض مراحل المهمة"
              : summary.warnings > 0
                ? "اكتملت المهمة مع تنبيهات فنية"
                : summary.skipped > 0
                  ? "اكتملت المهمة (تم تخطي بعض المراحل)"
                  : "اكتملت كافة مراحل المهمة السيبرانية بنجاح"}
          </span>
          {summary.totalDuration > 0 ? (
            <span className="tabular-nums font-mono text-slate-400">
              الوقت الإجمالي {formatDuration(summary.totalDuration)}
            </span>
          ) : null}
          <span className="tabular-nums font-mono text-cyan-400">
            {summary.completed} منجزة
            {summary.skipped ? ` · ${summary.skipped} متخطاة` : ""}
            {summary.failed ? ` · ${summary.failed} متعثرة` : ""}
          </span>
        </footer>
      ) : null}

      {completionAction ? (
        <div className="p-3 border-t border-cyan-500/30 bg-[#031222]/95 backdrop-blur-md animate-in fade-in duration-300">
          {completionAction}
        </div>
      ) : null}
    </section>
  );
}

export default ProcessingTimeline;
