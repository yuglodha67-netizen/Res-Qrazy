import React, { useState } from "react";
import { Download, FileText, Printer, FileSpreadsheet } from "lucide-react";
import { DateRange } from "../page";
import { toast } from "sonner";

interface Props {
  orders: any[];
  products: any[];
  dateRange: DateRange;
}

export function ExportReportsTab({ orders, products, dateRange }: Props) {
  const [reportType, setReportType] = useState("revenue");

  const generateCSV = () => {
    if (orders.length === 0) {
      toast.error("No data available to export for this period.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `QRAZY_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === "revenue" || reportType === "orders") {
      csvContent += "Order ID,Date,Status,Payment Method,Total Items,Revenue\n";
      orders.forEach(order => {
        const date = order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : order.createdAt;
        const items = order.cartItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
        csvContent += `"${order.id}","${date}","${order.status || 'pending'}","${order.paymentMethod || 'cash'}",${items},${order.totalPrice || 0}\n`;
      });
    } else if (reportType === "products") {
      csvContent += "Product Name,Category,Quantity Sold,Total Revenue Generated\n";
      const stats: Record<string, { cat: string, qty: number, rev: number }> = {};
      orders.forEach(order => {
        if (order.cartItems && Array.isArray(order.cartItems)) {
          order.cartItems.forEach((item: any) => {
            if (!stats[item.name]) stats[item.name] = { cat: item.category || 'N/A', qty: 0, rev: 0 };
            stats[item.name].qty += (item.quantity || 1);
            stats[item.name].rev += ((item.price || 0) * (item.quantity || 1));
          });
        }
      });
      Object.entries(stats).forEach(([name, data]) => {
        csvContent += `"${name}","${data.cat}",${data.qty},${data.rev}\n`;
      });
    } else if (reportType === "customers") {
      csvContent += "Customer ID,Total Orders,Total Spent\n";
      const stats: Record<string, { orders: number, spent: number }> = {};
      orders.forEach(order => {
        const id = order.userId || order.customerPhone || order.tableNumber || "Anonymous";
        if (!stats[id]) stats[id] = { orders: 0, spent: 0 };
        stats[id].orders += 1;
        stats[id].spent += (order.totalPrice || 0);
      });
      Object.entries(stats).forEach(([id, data]) => {
        csvContent += `"${id}",${data.orders},${data.spent}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export generated successfully!");
  };

  const generatePDF = () => {
    // A robust SaaS would use @react-pdf or server-side generation.
    // As an immediate high-quality solution, we trigger the browser print dialog
    // which natively supports "Save as PDF" and preserves CSS styling perfectly.
    toast.success("Opening print dialog. Select 'Save as PDF' as your destination.");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Export Data Reports</h2>
            <p className="text-muted-foreground text-sm mt-1">Generate comprehensive business reports for accounting, auditing, and record keeping.</p>
          </div>
        </div>

        <div className="space-y-8 print:hidden">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground">1. Select Report Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "revenue", label: "Financial & Revenue Report", desc: "Detailed breakdown of income and payments." },
                { id: "orders", label: "Order History Report", desc: "Complete log of all orders placed in the period." },
                { id: "products", label: "Product Performance Report", desc: "Sales volume and revenue per menu item." },
                { id: "customers", label: "Customer Activity Report", desc: "Data on active customers and their spending." }
              ].map(type => (
                <div 
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${reportType === type.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/30'}`}
                >
                  <h3 className="font-bold text-foreground mb-1">{type.label}</h3>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground">2. Confirm Data Scope</label>
            <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm flex justify-between items-center">
              <span className="text-muted-foreground">Currently Selected Period:</span>
              <span className="font-bold text-foreground uppercase tracking-wider">{dateRange.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-muted-foreground">To change the date range, use the global date selector in the top right corner of the dashboard.</p>
          </div>

          <div className="pt-6 border-t border-border flex gap-4">
            <button 
              onClick={generateCSV}
              className="flex-1 py-4 bg-card border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" /> Download CSV
            </button>
            <button 
              onClick={generatePDF}
              className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-5 h-5" /> Print / Save PDF
            </button>
          </div>

        </div>

      </div>

      {/* Hidden printable report summary */}
      <div className="hidden print:block print:p-8 print:w-full print:absolute print:top-0 print:left-0 print:bg-white print:z-50 print:min-h-screen">
        <h1 className="text-4xl font-black mb-2 uppercase">QRAZY Analytics Report</h1>
        <p className="text-lg text-slate-500 font-bold mb-8 uppercase tracking-widest border-b-2 border-slate-200 pb-4">
          Report Type: {reportType} | Period: {dateRange.replace('_', ' ')}
        </p>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="p-6 border-2 border-slate-200 rounded-2xl">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Orders</p>
            <p className="text-4xl font-black">{orders.length}</p>
          </div>
          <div className="p-6 border-2 border-slate-200 rounded-2xl">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue Generated</p>
            <p className="text-4xl font-black">₹{orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}</p>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-20">
          Generated automatically by QRAZY Restaurant Management System
        </p>
      </div>

    </div>
  );
}
