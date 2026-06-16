import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonLoaderProps {
  label?: string;
  className?: string;
}

export function ButtonLoader({ label = "Loading...", className = "" }: ButtonLoaderProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
