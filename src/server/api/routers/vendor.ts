import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import { listing, user, vendorProfile } from "@/server/db/schema";
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

// Simple slug generator — replace spaces/special chars
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const vendorRouter = createTRPCRouter({
  // ─── Check if current user has a vendor profile ──────────────────────────────
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.vendorProfile.findFirst({
      where: eq(vendorProfile.userId, ctx.session.user.id),
      with: { listings: { limit: 5, orderBy: [desc(listing.createdAt)] } },
    });
  }),

  // ─── Public: get vendor by slug ──────────────────────────────────────────────
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.slug, input.slug),
        with: {
          user: {
            columns: { id: true, name: true, image: true, email: true },
          },
          listings: {
            where: eq(listing.status, "published"),
            orderBy: [desc(listing.createdAt)],
          },
        },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });
      return found;
    }),

  // ─── Public: list vendors with filters ───────────────────────────────────────
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(CATEGORY_VALUES).optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        verifiedOnly: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(12),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.category) conditions.push(eq(vendorProfile.category, input.category));
      if (input.city) conditions.push(ilike(vendorProfile.city, `%${input.city}%`));
      if (input.verifiedOnly) conditions.push(eq(vendorProfile.isVerified, true));
      if (input.search) {
        conditions.push(ilike(vendorProfile.businessName, `%${input.search}%`));
      }

      const [vendors, countResult] = await Promise.all([
        ctx.db.query.vendorProfile.findMany({
          where: conditions.length ? and(...conditions) : undefined,
          limit: input.limit,
          offset: input.offset,
          orderBy: [desc(vendorProfile.averageRating)],
          with: {
            user: { columns: { id: true, name: true, image: true } },
          },
        }),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(vendorProfile)
          .where(conditions.length ? and(...conditions) : undefined),
      ]);

      return {
        vendors,
        total: countResult[0]?.count ?? 0,
        hasMore: input.offset + input.limit < (countResult[0]?.count ?? 0),
      };
    }),

  // ─── Create vendor profile (user becomes vendor) ─────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2).max(120),
        description: z.string().max(1000).optional(),
        category: z.enum(CATEGORY_VALUES),
        logoUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
        website: z.string().url().optional(),
        city: z.string().max(100).optional(),
        address: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only one vendor profile per user
      const existing = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Vendor profile already exists",
        });
      }

      // Generate unique slug
      let slug = toSlug(input.businessName);
      const slugExists = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.slug, slug),
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;

      const [created] = await ctx.db
        .insert(vendorProfile)
        .values({
          userId: ctx.session.user.id,
          slug,
          ...input,
        })
        .returning();

      // Promote user role to vendor
      await ctx.db
        .update(user)
        .set({ role: "vendor", updatedAt: new Date() })
        .where(eq(user.id, ctx.session.user.id));

      return created;
    }),

  // ─── Update own vendor profile ───────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2).max(120).optional(),
        description: z.string().max(1000).optional(),
        category: z.enum(CATEGORY_VALUES).optional(),
        logoUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
        website: z.string().url().optional(),
        city: z.string().max(100).optional(),
        address: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendorProfile.findFirst({
        where: eq(vendorProfile.userId, ctx.session.user.id),
      });
      if (!vendor) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .update(vendorProfile)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(vendorProfile.id, vendor.id));

      return { success: true };
    }),
});