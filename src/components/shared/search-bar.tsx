"use client";

import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils";

interface SearchBarProps {
  /** If true renders a compact single-line variant */
  compact?: boolean;
  className?: string;
  /** Pre-fill values from URL query params */
  defaultSearch?: string;
  defaultCategory?: string;
  defaultCity?: string;
  /** Where to navigate on submit — defaults to /events */
  searchHref?: string;
}

/**
 * Full search bar with keyword, category, and city inputs.
 * On submit it navigates to `searchHref` with query params applied.
 * Can also be used in controlled mode if you pass onChange handlers.
 */
export function SearchBar({
  compact = false,
  className,
  defaultSearch = "",
  defaultCategory = "",
  defaultCity = "",
  searchHref = "/events",
}: SearchBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [city, setCity] = useState(defaultCity);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      `${searchHref}${buildSearchParams({ search, category, city })}`,
    );
  }

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 backdrop-blur-sm",
          "transition-all focus-within:border-white/40 focus-within:bg-white/15",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-white/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or vendors…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
        "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <div className="flex flex-col gap-0 divide-white/10 sm:flex-row sm:divide-x">
        {/* Keyword */}
        <div className="flex flex-1 items-center gap-3 px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-white/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, services…"
            className="flex-1 bg-transparent text-base text-white placeholder:text-white/50 outline-none"
          />
        </div>

        {/* Category */}
        <div className="flex items-center gap-3 px-5 py-4">
          <SlidersHorizontal className="h-5 w-5 shrink-0 text-white/60" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-base text-white outline-none cursor-pointer [&>option]:bg-violet-900 [&>option]:text-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="flex items-center gap-3 px-5 py-4">
          <MapPin className="h-5 w-5 shrink-0 text-white/60" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City / Location"
            className="w-36 bg-transparent text-base text-white placeholder:text-white/50 outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center px-4 py-3">
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl bg-white font-semibold text-violet-700 hover:bg-violet-50 sm:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}