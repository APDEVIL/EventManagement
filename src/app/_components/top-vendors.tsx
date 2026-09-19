"use client";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";
import { VendorCard } from "@/components/vendor/vendor-card";

type Vendor = RouterOutputs["vendor"]["list"]["vendors"][number];

export function TopVendors() {
  const { data, isLoading } = api.vendor.list.useQuery({
    verifiedOnly: true,
    limit: 4,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {data?.vendors.map((vendor: Vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}