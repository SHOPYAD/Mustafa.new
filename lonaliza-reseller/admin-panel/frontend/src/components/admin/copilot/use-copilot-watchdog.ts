"use client";

import { useEffect, useRef } from "react";

const CONNECT_GRACE_MS = 12000;
const SILENCE_MS = 45000;

export function useCopilotWatchdog({
  isAvailable,
  isLoading,
  hasAssistantReply,
  pendingUserText,
  onSilentFail,
}: {
  isAvailable: boolean;
  isLoading: boolean;
  hasAssistantReply: boolean;
  pendingUserText: string;
  onSilentFail: (text: string, reason: string) => void;
}) {
  const failedRef = useRef(false);
  const pendingRef = useRef(pendingUserText);
  const onFailRef = useRef(onSilentFail);
  pendingRef.current = pendingUserText;
  onFailRef.current = onSilentFail;

  useEffect(() => {
    failedRef.current = false;
  }, [pendingUserText]);

  useEffect(() => {
    if (failedRef.current || isAvailable || !pendingRef.current) return;
    const timer = window.setTimeout(() => {
      if (!isAvailable && !failedRef.current && pendingRef.current) {
        failedRef.current = true;
        onFailRef.current(pendingRef.current, "Copilot runtime is not available");
      }
    }, CONNECT_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [isAvailable]);

  useEffect(() => {
    if (failedRef.current || !isLoading || !pendingRef.current) return;
    const timer = window.setTimeout(() => {
      if (!failedRef.current && pendingRef.current) {
        failedRef.current = true;
        onFailRef.current(pendingRef.current, "Copilot timed out with no reply");
      }
    }, SILENCE_MS);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (hasAssistantReply) failedRef.current = false;
  }, [hasAssistantReply]);
}

export async function probeCopilotHealth(scope: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/copilotkit?health=1&scope=${encodeURIComponent(scope)}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean; hasGeminiKey?: boolean };
    return Boolean(data.ok && data.hasGeminiKey);
  } catch {
    return false;
  }
}
