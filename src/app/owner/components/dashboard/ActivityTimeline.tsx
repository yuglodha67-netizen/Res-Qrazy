import React, { useMemo } from "react";
import { Activity, ShoppingBag, Package, Bell } from "lucide-react";

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
}

interface Props {
  orders: any[];
  products: any[];
}

export function ActivityTimeline({ orders, products }: Props) {
  
  const activities = useMemo(() => {
    const feed: any[] = [];

    // Map Orders to Activities
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      feed.push({
        id: `order_${order.id}`,
        type: "order",
        title: `New Order Received #${order.id.slice(0, 6)}`,
        desc: `${order.cartItems?.length || 1} items - ₹${Number(order.totalPrice || 0).toFixed(2)}`,
        date,
        time: date.getTime(),
        icon: ShoppingBag,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      });
    });

    // Sort and slice
    return feed.sort((a, b) => b.time - a.time).slice(0, 8);
  }, [orders]);

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col max-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Feed
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time restaurant pulse</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
            <Bell className="w-8 h-8 mb-3" />
            <p className="text-sm font-medium">No recent activity</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-4 space-y-6">
            {activities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${item.bg} flex items-center justify-center border-4 border-card`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-wider">
                      {timeAgo(item.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
