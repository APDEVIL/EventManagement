import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// Import the type from the server file directly — no circular dependency
import type { OurFileRouter } from "@/lib/uploadthing.server";

// ─── Typed upload components ──────────────────────────────────────────────────

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// ─── Programmatic upload helpers ──────────────────────────────────────────────

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Re-export the type for convenience
export type { OurFileRouter };