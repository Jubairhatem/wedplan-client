"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  CalendarDays,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { ApiError, fetchAPI } from "@/lib/api";
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

const bookingSchema = z.object({
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z
    .string()
    .min(2, "Event location must be at least 2 characters")
    .max(200, "Event location cannot exceed 200 characters"),
  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingDialogProps {
  serviceId: string;
  serviceName: string;
}

export function BookingDialog({ serviceId, serviceName }: BookingDialogProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;

  const todayISO = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { eventDate: "", eventLocation: "", message: "" },
  });

  const isCustomer = role === "customer";
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";

  const disabledReason = isVendor
    ? "Vendor accounts cannot book services. Sign in as a customer to book."
    : isAdmin
    ? "Admin accounts cannot place bookings."
    : !session?.user && !isPending
    ? "Please sign in as a customer to book this service."
    : null;

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      await fetchAPI("/bookings", {
        method: "POST",
        withAuth: true,
        body: JSON.stringify({
          serviceId,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          message: data.message || "",
        }),
      });

      toast.success("Booking request sent! The vendor will respond shortly.");
      reset();
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        router.push(
          `/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`
        );
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send the booking request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="w-full h-11 text-base shadow-sm"
        disabled={!isCustomer}
        onClick={() => setOpen(true)}
      >
        {isCustomer ? (
          <>
            <CalendarDays className="w-4 h-4" />
            Book This Service
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Booking Unavailable
          </>
        )}
      </Button>

      {disabledReason && (
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          {disabledReason}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              Book {serviceName}
            </DialogTitle>
            <DialogDescription>
              Share your event details and the vendor will confirm
              availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="eventDate"
                  type="date"
                  min={todayISO}
                  className="pl-9 h-10"
                  aria-invalid={!!errors.eventDate}
                  {...register("eventDate")}
                />
              </div>
              {errors.eventDate && (
                <p className="text-xs text-destructive">
                  {errors.eventDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="eventLocation"
                  placeholder="Venue name, city or address"
                  className="pl-9 h-10"
                  aria-invalid={!!errors.eventLocation}
                  {...register("eventLocation")}
                />
              </div>
              {errors.eventLocation && (
                <p className="text-xs text-destructive">
                  {errors.eventLocation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Message{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Textarea
                  id="message"
                  rows={3}
                  placeholder="Guest count, theme, special requests..."
                  className="pl-9"
                  aria-invalid={!!errors.message}
                  {...register("message")}
                />
              </div>
              {errors.message && (
                <p className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Booking Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
