import React, { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";

export function SalesPerformance({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState<"7" | "30">("7");

  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const now = new Date();
    const daysToSubtract = filter === "7" ? 7 : 30;
    
    // Initialize dates to ensure we have a continuous line even on days with 0 sales
    for (let i = daysToSubtract - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap[key] = 0;
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToSubtract);

    orders.forEach(order => {
      if (!order.createdAt) return;
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (orderDate >= cutoff) {
        const key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dataMap[key] !== undefined) {
          dataMap[key] += (order.totalPrice || 0);
        }
      }
    });

    return Object.entries(dataMap).map(([date, revenue]) => ({ date, revenue }));
  }, [orders, filter]);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Sales Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Revenue trend over time</p>
        </div>
        
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
          <button 
            onClick={() => setFilter("7")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === "7" ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setFilter("30")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === "30" ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
