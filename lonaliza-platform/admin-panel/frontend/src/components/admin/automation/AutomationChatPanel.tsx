"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ApprovalRecord } from "@/lib/automation/approval";
import type { StudioChatMessage } from "@/lib/automation/studio-chat";
import { ApprovalToolbar } from "@/components/admin/automation/studio/ApprovalToolbar";
import { ConversationPane } from "@/components/admin/automation/studio/ConversationPane";
import { JobPreviewCard } from "@/components/admin/automation/studio/JobPreviewCard";

async function studioApi(body?: Record<string, unknown>) {
  const res = await fetch("/admin/automation-studio/api", {
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

export default function AutomationChatPanel({ onSaved }: { onSaved?: () => void }) {
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [record, setRecord] = useState<ApprovalRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    void studioApi().then((data) => {
      const latest = data.items?.[0];
      if (latest) setRecord(latest);
    });
  }, []);

  const run = useCallback(
    async (body: Record<string, unknown>, userText?: string) => {
      setBusy(true);
      if (userText) setMessages((prev) => [...prev, { role: "user", content: userText }]);
      try {
        const data = await studioApi(body);
        if (!data.ok || !data.record) throw new Error(data.error || "تعذّر تنفيذ الإجراء");
        setRecord(data.record);
        if (data.reply) setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
        if (data.record.state === "active" || body.action === "submit") onSaved?.();
      } catch (e) {
        const message = e instanceof Error ? e.message : "تعذّر تنفيذ الإجراء";
        setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      } finally {
        setBusy(false);
      }
    },
    [onSaved]
  );

  const sendPrompt = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void run(
      {
        action: "chat",
        prompt: text,
        approvalId: record?.state === "draft" || record?.state === "awaiting_approval" ? record.id : undefined,
      },
      text
    );
  };

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">أنشئوا وظيفة بالمحادثة</p>
          <p className="text-xs text-muted-foreground">
            صفوا المطلوب بالعربية — مثال: «كل يوم 3 مقالات سياحية مسودة عن طرابزون». ثم أكّدوا المسودة.
          </p>
        </div>
        <Link
          href="/admin/automation-studio"
          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline dark:text-amber-300"
        >
          استوديو الأتمتة الكامل
          <ExternalLink className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <ConversationPane messages={messages} input={input} setInput={setInput} busy={busy} onSend={sendPrompt} />
        </div>
        <div className="flex flex-col gap-3 xl:col-span-5">
          <JobPreviewCard record={record} />
          <ApprovalToolbar
            record={record}
            busy={busy}
            notes={notes}
            onNotes={setNotes}
            onSubmit={() => record && void run({ action: "submit", approvalId: record.id })}
            onApprove={() => record && void run({ action: "approve", approvalId: record.id })}
            onReject={() =>
              record && void run({ action: "reject", approvalId: record.id, reason: notes }).then(() => setNotes(""))
            }
            onRevise={() =>
              record && void run({ action: "edit", approvalId: record.id, notes }).then(() => setNotes(""))
            }
            onDelete={() => {
              if (record) {
                void studioApi({ action: "delete", approvalId: record.id }).then(() => {
                  setRecord(null);
                  onSaved?.();
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
