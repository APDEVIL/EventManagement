"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

type UploadEndpoint = keyof OurFileRouter;

interface ImageUploadProps {
  /** Current image URLs already attached */
  value: string[];
  onChange: (urls: string[]) => void;
  endpoint: UploadEndpoint;
  /** Maximum number of images */
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Drag-and-drop image upload with preview grid.
 * Calls the UploadThing endpoint, then fires onChange with the new URL array.
 *
 * @example
 * <ImageUpload
 *   endpoint="listingImages"
 *   value={images}
 *   onChange={(urls) => form.setValue("images", urls)}
 *   maxImages={10}
 * />
 */
export function ImageUpload({
  value,
  onChange,
  endpoint,
  maxImages = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading } = useUpload({
    endpoint,
    onSuccess: (urls) => onChange([...value, ...urls]),
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
      const allowed = Array.from(files).slice(0, remaining);
      void upload(allowed);
    },
    [upload, value.length, maxImages],
  );

  function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const canAddMore = value.length < maxImages && !disabled;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <Image
                src={url}
                alt={`Upload ${i + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="120px"
              />
              {/* First image badge */}
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                  Cover
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className={cn(
                    "absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full",
                    "bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100",
                    "hover:bg-red-600",
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center gap-3",
            "rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-6 py-10",
            "text-center transition-all hover:border-violet-400 hover:bg-violet-50",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm font-medium text-violet-600">
                Uploading images…
              </p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 transition-colors group-hover:bg-violet-200">
                <ImagePlus className="h-7 w-7 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Drag & drop or{" "}
                  <span className="text-violet-600 underline-offset-2 hover:underline">
                    browse
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PNG, JPG, WEBP up to 4 MB each ·{" "}
                  {maxImages - value.length} remaining
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || isUploading}
      />
    </div>
  );
}