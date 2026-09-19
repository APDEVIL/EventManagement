import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

/**
 * Verified vendor badge — shows a shield-check icon with optional label.
 * Used on vendor cards, vendor profile pages, and listing cards.
 */
export function VerifiedBadge({
  size = "md",
  showLabel = false,
  className,
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        "bg-emerald-500/90 text-white backdrop-blur-sm",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <ShieldCheck
        className={cn(
          "shrink-0",
          size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
        )}
      />
      {showLabel && "Verified"}
    </span>
  );
}