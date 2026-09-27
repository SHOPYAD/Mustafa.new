"use client";

import { useMemo, type ReactNode } from "react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { takeAdvisorExtras } from "@/components/chat/advisor/advisor-extras";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Vercel AI SDK Runtime for assistant-ui.
 * useChatRuntime wraps useChat + AssistantChatTransport (system + frontend tools).
 * Model selection stays in the admin Gemini config — never in the composer.
 * Voice and file extras are merged into the chat POST at send time.
 */
export function AdvisorRuntime({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/advisor/chat",
        body: { locale },
        fetch: async (input, init) => {
          const extras = takeAdvisorExtras();
          if (init?.body && typeof init.body === "string") {
            try {
              const json = JSON.parse(init.body) as Record<string, unknown>;
              json.locale = locale;
              if (extras.attachments.length) json.attachments = extras.attachments;
              if (extras.audio) {
                json.audioBase64 = extras.audio.base64;
                json.audioMime = extras.audio.mime;
              }
              if (extras.plannerMode) json.mode = "planner";
              init = { ...init, body: JSON.stringify(json) };
            } catch {
              /* keep original body */
            }
          }
          return fetch(input, init);
        },
      }),
    [locale]
  );
  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div data-aui-theme="lonaliza" className="contents">
        {children}
      </div>
    </AssistantRuntimeProvider>
  );
}
