"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, LayoutDashboard, List, PlusSquare, 
  Layers, PlusCircle, BarChart3, Star, Download
} from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";
import { Product, Category, AddOn } from "@/types/product";

import { ProductDashboardTab } from "./components/ProductDashboardTab";
import { ProductListTab } from "./components/ProductListTab";
import { ProductFormTab } from "./components/ProductFormTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { AddonsTab } from "./components/AddonsTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { ImportExportTab } from "./components/ImportExportTab";

const TABS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "list", label: "All Products", icon: List },
  { id: "add", label: "Add Product", icon: PlusSquare },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "addons", label: "Add-ons & Extras", icon: PlusCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "import", label: "Import/Export", icon: Download },
];

export default function ProductManagementDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);
  
  // For editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, "products")), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to fetch products");
    });

    const unsubCats = onSnapshot(query(collection(db, "categories")), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const unsubAddons = onSnapshot(query(collection(db, "addons")), (snapshot) => {
      setAddons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AddOn)));
    });

    return () => {
      unsubProducts();
      unsubCats();
      unsubAddons();
    };
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("add");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <ProductDashboardTab products={products} categories={categories} />;
      case "list": return <ProductListTab products={products} onEdit={handleEditProduct} categories={categories} />;
      case "add": return <ProductFormTab 
                            existingProduct={editingProduct} 
                            categories={categories} 
                            addons={addons} 
                            onComplete={() => { setEditingProduct(null); setActiveTab("list"); }}
                            onCancel={() => { setEditingProduct(null); setActiveTab("list"); }}
                          />;
      case "categories": return <CategoriesTab categories={categories} />;
      case "addons": return <AddonsTab addons={addons} />;
      case "analytics": return <AnalyticsTab products={products} />;
      case "reviews": return <ReviewsTab products={products} />;
      case "import": return <ImportExportTab products={products} categories={categories} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto text-foreground pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Product Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Manage your restaurant menu, inventory, pricing, and availability.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            // If we are editing, highlight the 'add' tab differently or keep it selected
            const isActive = activeTab === tab.id;
            const label = (tab.id === "add" && editingProduct) ? "Edit Product" : tab.label;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== "add") setEditingProduct(null); // Clear edit state when navigating away
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm ${
                  isActive 
                    ? 'bg-accent text-accent-foreground border border-border shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm relative min-h-[calc(100vh-220px)] flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-full flex-1">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex-1">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
