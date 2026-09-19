import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { listing, vendorProfile } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

const CATEGORY_VALUES = [
  "venue",
  "catering",
  "photography",
  "music",
  "decoration",
  "transportation",
  "planning",
  "other",
] as const;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Helper: assert caller owns the listing's vendor profile
async function assertOwner(
  ctx: { db: { query: { listing: { findFirst: Function }; vendorProfile: { findFirst: Function } } }; session: { user: { id: string } } },
  listingId: string,
) {
  const found = await ctx.db.query.listing.findFirst({
    where: eq(listing.id, listingId),
    with: { vendor: true },
  });
  if (!found) throw new TRPCError({ code: "NOT_FOUND" });
  if (found.vendor.userId !== ctx.session.user.id) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return found;
}

export const listingRouter = createTRPCRouter({
  // ─── Public: paginated listings with search & filter ────────────────────────
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(CATEGORY_VALUES).optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z
          .enum(["newest", "price_asc", "price_desc", "rating"])
          .default("newest"),
        limit: z.number().min(1).max(50).default(12),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(listing.status, "published")];

      if (input.category) conditions.push(eq(listing.category, input.category));
      if (input.city) conditions.push(ilike(listing.city, `%${input.city}%`));
      if (input.minPrice !== undefined) {
        conditions.push(gte(listing.basePrice, String(input.minPrice)));
      }
      if (input.maxPrice !== undefined) {
        conditions.push(lte(listing.basePrice, String(input.maxPrice)));
      }
      if (input.search) {
        conditions.push(
          or(
            ilike(listing.title, `%${input.search}%`),
            ilike(listing.description, `%${input.search}%`),
          )!,
        );
      }

      const orderMap = {
        newest: [desc(listing.createdAt)],
        price_asc: [asc(listing.basePrice)],
        price_desc: [desc(listing.basePrice)],
        rating: [desc(listing.averageRating)],
      };

      const [listings, countResult] = await Promise.all([
        ctx.db.query.listing.findMany({
          where: and(...conditions),
          limit: input.limit,
          offset: input.offset,
          orderBy: orderMap[input.sortBy],
          with: {
            vendor: {
              columns: {
                id: true,
                businessName: true,
                slug: true,
                logoUrl: true,
                isVerified: true,
                city: true,
              },
            },
          },
        }),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(listing)
          .where(and(...conditions)),
      ]);

      return {
        listings,
        total: countResult[0]?.count ?? 0,
        hasMore: input.offset + input.limit < (countResult[0]?.count ?? 0),
      };
    }),

  // ─── Public: single listing by slug ─────────────────────────────────────────
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.listing.findFirst({
        where: and(
          eq(listing.slug, input.slug),
          eq(listing.status, "published"),
        ),
        with: {
          vendor: {
            with: {
              user: { columns: { id: true, name: true, image: true } },
            },
          },
          reviews: {
            where: (r, { eq }) => eq(r.isVisible, true),
            limit: 10,
            orderBy: (r, { desc }) => [desc(r.createdAt)],
            with: {
              user: { columns: { id: true, name: true, image: true } },
            },
          },
        },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });
      return found;
    }),

  // ─── Vendor: own listings (all statuses) ─────────────────────────────────────
  myListings: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "suspended", "all"]).default("all"),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "FORBIDDEN", message: "Vendor profile required" });

      const conditions = [eq(listing.vendorId, vendor.id)];
      if (input.status !== "all") {
        conditions.push(eq(listing.status, input.status));
      }

      return ctx.db.query.listing.findMany({
        where: and(...conditions),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(listing.updatedAt)],
      });
    }),

  // ─── Vendor: create listing ───────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(150),
        description: z.string().min(20).max(3000),
        category: z.enum(CATEGORY_VALUES),
        tags: z.array(z.string().max(30)).max(10).default([]),
        images: z.array(z.string().url()).max(10).default([]),
        basePrice: z.number().positive(),
        priceUnit: z.string().default("event"),
        city: z.string().max(100).optional(),
        address: z.string().max(255).optional(),
        capacity: z.number().positive().optional(),
        status: z.enum(["draft", "published"]).default("draft"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "FORBIDDEN", message: "Vendor profile required" });

      let slug = toSlug(input.title);
      const slugExists = await ctx.db.query.listing.findFirst({
        where: eq(listing.slug, slug),
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;

      const [created] = await ctx.db
        .insert(listing)
        .values({
          vendorId: vendor.id,
          slug,
          ...input,
          basePrice: String(input.basePrice),
        })
        .returning();

      return created;
    }),

  // ─── Vendor: update listing ───────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(5).max(150).optional(),
        description: z.string().min(20).max(3000).optional(),
        category: z.enum(CATEGORY_VALUES).optional(),
        tags: z.array(z.string().max(30)).max(10).optional(),
        images: z.array(z.string().url()).max(10).optional(),
        basePrice: z.number().positive().optional(),
        priceUnit: z.string().optional(),
        city: z.string().max(100).optional(),
        address: z.string().max(255).optional(),
        capacity: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, basePrice, ...rest } = input;
      await assertOwner(ctx as any, id);

      await ctx.db
        .update(listing)
        .set({
          ...rest,
          ...(basePrice !== undefined ? { basePrice: String(basePrice) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(listing.id, id));

      return { success: true };
    }),

  // ─── Vendor: toggle draft / published ────────────────────────────────────────
  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx as any, input.id);

      await ctx.db
        .update(listing)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(listing.id, input.id));

      return { success: true };
    }),

  // ─── Vendor: delete listing ───────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx as any, input.id);
      await ctx.db.delete(listing).where(eq(listing.id, input.id));
      return { success: true };
    }),
});