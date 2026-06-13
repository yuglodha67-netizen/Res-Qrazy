import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EmptyState } from "./shared";
import { Package, TrendingDown, Layers } from "lucide-react";

interface Props {
  orders: any[];
  products: any[];
}

const COLORS = ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ProductsMenuTab({ orders, products }: Props) {
  
  // Aggregate sales data per product
  const productStats = useMemo(() => {
    const stats: Record<string, { name: string, category: string, sales: number, revenue: number }> = {};
    
    // Initialize with all products to catch low performers (0 sales)
    products.forEach(p => {
      stats[p.name] = { name: p.name, category: p.category || "Uncategorized", sales: 0, revenue: 0 };
    });

    orders.forEach(order => {
      if (order.cartItems && Array.isArray(order.cartItems)) {
        order.cartItems.forEach((item: any) => {
          if (!stats[item.name]) {
            stats[item.name] = { name: item.name, category: item.category || "Uncategorized", sales: 0, revenue: 0 };
          }
          stats[item.name].sales += (item.quantity || 1);
          stats[item.name].revenue += ((item.price || 0) * (item.quantity || 1));
        });
      }
    });

    return Object.values(stats);
  }, [orders, products]);

  const bestSellers = [...productStats].sort((a, b) => b.sales - a.sales).slice(0, 10);
  const lowPerformers = [...productStats].sort((a, b) => a.sales - b.sales).slice(0, 10);

  // Category Distribution Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    productStats.forEach(p => {
      if (p.sales > 0) {
        map[p.category] = (map[p.category] || 0) + p.sales;
      }
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [productStats]);

  if (productStats.length === 0) {
    return <EmptyState message="No product or order data available." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Sales by Category</h3>
            <Layers className="w-5 h-5 text-muted-foreground" />
          </div>
          {categoryData.length === 0 ? (
            <EmptyState message="No category sales data." />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value} items sold`, 'Sales']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Actionable Insights */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-foreground mb-6">Menu Insights</h3>
          <div className="space-y-4">
            {categoryData.length > 0 && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm font-medium text-foreground">
                  The <span className="font-bold text-primary">{categoryData[0].name}</span> category is driving the most volume, generating <span className="font-bold">{categoryData[0].value}</span> total item sales.
                </p>
              </div>
            )}
            {bestSellers.length > 0 && bestSellers[0].sales > 0 && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-bold text-emerald-500">{bestSellers[0].name}</span> is your top performing item. Consider featuring it on your primary QR menus or adding cross-sell items.
                </p>
              </div>
            )}
            {lowPerformers.length > 0 && lowPerformers[0].sales === 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm font-medium text-foreground">
                  You have items like <span className="font-bold text-amber-500">{lowPerformers[0].name}</span> with 0 sales in this period. Review their pricing or visibility.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Sellers Table */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Best Performing Products</h3>
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-12 gap-2 p-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Sales</div>
              <div className="col-span-3 text-right">Revenue</div>
            </div>
            
            {bestSellers.filter(p => p.sales > 0).map((product, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center border-b border-border hover:bg-muted/50 transition-colors text-sm">
                <div className="col-span-1 font-bold text-muted-foreground">{idx + 1}</div>
                <div className="col-span-6">
                  <p className="font-bold text-foreground truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.category}</p>
                </div>
                <div className="col-span-2 text-center font-bold text-foreground">{product.sales}</div>
                <div className="col-span-3 text-right font-bold text-emerald-500">₹{product.revenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Performers Table */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Low Performing Products</h3>
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-12 gap-2 p-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Sales</div>
              <div className="col-span-3 text-right">Revenue</div>
            </div>
            
            {lowPerformers.map((product, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center border-b border-border hover:bg-muted/50 transition-colors text-sm">
                <div className="col-span-1 font-bold text-muted-foreground">{idx + 1}</div>
                <div className="col-span-6">
                  <p className="font-bold text-foreground truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.category}</p>
                </div>
                <div className="col-span-2 text-center font-bold text-destructive">{product.sales}</div>
                <div className="col-span-3 text-right font-bold text-muted-foreground">₹{product.revenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
