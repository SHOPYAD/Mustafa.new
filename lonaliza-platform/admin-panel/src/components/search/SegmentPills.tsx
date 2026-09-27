import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  className?: string;
};

export default function SegmentPills<T extends string>({
  value,
  options,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-slate-100 p-1 scrollbar-hide",
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-11 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 sm:min-h-0",
              active
                ? "bg-[var(--navy)] text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-[var(--navy)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
};

export function PillToggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
        checked
          ? "bg-[var(--brand-primary)] text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
        className
      )}
    >
      <span
        className={cn(
          "h-3.5 w-3.5 rounded-full border-2 transition-colors",
          checked ? "border-white bg-white" : "border-slate-400 bg-transparent"
        )}
      />
      {label}
    </button>
  );
}
