"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  Crown,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { fetchAPI, ApiError } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { WEDDING_CATEGORIES } from "@/lib/categories";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addServiceSchema = z.object({
  serviceName: z
    .string()
    .min(3, "Service name must be at least 3 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
  price: z.number().positive("Price must be greater than 0"),
  location: z.string().min(2, "Location is required").max(200),
  isActive: z.boolean(),
});

type AddServiceFormData = z.infer<typeof addServiceSchema>;

const MAX_IMAGES = 10;

interface PlanInfo {
  isPremium: boolean;
  activeServices: number;
}

export default function AddServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [plan, setPlan] = useState<PlanInfo | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddServiceFormData>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      serviceName: "",
      category: WEDDING_CATEGORIES[0],
      description: "",
      price: 0,
      location: "",
      isActive: true,
    },
  });

  const selectedCategory = watch("category");
  const isActive = watch("isActive");

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetchAPI<{
          activeServices: number;
          subscription: { isPremium: boolean };
        }>("/vendor/overview", { withAuth: true });
        if (res.data) {
          setPlan({
            isPremium: res.data.subscription?.isPremium ?? false,
            activeServices: res.data.activeServices ?? 0,
          });
        }
      } catch {
        // Non-critical: the banner is only informational
      }
    }
    loadPlan();
  }, []);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`);
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const url = await uploadToImgBB(file);
        setImages((previous) => [...previous, url]);
      }
      toast.success(
        files.length > 1 ? "Images uploaded successfully" : "Image uploaded"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload the image"
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((previous) => previous.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: AddServiceFormData) => {
    if (images.length === 0) {
      toast.error("Please upload at least one service image");
      return;
    }

    setIsSubmitting(true);
    setLimitReached(false);

    try {
      await fetchAPI("/vendor/services", {
        method: "POST",
        withAuth: true,
        body: JSON.stringify({ ...data, images }),
      });
      toast.success(
        "Service submitted! It will be visible once an admin approves it."
      );
      router.push("/dashboard/vendor/services");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setLimitReached(true);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to create the service"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add a New Service"
        description="List your wedding service. New listings go through a quick admin review before going live."
      />

      {/* Plan banner */}
      {plan && (
        <div
          className={
            plan.isPremium
              ? "mb-5 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4"
              : "mb-5 flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4"
          }
        >
          {plan.isPremium ? (
            <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            <p className="font-medium">
              {plan.isPremium ? "Premium vendor" : "Free plan"}
            </p>
            <p className="text-muted-foreground">
              {plan.isPremium
                ? "You have unlimited active service listings."
                : `You can keep up to 3 active services. You currently have ${plan.activeServices} active.`}
            </p>
            {!plan.isPremium && (
              <Link
                href="/dashboard/vendor/subscription"
                className="inline-flex items-center gap-1 text-primary font-medium mt-1 hover:underline"
              >
                <Crown className="w-3.5 h-3.5" />
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>
      )}

      {limitReached && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">
            Free plan limit reached
          </p>
          <p className="text-muted-foreground mt-1">
            You can have at most 3 active services on the free plan. Deactivate
            an existing service or upgrade to Premium for unlimited listings.
          </p>
          <Button asChild size="sm" className="mt-3 gap-1.5">
            <Link href="/dashboard/vendor/subscription">
              <Crown className="w-3.5 h-3.5" />
              Upgrade to Premium
            </Link>
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="serviceName">Service Name</Label>
          <Input
            id="serviceName"
            placeholder="e.g. Rosewood Garden Wedding Venue"
            aria-invalid={!!errors.serviceName}
            {...register("serviceName")}
          />
          {errors.serviceName && (
            <p className="text-xs text-destructive">
              {errors.serviceName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setValue("category", String(value), { shouldValidate: true })
              }
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {WEDDING_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Starting Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="1"
              placeholder="2500"
              aria-invalid={!!errors.price}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, state or region"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          {errors.location && (
            <p className="text-xs text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe your service, what is included and what makes it special..."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>Service Images</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFiles}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/70 group"
              >
                <img
                  src={image}
                  alt={`Service image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-destructive shadow hover:bg-background cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground disabled:opacity-60 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[11px]">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[11px]">Add image</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            JPEG, PNG, WebP or GIF up to 5MB each. At least one image is
            required.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setValue("isActive", event.target.checked)}
            className="h-4 w-4 accent-primary cursor-pointer"
          />
          <span>Make this service available for bookings once approved</span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/vendor/services")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Service
          </Button>
        </div>
      </form>
    </div>
  );
}
