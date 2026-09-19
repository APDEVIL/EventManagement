import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { notification, user } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
  // ─── Get current session user ───────────────────────────────────────────────
  me: protectedProcedure.query(async ({ ctx }) => {
    const found = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      with: {
        vendorProfile: true,
      },
    });
    if (!found) throw new TRPCError({ code: "NOT_FOUND" });
    return found;
  }),

  // ─── Get public user profile by id ──────────────────────────────────────────
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.user.findFirst({
        where: and(eq(user.id, input.id), eq(user.isActive, true)),
        columns: {
          id: true,
          name: true,
          image: true,
          city: true,
          bio: true,
          createdAt: true,
          role: true,
        },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });
      return found;
    }),

  // ─── Update own profile ──────────────────────────────────────────────────────
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80).optional(),
        bio: z.string().max(500).optional(),
        phone: z.string().max(20).optional(),
        city: z.string().max(100).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(user.id, ctx.session.user.id));
      return { success: true };
    }),

  // ─── Notifications ───────────────────────────────────────────────────────────
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notification.userId, ctx.session.user.id)];
      if (input.unreadOnly) {
        conditions.push(eq(notification.isRead, false));
      }
      return ctx.db.query.notification.findMany({
        where: and(...conditions),
        orderBy: [desc(notification.createdAt)],
        limit: input.limit,
      });
    }),

  markNotificationsRead: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.ids.map((id) =>
          ctx.db
            .update(notification)
            .set({ isRead: true })
            .where(
              and(
                eq(notification.id, id),
                eq(notification.userId, ctx.session.user.id),
              ),
            ),
        ),
      );
      return { success: true };
    }),

  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.userId, ctx.session.user.id));
    return { success: true };
  }),
});