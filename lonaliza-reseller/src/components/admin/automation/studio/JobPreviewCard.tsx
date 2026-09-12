"use client";

import { catalogEntry } from "@/lib/automation/catalog";
import { describeApprovalState, type ApprovalRecord } from "@/lib/automation/approval";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-foreground" dir="auto">
        {value}
      </dd>
    </div>
  );
}

export function JobPreviewCard({ record }: { record: ApprovalRecord | null }) {
  if (!record) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">معاينة الوظيفة</CardTitle>
          <CardDescription>
            صف المهمة بالعربية في المحادثة. تُبنى مسودة كاملة من الكتالوج دون تفعيل الكرون.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          لا مسودة بعد. الحسابات والميزانية تبقى حقولاً توضيحية — بلا قوائم مجروفة وبلا نشر قبل الاعتماد.
        </CardContent>
      </Card>
    );
  }

  const entry = catalogEntry(record.draft.type);
  const badge =
    record.state === "active"
      ? "default"
      : record.state === "rejected"
        ? "destructive"
        : record.state === "awaiting_approval"
          ? "secondary"
          : "outline";

  return (
    <Card className="h-full">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg" dir="auto">
              {record.draft.name}
            </CardTitle>
            <CardDescription className="mt-1">{entry.titleAr}</CardDescription>
          </div>
          <Badge variant={badge}>{describeApprovalState(record.state)}</Badge>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
          {record.id}
          {record.jobId ? ` → ${record.jobId}` : ""}
        </p>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm leading-relaxed text-foreground/90" dir="auto">
          {record.draft.summaryAr}
        </p>
        <Separator />
        <dl className="divide-y divide-border/70">
          <Row label="النوع" value={record.draft.type} />
          <Row label="الجدول" value={`${record.draft.cron} · ${record.draft.timezone}`} />
          <Row label="اللغات" value={record.draft.locales.join(" · ")} />
          <Row label="الحدود" value={`${record.draft.maxPerRun} / تشغيل · ${record.draft.maxPerDay} / يوم`} />
          <Row label="تجريبي" value={record.draft.dryRun ? "نعم — بدون أثر جانبي" : "لا — تشغيل حي بعد الاعتماد فقط"} />
          <Row label="نشر تلقائي" value="مغلق دائماً حتى الاعتماد اليدوي" />
          <Row label="الحسابات" value={record.draft.accounts} />
          <Row label="الميزانية" value={record.draft.budget} />
          {record.draft.consentSource ? <Row label="موافقة الجمهور" value={record.draft.consentSource} /> : null}
        </dl>
        {record.editNotes ? (
          <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100" dir="auto">
            ملاحظات التعديل: {record.editNotes}
          </p>
        ) : null}
        {record.rejectReason ? (
          <p className="mt-3 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-800 dark:text-rose-200" dir="auto">
            سبب الرفض: {record.rejectReason}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
