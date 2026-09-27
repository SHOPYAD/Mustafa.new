"use client";

/* Agent A: editor chrome only */

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/builder/cn";

export function Button({
  variant = "default",
  size = "sm",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "iconSm";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
        variant === "default" && "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black hover:from-amber-300 hover:to-amber-400 shadow-sm",
        variant === "outline" &&
          "border border-[var(--ed-border-hex,#e2e8f0)] bg-[var(--ed-surface-hex,#fff)] hover:bg-[hsl(var(--ed-hover,210_20%_96%))] text-[var(--ed-text-hex,#1e293b)]",
        variant === "ghost" &&
          "hover:bg-[hsl(var(--ed-hover,210_20%_96%))] text-[hsl(var(--ed-text-muted,215_16%_47%))]",
        size === "sm" && "h-8 px-3 text-xs",
        size === "iconSm" && "h-8 w-8",
        className
      )}
      {...props}
    />
  );
}

export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[var(--ed-border-hex,#e2e8f0)] shrink-0",
        orientation === "vertical" ? "w-px h-6 mx-1" : "h-px w-full",
        className
      )}
    />
  );
}

export function Tooltip({ children }: { children: ReactNode }) {
  return <span className="relative inline-flex group/tip">{children}</span>;
}

export function TooltipTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  void asChild;
  return <>{children}</>;
}

export function TooltipContent({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute top-full start-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100">
      {children}
    </span>
  );
}

export function TooltipProvider({ children }: { children: ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  return <div className="relative inline-flex group/dd">{children}</div>;
}

export function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  void asChild;
  return <>{children}</>;
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: "end" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl opacity-0 invisible group-hover/dd:opacity-100 group-hover/dd:visible group-focus-within/dd:opacity-100 group-focus-within/dd:visible",
        align === "end" ? "end-0" : "start-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100" />;
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-amber-50 hover:text-purple-900 font-medium",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ToggleGroup({
  children,
  className,
}: {
  type?: "single";
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("inline-flex", className)}>{children}</div>;
}

export function ToggleGroupItem({
  value,
  children,
  className,
  onClick,
  "aria-label": ariaLabel,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const [pressed, setPressed] = useState(false);
  void pressed;
  return (
    <button
      type="button"
      data-value={value}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none transition",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[72px] w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition",
        "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium text-foreground", className)} {...props} />;
}

export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("min-h-0 overflow-y-auto", className)}>{children}</div>;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
}: {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (next: number[]) => void;
  className?: string;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? min}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={cn("h-1.5 w-full cursor-pointer accent-amber-500", className)}
    />
  );
}

export function Switch({
  checked,
  onCheckedChange,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition",
        checked ? "bg-primary" : "bg-slate-300",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function Tabs({
  value,
  onValueChange,
  className,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} data-tabs-value={value} data-tabs-change={onValueChange ? "1" : undefined}>
      <TabsCtx.Provider value={{ value: value || "", onValueChange }}>{children}</TabsCtx.Provider>
    </div>
  );
}

const TabsCtx = createContext<{
  value: string;
  onValueChange?: (v: string) => void;
}>({ value: "" });

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("inline-flex items-center gap-1 rounded-md bg-muted p-1", className)}>{children}</div>;
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

function isInsideEditorSurface(target: EventTarget | null, roots: Array<Element | null>): boolean {
  if (!(target instanceof Node)) return false;
  for (const root of roots) {
    if (root?.contains(target)) return true;
  }
  if (target instanceof Element) {
    if (target.closest("[data-editor-popover]")) return true;
    if (target.closest("[data-media-picker-panel]")) return true;
    if (target.closest("input[type='color']")) return true;
  }
  return false;
}

function isNativePickerNoise(event: PointerEvent, roots: Array<Element | null>): boolean {
  const target = event.target;
  if (target === document.documentElement || target === document.body) {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      const inRoot = roots.some((root) => root?.contains(active));
      if (inRoot && active.matches("input[type=color], input[type=file]")) return true;
    }
    return true;
  }
  return false;
}

function placeBelowTrigger(
  trigger: HTMLElement | null,
  panel: HTMLElement | null,
  align: "start" | "end",
  sideOffset: number
): { top: number; left: number; width: number } {
  const rect = trigger?.getBoundingClientRect();
  const width = panel?.offsetWidth || trigger?.offsetWidth || 256;
  const height = panel?.offsetHeight || 200;
  if (!rect) return { top: 8, left: 8, width };
  let left = align === "end" ? rect.right - width : rect.left;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  let top = rect.bottom + sideOffset;
  if (top + height > window.innerHeight - 8) {
    top = Math.max(8, rect.top - height - sideOffset);
  }
  return { top, left, width };
}

const PopoverCtx = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: { current: HTMLElement | null };
} | null>(null);

export function Popover({
  open: openProp,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: ReactNode;
}) {
  const [internal, setInternal] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const open = openProp ?? internal;
  const setOpen = (v: boolean) => {
    setInternal(v);
    onOpenChange?.(v);
  };
  return (
    <PopoverCtx.Provider value={{ open, setOpen, triggerRef }}>
      <span className="relative inline-flex">{children}</span>
    </PopoverCtx.Provider>
  );
}

export function PopoverTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  const ctx = useContext(PopoverCtx);
  const toggle = () => ctx?.setOpen(!ctx.open);
  const assignRef = (node: HTMLElement | null) => {
    if (ctx) ctx.triggerRef.current = node;
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: (event: MouseEvent) => void;
      className?: string;
    }>;
    return cloneElement(child, {
      ref: assignRef,
      "aria-expanded": ctx?.open ?? false,
      onClick: (event: MouseEvent) => {
        child.props.onClick?.(event);
        toggle();
      },
    } as never);
  }

  return (
    <button
      type="button"
      ref={assignRef}
      aria-expanded={ctx?.open ?? false}
      onClick={toggle}
      className="inline-flex"
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  onPointerDownOutside,
  children,
}: {
  className?: string;
  align?: "start" | "end";
  sideOffset?: number;
  onPointerDownOutside?: (event: PointerEvent) => void;
  children: ReactNode;
}) {
  const ctx = useContext(PopoverCtx);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!ctx?.open) return;
    const sync = () => {
      const next = placeBelowTrigger(ctx.triggerRef.current, panelRef.current, align, sideOffset);
      setCoords({ top: next.top, left: next.left });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [align, ctx, ctx?.open, sideOffset]);

  useEffect(() => {
    if (!ctx?.open) return;
    const onPointerDown = (event: PointerEvent) => {
      const roots = [panelRef.current, ctx.triggerRef.current];
      if (isNativePickerNoise(event, roots)) return;
      if (isInsideEditorSurface(event.target, roots)) return;
      onPointerDownOutside?.(event);
      ctx.setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ctx, ctx?.open, onPointerDownOutside]);

  if (!ctx?.open || typeof document === "undefined") return null;

  const style: CSSProperties = {
    position: "fixed",
    top: coords.top,
    left: coords.left,
    zIndex: 80,
  };

  return createPortal(
    <div
      ref={panelRef}
      data-editor-popover=""
      className={cn("min-w-[12rem] rounded-lg border border-border bg-card p-2 shadow-xl", className)}
      style={style}
    >
      {children}
    </div>,
    document.body
  );
}

const SelectCtx = createContext<{
  value: string;
  onValueChange?: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: { current: HTMLElement | null };
} | null>(null);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  return (
    <SelectCtx.Provider value={{ value: value || "", onValueChange, open, setOpen, triggerRef }}>
      <div className="relative inline-flex w-full">{children}</div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(SelectCtx);
  return (
    <button
      type="button"
      ref={(node) => {
        if (ctx) ctx.triggerRef.current = node;
      }}
      aria-expanded={ctx?.open ?? false}
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        "flex h-8 w-full items-center justify-between rounded-md border border-border bg-background px-2 text-xs",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectCtx);
  return <span className="truncate">{ctx?.value || placeholder || ""}</span>;
}

export function SelectContent({ children }: { children: ReactNode }) {
  const ctx = useContext(SelectCtx);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!ctx?.open) return;
    const sync = () => {
      setCoords(placeBelowTrigger(ctx.triggerRef.current, panelRef.current, "start", 4));
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [ctx, ctx?.open]);

  useEffect(() => {
    if (!ctx?.open) return;
    const onPointerDown = (event: PointerEvent) => {
      const roots = [panelRef.current, ctx.triggerRef.current];
      if (isNativePickerNoise(event, roots)) return;
      if (isInsideEditorSurface(event.target, roots)) return;
      ctx.setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ctx, ctx?.open]);

  if (!ctx?.open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      data-editor-popover=""
      className="max-h-56 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-xl"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: Math.max(coords.width, ctx.triggerRef.current?.offsetWidth || 0),
        zIndex: 90,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = useContext(SelectCtx);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => {
        ctx?.onValueChange?.(value);
        ctx?.setOpen(false);
      }}
      className={cn(
        "flex w-full items-center rounded px-2 py-1.5 text-left text-xs",
        active ? "bg-primary/10 text-primary" : "hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

const AccordionCtx = createContext<{
  open: string[];
  toggle: (id: string) => void;
}>({ open: [], toggle: () => {} });

const AccordionItemIdCtx = createContext<string>("");

export function Accordion({
  type,
  value,
  onValueChange,
  className,
  children,
}: {
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (next: string[]) => void;
  className?: string;
  children: ReactNode;
}) {
  void type;
  const open = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (id: string) => {
    const next = open.includes(id) ? open.filter((x) => x !== id) : [...open, id];
    onValueChange?.(next);
  };
  return (
    <AccordionCtx.Provider value={{ open, toggle }}>
      <div className={className}>{children}</div>
    </AccordionCtx.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AccordionItemIdCtx.Provider value={value}>
      <div data-accordion-item={value} className={className}>
        {children}
      </div>
    </AccordionItemIdCtx.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(AccordionCtx);
  const item = useContext(AccordionItemIdCtx);
  const open = item ? ctx.open.includes(item) : false;
  return (
    <button
      type="button"
      onClick={() => item && ctx.toggle(item)}
      aria-expanded={open}
      className={cn("flex w-full items-center justify-between py-2 text-sm font-medium", className)}
    >
      {children}
    </button>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(AccordionCtx);
  const item = useContext(AccordionItemIdCtx);
  if (item && !ctx.open.includes(item)) return null;
  return <div className={className}>{children}</div>;
}
