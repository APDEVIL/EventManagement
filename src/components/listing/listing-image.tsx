"use client";

import Image from "next/image";
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import { MAX_LISTING_IMAGES } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingImageProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
}

// ─── ListingImage ─────────────────────────────────────────────────────────────

/**
 * Image management panel for listing create/edit forms.
 *
 * Features:
 * - Drag-and-drop file upload via UploadThing (listingImages endpoint)
 * - Drag-to-reorder grid items via native HTML5 drag events
 * - Per-image "Set as Cover" and "Remove" actions on hover
 * - Cover badge (star icon) on the first image
 * - Remaining slots counter
 *
 * @example
 * <ListingImage
 *   value={form.watch("images")}
 *   onChange={(urls) => form.setValue("images", urls)}
 * />
 */
export function ListingImage({
  value,
  onChange,
  disabled = false,
  className,
}: ListingImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag-to-reorder state
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Upload
  const { upload, isUploading } = useUpload({
    endpoint: "listingImages",
    onSuccess: (urls) => {
      const next = [...value, ...urls].slice(0, MAX_LISTING_IMAGES);
      onChange(next);
    },
  });

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const remaining = MAX_LISTING_IMAGES - value.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_LISTING_IMAGES} images allowed`);
        return;
      }
      void upload(Array.from(files).slice(0, remaining));
    },
    [upload, value.length],
  );

  function handleDropUpload(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // Ignore drop if we're currently reordering
    if (draggingIdx !== null) return;
    handleFiles(e.dataTransfer.files);
  }

  // ── Per-image actions ──────────────────────────────────────────────────────

  function removeImage(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function setCover(idx: number) {
    if (idx === 0) return;
    const next = [...value];
    const [item] = next.splice(idx, 1);
    next.unshift(item!);
    onChange(next);
    toast.success("Cover image updated");
  }

  // ── Drag-to-reorder ────────────────────────────────────────────────────────

  function onItemDragStart(idx: number) {
    setDraggingIdx(idx);
  }

  function onItemDragEnter(idx: number) {
    if (draggingIdx === null || draggingIdx === idx) return;
    setDragOverIdx(idx);
  }

  function onItemDragEnd() {
    if (
      draggingIdx !== null &&
      dragOverIdx !== null &&
      draggingIdx !== dragOverIdx
    ) {
      const next = [...value];
      const [moved] = next.splice(draggingIdx, 1);
      next.splice(dragOverIdx, 0, moved!);
      onChange(next);
    }
    setDraggingIdx(null);
    setDragOverIdx(null);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const canAddMore = value.length < MAX_LISTING_IMAGES && !disabled;
  const remaining = MAX_LISTING_IMAGES - value.length;

  return (
    <div className={cn("space-y-4", className)}>

      {/* ── Image grid ── */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {value.map((url, idx) => (
            <div
              key={url}
              draggable={!disabled}
              onDragStart={() => onItemDragStart(idx)}
              onDragEnter={() => onItemDragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={onItemDragEnd}
              className={cn(
                "group relative aspect-square cursor-grab overflow-hidden rounded-2xl border-2 bg-gray-50 transition-all active:cursor-grabbing",
                idx === 0
                  ? "border-violet-400 shadow-md shadow-violet-200/50"
                  : "border-transparent hover:border-violet-200",
                draggingIdx === idx && "scale-95 opacity-40 shadow-none",
                dragOverIdx === idx &&
                  draggingIdx !== idx &&
                  "scale-[1.04] border-violet-500 shadow-lg shadow-violet-200/60",
                disabled && "cursor-default",
              )}
            >
              {/* Image */}
              <Image
                src={url}
                alt={`Listing image ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                draggable={false}
              />

              {/* Cover badge */}
              {idx === 0 && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-sm">
                  <Star className="h-2.5 w-2.5 fill-white text-white" />
                  Cover
                </div>
              )}

              {/* Drag handle */}
              {!disabled && (
                <div className="absolute right-1.5 top-1.5 rounded-lg bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Hover overlay — actions */}
              {!disabled && (
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl",
                    "bg-black/0 opacity-0 transition-all duration-200",
                    "group-hover:bg-black/45 group-hover:opacity-100",
                  )}
                >
                  {idx !== 0 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCover(idx);
                      }}
                      className="h-7 rounded-lg bg-white/90 px-3 text-[11px] font-semibold text-violet-700 shadow-sm hover:bg-white"
                    >
                      Set Cover
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="h-7 rounded-lg bg-red-500/90 px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-red-600"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Upload zone ── */}
      {canAddMore && (
        <div
          onDrop={handleDropUpload}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl",
            "border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-10 text-center",
            "transition-all hover:border-violet-400 hover:bg-violet-50",
            isUploading && "pointer-events-none cursor-default opacity-70",
          )}
        >
          {isUploading ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
              </div>
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
                  <span className="text-violet-600 underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PNG, JPG, WEBP · Max 4 MB each ·{" "}
                  <span className="font-medium text-violet-500">
                    {remaining} slot{remaining !== 1 ? "s" : ""} remaining
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Reorder hint */}
      {value.length > 1 && !disabled && (
        <p className="text-center text-xs text-gray-400">
          Drag images to reorder · First image becomes the cover
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}