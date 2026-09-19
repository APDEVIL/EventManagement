"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { bookingSchema, type BookingInput } from "@/lib/validations";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingFormProps {
  listing: {
    id: string;
    title: string;
    basePrice: string | number;
    priceUnit: string;
    capacity?: number | null;
    city?: string | null;
    vendor?: {
      businessName: string;
      isVerified?: boolean;
    } | null;
  };
  /** Custom trigger element — defaults to a full-width "Book Now" button */
  trigger?: React.ReactNode;
  className?: string;
}

// ─── BookingForm ──────────────────────────────────────────────────────────────

/**
 * Booking request modal dialog.
 * Opens over any page — no navigation required.
 *
 * Flow:
 *   1. Form — event name, date picker, guest count, notes
 *   2. Success screen — confirmation with "View Bookings" CTA
 *
 * @example with default trigger
 * <BookingForm listing={listing} />
 *
 * @example with custom trigger
 * <BookingForm listing={listing} trigger={<Button>Request</Button>} />
 */
export function BookingForm({ listing, trigger, className }: BookingFormProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const utils = api.useUtils();

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      listingId: listing.id,
      eventName: "",
      guestCount: undefined,
      notes: "",
    },
  });

  const mutation = api.booking.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      void utils.booking.myBookings.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(data: BookingInput) {
    mutation.mutate(data);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Delay reset until after dialog close animation
      setTimeout(() => {
        form.reset({ listingId: listing.id, eventName: "", notes: "" });
        setSubmitted(false);
      }, 300);
    }
  }

  const price = parseFloat(String(listing.basePrice));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* ── Trigger ── */}
      <DialogTrigger asChild className={className}>
        {trigger ?? (
          <Button
            size="lg"
            className="w-full rounded-xl bg-violet-600 text-base font-semibold shadow-lg shadow-violet-200 hover:bg-violet-700"
          >
            Book Now
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      {/* ── Dialog ── */}
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        {submitted ? (
          <SuccessScreen
            listingTitle={listing.title}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <BookingFormContent
            listing={listing}
            price={price}
            form={form}
            mutation={mutation}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Form content ─────────────────────────────────────────────────────────────

function BookingFormContent({
  listing,
  price,
  form,
  mutation,
  onSubmit,
}: {
  listing: BookingFormProps["listing"];
  price: number;
  form: ReturnType<typeof useForm<BookingInput>>;
  mutation: ReturnType<typeof api.booking.create.useMutation>;
  onSubmit: (data: BookingInput) => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Request a Booking</DialogTitle>
        {/* Listing summary */}
        <div className="mt-2 space-y-0.5">
          <p className="font-semibold text-gray-900">{listing.title}</p>
          {listing.vendor && (
            <p className="text-sm text-gray-500">
              by {listing.vendor.businessName}
              {listing.vendor.isVerified && (
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  ✓ Verified
                </span>
              )}
            </p>
          )}
        </div>
      </DialogHeader>

      {/* Price summary banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3.5 ring-1 ring-violet-100">
        <div>
          <p className="text-xs font-medium text-violet-600">Starting from</p>
          <p className="text-xl font-bold text-violet-900">
            {formatCurrency(price)}
            <span className="ml-1 text-sm font-normal text-violet-500">
              / {listing.priceUnit}
            </span>
          </p>
        </div>
        {listing.city && (
          <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-100">
            📍 {listing.city}
          </span>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Event name */}
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Priya & Rahul's Wedding Reception"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event date */}
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-violet-400" />
                        {field.value
                          ? format(field.value, "EEEE, d MMMM yyyy")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest count */}
          <FormField
            control={form.control}
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expected Guests
                  {listing.capacity && (
                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                      (venue max: {listing.capacity})
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Optional"
                      min={1}
                      max={listing.capacity ?? undefined}
                      className="pl-9"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Dietary restrictions, theme preferences, accessibility needs, specific requests…"
                    rows={3}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/1000 · The vendor will see this
                  when reviewing your request.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Disclaimer */}
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-100">
            <span className="font-semibold">No payment yet.</span> Your booking
            is confirmed only after the vendor accepts. We'll notify you as soon
            as they respond.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-violet-600 text-base font-semibold hover:bg-violet-700"
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request…
              </>
            ) : (
              "Send Booking Request"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  listingTitle,
  onClose,
}: {
  listingTitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {/* Animated ring + check */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-60" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
          <CheckCircle2 className="h-11 w-11 text-emerald-500" />
        </div>
      </div>

      {/* Message */}
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Request Sent!</h3>
        <p className="text-sm leading-relaxed text-gray-500">
          Your booking request for{" "}
          <span className="font-semibold text-gray-700">
            "{listingTitle}"
          </span>{" "}
          has been sent. You'll receive a notification once the vendor responds.
        </p>
      </div>

      {/* What happens next */}
      <div className="w-full rounded-2xl bg-gray-50 p-4 text-left ring-1 ring-gray-100">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          What happens next
        </p>
        <ol className="space-y-2">
          {[
            "Vendor reviews your request",
            "You get notified of confirmation",
            "Discuss details directly with vendor",
          ].map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* CTAs */}
      <div className="flex w-full flex-col gap-2.5">
        <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
          <a href="/bookings">View My Bookings</a>
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-gray-500 hover:text-gray-700"
        >
          Continue Browsing
        </Button>
      </div>
    </div>
  );
}