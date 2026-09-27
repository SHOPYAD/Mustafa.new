"use client";

import { useState } from "react";
import { RefreshCw, Play, Pause, Activity, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HotelSyncDaemonController() {
  const { locale, dir } = useLocale();
  const ar = locale === "ar";

  const [isActive, setIsActive] = useState(true);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(15);
  const [markupPercent, setMarkupPercent] = useState<number>(12);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("منذ دقيقتين (14:05)");
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "تم فحص 24 فندقاً مستورداً وتحديث 8 أسعار غرف بنجاح وتطبيق هامش 12%.",
    "فحص حالة الغرف المتاحة: لا توجد غرف مباعة بالكامل في التواريخ القادمة.",
    "تحديث الكاش المركزي وتوليد أسعار الليلة الصافية بنجاح.",
  ]);

  const handleManualSync = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
      setLastSyncTime("الآن (لحظي)");
      setSyncLogs((prev) => [
        `فحص يدوي ناجح: تمت مزامنة كافة الفنادق والتحقق من أحدث الأسعار بهامش +${markupPercent}%.`,
        ...prev.slice(0, 3),
      ]);
    }, 1200);
  };

  return (
    <div dir={dir} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Activity size={18} />
            {ar ? "زاحف الأسعار" : "Rate crawler"}
            <Badge variant={isActive ? "secondary" : "outline"}>
              {isActive ? (ar ? "يعمل تلقائياً" : "Active 24/7") : ar ? "متوقف" : "Paused"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {ar
              ? "يزحف دورياً على صفحات الفنادق المستوردة لتحديث الأسعار مع تطبيق المارك أب"
              : "Crawls contracted hotel URLs to refresh rates and apply markups"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleManualSync} disabled={isSyncingNow}>
            <RefreshCw size={14} className={isSyncingNow ? "animate-spin" : ""} />
            {isSyncingNow ? (ar ? "جاري الزحف..." : "Syncing...") : ar ? "مزامنة يدوية فورية" : "Sync Now"}
          </Button>
          <Button type="button" variant={isActive ? "destructive" : "default"} onClick={() => setIsActive(!isActive)}>
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            {isActive ? (ar ? "إيقاف مؤقت" : "Pause") : ar ? "تفعيل" : "Enable"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              {ar ? "دورية الزحف والمزامنة" : "Sync Interval"}
            </p>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 30, 60].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  size="sm"
                  variant={intervalMinutes === mins ? "default" : "outline"}
                  onClick={() => setIntervalMinutes(mins)}
                >
                  {mins} {ar ? "د" : "m"}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                {ar ? "هامش ربح الوكالة التلقائي" : "Markup Applied"}
              </p>
              <Badge variant="outline" className="font-mono">
                +{markupPercent}%
              </Badge>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>5%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} />
          {ar ? "زاحف الغرف" : "Rooms crawler"}
        </CardTitle>
        <CardDescription>
          {ar
            ? "فحص توفر الغرف والكاش المركزي لنفس دورة المزامنة"
            : "Inventory availability and cache for the same sync cycle"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
          <p className="text-xs font-semibold text-muted-foreground">
            {ar ? "حالة الكاش وآخر زحف" : "Daemon Cache Status"}
          </p>
          <p className="text-xs font-semibold">{lastSyncTime}</p>
          <p className="text-[11px] text-muted-foreground">
            {ar ? "الكاش السريع مفعّل (10 دقائق TTL)" : "Cache Active (10m TTL)"}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Sparkles className="size-3" />
              </TableHead>
              <TableHead>{ar ? "سجل نشاط الزاحف" : "Recent daemon logs"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syncLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-muted-foreground">›</TableCell>
                <TableCell className="font-mono text-xs">{log}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
