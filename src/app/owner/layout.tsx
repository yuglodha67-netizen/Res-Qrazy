"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { OwnerSidebar } from "./components/OwnerSidebar";
import { OwnerProvider } from "./OwnerContext";
import { AuthGuard } from "./components/AuthGuard";
import { OwnerNavbar } from "./components/OwnerNavbar";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = ["/owner/login", "/owner/register", "/owner/forgot-password"].includes(pathname);

  return (
    <AuthGuard>
      <OwnerProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar is fixed on the left */}
          <OwnerSidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
            {/* Navbar is sticky at the top of the scrollable area */}
            <OwnerNavbar />
            
            {/* Scrollable Main Content */}
            <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isAuthRoute ? "" : "p-4 md:p-8 pb-24 md:pb-8 bg-background/50"}`}>
              <div className={`${isAuthRoute ? "w-full h-full" : "max-w-[1600px] mx-auto w-full"}`}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </OwnerProvider>
    </AuthGuard>
  );
}
