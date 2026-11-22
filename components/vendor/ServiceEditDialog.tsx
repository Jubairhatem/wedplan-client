"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { WEDDING_CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { VendorService } from "@/components/vendor/types";

const editServiceSchema = z.object({
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

type EditServiceFormData = z.infer<typeof editServiceSchema>;

interface ServiceEditDialogProps {
  service: VendorService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ServiceEditDialog({
  service,
  open,
  onOpenChange,
  onSaved,
}: ServiceEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      serviceName: "",
      category: WEDDING_CATEGORIES[0],
      description: "",
      price: 0,
      location: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!service) return;
    reset({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: service.price,
      location: service.location,
      isActive: service.isActive,
    });
  }, [service, reset]);

  const selectedCategory = watch("category");
  const isActive = watch("isActive");

  const onSubmit = async (data: EditServiceFormData) => {
    if (!service) return;
    setIsSaving(true);

    try {
      await fetchAPI(`/vendor/services/${service._id}`, {
        method: "PATCH",
        withAuth: true,
        body: JSON.stringify(data),
      });
      toast.success("Service updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update the service"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            Update Service
          </DialogTitle>
          <DialogDescription>
            Changes are saved immediately. Rejected services stay hidden from
            customers until re-approved by an admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-serviceName">Service Name</Label>
            <Input
              id="edit-serviceName"
              aria-invalid={!!errors.serviceName}
              {...register("serviceName")}
            />
            {errors.serviceName && (
              <p className="text-xs text-destructive">
                {errors.serviceName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  setValue("category", String(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="edit-category" className="w-full">
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
              <Label htmlFor="edit-price">Starting Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                min="1"
                step="1"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
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
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setValue("isActive", event.target.checked)
              }
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <span>Available for bookings</span>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
