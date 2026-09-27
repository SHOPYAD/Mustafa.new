"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bot, ExternalLink, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import type { ApprovalRecord } from "@/lib/automation/approval";
import type { StudioChatMessage } from "@/lib/automation/studio-chat";
import { ApprovalToolbar } from "./ApprovalToolbar";
import { ConversationPane } from "./ConversationPane";
import { JobPreviewCard } from "./JobPreviewCard";
import { StateStepper } from "./StateStepper";

async function studioApi(body?: Record<string, unknown>, id?: string) {
  const url = id
    ? `/admin/automation-studio/api?id=${encodeURIComponent(id)}`
    : "/admin/automation-studio/api";
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return (await res.json()) as {
    ok?: boolean;
    error?: string;
    record?: ApprovalRecord;
    items?: ApprovalRecord[];
    reply?: string;
  };
}

export default function StudioWorkbench() {
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [record, setRecord] = useState<ApprovalRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    void studioApi().then((data) => {
      if (cancelled || !data.ok) return;
      const latest = data.items?.[0];
      if (latest) setRecord(latest);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async (body: Record<string, unknown>, userText?: string) => {
    setBusy(true);
    setError("");
    if (userText) {
      setMessages((prev) => [...prev, { role: "user", content: userText }]);
    }
    try {
      const data = await studioApi(body);
      if (!data.ok || !data.record) {
        throw new Error(data.error || "تعذّر تنفيذ الإجراء");
      }
      setRecord(data.record);
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "تعذّر تنفيذ الإجراء";
      setError(message);
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setBusy(false);
    }
  }, []);

  const sendPrompt = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void run(
      {
        action: "chat",
        prompt: text,
        approvalId: record?.state === "draft" || record?.state === "awaiting_approval" ? record.id : undefined,
        notes: record?.state === "draft" && record.editNotes ? record.editNotes : undefined,
      },
      text
    );
  };

  const decide = (verb: "reject" | "edit") => {
    if (!record) return;
    void run({
      action: verb,
      approvalId: record.id,
      reason: notes,
      notes,
    }).then(() => setNotes(""));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <EnterprisePageHeader
        title="استوديو الأتمتة الذكي (Automation Studio)"
        description="صف الوظيفة بالعربية. تُبنى مسودة كاملة (نوع، كرون، أوروبا/إسطنبول، حسابات وميزانية، لغات، تجريبي، بدون نشر تلقائي). الكرون لا يعمل قبل الاعتماد."
        icon={Workflow}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الأتمتة والذكاء الاصطناعي", href: "/admin/automation" },
          { label: "استوديو الأتمتة" },
        ]}
        actions={
          <Link
            href="/admin/automation"
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
          >
            <span>الوظائف المحفوظة</span>
            <ExternalLink className="size-3.5" />
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl">
        <StateStepper state={record?.state || null} />
        <p className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <ShieldCheck className="size-4" />
          <span>حماية مشددة: لا قوائم هواتف مجروفة · لا نشر قبل الاعتماد</span>
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-400">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-h-0 xl:col-span-7">
          <ConversationPane
            messages={messages}
            input={input}
            setInput={setInput}
            busy={busy}
            onSend={sendPrompt}
          />
        </div>
        <div className="flex min-h-0 flex-col gap-5 xl:col-span-5">
          <JobPreviewCard record={record} />
          <ApprovalToolbar
            record={record}
            busy={busy}
            notes={notes}
            onNotes={setNotes}
            onSubmit={() => record && void run({ action: "submit", approvalId: record.id })}
            onApprove={() => record && void run({ action: "approve", approvalId: record.id })}
            onReject={() => decide("reject")}
            onRevise={() => decide("edit")}
          />
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-lg">
            <AdminCopilotPanel
              scope="email"
              title="Copilot الأتمتة"
              hint="وضع الأتمتة: اقترح مسودة ثم أرسل للاعتماد. لا تفعّل الكرون مباشرة."
              placeholder="مثال: حملة تيليغرام أسبوعية لجمهور موافق…"
              className="h-[380px]"
              defaultMode="automation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
