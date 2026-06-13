"use client";

import React from "react";
import { Product, Category } from "@/types/product";
import { Package, Layers, AlertCircle, EyeOff, Tag, TrendingUp } from "lucide-react";

export function ProductDashboardTab({ products, categories }: { products: Product[], categories: Category[] }) {
  
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.availability === "available").length;
  const outOfStock = products.filter(p => p.availability === "out_of_stock").length;
  const hiddenProducts = products.filter(p => p.availability === "hidden").length;
  const totalCategories = categories.length;

  // Simple mock calculation for best sellers since we don't have order data right here
  const bestSellers = [...products].sort((a, b) => b.price - a.price).slice(0, 3); // Mock logic

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Available", value: availableProducts, icon: Tag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Out of Stock", value: outOfStock, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Hidden", value: hiddenProducts, icon: EyeOff, color: "text-slate-500", bg: "bg-slate-500/10" },
    { label: "Categories", value: totalCategories, icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Product Overview</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-accent text-foreground transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Best Sellers</h3>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-foreground font-bold">₹{product.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Stock Alerts</h3>
          {outOfStock === 0 ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[150px] text-muted-foreground">
              <CheckCircle className="w-12 h-12 text-primary/50 mb-2" />
              <p className="text-sm font-medium">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.filter(p => p.availability === "out_of_stock").slice(0, 4).map(product => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex-1">
                    <p className="font-bold text-destructive">{product.name}</p>
                    <p className="text-xs text-destructive/80">Requires restocking</p>
                  </div>
                  <button className="px-3 py-1 bg-background border border-border text-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors">
                    Update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Temporary icon to avoid import error
const CheckCircle = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
