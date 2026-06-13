"use client";

import React, { useState, useEffect } from "react";
import { QrCode, LayoutDashboard, List, PlusSquare, Printer, Settings } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";
import { QRCodeData } from "@/types/qr";

import { QRDashboardTab } from "./components/QRDashboardTab";
import { QRListTab } from "./components/QRListTab";
import { QRFormTab } from "./components/QRFormTab";
import { QRPrintTab } from "./components/QRPrintTab";

const TABS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "list", label: "Manage QR Codes", icon: List },
  { id: "form", label: "Create New QR", icon: PlusSquare },
  { id: "print", label: "Templates & Print", icon: Printer },
  { id: "settings", label: "Security & Settings", icon: Settings },
];

export default function QRManagementDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [qrcodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);

  useEffect(() => {
    const q = query(collection(db, "qrcodes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QRCodeData[];
      setQRCodes(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to fetch QR codes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (qr: QRCodeData) => {
    setEditingQR(qr);
    setActiveTab("form");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <QRDashboardTab qrcodes={qrcodes} />;
      case "list": return <QRListTab qrcodes={qrcodes} onEdit={handleEdit} />;
      case "form": return <QRFormTab existingQR={editingQR} onComplete={() => { setEditingQR(null); setActiveTab("list"); }} onCancel={() => { setEditingQR(null); setActiveTab("list"); }} />;
      case "print": return <QRPrintTab qrcodes={qrcodes} />;
      case "settings": return <div className="p-8 text-center text-muted-foreground border border-border rounded-xl bg-card">Security settings coming soon...</div>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto text-foreground pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <QrCode className="w-8 h-8 text-primary" />
            QR Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Generate, customize, and manage smart QR codes for your tables.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = (tab.id === "form" && editingQR) ? "Edit QR Code" : tab.label;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== "form") setEditingQR(null);
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm ${
                  isActive 
                    ? 'bg-accent text-accent-foreground border border-border shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm relative min-h-[calc(100vh-220px)] flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-full flex-1">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex-1">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
