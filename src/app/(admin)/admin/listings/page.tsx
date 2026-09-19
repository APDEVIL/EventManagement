"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  ShieldOff,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryPill } from "@/components/shared/category-pill";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { api } from "@/trpc/react";

type StatusFilter = "all" | "draft" | "published" | "suspended";

const STATUS_BADGE: Record<string, string> = {
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  suspended: "border-red-200 bg-red-50 text-red-700",
};

export default function AdminListingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const utils = api.useUtils();

  const { data: listings, isLoading } = api.admin.listListings.useQuery({
    status: statusFilter,
    limit: 50,
  });

  const setStatusMutation = api.admin.setListingStatus.useMutation({
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = {
        published: "Listing published.",
        suspended: "Listing suspended.",
        draft: "Listing moved to draft.",
      };
      toast.success(labels[vars.status] ?? "Status updated.");
      void utils.admin.listListings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const setVerifiedMutation = api.admin.setVendorVerified.useMutation({
    onSuccess: (_, vars) => {
      toast.success(
        vars.isVerified ? "Vendor verified." : "Verification removed.",
      );
      void utils.admin.listListings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-200">
              <ListChecks className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Listings</h1>
              <p className="text-sm text-gray-500">
                Approve, suspend, and manage vendor listings
              </p>
            </div>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-44 rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listings</SelectItem>
              <SelectItem value="draft">Draft / Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-gray-100 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="w-72">Listing</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : listings?.map((l) => (
                    <TableRow key={l.id} className="hover:bg-gray-50/40">
                      {/* Title */}
                      <TableCell>
                        <div className="max-w-[260px]">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {l.title}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {l.slug}
                          </p>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <CategoryPill category={l.category} size="sm" />
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-sm font-medium text-gray-900">
                        {formatCurrency(l.basePrice)}{" "}
                        <span className="text-xs text-gray-400">
                          /{l.priceUnit}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[l.status] ?? STATUS_BADGE.draft}`}
                        >
                          {l.status}
                        </span>
                      </TableCell>

                      {/* Vendor */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-gray-700">
                            {l.vendor?.businessName ?? "—"}
                          </span>
                          {l.vendor?.isVerified && (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-xs text-gray-400">
                        {formatRelativeTime(l.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Publish */}
                          {l.status !== "published" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 rounded-lg border-emerald-200 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50"
                              disabled={setStatusMutation.isPending}
                              onClick={() =>
                                setStatusMutation.mutate({
                                  listingId: l.id,
                                  status: "published",
                                })
                              }
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Publish
                            </Button>
                          )}

                          {/* Suspend */}
                          {l.status !== "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 rounded-lg border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50"
                              disabled={setStatusMutation.isPending}
                              onClick={() =>
                                setStatusMutation.mutate({
                                  listingId: l.id,
                                  status: "suspended",
                                })
                              }
                            >
                              <XCircle className="h-3 w-3" />
                              Suspend
                            </Button>
                          )}

                          {/* Verify vendor */}
                          {l.vendor && (
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-7 gap-1 rounded-lg px-2.5 text-xs ${l.vendor.isVerified ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`}
                              disabled={setVerifiedMutation.isPending}
                              onClick={() =>
                                setVerifiedMutation.mutate({
                                  vendorId: l.vendor!.id,
                                  isVerified: !l.vendor!.isVerified,
                                })
                              }
                            >
                              {l.vendor.isVerified ? (
                                <>
                                  <ShieldOff className="h-3 w-3" /> Unverify
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3" /> Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {!isLoading && !listings?.length && (
            <p className="py-12 text-center text-sm text-gray-400">
              No listings found for the selected filter.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}