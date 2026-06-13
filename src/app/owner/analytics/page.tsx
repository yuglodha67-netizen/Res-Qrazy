"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart as BarChartIcon, LayoutDashboard, LineChart, PieChart, 
  Users, FileDown, RefreshCw, Calendar, Loader2 
} from "lucide-react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

import { AnalyticsOverviewTab } from "./components/AnalyticsOverviewTab";
import { RevenueOrdersTab } from "./components/RevenueOrdersTab";
import { ProductsMenuTab } from "./components/ProductsMenuTab";
import { CustomersQRTab } from "./components/CustomersQRTab";
import { ExportReportsTab } from "./components/ExportReportsTab";

export type DateRange = "today" | "last_7" | "last_30" | "last_90" | "all_time";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "revenue", label: "Revenue & Orders", icon: LineChart },
  { id: "products", label: "Products & Menu", icon: PieChart },
  { id: "customers", label: "Customers & QR", icon: Users },
  { id: "reports", label: "Export Reports", icon: FileDown },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>("last_30");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [qrcodes, setQrcodes] = useState<any[]>([]);

  const fetchAnalytics = () => {
    setIsRefreshing(true);
    setLoading(true);

    let startDate: Date | null = null;
    const now = new Date();
    
    switch (dateRange) {
      case "today": startDate = new Date(now.setHours(0,0,0,0)); break;
      case "last_7": startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case "last_30": startDate = new Date(now.setDate(now.getDate() - 30)); break;
      case "last_90": startDate = new Date(now.setDate(now.getDate() - 90)); break;
      case "all_time": startDate = null; break;
    }

    // Orders Query (filtered by date if applicable)
    let ordersQuery = query(collection(db, "orders"));
    // Note: To use orderBy and where together in Firestore, we need an index.
    // If no index exists, this might fail, so we'll fetch all and filter locally 
    // to guarantee it works without requiring the user to click a Firebase index creation link.
    // However, if we fetch all, it might be heavy. For production, local filtering is a safe fallback.
    
    const unsubs: (() => void)[] = [];

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      let fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Local date filter to avoid Firebase index errors
      if (startDate) {
        fetchedOrders = fetchedOrders.filter(order => {
          if (!order.createdAt) return false;
          // Handle both Firebase Timestamp and ISO strings
          const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
          return orderDate >= startDate!;
        });
      }
      
      setOrders(fetchedOrders);
      setLastUpdated(new Date());
      setLoading(false);
      setIsRefreshing(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to fetch order analytics");
      setLoading(false);
      setIsRefreshing(false);
    });
    unsubs.push(unsubOrders);

    // Products Query (We need all products for inventory/menu analytics)
    const unsubProducts = onSnapshot(query(collection(db, "products")), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    });
    unsubs.push(unsubProducts);

    // QR Codes Query
    const unsubQRs = onSnapshot(query(collection(db, "qrcodes")), (snapshot) => {
      setQrcodes(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    });
    unsubs.push(unsubQRs);

    return () => unsubs.forEach(unsub => unsub());
  };

  useEffect(() => {
    const cleanup = fetchAnalytics();
    return cleanup;
  }, [dateRange]);

  const handleManualRefresh = () => {
    toast.info("Refreshing analytics...");
    fetchAnalytics();
  };

  const renderContent = () => {
    if (loading && orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
          <Loader2 className="w-12 h-12 animate-spin text-primary/50 mb-4" />
          <p className="font-medium text-lg">Crunching the numbers...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview": return <AnalyticsOverviewTab orders={orders} products={products} dateRange={dateRange} />;
      case "revenue": return <RevenueOrdersTab orders={orders} dateRange={dateRange} />;
      case "products": return <ProductsMenuTab orders={orders} products={products} />;
      case "customers": return <CustomersQRTab orders={orders} qrcodes={qrcodes} />;
      case "reports": return <ExportReportsTab orders={orders} products={products} dateRange={dateRange} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto text-foreground pb-8">
      
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BarChartIcon className="w-8 h-8 text-primary" />
            Restaurant Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium flex items-center gap-2">
            Real-time performance insights. 
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-muted rounded-md border border-border">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value as DateRange)}
              className="bg-transparent border-none text-sm font-bold text-foreground focus:outline-none appearance-none pr-4 cursor-pointer"
            >
              <option className="bg-background text-foreground" value="today">Today</option>
              <option className="bg-background text-foreground" value="last_7">Last 7 Days</option>
              <option className="bg-background text-foreground" value="last_30">Last 30 Days</option>
              <option className="bg-background text-foreground" value="last_90">Last 3 Months</option>
              <option className="bg-background text-foreground" value="all_time">All Time</option>
            </select>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-3 bg-card border border-border rounded-xl shadow-sm hover:bg-muted transition-colors text-foreground disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm ${
                  isActive 
                    ? 'bg-accent text-accent-foreground border border-border shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full relative min-h-[calc(100vh-220px)] flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
