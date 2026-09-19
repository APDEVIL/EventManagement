"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { StarRating } from "@/components/review/star-rating";
import { formatRelativeTime, initials, truncate } from "@/lib/utils";
import { api } from "@/trpc/react";

type VisibilityFilter = "all" | "visible" | "hidden";

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const utils = api.useUtils();

  const visibleParam =
    filter === "visible" ? true : filter === "hidden" ? false : undefined;

  const { data: reviews, isLoading } = api.admin.listReviews.useQuery({
    visible: visibleParam,
    limit: 50,
  });

  const setVisibleMutation = api.admin.setReviewVisible.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.isVisible ? "Review shown." : "Review hidden.");
      void utils.admin.listReviews.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/60 via-white to-violet-50/40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
              <p className="text-sm text-gray-500">
                Moderate reviews and manage visibility
              </p>
            </div>
          </div>

          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as VisibilityFilter)}
          >
            <SelectTrigger className="w-40 rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-gray-100 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead>Reviewer</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead className="w-32">Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
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
                : reviews?.map((r) => {
                    // admin.listReviews selects id/name/email on user.
                    // image is not in the column selection — access safely via cast
                    const reviewUser = r.user as {
                      id: string;
                      name?: string | null;
                      email?: string | null;
                      image?: string | null;
                    } | null;

                    return (
                      <TableRow
                        key={r.id}
                        className="hover:bg-gray-50/40 align-top"
                      >
                        {/* Reviewer */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reviewUser?.image ?? ""} />
                              <AvatarFallback className="bg-violet-100 text-xs font-bold text-violet-700">
                                {initials(reviewUser?.name ?? "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {reviewUser?.name ?? "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {reviewUser?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Listing */}
                        <TableCell>
                          <p className="text-sm font-medium text-gray-900">
                            {r.listing?.title ?? "—"}
                          </p>
                        </TableCell>

                        {/* Rating */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StarRating value={r.rating} readonly size="xs" />
                            <span className="text-sm font-semibold text-gray-900">
                              {r.rating}
                            </span>
                          </div>
                        </TableCell>

                        {/* Review body */}
                        <TableCell className="max-w-xs">
                          {r.title && (
                            <p className="mb-0.5 text-xs font-semibold text-gray-700">
                              {r.title}
                            </p>
                          )}
                          <p className="text-xs leading-relaxed text-gray-500">
                            {truncate(r.body, 120)}
                          </p>
                        </TableCell>

                        {/* Visibility */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${r.isVisible ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
                          >
                            {r.isVisible ? (
                              <>
                                <Eye className="h-2.5 w-2.5" /> Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-2.5 w-2.5" /> Hidden
                              </>
                            )}
                          </span>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-gray-400">
                          {formatRelativeTime(r.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={setVisibleMutation.isPending}
                            onClick={() =>
                              setVisibleMutation.mutate({
                                reviewId: r.id,
                                isVisible: !r.isVisible,
                              })
                            }
                            className={`h-7 gap-1 rounded-lg px-2.5 text-xs ${r.isVisible ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                          >
                            {r.isVisible ? (
                              <>
                                <EyeOff className="h-3 w-3" /> Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" /> Show
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>

          {!isLoading && !reviews?.length && (
            <p className="py-12 text-center text-sm text-gray-400">
              No reviews found for the selected filter.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}