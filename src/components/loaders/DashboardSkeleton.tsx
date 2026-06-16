import React from "react";
import { CardSkeleton } from "./CardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64 animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-card border border-border/50 animate-pulse p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-full" />
            </div>
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="h-[400px] rounded-3xl bg-card border border-border/50 animate-pulse p-6" />
          <div className="h-[300px] rounded-3xl bg-card border border-border/50 animate-pulse p-6" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="h-[250px] rounded-3xl bg-card border border-border/50 animate-pulse p-6" />
          <div className="h-[450px] rounded-3xl bg-card border border-border/50 animate-pulse p-6" />
        </div>
      </div>
    </div>
  );
}
