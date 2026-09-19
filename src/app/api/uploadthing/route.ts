import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing.server";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

// Re-export the type so consumers can still import it from this path
export type { OurFileRouter } from "@/lib/uploadthing.server";