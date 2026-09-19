"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Store } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryFilterRow } from "@/components/shared/category-pill";
import { VendorCard, VendorCardSkeleton } from "@/components/vendor/vendor-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { CategoryValue } from "@/lib/constants";

export default function VendorsPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState<CategoryValue | undefined>(
    (searchParams.get("category") as CategoryValue) ?? undefined,
  );
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allVendors, setAllVendors] = useState<any[]>([]);

  const debouncedSearch = useDebounce(search, 400);
  const debouncedCity = useDebounce(city, 400);

  const { data, isLoading, isFetching } = api.vendor.list.useQuery({
    search: debouncedSearch || undefined,
    category,
    city: debouncedCity || undefined,
    verifiedOnly,
    limit: DEFAULT_PAGE_SIZE,
    offset,
  });

  // Reset on filter change
  useEffect(() => {
    setOffset(0);
    setAllVendors([]);
  }, [debouncedSearch, category, debouncedCity, verifiedOnly]);

  // Accumulate pages
  useEffect(() => {
    if (!data?.vendors) return;
    if (offset === 0) {
      setAllVendors(data.vendors);
    } else {
      setAllVendors((prev) => [...prev, ...data.vendors]);
    }
  }, [data?.vendors, offset]);

  const hasMore = data ? offset + DEFAULT_PAGE_SIZE < data.total : false;
  const showSkeleton = isLoading && offset === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <PageHero
        size="sm"
        title={
          <>
            Find{" "}
            <span className="text-violet-200">Trusted</span> Vendors
          </>
        }
        subtitle="Every vendor on our platform is verified and reviewed by real clients."
        actions={
          <div className="w-full max-w-2xl">
            <SearchBar
              searchHref="/vendors"
              defaultSearch={search}
              defaultCity={city}
            />
          </div>
        }
      />

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="mb-8 space-y-4">
          <CategoryFilterRow
            value={category}
            onChange={(v) => setCategory(v as CategoryValue | undefined)}
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* City input */}
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City…"
              className="h-9 w-36 rounded-xl border-gray-200 text-sm shadow-none"
            />

            {/* Verified toggle */}
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`flex h-9 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-all ${verifiedOnly ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
            >
              <span className={`h-2 w-2 rounded-full ${verifiedOnly ? "bg-emerald-500" : "bg-gray-300"}`} />
              Verified Only
            </button>

            {/* Results count */}
            <span className="ml-auto text-sm text-gray-500">
              {data?.total?.toLocaleString() ?? 0} vendor
              {data?.total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grid */}
        {showSkeleton ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <VendorCardSkeleton key={i} />
            ))}
          </div>
        ) : !allVendors.length ? (
          <EmptyState
            icon={Store}
            title="No vendors found"
            description="Try adjusting your filters or search in a different city."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setCategory(undefined);
              setCity("");
              setVerifiedOnly(false);
            }}
          />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allVendors.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={isFetching}
                  onClick={() => setOffset((o) => o + DEFAULT_PAGE_SIZE)}
                  className="min-w-40 rounded-full border-violet-200 text-violet-700 hover:border-violet-400 hover:bg-violet-50"
                >
                  {isFetching ? "Loading…" : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}