import { cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryLabel, CATEGORIES } from "@/lib/constants";

interface CategoryPillProps {
  category: string;
  /** When true renders as a clickable toggle filter */
  interactive?: boolean;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
}

// Color map matching the brand palette — maps category → Tailwind classes
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; activeBg: string; activeText: string }> = {
  venue: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    activeBg: "bg-violet-600",
    activeText: "text-white",
  },
  catering: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
    activeText: "text-white",
  },
  photography: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    activeBg: "bg-sky-600",
    activeText: "text-white",
  },
  music: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    activeBg: "bg-pink-600",
    activeText: "text-white",
  },
  decoration: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
  },
  transportation: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    activeText: "text-white",
  },
  planning: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    activeBg: "bg-purple-600",
    activeText: "text-white",
  },
  other: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    activeBg: "bg-gray-600",
    activeText: "text-white",
  },
};

export function CategoryPill({
  category,
  interactive = false,
  active = false,
  onClick,
  size = "md",
  className,
}: CategoryPillProps) {
  const Icon = getCategoryIcon(category);
  const label = getCategoryLabel(category);
  const colors = COLOR_MAP[category] ?? COLOR_MAP.other!;

  const base = cn(
    "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all",
    size === "sm" && "px-2.5 py-0.5 text-xs",
    size === "md" && "px-3 py-1 text-sm",
    active
      ? cn(colors.activeBg, colors.activeText, "border-transparent shadow-sm")
      : cn(colors.bg, colors.text, colors.border),
    interactive &&
      "cursor-pointer select-none hover:shadow-sm active:scale-95",
    className,
  );

  if (interactive) {
    return (
      <button type="button" className={base} onClick={onClick}>
        <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        {label}
      </button>
    );
  }

  return (
    <span className={base}>
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {label}
    </span>
  );
}

// ─── Category filter row ──────────────────────────────────────────────────────

interface CategoryFilterRowProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

/**
 * Horizontal scrollable row of CategoryPill toggles for filter bars.
 */
export function CategoryFilterRow({
  value,
  onChange,
  className,
}: CategoryFilterRowProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-hide",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-sm font-medium transition-all",
          !value
            ? "border-transparent bg-violet-600 text-white shadow-sm"
            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <CategoryPill
          key={cat.value}
          category={cat.value}
          interactive
          active={value === cat.value}
          onClick={() => onChange(value === cat.value ? undefined : cat.value)}
          className="shrink-0"
        />
      ))}
    </div>
  );
}