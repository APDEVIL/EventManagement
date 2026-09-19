import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  booking,
  listing,
  notification,
  vendorProfile,
} from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

// Helper: push a notification row (fire-and-forget, never throws)
async function pushNotification(
  db: any,
  payload: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
  },
) {
  try {
    await db.insert(notification).values(payload);
  } catch {
    // Notification failure must never break the primary operation
  }
}

export const bookingRouter = createTRPCRouter({
  // ─── User: get own bookings ──────────────────────────────────────────────────
  myBookings: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "confirmed", "cancelled", "completed", "all"])
          .default("all"),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(booking.userId, ctx.session.user.id)];
      if (input.status !== "all") {
        conditions.push(eq(booking.status, input.status));
      }

      return ctx.db.query.booking.findMany({
        where: and(...conditions),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(booking.createdAt)],
        with: {
          listing: {
            columns: {
              id: true,
              title: true,
              slug: true,
              images: true,
              basePrice: true,
              priceUnit: true,
            },
          },
          vendor: {
            columns: {
              id: true,
              businessName: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      });
    }),

  // ─── Vendor: get bookings for own listings ───────────────────────────────────
  vendorBookings: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "confirmed", "cancelled", "completed", "all"])
          .default("pending"),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "FORBIDDEN" });

      const conditions = [eq(booking.vendorId, vendor.id)];
      if (input.status !== "all") {
        conditions.push(eq(booking.status, input.status));
      }

      return ctx.db.query.booking.findMany({
        where: and(...conditions),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(booking.createdAt)],
        with: {
          listing: {
            columns: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    }),

  // ─── User: request a booking ─────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        listingId: z.string().uuid(),
        eventDate: z.coerce.date().refine((d) => d > new Date(), {
          message: "Event date must be in the future",
        }),
        eventName: z.string().min(3).max(150),
        guestCount: z.number().positive().optional(),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.listing.findFirst({
        where: and(
          eq(listing.id, input.listingId),
          eq(listing.status, "published"),
        ),
        with: { vendor: true },
      });

      if (!found) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found or not available",
        });
      }

      const [created] = await ctx.db
        .insert(booking)
        .values({
          listingId: found.id,
          userId: ctx.session.user.id,
          vendorId: found.vendorId,
          eventDate: input.eventDate,
          eventName: input.eventName,
          guestCount: input.guestCount,
          notes: input.notes,
          totalPrice: found.basePrice,
        })
        .returning();

      // Notify vendor
      await pushNotification(ctx.db, {
        userId: found.vendor.userId,
        type: "booking_received",
        title: "New booking request",
        message: `${input.eventName} — ${input.eventDate.toDateString()}`,
        relatedId: created!.id,
      });

      return created;
    }),

  // ─── Vendor: confirm booking ─────────────────────────────────────────────────
  confirm: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        vendorNotes: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "FORBIDDEN" });

      const found = await ctx.db.query.booking.findFirst({
        where: and(
          eq(booking.id, input.bookingId),
          eq(booking.vendorId, vendor.id),
          eq(booking.status, "pending"),
        ),
        with: { listing: true },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .update(booking)
        .set({
          status: "confirmed",
          vendorNotes: input.vendorNotes,
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(booking.id, input.bookingId));

      // Increment listing's booking count
      await ctx.db
        .update(listing)
        .set({ totalBookings: sql`${listing.totalBookings} + 1` })
        .where(eq(listing.id, found.listingId));

      // Notify user
      await pushNotification(ctx.db, {
        userId: found.userId,
        type: "booking_confirmed",
        title: "Booking confirmed!",
        message: `Your booking for "${found.listing.title}" has been confirmed.`,
        relatedId: found.id,
      });

      return { success: true };
    }),

  // ─── Cancel booking (user or vendor) ─────────────────────────────────────────
  cancel: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.booking.findFirst({
        where: eq(booking.id, input.bookingId),
        with: { vendor: true, listing: true },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      const isUser = found.userId === ctx.session.user.id;
      const isVendor = found.vendor.userId === ctx.session.user.id;

      if (!isUser && !isVendor) throw new TRPCError({ code: "FORBIDDEN" });
      if (found.status === "cancelled" || found.status === "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel this booking" });
      }

      await ctx.db
        .update(booking)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          vendorNotes: input.reason ?? found.vendorNotes,
          updatedAt: new Date(),
        })
        .where(eq(booking.id, input.bookingId));

      // Notify the other party
      const notifyUserId = isVendor ? found.userId : found.vendor.userId;
      await pushNotification(ctx.db, {
        userId: notifyUserId,
        type: "booking_cancelled",
        title: "Booking cancelled",
        message: `Booking for "${found.listing.title}" was cancelled.`,
        relatedId: found.id,
      });

      return { success: true };
    }),

  // ─── Vendor: mark booking as completed ───────────────────────────────────────
  complete: protectedProcedure
    .input(z.object({ bookingId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "FORBIDDEN" });

      const found = await ctx.db.query.booking.findFirst({
        where: and(
          eq(booking.id, input.bookingId),
          eq(booking.vendorId, vendor.id),
          eq(booking.status, "confirmed"),
        ),
        with: { listing: true },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .update(booking)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(booking.id, input.bookingId));

      // Prompt user to leave a review
      await pushNotification(ctx.db, {
        userId: found.userId,
        type: "review_prompt",
        title: "How was it?",
        message: `Leave a review for "${found.listing.title}"`,
        relatedId: found.listingId,
      });

      return { success: true };
    }),
});