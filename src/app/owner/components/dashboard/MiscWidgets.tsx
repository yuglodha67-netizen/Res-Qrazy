import React, { useMemo } from "react";
import { PackageX, QrCode, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  products: any[];
  qrcodes: any[];
  orders: any[];
}

export function MiscWidgets({ products, qrcodes, orders }: Props) {
  
  // Inventory Alerts
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.inStock === false || (p.stockQuantity !== undefined && p.stockQuantity < 5));
  }, [products]);

  // QR Summary
  const qrSummary = useMemo(() => {
    const totalScans = qrcodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0);
    const topQR = [...qrcodes].sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0))[0];
    return { totalScans, topQR };
  }, [qrcodes]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
      
      {/* Inventory Alerts */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <PackageX className="w-4 h-4 text-amber-500" />
            Inventory Alerts
          </h2>
          {lowStockProducts.length > 0 && (
            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {lowStockProducts.length} issues
            </span>
          )}
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All products are well stocked.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Action Required</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {lowStockProducts.length} products are marked as out of stock or running low.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              {lowStockProducts.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded-lg">
                  <span className="font-bold text-foreground truncate max-w-[150px]">{p.name}</span>
                  <span className="text-destructive font-bold">{p.inStock === false ? 'Out of Stock' : 'Low Stock'}</span>
                </div>
              ))}
            </div>
            
            <Link href="/owner/products" className="block text-center mt-2 text-xs font-bold text-primary hover:underline">
              Manage Inventory
            </Link>
          </div>
        )}
      </div>

      {/* QR Performance */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            QR Performance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 border border-border rounded-xl">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Scans</p>
            <p className="text-2xl font-black text-foreground">{qrSummary.totalScans}</p>
          </div>
          <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Table</p>
            <p className="text-sm font-bold text-foreground truncate">{qrSummary.topQR?.name || qrSummary.topQR?.tableNumber || "N/A"}</p>
          </div>
        </div>
        
        <Link href="/owner/qr" className="mt-4 flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 rounded-xl group cursor-pointer">
          <span className="text-xs font-bold text-primary">Manage QR Codes</span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
}
