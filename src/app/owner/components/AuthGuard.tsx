"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChefHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PUBLIC_ROUTES = ["/owner/login", "/owner/register", "/owner/forgot-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      if (!user && !isPublicRoute) {
        // Not logged in, trying to access protected route
        router.replace("/owner/login");
      } else if (user && isPublicRoute) {
        // Logged in, trying to access auth pages
        router.replace("/owner");
      } else if (user && !isPublicRoute && role !== "owner" && role !== "admin") {
        // Logged in but not an owner/admin attempting to access owner dashboard
        router.replace("/unauthorized");
      }
    }
  }, [loading, user, role, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse text-primary">
          <ChefHat className="w-12 h-12" />
          <span className="font-semibold text-muted-foreground">Authenticating Securely...</span>
        </div>
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If on a public auth page and not logged in, just show children
  if (!user && isPublicRoute) {
    return <>{children}</>;
  }

  // If on protected route, logged in, and authorized, show children
  if (user && (role === "owner" || role === "admin") && !isPublicRoute) {
    return <>{children}</>;
  }

  return null;
}
