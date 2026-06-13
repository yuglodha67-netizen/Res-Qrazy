import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { CustomerSecurityGuard } from "@/components/CustomerSecurityGuard";
import { GlobalTypographyProvider } from "@/components/GlobalTypographyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QRAZY | The Future of Dining",
  description: "Experience our culinary masterpieces with AR-powered visualization, instant table ordering, and seamless checkout. Scan, visualize, and order.",
  keywords: ["restaurant", "AR menu", "smart dining", "QR ordering", "food"],
  openGraph: {
    title: "QRAZY | The Future of Dining",
    description: "Experience our culinary masterpieces with AR-powered visualization and instant table ordering.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRAZY | The Future of Dining",
    description: "Scan. Visualize. Order. Experience.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <GlobalTypographyProvider>
          <AuthProvider>
            <CustomerSecurityGuard>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange
              >
                <CartProvider>
                  <ClientLayoutWrapper>
                    <Navigation />
                    {children}
                  </ClientLayoutWrapper>
                </CartProvider>
                <Toaster position="top-center" theme="dark" richColors />
              </ThemeProvider>
            </CustomerSecurityGuard>
          </AuthProvider>
        </GlobalTypographyProvider>
      </body>
    </html>
  );
}
