"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModernThemeSwitcher({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      className="h-8 w-8 text-foreground/80 hover:text-foreground rounded-lg border border-border/50 bg-background/50 hover:bg-muted transition-colors"
      title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      aria-label="تبديل المظهر"
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-slate-700 transition-transform duration-200" />
      )}
    </Button>
  );
}
