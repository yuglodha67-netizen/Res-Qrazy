"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOwnerRoute = pathname?.startsWith("/owner");

  if (isOwnerRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <div className="pt-[72px] pb-24">
        {children}
      </div>
    </>
  );
}
