"use client";

import React from "react";
import { KDSOrder } from "./KitchenOrderCard";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, ChefHat } from "lucide-react";

interface Props {
  orders: KDSOrder[];
}

export function KDSAnalytics({ orders }: Props) {
  
  // Calculate stats based on today's orders
  const today = new Date().toDateString();
  const todaysOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return date.toDateString() === today;
  });

  const completedToday = todaysOrders.filter(o => o.status === "completed" || o.status === "archived");
  const activeToday = todaysOrders.filter(o => o.status === "preparing" || o.status === "new");
  
  let totalPrepMinutes = 0;
  let preppedCount = 0;

  completedToday.forEach(o => {
    if (o.createdAt && (o as any).completedAt) {
      const start = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      const end = (o as any).completedAt.toDate ? (o as any).completedAt.toDate() : new Date((o as any).completedAt);
      const diffMs = end.getTime() - start.getTime();
      totalPrepMinutes += Math.floor(diffMs / 60000);
      preppedCount++;
    }
  });

  const avgPrepTime = preppedCount > 0 ? Math.round(totalPrepMinutes / preppedCount) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Active Orders</span>
          <ChefHat className="w-4 h-4 text-primary" />
        </div>
        <div className="text-3xl font-bold text-foreground">{activeToday.length}</div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Completed Today</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-3xl font-bold text-foreground">{completedToday.length}</div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Avg Prep Time</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-3xl font-bold text-foreground">{avgPrepTime}</div>
          <span className="text-sm font-bold text-muted-foreground">min</span>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Delayed</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="text-3xl font-bold text-red-500">
          {/* Rough delayed calculation for active orders > 20 mins */}
          {activeToday.filter(o => {
             if (!o.createdAt) return false;
             const start = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
             return (new Date().getTime() - start.getTime()) / 60000 > 20;
          }).length}
        </div>
      </div>
    </div>
  );
}
