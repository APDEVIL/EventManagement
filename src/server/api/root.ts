import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { bookingRouter } from "./routers/booking";
import { listingRouter } from "./routers/listing";
import { reviewRouter } from "./routers/review";
import { userRouter } from "./routers/user";
import { vendorRouter } from "./routers/vendor";

export const appRouter = createTRPCRouter({
  user: userRouter,
  vendor: vendorRouter,
  listing: listingRouter,
  booking: bookingRouter,
  review: reviewRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);