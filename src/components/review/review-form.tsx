"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StarRating, RATING_LABELS } from "./star-rating";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { getErrorMessage } from "@/lib/utils";
import { api } from "@/trpc/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewFormProps {
  bookingId: string;
  listingTitle?: string;
  /** Called after successful submission */
  onSuccess?: () => void;
  className?: string;
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────

/**
 * Review creation form. Requires a completed booking.
 * Shows a success confirmation screen after submission.
 *
 * @example
 * <ReviewForm
 *   bookingId={booking.id}
 *   listingTitle={booking.listing.title}
 *   onSuccess={() => router.refresh()}
 * />
 */
export function ReviewForm({
  bookingId,
  listingTitle,
  onSuccess,
  className,
}: ReviewFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const utils = api.useUtils();

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      bookingId,
      rating: 0,
      title: "",
      body: "",
    },
  });

  const mutation = api.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted — thank you!");
      void utils.review.forListing.invalidate();
      setSubmitted(true);
      onSuccess?.();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const ratingValue = form.watch("rating");

  // ─── Success screen ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <Card className="flex flex-col items-center gap-4 border border-emerald-100 bg-emerald-50/60 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Review published!</p>
          <p className="mt-1 text-sm text-gray-500">
            Your feedback helps other clients make great choices.
          </p>
        </div>
      </Card>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────────

  return (
    <Card className={className}>
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900">
            Write a Review
          </h3>
          {listingTitle && (
            <p className="mt-0.5 text-sm text-gray-500">
              For:{" "}
              <span className="font-medium text-gray-700">{listingTitle}</span>
            </p>
          )}
        </div>

        <Separator className="mb-5" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            {/* ── Star rating ── */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        size="lg"
                      />
                      {ratingValue > 0 && (
                        <span className="text-sm font-semibold text-amber-600">
                          {RATING_LABELS[ratingValue]}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Title ── */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summarise your experience in one line…"
                      maxLength={120}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional · {field.value?.length ?? 0}/120
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Body ── */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell others what you liked, what could be better, and any tips for future clients…"
                      rows={5}
                      className="resize-none"
                      maxLength={1500}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/1500 · Minimum 10 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Disclaimer ── */}
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-400">
              Reviews are public. By submitting, you confirm this reflects your
              honest experience and agree to our community guidelines.
            </p>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={mutation.isPending || ratingValue === 0}
              className="w-full bg-violet-600 hover:bg-violet-700 sm:w-auto"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}