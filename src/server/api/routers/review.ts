import { TRPCError } from "@trpc/server";
import { and, avg, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { booking, listing, review, vendorProfile } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

// Recalculate and persist aggregated rating on listing + vendor
async function syncRatings(db: any, listingId: string) {
  const [agg] = await db
    .select({
      avg: avg(review.rating),
      total: count(review.id),
    })
    .from(review)
    .where(and(eq(review.listingId, listingId), eq(review.isVisible, true)));

  const avgRating = agg?.avg ? Number(Number(agg.avg).toFixed(2)) : 0;
  const totalReviews = agg?.total ?? 0;

  await db
    .update(listing)
    .set({ averageRating: String(avgRating), totalReviews })
    .where(eq(listing.id, listingId));

  // Also update vendor aggregate
  const found = await db.query.listing.findFirst({
    where: eq(listing.id, listingId),
    columns: { vendorId: true },
  });
  if (!found) return;

  const [vendorAgg] = await db
    .select({
      avg: avg(review.rating),
      total: count(review.id),
    })
    .from(review)
    .innerJoin(listing, eq(review.listingId, listing.id))
    .where(
      and(
        eq(listing.vendorId, found.vendorId),
        eq(review.isVisible, true),
      ),
    );

  await db
    .update(vendorProfile)
    .set({
      averageRating: String(
        vendorAgg?.avg ? Number(Number(vendorAgg.avg).toFixed(2)) : 0,
      ),
      totalReviews: vendorAgg?.total ?? 0,
    })
    .where(eq(vendorProfile.id, found.vendorId));
}

export const reviewRouter = createTRPCRouter({
  // ─── Public: paginated reviews for a listing ────────────────────────────────
  forListing: publicProcedure
    .input(
      z.object({
        listingId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.review.findMany({
        where: and(
          eq(review.listingId, input.listingId),
          eq(review.isVisible, true),
        ),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(review.createdAt)],
        with: {
          user: { columns: { id: true, name: true, image: true } },
        },
      });
    }),

  // ─── User: create review (must have completed booking) ──────────────────────
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(120).optional(),
        body: z.string().min(10).max(1500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the booking belongs to this user and is completed
      const found = await ctx.db.query.booking.findFirst({
        where: and(
          eq(booking.id, input.bookingId),
          eq(booking.userId, ctx.session.user.id),
          eq(booking.status, "completed"),
        ),
      });
      if (!found) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Completed booking required to leave a review",
        });
      }

      // One review per booking (booking.id is a unique FK on review)
      const existing = await ctx.db.query.review.findFirst({
        where: eq(review.bookingId, input.bookingId),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this booking",
        });
      }

      const [created] = await ctx.db
        .insert(review)
        .values({
          listingId: found.listingId,
          userId: ctx.session.user.id,
          bookingId: input.bookingId,
          rating: input.rating,
          title: input.title,
          body: input.body,
        })
        .returning();

      // Sync aggregated ratings
      await syncRatings(ctx.db, found.listingId);

      return created;
    }),

  // ─── User: delete own review ─────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ reviewId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.review.findFirst({
        where: and(
          eq(review.id, input.reviewId),
          eq(review.userId, ctx.session.user.id),
        ),
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.delete(review).where(eq(review.id, input.reviewId));
      await syncRatings(ctx.db, found.listingId);

      return { success: true };
    }),
});