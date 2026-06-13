export type ProductAvailability = "available" | "out_of_stock" | "hidden";

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Medium", "Large"
  price: number;
  available: boolean;
}

export interface ProductSchedule {
  alwaysAvailable: boolean;
  startTime?: string; // "07:00"
  endTime?: string;   // "11:00"
  days?: string[];    // ["monday", "tuesday"]
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  category: string;
  subCategory?: string;
  spiceLevel: number;
  modelUrl?: string; // AR Model
  imageUrl?: string; // 2D Image
  
  availability: ProductAvailability;
  stockQuantity?: number | null; // null means unlimited
  
  variants?: ProductVariant[];
  addonIds?: string[];
  
  schedule?: ProductSchedule;
  
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isVisible: boolean;
  order: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  categoryMapping?: string[]; // If empty, applies to all
  isAvailable: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: any;
  status: "new" | "handled" | "reported";
}
