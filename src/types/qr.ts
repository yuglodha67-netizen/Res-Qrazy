export type QRStatus = "active" | "disabled" | "expired" | "archived";

export interface QRCustomization {
  fgColor: string; // QR code foreground color
  bgColor: string; // QR code background color
  eyeColor: string; // QR code eye color
  logoUrl?: string; // Optional center logo URL
  style: "squares" | "dots";
}

export interface QRCodeData {
  id: string;
  name: string;             // e.g., "Table 01"
  tableNumber: string;      // e.g., "1"
  section: string;          // e.g., "Outdoor Area"
  description: string;      // Optional description
  url: string;              // The final URL encoded in the QR
  status: QRStatus;
  expiryDate: any;          // Firebase Timestamp or null
  menuId: string;           // e.g., "regular", "breakfast", etc.
  scanCount: number;
  customization: QRCustomization;
  createdAt: any;           // Firebase Timestamp
  updatedAt: any;           // Firebase Timestamp
}
