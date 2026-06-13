import React from "react";
import { SearchX } from "lucide-react";

export function StatCard({ title, value, subtext, icon: Icon, trend }: any) {
  const isPositive = trend && trend.startsWith("+");
  const isNegative = trend && trend.startsWith("-");

  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent text-foreground transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
            isPositive ? "bg-emerald-500/10 text-emerald-500" : 
            isNegative ? "bg-destructive/10 text-destructive" : 
            "bg-muted text-muted-foreground"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-foreground mb-1 truncate" title={String(value)}>{value}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          {subtext && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{subtext}</span>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message, icon: Icon = SearchX }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/20 border border-border border-dashed rounded-2xl h-full min-h-[250px]">
      <Icon className="w-10 h-10 mb-4 opacity-20" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
