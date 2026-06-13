"use client";

import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { ChefHat, Clock, CheckCircle2, Inbox } from "lucide-react";
import { KDSOrder, KitchenOrderCard } from "./components/KitchenOrderCard";
import { KDSAnalytics } from "./components/KDSAnalytics";
import { KDSHeader } from "./components/KDSHeader";

export default function KDSPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          time: d.time || new Date(d.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }) as KDSOrder[];
      
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter (exclude archived/completed from Kanban)
      if (order.status === "archived" || order.status === "completed") return false;

      // Type Filter
      if (orderTypeFilter !== "all" && order.orderType !== orderTypeFilter) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesTable = order.table.toLowerCase().includes(q);
        const matchesItems = order.items?.some(i => i.toLowerCase().includes(q));
        const matchesCart = order.cartItems?.some(c => c.name.toLowerCase().includes(q));
        return matchesId || matchesTable || matchesItems || matchesCart;
      }

      return true;
    }).sort((a, b) => {
      // Sort priorities first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      
      // Then sort by oldest first
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeA - timeB;
    });
  }, [orders, searchQuery, orderTypeFilter]);

  const newOrders = filteredOrders.filter(o => o.status === "new");
  const preparingOrders = filteredOrders.filter(o => o.status === "preparing");
  const readyOrders = filteredOrders.filter(o => o.status === "ready");

  if (loading) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="animate-pulse bg-card h-24 rounded-2xl border border-border" />
        <div className="flex gap-6 h-[700px]">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 bg-muted/30 p-6 rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Kitchen Display System
          <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/20">Live</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Command center for real-time kitchen operations and order routing.
        </p>
      </div>

      <KDSAnalytics orders={orders} />
      
      <KDSHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        orderTypeFilter={orderTypeFilter} 
        setOrderTypeFilter={setOrderTypeFilter} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[700px] items-start">
        
        {/* NEW ORDERS COLUMN */}
        <div className="bg-muted/30 p-4 xl:p-6 rounded-2xl border border-border flex flex-col h-full max-h-[800px] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">New Orders</h3>
            </div>
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              {newOrders.length}
            </span>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar relative z-10">
            {newOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <Inbox className="w-12 h-12 mb-3" />
                <p className="font-semibold">No new orders</p>
              </div>
            ) : (
              newOrders.map(order => <KitchenOrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>

        {/* PREPARING COLUMN */}
        <div className="bg-muted/30 p-4 xl:p-6 rounded-2xl border border-border flex flex-col h-full max-h-[800px] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Preparing</h3>
            </div>
            <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              {preparingOrders.length}
            </span>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar relative z-10">
            {preparingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <ChefHat className="w-12 h-12 mb-3" />
                <p className="font-semibold">Kitchen is clear</p>
              </div>
            ) : (
              preparingOrders.map(order => <KitchenOrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>

        {/* READY COLUMN */}
        <div className="bg-muted/30 p-4 xl:p-6 rounded-2xl border border-border flex flex-col h-full max-h-[800px] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Ready</h3>
            </div>
            <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              {readyOrders.length}
            </span>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar relative z-10">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <CheckCircle2 className="w-12 h-12 mb-3" />
                <p className="font-semibold">All orders dispatched</p>
              </div>
            ) : (
              readyOrders.map(order => <KitchenOrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
