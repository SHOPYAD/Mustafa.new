"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bot, ExternalLink, ShieldCheck } from "lucide-react";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
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
    <AdminPage>
      <AdminPageHeader
        title="استوديو الأتمتة"
        description="صف الوظيفة بالعربية. تُبنى مسودة كاملة (نوع، كرون، أوروبا/إسطنبول، حسابات وميزانية توضيحية، لغات، تجريبي، بدون نشر تلقائي). الكرون لا يعمل قبل الاعتماد — من هنا أو من تيليغرام: انشر / أطلق / ارفض / عدّل."
        icon={<Bot className="size-5" />}
        actions={
          <Link
            href="/admin/automation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            الوظائف المحفوظة
            <ExternalLink className="size-3.5" />
          </Link>
        }
      />

      <div className='mb-5 flex flex-col gap-3 rounded-2xl border border-border/20 bg-secondary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <StateStepper state={record?.state || null} />
        <p className='inline-flex items-center gap-1.5 text-xs text-admin-btn-secondary-hover dark:text-muted-foreground'>
          <ShieldCheck className="size-3.5" />
          لا قوائم هواتف مجروفة · لا نشر قبل الموافقة
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">
        <div className="min-h-0 xl:col-span-7">
          <ConversationPane
            messages={messages}
            input={input}
            setInput={setInput}
            busy={busy}
            onSend={sendPrompt}
          />
        </div>
        <div className="flex min-h-0 flex-col gap-4 xl:col-span-5">
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
          <div className='overflow-hidden rounded-2xl border border-border bg-background'>
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
    </AdminPage>
  );
}
