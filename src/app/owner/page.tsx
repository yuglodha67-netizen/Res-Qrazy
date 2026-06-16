"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { Loader2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/loaders/DashboardSkeleton";

import { DashboardHeader } from "./components/dashboard/DashboardHeader";
import { BusinessOverview } from "./components/dashboard/BusinessOverview";
import { SalesPerformance } from "./components/dashboard/SalesPerformance";
import { OrderWidgets } from "./components/dashboard/OrderWidgets";
import { ProductInsights } from "./components/dashboard/ProductInsights";
import { CustomerInsights } from "./components/dashboard/CustomerInsights";
import { ActivityTimeline } from "./components/dashboard/ActivityTimeline";
import { MiscWidgets } from "./components/dashboard/MiscWidgets";

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [qrcodes, setQrcodes] = useState<any[]>([]);
  
  // Customization State
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    overview: true, sales: true, orders: true, products: true, customers: true, timeline: true, misc: true
  });

  useEffect(() => {
    // Load preferences
    const saved = localStorage.getItem("dashboardPreferences");
    if (saved) {
      try { setVisibleWidgets(JSON.parse(saved)); } catch (e) {}
    }

    const unsubs: (() => void)[] = [];

    // Fetch orders (Limited for performance if it's huge, but assuming reasonable size for now)
    const unsubOrders = onSnapshot(query(collection(db, "orders")), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    unsubs.push(unsubOrders);

    // Fetch products
    const unsubProducts = onSnapshot(query(collection(db, "products")), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    });
    unsubs.push(unsubProducts);

    // Fetch QRs
    const unsubQRs = onSnapshot(query(collection(db, "qrcodes")), (snapshot) => {
      setQrcodes(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    });
    unsubs.push(unsubQRs);

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  const toggleWidget = (key: string) => {
    setVisibleWidgets(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("dashboardPreferences", JSON.stringify(next));
      return next;
    });
  };

  if (loading && orders.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-12">
      <DashboardHeader 
        visibleWidgets={visibleWidgets}
        onToggleWidget={toggleWidget}
      />
      
      {visibleWidgets.overview && <BusinessOverview orders={orders} products={products} />}
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {visibleWidgets.sales && <SalesPerformance orders={orders} />}
          {visibleWidgets.orders && <OrderWidgets orders={orders} />}
          {visibleWidgets.products && <ProductInsights orders={orders} products={products} />}
          {visibleWidgets.customers && <CustomerInsights orders={orders} />}
        </div>
        
        <div className="flex flex-col gap-6">
          {visibleWidgets.misc && <MiscWidgets qrcodes={qrcodes} orders={orders} products={products} />}
          {visibleWidgets.timeline && <ActivityTimeline orders={orders} products={products} />}
        </div>
      </div>
    </div>
  );
}
