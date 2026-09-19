"use client";

import { api } from "@/trpc/react";
import { ListingGrid } from "@/components/listing/listing-grid";

export function FeaturedListings() {
  const { data, isLoading } = api.listing.list.useQuery({
    sortBy: "rating",
    limit: 8,
  });

  return (
    <ListingGrid
      listings={data?.listings}
      isLoading={isLoading}
      cols="auto"
      emptyTitle="No listings yet"
      emptyDescription="Check back soon — vendors are joining every day."
    />
  );
}