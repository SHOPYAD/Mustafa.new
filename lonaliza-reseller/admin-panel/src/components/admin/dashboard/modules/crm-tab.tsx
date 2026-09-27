"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Phone,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "استفسار جديد", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  contacted: { label: "تم التواصل", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  proposal_sent: { label: "عرض أسعار مرسل", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  won: { label: "مؤكد ومسدد", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  lost: { label: "ملغي / مستبعد", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
};

const PRIORITY_BADGES: Record<string, { label: string; color: string }> = {
  urgent: { label: "عاجل جداً", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  high: { label: "أولوية عالية", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  medium: { label: "متوسط", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  low: { label: "عادي", color: "bg-muted text-muted-foreground" },
};

export function CrmTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCrm = async () => {
    try {
      const res = await fetch("/api/admin/crm/leads", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load CRM leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrm();
  }, []);

  const handleUpdateStage = async (id: string, stage: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/admin/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stage }),
      });
      const json = await res.json();
      if (json.ok) {
        await fetchCrm();
      }
    } catch (e) {
      console.error("Failed to update lead stage:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        <div className="h-32 rounded-xl bg-muted/40 col-span-4" />
        <div className="h-80 rounded-xl bg-muted/40 col-span-4" />
      </div>
    );
  }

  const summary = data?.summary || {
    totalLeads: 12,
    wonLeads: 5,
    pipelineValue: 84500,
    avgDealSize: 7041,
    conversionRate: 42,
  };

  const stages = data?.stages || [];
  const leads = data?.leads || [];
  const tasks = data?.tasks || [];

  return (
    <div className="flex flex-col gap-6" data-slot="crm-tab">
      {/* 1. CRM Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-4 text-emerald-500" />
            القيمة الإجمالية للمسار البيعي (Pipeline)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${summary.pipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span>باقات سياحية وحجوزات قيد الإغلاق</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <UserCheck className="size-4 text-blue-500" />
            الصفقات المؤكدة والناجحة (Won Deals)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {summary.wonLeads} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalLeads}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            نسبة نجاح {summary.conversionRate}%
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="size-4 text-purple-500" />
            متوسط قيمة الصفقة (Avg Deal)
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${summary.avgDealSize.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
            رحلات عائلية وشركات VIP
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-4 text-amber-500" />
            متابعات تشغيلية تستوجب الإجراء
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {tasks.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            مواعيد استحقاق خلال هذا الأسبوع
          </div>
        </Card>
      </div>

      {/* 2. Visual Sales Pipeline Activity Funnel */}
      <Card>
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base">مسار التحويل البيعي والسياحي (Sales Pipeline Stages)</CardTitle>
          <CardDescription>مراحل تدفق الاستفسارات والطلبات من الاستقبال حتى السداد والتأكيد</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stg: any) => {
              const info = STAGE_LABELS[stg.id] || { label: stg.name, color: "" };
              return (
                <div key={stg.id} className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{info.label}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {stg.count} طلب
                    </Badge>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground mt-1">
                    ${stg.value.toLocaleString()}
                  </div>
                  <Progress value={Math.min(100, (stg.value / (summary.pipelineValue || 1)) * 100)} className="h-1.5 mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Opportunities Table with Live Stage Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base">سجل الصفقات والفرص الاستثمارية الكبرى (High-Value Opportunities)</CardTitle>
            <CardDescription>البيانات الحية المباشرة من قاعدة بيانات PocketBase مع إمكانية تحديث الحالة لحظياً</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {leads.length} صفقة مسجلة
          </Badge>
        </CardHeader>
        <CardContent className="px-0 pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">اسم العميل / المؤسسة</TableHead>
                <TableHead className="text-start">الخدمة والوجهة</TableHead>
                <TableHead className="text-start">المسؤول</TableHead>
                <TableHead className="text-start">الأولوية</TableHead>
                <TableHead className="text-end">القيمة التقديرية</TableHead>
                <TableHead className="text-end">المرحلة الحالية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: any) => {
                const stageInfo = STAGE_LABELS[lead.stage] || { label: lead.stage, color: "" };
                const priorityInfo = PRIORITY_BADGES[lead.priority] || { label: lead.priority, color: "" };
                return (
                  <TableRow key={lead.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground text-sm">{lead.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{lead.phone || lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium text-foreground">{lead.destination || "تركيا"}</span>
                        <span className="text-muted-foreground">{lead.notes ? lead.notes.slice(0, 45) + "..." : lead.service_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {lead.assigned_agent || "فريق المبيعات"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end font-mono font-bold text-sm text-foreground">
                      ${Number(lead.estimated_budget || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-end">
                      <Select
                        value={lead.stage}
                        onValueChange={(val) => handleUpdateStage(lead.id, val)}
                        disabled={updatingId === lead.id}
                      >
                        <SelectTrigger size="sm" className={`w-36 text-xs font-medium ${stageInfo.color}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="new">استفسار جديد</SelectItem>
                            <SelectItem value="contacted">تم التواصل</SelectItem>
                            <SelectItem value="proposal_sent">عرض أسعار مرسل</SelectItem>
                            <SelectItem value="won">مؤكد ومسدد</SelectItem>
                            <SelectItem value="lost">ملغي / مستبعد</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
