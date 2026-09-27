"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Key,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Bot,
  ExternalLink,
  Layers,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { PlatformAuditResult } from "@/lib/server/mcp/servers/platform-admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PlatformReadinessHeaderBanner() {
  const [audit, setAudit] = useState<PlatformAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platform-readiness", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.audit) {
        setAudit(data.audit);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudit();

    const handleUpdate = () => fetchAudit();
    window.addEventListener("lonaliza:settings-updated", handleUpdate);
    return () => window.removeEventListener("lonaliza:settings-updated", handleUpdate);
  }, [fetchAudit]);

  const handoverToAgent = (moduleName: string, promptText?: string) => {
    setDetailsOpen(false);
    const message = promptText || `قم بإعداد وضبط قسم «${moduleName}» بالكامل في المنصة والتحقق من متطلباته ونواقصه الآن.`;
    window.dispatchEvent(
      new CustomEvent("lonaliza:admin-agent-chat", {
        detail: { prompt: message },
      })
    );
  };

  const batchSetupAll = () => {
    setDetailsOpen(false);
    const message =
      "⚡ أيها الوكيل المشرف العام، قم الآن بعمل مراجعة وإعداد شامل لكافة أقسام المنصة الـ 18 بالترتيب، واطلب مني أي مفاتيح مطلوبة خطوة بخطوة وجهز المنصة للإطلاق الكامل.";
    window.dispatchEvent(
      new CustomEvent("lonaliza:admin-agent-chat", {
        detail: { prompt: message },
      })
    );
  };

  if (loading || !audit) return null;

  const score = audit.overallScore;
  const isExcellent = score >= 90;
  const isGood = score >= 75 && score < 90;

  const progressBarColor = isExcellent
    ? "from-emerald-600 to-[color:var(--admin-gold)]"
    : isGood
    ? "from-[color:var(--admin-accent)] to-[color:var(--admin-gold)]"
    : "from-amber-600 to-[color:var(--admin-gold)]";

  const badgeBgColor = isExcellent
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : isGood
    ? "border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-text-primary)]"
    : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200";

  // Minimized pill state
  if (minimized) {
    return (
      <div className="w-full px-4 pt-2">
        <div className="flex items-center justify-between rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-[color:var(--admin-gold)]" />
            <span className="text-xs font-bold text-[color:var(--admin-text-primary)]">جاهزية المنصة للإطلاق:</span>
            <span className={`rounded-lg border px-2 py-0.5 text-xs font-black ${badgeBgColor}`}>
              {score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-xs font-bold text-[color:var(--admin-gold)] underline underline-offset-4"
            >
              تفاصيل الأقسام (18)
            </button>
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="text-[color:var(--admin-text-muted)] hover:text-[color:var(--admin-text-primary)] p-1"
              title="توسيع البانر"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside
        aria-label="جاهزية المنصة"
        className="w-full border-b border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-4 py-2.5 sm:px-6 text-[color:var(--admin-text-primary)]"
        data-readiness-banner="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Right Section: Icon & Title & Score */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-purple-royal)] text-white border border-[color:var(--admin-border-subtle)]">
              <Rocket size={17} className="stroke-[2.2] text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-[color:var(--admin-text-primary)]">
                  جاهزية منصة لوناليزا للإطلاق الإنتاجي
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-black ${badgeBgColor}`}>
                  {score}% مكتمل
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[color:var(--admin-text-muted)]">
                {audit.readyModulesCount} من أصل {audit.totalModulesCount} قسماً مكتمل وجاهز للعمليات الميدانية
              </p>
            </div>
          </div>

          {/* Middle Section: Progress Bar */}
          <div className="hidden md:flex flex-1 max-w-xs items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressBarColor} transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Left Section: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
              <Layers size={13} />
              <span>تفاصيل الإعدادات ({audit.totalModulesCount || 18})</span>
            </Button>

            <Button type="button" size="sm" onClick={batchSetupAll}>
              <Bot size={13} />
              <span>إعداد شامل بالوكيل</span>
            </Button>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="rounded-lg p-1.5 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg-subtle)] hover:text-[color:var(--admin-text-primary)]"
              title="تصغير البانر"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </aside>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" dir="rtl">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>كشف تدقيق جاهزية المنصة</DialogTitle>
            <DialogDescription>
              معدل الجاهزية العام: {score}% — {audit.readyModulesCount} من {audit.totalModulesCount} قسماً مكتمل
            </DialogDescription>
            <Progress value={score} className="mt-3" />
          </DialogHeader>
          <div className="flex items-center justify-between gap-3 px-6 pb-3">
            <p className="text-xs text-muted-foreground">هل تريد إسناد إعداد النواقص للمشرف الذكي؟</p>
            <Button type="button" size="sm" onClick={batchSetupAll}>
              <Bot size={15} />
              إطلاق الإعداد الشامل
            </Button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>القسم</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead>الملخص</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        {m.readinessPercent >= 90 ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : m.requiresApiKey ? (
                          <Key size={16} className="text-secondary" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-600" />
                        )}
                        {m.nameAr}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-24 flex-col gap-1">
                        <Progress value={m.readinessPercent} />
                        <Badge variant={m.readinessPercent >= 90 ? "secondary" : "outline"}>
                          {m.readinessPercent}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-xs">
                      {m.summaryAr}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="xs" asChild>
                          <Link href={m.configUrl} onClick={() => setDetailsOpen(false)}>
                            إعداد
                            <ExternalLink size={11} />
                          </Link>
                        </Button>
                        <Button size="xs" type="button" onClick={() => handoverToAgent(m.nameAr)}>
                          للوكيل
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="p-4">
            <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>
              إغلاق
            </Button>
            <Button type="button" variant="ghost" onClick={() => void fetchAudit()}>
              <RefreshCw size={14} />
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
