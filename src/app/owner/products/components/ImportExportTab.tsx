"use client";

import React, { useState } from "react";
import { Product, Category, AddOn } from "@/types/product";
import { Download, Upload, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  products: Product[];
  categories: Category[];
  addons: AddOn[];
}

export function ImportExportTab({ products, categories }: Omit<Props, "addons">) {
  const [loading, setLoading] = useState(false);

  const handleExportCSV = () => {
    try {
      setLoading(true);
      // Native CSV Generation without external libraries
      const headers = ["ID", "Name", "Category", "Price", "Availability", "Stock"];
      
      const rows = products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
        `"${p.category || 'Mains'}"`,
        p.price,
        p.availability || "available",
        p.stockQuantity === null || p.stockQuantity === undefined ? "Unlimited" : p.stockQuantity
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Products exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export products.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportPlaceholder = () => {
    toast.error("CSV Import requires backend validation mapping. Please use manual entry for now.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Import & Export Data</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-muted/30 group-hover:text-primary/10 transition-colors">
            <Download className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-foreground mb-2">Export Products</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Download your entire product catalog as a CSV file. This includes prices, stock levels, and categories.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-bold text-foreground">{products.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Categories</span>
                <span className="font-bold text-foreground">{categories.length}</span>
              </div>
            </div>

            <button 
              onClick={handleExportCSV}
              disabled={loading || products.length === 0}
              className="w-full py-3 bg-primary hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-muted/30 group-hover:text-primary/10 transition-colors">
            <Upload className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-foreground mb-2">Import Products</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Bulk upload products using a CSV file. Make sure your columns match the export template.
            </p>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-500/90 leading-relaxed">
                Importing will overwrite existing products with the same ID. We recommend downloading a backup first.
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-accent transition-colors cursor-pointer" onClick={handleImportPlaceholder}>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Maximum file size: 5MB</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
