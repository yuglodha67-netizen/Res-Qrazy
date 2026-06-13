import React from "react";
import { QRCodeData } from "@/types/qr";
import { LayoutDashboard, QrCode, CheckCircle, Ban, ScanFace, TrendingUp, Clock } from "lucide-react";

export function QRDashboardTab({ qrcodes }: { qrcodes: QRCodeData[] }) {
  const totalQRs = qrcodes.length;
  const activeQRs = qrcodes.filter(qr => qr.status === "active" || !qr.status).length;
  const expiredQRs = qrcodes.filter(qr => qr.status === "expired").length;
  const disabledQRs = qrcodes.filter(qr => qr.status === "disabled").length;
  
  const totalScans = qrcodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0);
  
  const mostScanned = [...qrcodes].sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0)).slice(0, 3);

  const stats = [
    { label: "Total QR Codes", value: totalQRs, icon: QrCode },
    { label: "Active QRs", value: activeQRs, icon: CheckCircle },
    { label: "Total Scans", value: totalScans, icon: ScanFace },
    { label: "Disabled/Expired", value: expiredQRs + disabledQRs, icon: Ban },
  ];

  // Mock scan history for chart
  const mockScans = [
    { day: "Mon", value: 12 },
    { day: "Tue", value: 45 },
    { day: "Wed", value: 32 },
    { day: "Thu", value: 65 },
    { day: "Fri", value: 120 },
    { day: "Sat", value: 180 },
    { day: "Sun", value: 140 },
  ];
  const maxScans = Math.max(...mockScans.map(d => d.value), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">QR Overview</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent text-foreground transition-transform">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Scans Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Weekly Scan Trends</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-end gap-2 justify-between">
            {mockScans.map((data) => {
              const height = `${(data.value / maxScans) * 100}%`;
              return (
                <div key={data.day} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-primary/20 rounded-t-lg relative flex items-end justify-center group-hover:bg-primary/30 transition-colors" style={{ height }}>
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-foreground px-2 py-1 rounded text-xs font-bold text-background transition-opacity">
                      {data.value}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Scanned Tables */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Most Scanned QR Codes</h3>
          {mostScanned.length === 0 || mostScanned[0].scanCount === 0 || !mostScanned[0].scanCount ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
              <Clock className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">No scan data available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mostScanned.map((qr, idx) => (
                <div key={qr.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{qr.name || qr.tableNumber}</p>
                    <p className="text-xs text-muted-foreground">Section: {qr.section || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{qr.scanCount}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Scans</p>
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
