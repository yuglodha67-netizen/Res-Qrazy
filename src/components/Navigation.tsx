"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/context/CartContext";

export function Navigation() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/owner")) return null;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <Link href="/" className="text-xl font-bold tracking-tight">
        QRAZY
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/menu" className="text-sm font-medium hover:text-primary transition-colors">
          Menu
        </Link>
        <Link href="/cart" className="relative flex items-center text-sm font-medium hover:text-primary transition-colors">
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
