import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import {
  booking,
  listing,
  review,
  user,
  vendorProfile,
} from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

/**
 * Read role directly from the DB row — better-auth's session type does not
 * expose additionalFields on `ctx.session.user`, so we always do a fresh
 * lookup instead of casting the session object.
 */
async function assertAdmin(db: any, userId: string) {
  const found = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { role: true },
  });
  if (found?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

export const adminRouter = createTRPCRouter({
  // ─── Dashboard stats ─────────────────────────────────────────────────────────
  stats: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx.db, ctx.session.user.id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      [totalUsers],
      [totalVendors],
      [totalListings],
      [totalBookings],
      [recentBookings],
      [pendingListings],
    ] = await Promise.all([
      ctx.db.select({ count: count() }).from(user),
      ctx.db.select({ count: count() }).from(vendorProfile),
      ctx.db.select({ count: count() }).from(listing),
      ctx.db.select({ count: count() }).from(booking),
      ctx.db
        .select({ count: count() })
        .from(booking)
        .where(gte(booking.createdAt, thirtyDaysAgo)),
      ctx.db
        .select({ count: count() })
        .from(listing)
        .where(eq(listing.status, "draft")),
    ]);

    return {
      totalUsers: totalUsers?.count ?? 0,
      totalVendors: totalVendors?.count ?? 0,
      totalListings: totalListings?.count ?? 0,
      totalBookings: totalBookings?.count ?? 0,
      recentBookings: recentBookings?.count ?? 0,
      pendingListings: pendingListings?.count ?? 0,
    };
  }),

  // ─── Users ───────────────────────────────────────────────────────────────────
  listUsers: protectedProcedure
    .input(
      z.object({
        role: z.enum(["user", "vendor", "admin", "all"]).default("all"),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      return ctx.db.query.user.findMany({
        where:
          input.role !== "all"
            ? eq(user.role, input.role as "user" | "vendor" | "admin")
            : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(user.createdAt)],
        with: { vendorProfile: true },
      });
    }),

  setUserActive: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      await ctx.db
        .update(user)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(user.id, input.userId));

      return { success: true };
    }),

  setUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "vendor", "admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      await ctx.db
        .update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId));

      return { success: true };
    }),

  // ─── Listings ─────────────────────────────────────────────────────────────────
  listListings: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["draft", "published", "suspended", "all"])
          .default("all"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      const conditions =
        input.status !== "all"
          ? [eq(listing.status, input.status as "draft" | "published" | "suspended")]
          : undefined;

      return ctx.db.query.listing.findMany({
        where: conditions ? and(...conditions) : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(listing.createdAt)],
        with: {
          vendor: {
            columns: {
              id: true,
              businessName: true,
              slug: true,
              isVerified: true,
            },
          },
        },
      });
    }),

  setListingStatus: protectedProcedure
    .input(
      z.object({
        listingId: z.string().uuid(),
        status: z.enum(["published", "suspended", "draft"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      await ctx.db
        .update(listing)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(listing.id, input.listingId));

      return { success: true };
    }),

  // ─── Vendor verification ──────────────────────────────────────────────────────
  setVendorVerified: protectedProcedure
    .input(
      z.object({
        vendorId: z.string().uuid(),
        isVerified: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      await ctx.db
        .update(vendorProfile)
        .set({ isVerified: input.isVerified, updatedAt: new Date() })
        .where(eq(vendorProfile.id, input.vendorId));

      return { success: true };
    }),

  // ─── Reviews moderation ───────────────────────────────────────────────────────
  listReviews: protectedProcedure
    .input(
      z.object({
        visible: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      return ctx.db.query.review.findMany({
        where:
          input.visible !== undefined
            ? eq(review.isVisible, input.visible)
            : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(review.createdAt)],
        with: {
          user: { columns: { id: true, name: true, email: true } },
          listing: { columns: { id: true, title: true, slug: true } },
        },
      });
    }),

  setReviewVisible: protectedProcedure
    .input(
      z.object({
        reviewId: z.string().uuid(),
        isVisible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      const found = await ctx.db.query.review.findFirst({
        where: eq(review.id, input.reviewId),
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .update(review)
        .set({ isVisible: input.isVisible })
        .where(eq(review.id, input.reviewId));

      // Inline rating resync (avoids circular import with review.ts)
      const [agg] = await ctx.db
        .select({
          avg: sql<string>`avg(${review.rating})`,
          total: sql<number>`count(${review.id})::int`,
        })
        .from(review)
        .where(and(eq(review.listingId, found.listingId), eq(review.isVisible, true)));

      await ctx.db
        .update(listing)
        .set({
          averageRating: String(agg?.avg ? Number(Number(agg.avg).toFixed(2)) : 0),
          totalReviews: agg?.total ?? 0,
        })
        .where(eq(listing.id, found.listingId));

      return { success: true };
    }),

  // ─── Booking reports ──────────────────────────────────────────────────────────
  bookingReport: protectedProcedure
    .input(
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertAdmin(ctx.db, ctx.session.user.id);

      return ctx.db.query.booking.findMany({
        where: and(
          gte(booking.createdAt, input.from),
          lte(booking.createdAt, input.to),
        ),
        orderBy: [desc(booking.createdAt)],
        with: {
          listing: { columns: { id: true, title: true } },
          user: { columns: { id: true, name: true, email: true } },
          vendor: { columns: { id: true, businessName: true } },
        },
      });
    }),
});