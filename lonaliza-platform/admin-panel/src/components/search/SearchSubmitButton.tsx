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
      className={cn(
        searchSubmitClass,
        "w-full xl:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 border border-amber-300/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <Search size={18} className="shrink-0 text-slate-950 stroke-[2.5]" />
      <span className="text-slate-950 font-black">{label}</span>
    </button>
  );
}
