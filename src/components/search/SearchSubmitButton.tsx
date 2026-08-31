import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchSubmitClass } from "@/components/search/search-styles";

type Props = {
  label: string;
  disabled?: boolean;
  className?: string;
};

export default function SearchSubmitButton({ label, disabled, className }: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(searchSubmitClass, "w-full xl:w-auto", className)}
      style={{
        backgroundColor: "var(--brand-button)",
        color: "var(--theme-btn-text)",
        borderRadius: "var(--radius-button)",
        boxShadow: "var(--theme-btn-shadow)",
        border: "var(--theme-border-width) solid var(--theme-btn-border)",
      }}
    >
      <Search size={17} className="text-white" />
      <span>{label}</span>
    </button>
  );
}
