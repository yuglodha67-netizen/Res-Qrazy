import React, { useMemo } from "react";
import { Users, QrCode, Star, ShoppingBag } from "lucide-react";
import { EmptyState } from "./shared";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  orders: any[];
  qrcodes: any[];
}

export function CustomersQRTab({ orders, qrcodes }: Props) {
  
  // 1. Customer Analytics
  const customerStats = useMemo(() => {
    const map: Record<string, { id: string, orderCount: number, totalSpent: number, lastOrder: Date }> = {};
    
    orders.forEach(order => {
      // Use phone, userId, or tableNumber as a proxy for customer identity if anonymous
      const custId = order.userId || order.customerPhone || order.tableNumber || "Anonymous";
      if (!map[custId]) {
        map[custId] = { id: custId, orderCount: 0, totalSpent: 0, lastOrder: new Date(0) };
      }
      
      map[custId].orderCount += 1;
      map[custId].totalSpent += (order.totalPrice || 0);
      
      if (order.createdAt) {
        const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        if (d > map[custId].lastOrder) map[custId].lastOrder = d;
      }
    });

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const topCustomers = customerStats.filter(c => c.id !== "Anonymous").slice(0, 10);
  const totalCustomers = customerStats.length;
  const returningCustomers = customerStats.filter(c => c.orderCount > 1).length;
  const newCustomers = totalCustomers - returningCustomers;

  const retentionData = [
    { name: "New Customers", value: newCustomers },
    { name: "Returning Customers", value: returningCustomers }
  ];

  // 2. QR & Table Analytics
  const tableStats = useMemo(() => {
    const map: Record<string, { qrName: string, scans: number, orders: number, revenue: number }> = {};
    
    qrcodes.forEach(qr => {
      const key = qr.tableNumber || qr.name;
      map[key] = { qrName: qr.name || qr.tableNumber, scans: qr.scanCount || 0, orders: 0, revenue: 0 };
    });

    orders.forEach(order => {
      if (order.tableNumber && map[order.tableNumber]) {
        map[order.tableNumber].orders += 1;
        map[order.tableNumber].revenue += (order.totalPrice || 0);
      }
    });

    return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, 10);
  }, [orders, qrcodes]);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Retention Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Customer Retention</h3>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 'bold' }} width={120} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)' }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#ffffff" radius={[0, 4, 4, 0]}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Active Customers Table */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col max-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Top Customers</h3>
            <Star className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {topCustomers.length === 0 ? (
              <EmptyState message="No customer data available." />
            ) : (
              <div className="space-y-3">
                {topCustomers.map((cust, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {cust.id.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{cust.id}</p>
                        <p className="text-[10px] text-muted-foreground">{cust.orderCount} Orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">₹{cust.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* QR Code & Table Analytics */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col max-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Table & QR Performance</h3>
            <p className="text-xs text-muted-foreground mt-1">See how your physical tables and QR codes convert into actual orders.</p>
          </div>
          <QrCode className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {tableStats.length === 0 ? (
            <EmptyState message="No QR codes or Table orders available." />
          ) : (
            <>
              <div className="grid grid-cols-12 gap-2 p-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Table / QR Name</div>
                <div className="col-span-2 text-center">QR Scans</div>
                <div className="col-span-2 text-center">Orders</div>
                <div className="col-span-3 text-right">Table Revenue</div>
              </div>
              
              {tableStats.map((table, idx) => {
                const conversion = table.scans > 0 ? ((table.orders / table.scans) * 100).toFixed(1) : 0;
                
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center border-b border-border hover:bg-muted/50 transition-colors text-sm">
                    <div className="col-span-1 font-bold text-muted-foreground">{idx + 1}</div>
                    <div className="col-span-4 font-bold text-foreground truncate">{table.qrName}</div>
                    <div className="col-span-2 text-center font-bold text-muted-foreground">{table.scans}</div>
                    <div className="col-span-2 text-center">
                      <span className="font-bold text-foreground">{table.orders}</span>
                      {table.scans > 0 && <span className="block text-[9px] text-primary">{conversion}% conv.</span>}
                    </div>
                    <div className="col-span-3 text-right font-bold text-emerald-500">₹{table.revenue.toFixed(2)}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
