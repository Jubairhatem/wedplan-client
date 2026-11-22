export interface BookingParty {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  businessName?: string | null;
}

export interface BookingServiceSummary {
  _id?: string;
  serviceName?: string;
  category?: string;
  price?: number;
  location?: string;
  images?: string[];
}

export interface BookingItem {
  _id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  service?: BookingServiceSummary | null;
  vendor?: BookingParty | null;
  customer?: BookingParty | null;
}

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function formatEventDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
