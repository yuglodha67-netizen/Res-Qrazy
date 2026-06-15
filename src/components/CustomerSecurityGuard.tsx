"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/utils/firebase/config";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";

/**
 * Ensures that customers navigating the menu or cart are silently authenticated.
 * This assigns them a persistent Anonymous UID which we use in Firestore rules
 * to verify order ownership and prevent IDOR.
 */
export function CustomerSecurityGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // If the user is on an owner route or unauthorized page, we let the AuthGuard handle it.
    if (pathname?.startsWith("/owner") || pathname === "/unauthorized") {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Failed to authenticate customer session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  return <>{children}</>;
}
