"use client";

import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import {
  FALLBACK_ICON,
  lucideNameToKebab,
  sanitizeSvgMarkup,
  type UiIconRef,
} from "@/lib/ui-icons-store";

type LucideDynamicName = React.ComponentProps<typeof DynamicIcon>["name"];

function asLucideName(name: string): LucideDynamicName {
  return lucideNameToKebab(name) as LucideDynamicName;
}

function EmptyGlyph({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export default function UiIcon({
  icon,
  size = 16,
  className,
  title,
}: {
  icon: UiIconRef | null | undefined;
  size?: number;
  className?: string;
  title?: string;
}) {
  const ref = icon ?? FALLBACK_ICON;

  if (ref.source === "svg") {
    const svg = sanitizeSvgMarkup(ref.svg || "");
    if (svg) {
      return (
        <span
          title={title}
          aria-hidden={!title}
          className={cn(
            "inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current",
            className
          )}
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
  }

  return (
    <span title={title} className="inline-flex shrink-0">
      <DynamicIcon
        name={asLucideName(ref.name || FALLBACK_ICON.name)}
        size={size}
        className={cn("shrink-0", className)}
        fallback={() => <EmptyGlyph size={size} className={className} />}
      />
    </span>
  );
}
