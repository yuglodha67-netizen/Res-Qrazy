import React, { useMemo } from "react";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard, EmptyState } from "./shared";
import { DateRange } from "../page";

interface Props {
  orders: any[];
  products: any[];
  dateRange: DateRange;
}

export function AnalyticsOverviewTab({ orders, products, dateRange }: Props) {
  // Aggregate stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalOrders = orders.length;
  
  // Calculate unique customers (if user data exists, else unique device/ip/table if possible, mock for now using order count as heuristic if anonymous)
  const uniqueCustomers = new Set(orders.map(o => o.userId || o.customerPhone || o.id)).size;
  
  // Calculate total products sold
  let totalProductsSold = 0;
  const productSales: Record<string, { name: string, count: number, revenue: number }> = {};
  
  orders.forEach(order => {
    if (order.cartItems && Array.isArray(order.cartItems)) {
      order.cartItems.forEach((item: any) => {
        totalProductsSold += (item.quantity || 1);
        if (!productSales[item.name]) productSales[item.name] = { name: item.name, count: 0, revenue: 0 };
        productSales[item.name].count += (item.quantity || 1);
        productSales[item.name].revenue += ((item.price || 0) * (item.quantity || 1));
      });
    }
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Chart Data Aggregation
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      
      let key = "";
      if (dateRange === "today") {
        key = `${date.getHours()}:00`;
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      dataMap[key] = (dataMap[key] || 0) + (order.totalPrice || 0);
    });

    // If no orders, provide empty structure based on dateRange so chart doesn't crash
    if (Object.keys(dataMap).length === 0) {
      return [{ time: "No Data", revenue: 0 }];
    }

    return Object.entries(dataMap)
      .map(([time, revenue]) => ({ time, revenue }))
      .sort((a, b) => {
        // Simple sort, robust time sorting would parse the keys
        return a.time.localeCompare(b.time);
      });
  }, [orders, dateRange]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Orders Placed" 
          value={totalOrders} 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Active Customers" 
          value={uniqueCustomers} 
          icon={Users} 
          subtext="Unique"
        />
        <StatCard 
          title="Items Sold" 
          value={totalProductsSold} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Revenue Over Time</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 w-full h-full min-h-[300px]">
            {orders.length === 0 ? (
              <EmptyState message="No revenue data for this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    formatter={(value: any) => {
                      const num = typeof value === 'number' ? value : 0;
                      return [`₹${num.toFixed(2)}`, 'Revenue'];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Selling Items</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {topProducts.length === 0 ? (
              <EmptyState message="No sales recorded yet." />
            ) : (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{product.count} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">₹{product.revenue.toFixed(0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
