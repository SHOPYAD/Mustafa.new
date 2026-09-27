"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
  className,
  children,
  direction = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { direction?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        direction === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResizablePanel({
  className,
  children,
  defaultSize,
  ...props
}: React.ComponentProps<"div"> & { defaultSize?: number; minSize?: number }) {
  return (
    <div
      data-slot="resizable-panel"
      className={cn("flex-1 overflow-auto", className)}
      style={defaultSize ? { flexBasis: `${defaultSize}%` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<"div"> & { withHandle?: boolean }) {
  return (
    <div
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      )}
    </div>
  );
}
