import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function NativeComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  disabled,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <form
      className="flex items-stretch gap-2 rounded-[1.35rem] border border-slate-200 bg-slate-50/90 p-1.5 shadow-inner"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(
          "min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none",
          "placeholder:text-slate-400 focus:border-purple-300"
        )}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED] px-4 text-sm font-black text-white shadow-sm disabled:opacity-45"
      >
        {submitLabel}
      </button>
    </form>
  );
}
