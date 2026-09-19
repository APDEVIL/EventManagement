"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryFilterRow } from "@/components/shared/category-pill";
import { cn } from "@/lib/utils";
import { LISTING_SORT_OPTIONS } from "@/lib/constants";
import type { ListingFilterInput } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingFiltersProps {
  filters: ListingFilterInput;
  onChange: (patch: Partial<ListingFilterInput>) => void;
  onReset: () => void;
  total?: number;
  className?: string;
}

// ─── ListingFilters ───────────────────────────────────────────────────────────

/**
 * Full filter bar: category pills row, sort select, city input,
 * advanced filters sheet (price range), result count, and reset button.
 *
 * @example
 * const [filters, setFilters] = useState(DEFAULT_FILTERS);
 *
 * <ListingFilters
 *   filters={filters}
 *   onChange={(patch) => setFilters((f) => ({ ...f, ...patch, offset: 0 }))}
 *   onReset={() => setFilters(DEFAULT_FILTERS)}
 *   total={data?.total}
 * />
 */
export function ListingFilters({
  filters,
  onChange,
  onReset,
  total,
  className,
}: ListingFiltersProps) {
  const hasActive =
    !!filters.category ||
    !!filters.city ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.sortBy !== "newest";

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── Category pill row ── */}
      <CategoryFilterRow
        value={filters.category}
        onChange={(cat) =>
          onChange({ category: cat as ListingFilterInput["category"] })
        }
      />

      {/* ── Controls row ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(v) =>
            onChange({ sortBy: v as ListingFilterInput["sortBy"] })
          }
        >
          <SelectTrigger className="h-9 w-44 rounded-xl border-gray-200 text-sm shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LISTING_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City */}
        <Input
          value={filters.city ?? ""}
          onChange={(e) => onChange({ city: e.target.value || undefined })}
          placeholder="City…"
          className="h-9 w-36 rounded-xl border-gray-200 text-sm shadow-none"
        />

        {/* Advanced filters (price range) */}
        <PriceRangeSheet filters={filters} onChange={onChange} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result count */}
        {total !== undefined && (
          <span className="text-sm text-gray-500">
            {total.toLocaleString()}{" "}
            {total === 1 ? "result" : "results"}
          </span>
        )}

        {/* Reset */}
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-gray-500 hover:text-gray-900"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Price range sheet ────────────────────────────────────────────────────────

function PriceRangeSheet({
  filters,
  onChange,
}: {
  filters: ListingFilterInput;
  onChange: (patch: Partial<ListingFilterInput>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(String(filters.minPrice ?? ""));
  const [max, setMax] = useState(String(filters.maxPrice ?? ""));

  // Sync local state when sheet opens
  function handleOpenChange(v: boolean) {
    if (v) {
      setMin(String(filters.minPrice ?? ""));
      setMax(String(filters.maxPrice ?? ""));
    }
    setOpen(v);
  }

  function apply() {
    onChange({
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
    });
    setOpen(false);
  }

  function clear() {
    setMin("");
    setMax("");
    onChange({ minPrice: undefined, maxPrice: undefined });
    setOpen(false);
  }

  const hasPrice =
    filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 rounded-xl border-gray-200 text-sm shadow-none",
            hasPrice &&
              "border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Price
          {hasPrice && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              1
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Price Range</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6 px-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Min Price (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={min}
                  min={0}
                  onChange={(e) => setMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Max Price (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="Any"
                  value={max}
                  min={0}
                  onChange={(e) => setMax(e.target.value)}
                />
              </div>
            </div>

            {/* Quick presets */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400">Quick ranges</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Under ₹10K", min: "", max: "10000" },
                  { label: "₹10K–50K", min: "10000", max: "50000" },
                  { label: "₹50K–1L", min: "50000", max: "100000" },
                  { label: "Above ₹1L", min: "100000", max: "" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMin(preset.min);
                      setMax(preset.max);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      min === preset.min && max === preset.max
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={clear}
            >
              Clear
            </Button>
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}