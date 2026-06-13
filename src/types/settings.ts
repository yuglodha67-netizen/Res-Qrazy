export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: BusinessHours;
  tuesday: BusinessHours;
  wednesday: BusinessHours;
  thursday: BusinessHours;
  friday: BusinessHours;
  saturday: BusinessHours;
  sunday: BusinessHours;
}

export interface RestaurantSettings {
  // 1. Profile
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  heroTitle: string;
  heroDescription: string;
  
  // 2. Account
  phone: string;
  email: string;

  // 4. Operations
  acceptOrders: boolean;
  prepTime: string;
  minOrderAmount: number;
  tableReservations: boolean;
  businessHours: WeeklyHours;

  // 5. Billing
  taxRate: number;
  serviceCharge: number;
  paymentMethods: string[];
  
  // 6. Notifications
  notifyNewOrders: boolean;
  notifyCancelledOrders: boolean;
  notifyReviews: boolean;
  notifyChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  // 7. Branding
  themeMode: "light" | "dark" | "system";
  primaryColor: string;

  // 8. Menu Management
  menuVisible: boolean;
  autoHideOutofStock: boolean;

  // 9. Typography
  fontScale: "small" | "default" | "medium" | "large" | "extra-large";
}

export const defaultSettings: RestaurantSettings = {
  name: "",
  tagline: "",
  description: "",
  logoUrl: "",
  coverUrl: "",
  heroTitle: "Experience Culinary Excellence",
  heroDescription: "Fresh ingredients, handcrafted dishes, and unforgettable dining experiences.",
  phone: "",
  email: "",
  acceptOrders: true,
  prepTime: "20-30",
  minOrderAmount: 0,
  tableReservations: false,
  businessHours: {
    monday: { open: "10:00", close: "22:00", closed: false },
    tuesday: { open: "10:00", close: "22:00", closed: false },
    wednesday: { open: "10:00", close: "22:00", closed: false },
    thursday: { open: "10:00", close: "22:00", closed: false },
    friday: { open: "10:00", close: "23:00", closed: false },
    saturday: { open: "10:00", close: "23:00", closed: false },
    sunday: { open: "10:00", close: "21:00", closed: false },
  },
  taxRate: 5,
  serviceCharge: 0,
  paymentMethods: ["card", "cash"],
  notifyNewOrders: true,
  notifyCancelledOrders: true,
  notifyReviews: true,
  notifyChannels: { email: true, sms: false, push: true },
  themeMode: "system",
  primaryColor: "#3b82f6", // Blue
  menuVisible: true,
  autoHideOutofStock: true,
  fontScale: "default",
};
