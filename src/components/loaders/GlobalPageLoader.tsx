"use client";

import React from "react";
import { ChefHat } from "lucide-react";

export function GlobalPageLoader({ message = "Loading experience..." }: { message?: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-background text-foreground z-50 fixed inset-0">
      <div className="relative flex flex-col items-center gap-6">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 -m-6 rounded-full border-t-2 border-primary animate-[spin_2s_linear_infinite]" />
        {/* Inner pulsing icon */}
        <div className="p-4 bg-primary/10 rounded-full animate-pulse border border-primary/20">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
        <span className="font-semibold text-lg text-muted-foreground animate-pulse tracking-wide">
          {message}
        </span>
      </div>
    </div>
  );
}
