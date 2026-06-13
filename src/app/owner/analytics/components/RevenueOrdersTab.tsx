import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { DateRange } from "../page";
import { EmptyState } from "./shared";
import { Clock, Wallet, CheckCircle } from "lucide-react";

interface Props {
  orders: any[];
  dateRange: DateRange;
}

const COLORS = ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function RevenueOrdersTab({ orders, dateRange }: Props) {
  
  // 1. Revenue by Date (Bar Chart)
  const revenueData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const key = dateRange === "today" 
        ? `${date.getHours()}:00` 
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap[key] = (dataMap[key] || 0) + (order.totalPrice || 0);
    });

    return Object.entries(dataMap)
      .map(([time, revenue]) => ({ time, revenue }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [orders, dateRange]);

  // 2. Order Status Distribution (Pie Chart)
  const statusData = useMemo(() => {
    const map: Record<string, number> = {
      completed: 0, pending: 0, preparing: 0, cancelled: 0
    };
    orders.forEach(order => {
      const status = (order.status || "pending").toLowerCase();
      map[status] = (map[status] || 0) + 1;
    });
    
    return Object.entries(map)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  // 3. Payment Method Distribution
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {
      cash: 0, online: 0, card: 0, other: 0
    };
    orders.forEach(order => {
      const method = (order.paymentMethod || "other").toLowerCase();
      map[method] = (map[method] || 0) + 1;
    });
    
    return Object.entries(map)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  // 4. Peak Hours Heatmap Approx (Orders by Hour)
  const peakHoursData = useMemo(() => {
    const map: Record<number, number> = {};
    for (let i=0; i<24; i++) map[i] = 0; // Initialize 24 hours
    
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      map[date.getHours()] += 1;
    });

    return Object.entries(map)
      .map(([hour, count]) => ({ 
        hour: `${hour.padStart(2, '0')}:00`, 
        count 
      }))
      .filter(d => d.count > 0 || parseInt(d.hour) > 8 && parseInt(d.hour) < 23); // Filter to active hours roughly
  }, [orders]);

  if (orders.length === 0) {
    return <EmptyState message="No orders found for the selected date range." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Revenue Bar Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Revenue Breakdown</h3>
          <Wallet className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                formatter={(value: any) => {
                  const num = typeof value === 'number' ? value : 0;
                  return [`₹${num.toFixed(2)}`, 'Revenue'];
                }}
              />
              <Bar dataKey="revenue" fill="#ffffff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Order Status */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground">Order Status</h3>
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground">Payment Methods</h3>
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak Hours Approx Heatmap (Bar Chart) */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Peak Order Hours</h3>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                formatter={(value: any) => [value, 'Orders']}
              />
              <Bar dataKey="count" fill="#ffffff" opacity={0.6} activeBar={{ opacity: 1 }} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
