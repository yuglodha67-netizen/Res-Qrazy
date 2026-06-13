import React, { useMemo } from "react";
import { Package, TrendingUp, TrendingDown, Image as ImageIcon } from "lucide-react";

interface Props {
  orders: any[];
  products: any[];
}

export function ProductInsights({ orders, products }: Props) {
  
  const productStats = useMemo(() => {
    const stats: Record<string, { name: string, category: string, image: string, sales: number, revenue: number }> = {};
    
    products.forEach(p => {
      stats[p.name] = { 
        name: p.name, 
        category: p.category || "Uncategorized", 
        image: p.imageUrl || "",
        sales: 0, 
        revenue: 0 
      };
    });

    orders.forEach(order => {
      if (order.cartItems && Array.isArray(order.cartItems)) {
        order.cartItems.forEach((item: any) => {
          if (!stats[item.name]) {
            stats[item.name] = { name: item.name, category: item.category || "Uncategorized", image: "", sales: 0, revenue: 0 };
          }
          stats[item.name].sales += (item.quantity || 1);
          stats[item.name].revenue += ((item.price || 0) * (item.quantity || 1));
        });
      }
    });

    return Object.values(stats);
  }, [orders, products]);

  const bestSellers = [...productStats].sort((a, b) => b.sales - a.sales).slice(0, 3);
  const lowPerformers = [...productStats].sort((a, b) => a.sales - b.sales).slice(0, 3);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Product Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Best and worst performing menu items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Best Sellers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2 border-b border-border pb-2">
            <TrendingUp className="w-4 h-4" /> Top Sellers
          </h3>
          {bestSellers.length === 0 || bestSellers[0].sales === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.filter(p => p.sales > 0).map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/80 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{product.sales} <span className="text-[10px] text-muted-foreground font-normal">sold</span></p>
                    <p className="text-xs font-bold text-emerald-500">₹{product.revenue.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Performers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 border-b border-border pb-2">
            <TrendingDown className="w-4 h-4" /> Low Performers
          </h3>
          {lowPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No products found.</p>
          ) : (
            <div className="space-y-3">
              {lowPerformers.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/80 transition-colors opacity-80 hover:opacity-100">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{product.sales} <span className="text-[10px] text-muted-foreground font-normal">sold</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
