import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  /** Use "page" for full-page centering, "card" for inside a card/table */
  variant?: "page" | "card";
}

/**
 * Reusable empty state component with decorative blob illustration,
 * consistent with the brand visual language.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  variant = "card",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "page" && "min-h-[60vh] px-4",
        variant === "card" && "py-16 px-6",
        className,
      )}
    >
      {/* Decorative blob ring */}
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-3 rounded-full bg-violet-100/60 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 ring-1 ring-violet-200/60">
          <Icon className="h-9 w-9 text-violet-500" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      )}

      {actionLabel && (onAction ?? actionHref) && (
        <Button
          onClick={onAction}
          asChild={!!actionHref}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
        </Button>
      )}
    </div>
  );
}