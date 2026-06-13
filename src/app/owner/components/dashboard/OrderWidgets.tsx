import React, { useMemo } from "react";
import { ListOrdered, CheckCircle2, Clock, ChefHat, Eye } from "lucide-react";
import Link from "next/link";

export function OrderWidgets({ orders }: { orders: any[] }) {
  
  const statusCounts = useMemo(() => {
    const counts = { pending: 0, preparing: 0, completed: 0, cancelled: 0 };
    orders.forEach(order => {
      const status = (order.status || "pending").toLowerCase();
      if (counts[status as keyof typeof counts] !== undefined) {
        counts[status as keyof typeof counts]++;
      } else {
        counts.pending++; // fallback
      }
    });
    return counts;
  }, [orders]);

  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Completed</span>;
      case "pending": return <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">New</span>;
      case "preparing": return <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Preparing</span>;
      case "cancelled": return <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
      default: return <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      
      {/* Live Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-amber-500/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{statusCounts.pending}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-blue-500/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{statusCounts.preparing}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preparing</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-emerald-500/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{statusCounts.completed}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/owner/orders'}>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider">View All</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage Orders</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
            <p className="text-xs text-muted-foreground mt-1">Latest 5 orders placed across the restaurant.</p>
          </div>
          <Link href="/owner/orders" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ListOrdered className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No recent orders found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-bold">Order ID</th>
                  <th className="px-6 py-3 font-bold">Customer / Table</th>
                  <th className="px-6 py-3 font-bold text-center">Items</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Amount</th>
                  <th className="px-6 py-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => {
                  const itemsCount = order.cartItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
                  return (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.customerName || "Walk-in"}</p>
                        {order.tableNumber && <p className="text-[10px] text-muted-foreground">Table: {order.tableNumber}</p>}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-foreground">{itemsCount}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.status || "pending")}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-500">₹{Number(order.totalPrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-1.5 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg shadow-sm" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
