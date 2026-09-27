"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "lucide-react";

export function MessageScrollerProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function MessageScroller({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller"
      className={cn("relative flex size-full min-h-0 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

export function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller-viewport"
      className={cn("size-full min-h-0 min-w-0 overflow-y-auto", className)}
      {...props}
    />
  );
}

export function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller-content"
      className={cn("flex h-max min-h-full flex-col gap-6", className)}
      {...props}
    />
  );
}

export function MessageScrollerItem({
  className,
  scrollAnchor,
  ...props
}: React.ComponentProps<"div"> & { scrollAnchor?: boolean }) {
  return (
    <div
      data-slot="message-scroller-item"
      className={cn("min-w-0 shrink-0", className)}
      {...props}
    />
  );
}

export function MessageScrollerButton({
  direction = "end",
  className,
  children,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<"button"> & {
  direction?: "start" | "end";
  variant?: string;
  size?: string;
  render?: React.ReactNode;
}) {
  return (
    <Button
      variant="secondary"
      size="icon-sm"
      className={cn("absolute bottom-4 left-1/2 -translate-x-1/2", className)}
      {...(props as any)}
    >
      {children ?? <ArrowDownIcon className="size-4" />}
    </Button>
  );
}

export function useMessageScroller() {
  return { scrollToBottom: () => {} };
}

export function useMessageScrollerScrollable() {
  return true;
}

export function useMessageScrollerVisibility() {
  return true;
}
