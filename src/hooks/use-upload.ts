"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

type Endpoint = keyof OurFileRouter;

interface UseUploadOptions {
  endpoint: Endpoint;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Thin wrapper around useUploadThing that manages local loading/error state,
 * fires sonner toasts, and returns a clean `upload(files)` function.
 *
 * @example
 * const { upload, isUploading } = useUpload({
 *   endpoint: "listingImages",
 *   onSuccess: (urls) => form.setValue("images", urls),
 * });
 */
export function useUpload({ endpoint, onSuccess, onError }: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const uploadedUrls = res.map((r) => r.url);
      setUrls(uploadedUrls);
      setIsUploading(false);
      toast.success(
        uploadedUrls.length === 1
          ? "Image uploaded successfully"
          : `${uploadedUrls.length} images uploaded`,
      );
      onSuccess?.(uploadedUrls);
    },
    onUploadError: (err) => {
      setError(err);
      setIsUploading(false);
      toast.error(err.message ?? "Upload failed. Please try again.");
      onError?.(err);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setError(null);
    },
  });

  async function upload(files: File[]) {
    if (!files.length) return;
    setIsUploading(true);
    await startUpload(files);
  }

  return { upload, isUploading, urls, error };
}