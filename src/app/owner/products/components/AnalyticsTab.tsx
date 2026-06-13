"use client";

import React from "react";
import { Product } from "@/types/product";
import { BarChart3 } from "lucide-react";

export function AnalyticsTab({ products }: { products: Product[] }) {
  
  // Mock data generation for charts
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryData = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length
  }));
  const maxCount = Math.max(...categoryData.map(d => d.count), 1);

  const mockRevenue = [
    { day: "Mon", value: 1200 },
    { day: "Tue", value: 1900 },
    { day: "Wed", value: 1500 },
    { day: "Thu", value: 2200 },
    { day: "Fri", value: 3800 },
    { day: "Sat", value: 4500 },
    { day: "Sun", value: 3100 },
  ];
  const maxRev = Math.max(...mockRevenue.map(d => d.value));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Product Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Weekly Revenue Trend</h3>
          <div className="h-64 flex items-end gap-2 justify-between">
            {mockRevenue.map((data) => {
              const height = `${(data.value / maxRev) * 100}%`;
              return (
                <div key={data.day} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-primary/20 rounded-t-lg relative flex items-end justify-center group-hover:bg-primary/30 transition-colors" style={{ height }}>
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-foreground px-2 py-1 rounded text-xs font-bold text-background transition-opacity">
                      ₹{data.value}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Product Distribution by Category</h3>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories found.</p>
            ) : categoryData.map((data, idx) => {
              const width = `${(data.count / maxCount) * 100}%`;
              return (
                <div key={data.name || `cat-${idx}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{data.name || "Uncategorized"}</span>
                    <span>{data.count} items</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
