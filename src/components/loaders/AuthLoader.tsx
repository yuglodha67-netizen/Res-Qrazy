"use client";

import React from "react";
import { ChefHat } from "lucide-react";

export function AuthLoader({ message = "Authenticating Securely..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden text-center p-10 flex flex-col items-center">
        <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6 relative border border-primary/20">
          <ChefHat className="w-10 h-10 text-primary animate-pulse" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full animate-ping" />
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-3">
          Security Check
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
          {message}
        </p>
        <div className="flex justify-center w-full">
          <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ transformOrigin: "left", animation: "indeterminate 1.5s infinite linear" }} />
          </div>
        </div>
        <style jsx>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%) scaleX(0.2); }
            50% { transform: translateX(0%) scaleX(0.5); }
            100% { transform: translateX(100%) scaleX(0.2); }
          }
        `}</style>
      </div>
    </div>
  );
}
