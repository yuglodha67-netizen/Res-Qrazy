import React from "react";

export function ProductSkeleton() {
  return (
    <div className="rounded-2xl border bg-card/50 shadow-sm overflow-hidden flex flex-col animate-pulse h-full">
      <div className="aspect-video w-full bg-muted/70 relative">
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="absolute top-3 right-3 h-8 w-8 bg-muted rounded-full" />
      </div>
      <div className="p-5 flex flex-col flex-grow space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-muted rounded w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded-full" />
          <div className="h-4 bg-muted rounded w-12" />
          <div className="h-4 bg-muted rounded w-8" />
        </div>
        <div className="space-y-2 flex-grow">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="h-7 bg-muted rounded w-20" />
          <div className="h-9 bg-muted rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}
