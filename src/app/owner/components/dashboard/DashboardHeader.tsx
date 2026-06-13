"use client";

import React, { useEffect, useState } from "react";
import { Store, Settings, Plus, QrCode, FileText, Activity, LayoutDashboard, ChevronDown } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import Link from "next/link";

interface Props {
  visibleWidgets: Record<string, boolean>;
  onToggleWidget: (key: string) => void;
}

export function DashboardHeader({ visibleWidgets, onToggleWidget }: Props) {
  const [profile, setProfile] = useState<{ name: string; logoUrl: string } | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({ name: data.name || "Restaurant Owner", logoUrl: data.logoUrl || "" });
      }
    });
    return () => unsub();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-card-foreground animate-in fade-in slide-in-from-top-4 duration-500 relative z-30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Welcome Section */}
        <div className="flex items-center gap-4">
          {profile?.logoUrl ? (
            <img src={profile.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-2xl shadow-sm border border-border" />
          ) : (
            <div className="w-16 h-16 bg-primary/10 rounded-2xl shadow-sm flex items-center justify-center border border-primary/20">
              <Store className="w-8 h-8 text-primary" />
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {greeting()}, {profile?.name || "Owner"}
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link href="/owner/products" className="px-4 py-2 bg-background border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2 text-sm font-bold shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link href="/owner/qr" className="px-4 py-2 bg-background border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2 text-sm font-bold shadow-sm">
            <QrCode className="w-4 h-4" /> Generate QR
          </Link>
          <Link href="/owner/analytics" className="px-4 py-2 bg-primary text-primary-foreground border border-primary rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2 text-sm font-bold">
            <Activity className="w-4 h-4" /> View Analytics
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setShowCustomize(!showCustomize)}
              className="p-2 bg-background border border-border rounded-xl hover:bg-muted transition-colors shadow-sm"
              title="Customize Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            
            {showCustomize && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-border bg-muted/50">
                  <h3 className="font-bold text-sm text-foreground">Customize Dashboard</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Show or hide widgets</p>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  {Object.entries({
                    overview: "Overview Cards",
                    sales: "Sales Chart",
                    orders: "Order Management",
                    products: "Product Insights",
                    customers: "Customer Insights",
                    timeline: "Activity Timeline",
                    misc: "Inventory & Alerts"
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer">
                      <span className="text-sm font-medium">{label}</span>
                      <input 
                        type="checkbox" 
                        checked={visibleWidgets[key]} 
                        onChange={() => onToggleWidget(key)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
