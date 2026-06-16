import React from "react";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden flex flex-col p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 bg-muted rounded w-1/3" />
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}
