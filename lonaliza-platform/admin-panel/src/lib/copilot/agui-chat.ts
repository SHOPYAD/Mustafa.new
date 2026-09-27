import type { Message } from "@copilotkit/shared";

export type AguiToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown> | null;
};

export type ChatRow =
  | { kind: "text"; id: string; role: "user" | "assistant"; content: string }
  | { kind: "tool"; id: string; name: string; args: Record<string, unknown> | null; done: boolean };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        const rec = asRecord(part);
        if (!rec) return "";
        if (typeof rec.text === "string") return rec.text;
        if (typeof rec.content === "string") return rec.content;
        return "";
      })
      .join("");
  }
  const rec = asRecord(content);
  if (rec && typeof rec.text === "string") return rec.text;
  return "";
}

function parseArgs(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return asRecord(JSON.parse(raw));
    } catch {
      return raw.trim() ? { raw } : null;
    }
  }
  return asRecord(raw);
}

export function extractToolCalls(message: unknown): AguiToolCall[] {
  const rec = asRecord(message);
  if (!rec) return [];
  const rawCalls = Array.isArray(rec.toolCalls)
    ? rec.toolCalls
    : Array.isArray(rec.tool_calls)
      ? rec.tool_calls
      : [];
  return rawCalls.flatMap((call, index) => {
    const item = asRecord(call);
    if (!item) return [];
    const fn = asRecord(item.function);
    const name =
      (typeof item.name === "string" && item.name) ||
      (typeof fn?.name === "string" && fn.name) ||
      "";
    if (!name) return [];
    return [
      {
        id: typeof item.id === "string" && item.id ? item.id : `tool-${index}`,
        name,
        args: parseArgs(item.arguments ?? fn?.arguments ?? item.args),
      },
    ];
  });
}

export function flattenChatRows(messages: unknown[]): ChatRow[] {
  const rows: ChatRow[] = [];
  const toolDone = new Set<string>();
  for (const raw of messages) {
    const rec = asRecord(raw);
    if (!rec) continue;
    const role = typeof rec.role === "string" ? rec.role : "";
    if (role === "tool" || role === "function") {
      const id = typeof rec.toolCallId === "string" ? rec.toolCallId : typeof rec.id === "string" ? rec.id : "";
      if (id) toolDone.add(id);
      continue;
    }
    if (typeof rec.isResultMessage === "function" && rec.isResultMessage()) {
      const id = typeof rec.actionExecutionId === "string" ? rec.actionExecutionId : "";
      if (id) toolDone.add(id);
      continue;
    }
    if (typeof rec.isActionExecutionMessage === "function" && rec.isActionExecutionMessage()) {
      rows.push({
        kind: "tool",
        id: typeof rec.id === "string" ? rec.id : `tool-${rows.length}`,
        name: typeof rec.name === "string" ? rec.name : "tool",
        args: parseArgs(rec.arguments),
        done: Boolean(rec.id && toolDone.has(String(rec.id))),
      });
      continue;
    }
    for (const call of extractToolCalls(raw)) {
      rows.push({
        kind: "tool",
        id: call.id,
        name: call.name,
        args: call.args,
        done: toolDone.has(call.id),
      });
    }
    const content = textOf(rec.content);
    if (!content) continue;
    const isUser = role === "user" || role === "User";
    rows.push({
      kind: "text",
      id: typeof rec.id === "string" && rec.id ? rec.id : `msg-${rows.length}`,
      role: isUser ? "user" : "assistant",
      content,
    });
  }
  return rows.map((row) =>
    row.kind === "tool" && toolDone.has(row.id) ? { ...row, done: true } : row
  );
}

export function hasCopilotActivity(messages: unknown[]): boolean {
  return flattenChatRows(messages).some((row) => row.kind === "tool" || (row.kind === "text" && row.role === "assistant"));
}

export function newUserMessage(content: string): Message {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "user",
    content,
  };
}
