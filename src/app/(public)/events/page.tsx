"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { SearchBar } from "@/components/shared/search-bar";
import { ListingGrid } from "@/components/listing/listing-grid";
import { ListingFilters } from "@/components/listing/listing-fileters";
import { api } from "@/trpc/react";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { ListingFilterInput } from "@/lib/validations";

const DEFAULT_FILTERS: ListingFilterInput = {
  sortBy: "newest",
};

export default function EventsPage() {
  const searchParams = useSearchParams();

  // Initialise filters from URL query params
  const [filters, setFilters] = useState<ListingFilterInput>({
    search: searchParams.get("search") ?? undefined,
    category: (searchParams.get("category") as ListingFilterInput["category"]) ?? undefined,
    city: searchParams.get("city") ?? undefined,
    sortBy: "newest",
  });

  const [offset, setOffset] = useState(0);
  const [allListings, setAllListings] = useState<any[]>([]);

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryInput = {
    ...filters,
    search: debouncedSearch,
    limit: DEFAULT_PAGE_SIZE,
    offset,
  };

  const { data, isLoading, isFetching } = api.listing.list.useQuery(queryInput);

  // Reset accumulated listings when filters change
  useEffect(() => {
    setOffset(0);
    setAllListings([]);
  }, [
    filters.category,
    filters.city,
    filters.sortBy,
    filters.minPrice,
    filters.maxPrice,
    debouncedSearch,
  ]);

  // Accumulate pages for load-more
  useEffect(() => {
    if (!data?.listings) return;
    if (offset === 0) {
      setAllListings(data.listings);
    } else {
      setAllListings((prev) => [...prev, ...data.listings]);
    }
  }, [data?.listings, offset]);

  function handleFilterChange(patch: Partial<ListingFilterInput>) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
  }

  function handleLoadMore() {
    setOffset((o) => o + DEFAULT_PAGE_SIZE);
  }

  const hasMore = data ? offset + DEFAULT_PAGE_SIZE < data.total : false;

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <PageHero
        size="sm"
        title={
          <>
            Find the{" "}
            <span className="text-violet-200">Perfect</span> Service
          </>
        }
        subtitle="Browse thousands of event listings across every category."
        actions={
          <div className="w-full max-w-2xl">
            <SearchBar
              searchHref="/events"
              defaultSearch={filters.search}
              defaultCategory={filters.category}
              defaultCity={filters.city}
            />
          </div>
        }
      />

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filters */}
        <ListingFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          total={data?.total}
          className="mb-8"
        />

        {/* Grid */}
        <ListingGrid
          listings={allListings}
          isLoading={isLoading && offset === 0}
          isFetchingMore={isFetching && offset > 0}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          cols="auto"
          emptyTitle="No listings found"
          emptyDescription="Try adjusting your filters, search term, or browse a different category."
          emptyActionLabel="Clear filters"
          emptyActionHref="/events"
        />
      </div>
    </div>
  );
}