"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DollarSign,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Save,
  Tag,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ListingImage } from "./listing-image";
import { CATEGORIES, PRICE_UNITS } from "@/lib/constants";
import { listingSchema, type ListingInput } from "@/lib/validations";
import { cn, getErrorMessage } from "@/lib/utils";
import { api } from "@/trpc/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingFormProps {
  // ✅ Accept null from DB at the prop boundary; coerced to undefined inside the form
  defaultValues?: Partial<Omit<ListingInput, "capacity">> & {
    id?: string;
    capacity?: number | null;
  };
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
        <Icon className="h-4 w-4 text-violet-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// ─── ListingForm ──────────────────────────────────────────────────────────────

/**
 * Full create/edit form for vendor listings.
 * Sections: Details · Pricing & Location · Photos · Tags
 * Two submit paths: "Save as Draft" and "Publish".
 *
 * @example create
 * <ListingForm />
 *
 * @example edit
 * <ListingForm defaultValues={{ id: listing.id, ...listing }} />
 */
export function ListingForm({ defaultValues }: ListingFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;
  const utils = api.useUtils();

  // ── Form setup ──────────────────────────────────────────────────────────────
  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema) as unknown as Resolver<ListingInput>,
    defaultValues: {
      title: "",
      description: "",
      category: "venue",
      tags: [],
      images: [],
      basePrice: 0,
      priceUnit: "event",
      city: "",
      address: "",
      status: "draft",
      ...defaultValues,
      // ✅ Always coerce null → undefined; DB returns null, form uses undefined
      capacity: defaultValues?.capacity ?? undefined,
    },
  });

  // ── Tag input ───────────────────────────────────────────────────────────────
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag) return;
    const current = form.getValues("tags");
    if (current.length >= 10) { toast.error("Maximum 10 tags"); return; }
    if (current.includes(tag)) { setTagInput(""); return; }
    form.setValue("tags", [...current, tag], { shouldDirty: true });
    setTagInput("");
  }

  function removeTag(tag: string) {
    form.setValue(
      "tags",
      form.getValues("tags").filter((t) => t !== tag),
      { shouldDirty: true },
    );
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      const tags = form.getValues("tags");
      if (tags.length) removeTag(tags[tags.length - 1]!);
    }
  }

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = api.listing.create.useMutation({
    onSuccess: () => {
      toast.success("Listing created!");
      void utils.listing.myListings.invalidate();
      router.push("/vendor/listings");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = api.listing.update.useMutation({
    onSuccess: () => {
      toast.success("Listing updated!");
      void utils.listing.myListings.invalidate();
      router.push("/vendor/listings");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ✅ Coerce capacity null → undefined before sending to tRPC mutations
  function onSubmit(data: ListingInput) {
    const payload = { ...data, capacity: data.capacity ?? undefined };
    if (isEdit && defaultValues?.id) {
      updateMutation.mutate({ id: defaultValues.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function saveDraft() {
    form.setValue("status", "draft");
    void form.handleSubmit(onSubmit)();
  }

  function publish() {
    form.setValue("status", "published");
    void form.handleSubmit(onSubmit)();
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

        {/* ══ 1. Core details ══ */}
        <section className="space-y-5">
          <SectionHeader
            icon={Info}
            title="Listing Details"
            description="The core information clients see when browsing listings."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Premium Wedding Photography Package"
                      className="text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/150 — Be specific and descriptive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Capacity</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Optional"
                        className="pl-9"
                        min={1}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your service — what's included, what makes it unique, what clients can expect…"
                      rows={6}
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/3000 · Minimum 20 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* ══ 2. Pricing & Location ══ */}
        <section className="space-y-5">
          <SectionHeader
            icon={DollarSign}
            title="Pricing & Location"
            description="Set your rate and let clients know where you operate."
          />

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Base price */}
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Price (₹) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        min={1}
                        className="pl-7"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : 0,
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price unit */}
            <FormField
              control={form.control}
              name="priceUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Per</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRICE_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Bengaluru"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Street, area — shown only to confirmed bookings"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* ══ 3. Photos ══ */}
        <section className="space-y-5">
          <SectionHeader
            icon={ImageIcon}
            title="Photos"
            description="Upload up to 10 images. Drag to reorder. First image is the cover."
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ListingImage
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* ══ 4. Tags ══ */}
        <section className="space-y-5">
          <SectionHeader
            icon={Tag}
            title="Tags"
            description="Keywords that help clients find your listing. Press Enter or comma to add."
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      "flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-input",
                      "bg-background px-3 py-2 ring-offset-background",
                      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    )}
                    onClick={() => tagInputRef.current?.focus()}
                  >
                    {field.value.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                          className="ml-0.5 rounded-full text-violet-500 hover:text-violet-900"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => tagInput && addTag(tagInput)}
                      placeholder={
                        field.value.length === 0
                          ? "e.g. outdoor, weekend, luxury…"
                          : field.value.length < 10
                            ? "Add more…"
                            : ""
                      }
                      disabled={field.value.length >= 10}
                      className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    />
                  </div>
                </FormControl>
                <FormDescription>{field.value.length}/10 tags</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* ══ Actions ══ */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={saveDraft}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && form.getValues("status") === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as Draft
          </Button>

          <Button
            type="button"
            onClick={publish}
            disabled={isPending}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {isPending && form.getValues("status") === "published" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Save & Publish" : "Publish Listing"}
          </Button>
        </div>
      </form>
    </Form>
  );
}