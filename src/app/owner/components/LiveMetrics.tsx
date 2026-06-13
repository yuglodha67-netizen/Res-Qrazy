"use client";

import React, { useEffect, useState } from "react";
import { Activity, ArrowUpRight } from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/utils/firebase/config";

export function LiveMetrics() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.totalPrice) {
          revenue += data.totalPrice;
        }
      });
      
      setTotalRevenue(revenue);
      setTotalOrders(snapshot.docs.length);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live metrics:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-card-foreground h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Metrics
        </span>
        <ArrowUpRight className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
      </h2>
      
      {loading ? (
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border animate-pulse">
              <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-16 bg-muted-foreground/20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/50 border border-border transition-colors">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Revenue</span>
            <span className="text-4xl font-bold text-foreground">
              ₹{totalRevenue.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border transition-colors">
            <span className="text-sm font-semibold text-muted-foreground">Total Orders</span>
            <span className="font-bold text-xl text-foreground">{totalOrders}</span>
          </div>
          
          <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border transition-colors">
            <span className="text-sm font-semibold text-muted-foreground">AR Upsell Lift</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              +15.2%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
