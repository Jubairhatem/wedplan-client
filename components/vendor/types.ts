export interface VendorService {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
