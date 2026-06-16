import React from "react";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden animate-pulse">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/20">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/4 justify-self-end" />
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-6 bg-muted rounded-full w-16 justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}
