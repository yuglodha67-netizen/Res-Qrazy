import React, { useState } from "react";
import { QRCodeData, QRStatus } from "@/types/qr";
import { Search, Filter, MoreVertical, Edit, Trash2, Link as LinkIcon, Download, CheckCircle, Ban, Archive, Clock } from "lucide-react";
import { toast } from "sonner";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";

export function QRListTab({ qrcodes, onEdit }: { qrcodes: QRCodeData[], onEdit: (qr: QRCodeData) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredQRs = qrcodes.filter(qr => {
    const matchesSearch = (qr.name?.toLowerCase().includes(search.toLowerCase())) || 
                          (qr.tableNumber?.toLowerCase().includes(search.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    const currentStatus = qr.status || "active";
    return matchesSearch && currentStatus === statusFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this QR code?")) return;
    try {
      await deleteDoc(doc(db, "qrcodes", id));
      toast.success("QR code deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete QR code.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: QRStatus) => {
    try {
      await updateDoc(doc(db, "qrcodes", id), { status: newStatus });
      toast.success(`QR marked as ${newStatus}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  const handleRegenerateToken = async (qr: QRCodeData) => {
    if (!confirm("Are you sure? This will invalidate all printed physical QRs for this table!")) return;
    try {
      const newToken = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const newUrl = `${baseUrl}/?qr=${newToken}`;
      
      await updateDoc(doc(db, "qrcodes", qr.id), { 
        token: newToken,
        url: newUrl,
        updatedAt: new Date()
      });
      toast.success("Token regenerated successfully! Old QR codes will no longer work.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to regenerate token.");
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active": return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">Active</span>;
      case "disabled": return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive">Disabled</span>;
      case "expired": return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">Expired</span>;
      case "archived": return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">Archived</span>;
      default: return <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">Active</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Manage QR Codes</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search table or name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-background border border-border text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary transition-colors w-full md:w-64 text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1 shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm text-foreground focus:outline-none py-1.5"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border font-bold text-muted-foreground text-xs uppercase tracking-wider bg-muted">
          <div className="col-span-3">QR Name / Table</div>
          <div className="col-span-2">Section</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Menu Assigned</div>
          <div className="col-span-1 text-center">Scans</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border overflow-y-auto custom-scrollbar flex-1">
          {filteredQRs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[200px]">
              <Search className="w-8 h-8 mb-3 opacity-20" />
              <p>No QR codes match your search criteria.</p>
            </div>
          ) : filteredQRs.map((qr) => (
            <div key={qr.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors">
              <div className="col-span-3">
                <p className="font-bold text-foreground truncate">{qr.name || qr.tableNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{qr.tableNumber ? `Table: ${qr.tableNumber}` : 'No table assigned'}</p>
              </div>
              <div className="col-span-2 text-sm text-foreground truncate">
                {qr.section || <span className="text-muted-foreground italic">None</span>}
              </div>
              <div className="col-span-2">
                {getStatusBadge(qr.status || "active")}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground capitalize">
                {qr.menuId || "Regular"}
              </div>
              <div className="col-span-1 text-center font-bold text-foreground">
                {qr.scanCount || 0}
              </div>
              
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button onClick={() => copyLink(qr.url)} title="Copy Scan Link" className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(qr)} title="Edit QR" className="p-2 text-muted-foreground hover:text-primary bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                
                {/* Dropdown for Status/Delete (mocked as simple buttons for now, or we can use a select) */}
                <select 
                  className="bg-background border border-border text-xs rounded-lg px-2 py-2 text-muted-foreground focus:outline-none focus:border-primary hover:bg-muted cursor-pointer"
                  value={qr.status || "active"}
                  onChange={(e) => {
                    if (e.target.value === "delete") {
                      handleDelete(qr.id);
                    } else if (e.target.value === "regenerate") {
                      handleRegenerateToken(qr);
                      e.target.value = qr.status || "active"; // reset select
                    } else {
                      handleUpdateStatus(qr.id, e.target.value as QRStatus);
                    }
                  }}
                >
                  <option value="active">Make Active</option>
                  <option value="disabled">Disable</option>
                  <option value="archived">Archive</option>
                  <option value="regenerate" className="text-amber-500 font-bold">Regenerate Token</option>
                  <option value="delete" className="text-destructive font-bold">Delete QR</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
