import React, { useMemo } from "react";
import { Users, UserPlus, UserCheck, HeartHandshake } from "lucide-react";

export function CustomerInsights({ orders }: { orders: any[] }) {

  const stats = useMemo(() => {
    const custMap: Record<string, { orders: number, spent: number }> = {};
    
    orders.forEach(order => {
      const custId = order.userId || order.customerPhone || order.id; // Fallback to order.id (anonymous unique)
      if (!custMap[custId]) custMap[custId] = { orders: 0, spent: 0 };
      custMap[custId].orders += 1;
      custMap[custId].spent += (order.totalPrice || 0);
    });

    const totalCustomers = Object.keys(custMap).length;
    let returning = 0;
    let totalRevenue = 0;

    Object.values(custMap).forEach(c => {
      if (c.orders > 1) returning += 1;
      totalRevenue += c.spent;
    });

    const newCust = totalCustomers - returning;
    const aov = orders.length > 0 ? totalRevenue / orders.length : 0;
    const avgOrdersPerCust = totalCustomers > 0 ? orders.length / totalCustomers : 0;

    return { totalCustomers, newCust, returning, aov, avgOrdersPerCust };
  }, [orders]);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Customer Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Acquisition and behavior metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{stats.newCust}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{stats.returning}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Returning</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
          <HeartHandshake className="w-4 h-4 text-primary" /> Behavior Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Average Order Value (AOV)</span>
            <span className="text-sm font-bold text-emerald-500">₹{stats.aov.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Avg Orders per Customer</span>
            <span className="text-sm font-bold text-foreground">{stats.avgOrdersPerCust.toFixed(1)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
