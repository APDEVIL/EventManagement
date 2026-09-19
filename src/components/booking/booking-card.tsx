"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BookingStatusBadge } from "./booking-status-badge";
import {
  cn,
  formatCurrency,
  formatEventDate,
  formatRelativeTime,
  getImagePlaceholder,
  initials,
} from "@/lib/utils";
import { api } from "@/trpc/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingCardData {
  id: string;
  status: string;
  eventDate: Date | string;
  eventName: string;
  guestCount?: number | null;
  totalPrice: string | number;
  notes?: string | null;
  vendorNotes?: string | null;
  createdAt: Date | string;
  listing?: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    basePrice?: string | number;
    priceUnit?: string;
  } | null;
  vendor?: {
    id: string;
    businessName: string;
    slug: string;
    logoUrl?: string | null;
  } | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
  } | null;
}

interface BookingCardProps {
  booking: BookingCardData;
  /** "user" shows cancel; "vendor" shows confirm/decline/complete */
  perspective: "user" | "vendor";
  onMutated?: () => void;
  className?: string;
}

// ─── BookingCard ──────────────────────────────────────────────────────────────

/**
 * Booking row card used in both the user dashboard and vendor portal.
 * Perspective controls which action buttons are shown.
 *
 * User    → Cancel (pending / confirmed)
 * Vendor  → Confirm + Decline (pending) · Mark Complete (confirmed)
 *
 * @example user
 * <BookingCard booking={booking} perspective="user" />
 *
 * @example vendor
 * <BookingCard booking={booking} perspective="vendor" onMutated={refetch} />
 */
export function BookingCard({
  booking,
  perspective,
  onMutated,
  className,
}: BookingCardProps) {
  const utils = api.useUtils();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const coverImage =
    booking.listing?.images?.[0] ??
    getImagePlaceholder(booking.listing?.title ?? "E");

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = () => {
    void utils.booking.myBookings.invalidate();
    void utils.booking.vendorBookings.invalidate();
    onMutated?.();
  };

  const cancelMutation = api.booking.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled.");
      setCancelOpen(false);
      setCancelReason("");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const confirmMutation = api.booking.confirm.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed! The client has been notified.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const completeMutation = api.booking.complete.useMutation({
    onSuccess: () => {
      toast.success("Booking marked as complete.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const isBusy =
    cancelMutation.isPending ||
    confirmMutation.isPending ||
    completeMutation.isPending;

  const status = booking.status;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md",
          className,
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* ── Thumbnail ── */}
          <Link
            href={`/events/${booking.listing?.slug ?? "#"}`}
            className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 sm:h-auto sm:w-40"
          >
            <Image
              src={coverImage}
              alt={booking.listing?.title ?? "Listing"}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="160px"
            />
          </Link>

          {/* ── Main content ── */}
          <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/events/${booking.listing?.slug ?? "#"}`}
                  className="line-clamp-1 font-bold text-gray-900 hover:text-violet-700 transition-colors"
                >
                  {booking.listing?.title ?? "—"}
                </Link>

                {/* Sub-info by perspective */}
                {perspective === "user" && booking.vendor && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    by{" "}
                    <Link
                      href={`/vendors/${booking.vendor.slug}`}
                      className="font-medium text-violet-600 hover:underline"
                    >
                      {booking.vendor.businessName}
                    </Link>
                  </p>
                )}
                {perspective === "vendor" && booking.user && (
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={booking.user.image ?? ""} />
                      <AvatarFallback className="bg-violet-100 text-[9px] font-bold text-violet-700">
                        {initials(booking.user.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {booking.user.name ?? booking.user.email}
                    </span>
                  </div>
                )}
              </div>

              <BookingStatusBadge status={status} showDot size="md" />
            </div>

            {/* Event details row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                {formatEventDate(booking.eventDate)}
              </span>

              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <span className="text-gray-400">Event:</span>
                <span className="font-medium text-gray-900">
                  {booking.eventName}
                </span>
              </span>

              {booking.guestCount && (
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                  {booking.guestCount} guests
                </span>
              )}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <p className="text-sm italic leading-relaxed text-gray-500">
                  "{booking.notes}"
                </p>
              </div>
            )}

            {/* Vendor response notes */}
            {booking.vendorNotes && perspective === "user" && (
              <div className="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2.5">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                <div>
                  <p className="mb-0.5 text-xs font-semibold text-violet-600">
                    Vendor note
                  </p>
                  <p className="text-sm italic leading-relaxed text-violet-800">
                    "{booking.vendorNotes}"
                  </p>
                </div>
              </div>
            )}

            {/* Footer: price + actions */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3">
              {/* Total price */}
              <div>
                <span className="text-xs text-gray-400">Total</span>
                <p className="text-base font-bold text-gray-900">
                  {formatCurrency(booking.totalPrice)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">

                {/* ── User actions ── */}
                {perspective === "user" &&
                  (status === "pending" || status === "confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => setCancelOpen(true)}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Cancel Booking
                    </Button>
                  )}

                {/* ── Vendor actions ── */}
                {perspective === "vendor" && status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        confirmMutation.mutate({ bookingId: booking.id })
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {confirmMutation.isPending ? "Confirming…" : "Confirm"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => setDeclineOpen(true)}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </>
                )}

                {perspective === "vendor" && status === "confirmed" && (
                  <Button
                    size="sm"
                    disabled={isBusy}
                    onClick={() =>
                      completeMutation.mutate({ bookingId: booking.id })
                    }
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {completeMutation.isPending ? "Updating…" : "Mark Complete"}
                  </Button>
                )}

                {/* Booked timestamp */}
                <span className="text-xs text-gray-400">
                  Booked {formatRelativeTime(booking.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Cancel dialog (user) ── */}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel Booking"
        confirmVariant="destructive"
        reasonPlaceholder="Optional reason (e.g. change of plans)…"
        reason={cancelReason}
        onReasonChange={setCancelReason}
        isPending={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate({
            bookingId: booking.id,
            reason: cancelReason || undefined,
          })
        }
      />

      {/* ── Decline dialog (vendor) ── */}
      <ConfirmDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        title="Decline Booking"
        description="Please let the client know why you're declining. They'll receive a notification."
        confirmLabel="Decline Booking"
        confirmVariant="destructive"
        reasonPlaceholder="Reason for declining (e.g. date unavailable)…"
        reason={cancelReason}
        onReasonChange={setCancelReason}
        isPending={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate({
            bookingId: booking.id,
            reason: cancelReason || undefined,
          })
        }
      />
    </>
  );
}

// ─── Confirm / cancel dialog ──────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  reasonPlaceholder?: string;
  reason: string;
  onReasonChange: (v: string) => void;
  isPending: boolean;
  onConfirm: () => void;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  reasonPlaceholder,
  reason,
  onReasonChange,
  isPending,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {reasonPlaceholder && (
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            className="mt-2 resize-none"
          />
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Go Back
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isPending}
            className={
              confirmVariant === "destructive"
                ? ""
                : "bg-violet-600 hover:bg-violet-700"
            }
          >
            {isPending ? "Processing…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Booking list ─────────────────────────────────────────────────────────────

interface BookingListProps {
  bookings?: BookingCardData[];
  isLoading?: boolean;
  perspective: BookingCardProps["perspective"];
  onMutated?: () => void;
  skeletonCount?: number;
  emptyMessage?: string;
  className?: string;
}

/**
 * Vertical list of BookingCards with loading skeletons and empty state.
 *
 * @example
 * <BookingList bookings={data} perspective="user" isLoading={isLoading} />
 */
export function BookingList({
  bookings,
  isLoading = false,
  perspective,
  onMutated,
  skeletonCount = 3,
  emptyMessage = "No bookings found.",
  className,
}: BookingListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          perspective={perspective}
          onMutated={onMutated}
        />
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function BookingCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-gray-100 bg-white",
        className,
      )}
    >
      <div className="flex">
        <Skeleton className="h-40 w-40 shrink-0 rounded-none" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}