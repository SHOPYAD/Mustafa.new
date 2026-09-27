"use client";

type AdminSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  compact?: boolean;
};

/**
 * Compact iOS/Material settings switch for admin pages.
 * Uses logical insets so the thumb travels correctly in RTL.
 */
export default function AdminSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
  compact,
}: AdminSwitchProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="admin-tap inline-flex items-center justify-center shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 disabled:opacity-50"
    >
      <span
        className={`relative h-6 w-11 rounded-full focus:outline-none ${
          checked ? "bg-teal-700" : "bg-slate-600"
        }`}
        style={{ transition: "background-color 150ms ease" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
          style={{
            insetInlineStart: checked ? "1.375rem" : "0.125rem",
            transition: "inset-inline-start 150ms ease",
          }}
        />
      </span>
    </button>
  );

  if (compact) return control;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="mt-0.5 text-xs leading-5 text-admin-text-muted">{description}</p> : null}
      </div>
      {control}
    </div>
  );
}
