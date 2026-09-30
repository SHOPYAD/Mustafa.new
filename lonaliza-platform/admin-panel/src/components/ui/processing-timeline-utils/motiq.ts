import * as React from "react";

export type StatusTone = "neutral" | "active" | "warning" | "error" | "success";

export interface StatusVarsResult {
  color: string;
  bg: string;
  border: string;
}

export function statusVars(tone: StatusTone): StatusVarsResult {
  switch (tone) {
    case "active":
      return {
        color: "var(--color-accent, #00f3ff)",
        bg: "color-mix(in oklab, var(--color-accent, #00f3ff) 16%, transparent)",
        border: "color-mix(in oklab, var(--color-accent, #00f3ff) 40%, transparent)",
      };
    case "success":
      return {
        color: "var(--color-success, #32d583)",
        bg: "color-mix(in oklab, var(--color-success, #32d583) 16%, transparent)",
        border: "color-mix(in oklab, var(--color-success, #32d583) 40%, transparent)",
      };
    case "warning":
      return {
        color: "var(--color-warning, #f6b94a)",
        bg: "color-mix(in oklab, var(--color-warning, #f6b94a) 16%, transparent)",
        border: "color-mix(in oklab, var(--color-warning, #f6b94a) 40%, transparent)",
      };
    case "error":
      return {
        color: "var(--color-error, #ff5c70)",
        bg: "color-mix(in oklab, var(--color-error, #ff5c70) 16%, transparent)",
        border: "color-mix(in oklab, var(--color-error, #ff5c70) 40%, transparent)",
      };
    case "neutral":
    default:
      return {
        color: "var(--color-neutral, #9caabd)",
        bg: "color-mix(in oklab, var(--color-neutral, #9caabd) 12%, transparent)",
        border: "var(--color-border, #263449)",
      };
  }
}

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduce;
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (val: T) => void;
}): [T, (val: T | ((prev: T) => T)) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<T>(defaultValue as T);
  const state = isControlled ? (value as T) : internal;

  const setState = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as any)(state) : next;
      if (!isControlled) {
        setInternal(resolved);
      }
      onChange?.(resolved);
    },
    [isControlled, state, onChange]
  );

  return [state, setState];
}

export function scrollIntoViewWithin(
  el: HTMLElement | null,
  options: { smooth?: boolean } = {}
) {
  if (!el) return;
  try {
    el.scrollIntoView({
      behavior: options.smooth ? "smooth" : "auto",
      block: "nearest",
      inline: "nearest",
    });
  } catch {
    // ignore
  }
}

export function formatTimestamp(value: Date | number | string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(value);
  }
}
