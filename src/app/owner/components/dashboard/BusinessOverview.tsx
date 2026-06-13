import React, { useMemo } from "react";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";

interface Props {
  orders: any[];
  products: any[];
}

export function BusinessOverview({ orders, products }: Props) {
  
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    let todayRev = 0;
    let yesterdayRev = 0;
    let todayOrders = 0;
    let yesterdayOrders = 0;
    
    const uniqueCustomers = new Set();
    let newCustomersToday = 0;

    orders.forEach(order => {
      if (!order.createdAt) return;
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const orderTime = orderDate.getTime();
      
      const rev = order.totalPrice || 0;
      const custId = order.userId || order.customerPhone || order.id;
      
      uniqueCustomers.add(custId);

      if (orderTime >= startOfToday) {
        todayRev += rev;
        todayOrders += 1;
        // Simple approximation of 'new' customer: if it's the first time we see them, though 
        // a real DB would check if their first order was today. We'll count unique today for simplicity.
        newCustomersToday += 1; 
      } else if (orderTime >= startOfYesterday && orderTime < startOfToday) {
        yesterdayRev += rev;
        yesterdayOrders += 1;
      }
    });

    const revGrowth = yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev) * 100 : (todayRev > 0 ? 100 : 0);
    const orderGrowth = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : (todayOrders > 0 ? 100 : 0);

    const availableProducts = products.filter(p => p.inStock !== false && p.status !== "inactive").length;
    
    return {
      todayRev,
      revGrowth,
      todayOrders,
      orderGrowth,
      totalCustomers: uniqueCustomers.size,
      newCustomersToday,
      totalProducts: products.length,
      availableProducts
    };
  }, [orders, products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      
      {/* Revenue Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${stats.revGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            {stats.revGrowth >= 0 ? '+' : ''}{stats.revGrowth.toFixed(1)}%
          </span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Revenue</h3>
          <p className="text-4xl font-black text-foreground">₹{stats.todayRev.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Compared to yesterday</p>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${stats.orderGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            {stats.orderGrowth >= 0 ? '+' : ''}{stats.orderGrowth.toFixed(1)}%
          </span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Orders</h3>
          <p className="text-4xl font-black text-foreground">{stats.todayOrders}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Compared to yesterday</p>
        </div>
      </div>

      {/* Customers Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Customers</h3>
          <p className="text-4xl font-black text-foreground">{stats.totalCustomers}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Unique order IDs recorded</p>
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Menu Items</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-foreground">{stats.availableProducts}</p>
            <p className="text-sm font-bold text-muted-foreground">/ {stats.totalProducts}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Products currently available</p>
        </div>
      </div>

    </div>
  );
}
