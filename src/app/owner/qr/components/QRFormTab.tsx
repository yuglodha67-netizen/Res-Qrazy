import React, { useState, useEffect } from "react";
import { QRCodeData, QRCustomization, QRStatus } from "@/types/qr";
import { QRCodeSVG } from "qrcode.react";
import { Save, Ban, Palette, Link as LinkIcon, QrCode } from "lucide-react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

interface Props {
  existingQR: QRCodeData | null;
  onComplete: () => void;
  onCancel: () => void;
}

export function QRFormTab({ existingQR, onComplete, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    tableNumber: "",
    section: "",
    description: "",
    menuId: "regular",
    status: "active" as QRStatus,
  });

  const [customization, setCustomization] = useState<QRCustomization>({
    fgColor: "#000000",
    bgColor: "#ffffff",
    eyeColor: "#000000",
    style: "squares",
    logoUrl: "",
  });

  useEffect(() => {
    if (existingQR) {
      setFormData({
        name: existingQR.name || "",
        tableNumber: existingQR.tableNumber || "",
        section: existingQR.section || "",
        description: existingQR.description || "",
        menuId: existingQR.menuId || "regular",
        status: existingQR.status || "active",
      });
      if (existingQR.customization) {
        setCustomization({
          ...existingQR.customization,
          style: existingQR.customization.style || "squares"
        });
      }
    }
  }, [existingQR]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.tableNumber) {
      toast.error("Please provide a name or table number.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(existingQR ? "Updating QR code..." : "Generating QR code...");

    try {
      const baseUrl = window.location.origin;
      const secureToken = existingQR?.token || crypto.randomUUID();
      const scanUrl = `${baseUrl}/?qr=${secureToken}`;
      
      const qrData = {
        ...formData,
        url: scanUrl,
        token: secureToken,
        customization,
        updatedAt: new Date(),
      };

      if (existingQR) {
        await updateDoc(doc(db, "qrcodes", existingQR.id), qrData);
        toast.success("QR Code updated!", { id: toastId });
      } else {
        await addDoc(collection(db, "qrcodes"), {
          ...qrData,
          scanCount: 0,
          createdAt: new Date(),
        });
        toast.success("QR Code generated successfully!", { id: toastId });
      }
      
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save QR code.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Preview URL generator
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const previewUrl = `${baseUrl}/?qr=${existingQR?.token || 'preview_token'}`;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
        <QrCode className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {existingQR ? "Edit QR Code" : "Create New QR Code"}
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Column */}
        <form id="qr-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Basic Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">QR Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="e.g. Table 01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Table Identifier</label>
                <input type="text" value={formData.tableNumber} onChange={e => setFormData({ ...formData, tableNumber: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="e.g. 1, T-1, Bar-2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Section / Area</label>
              <input type="text" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="e.g. Outdoor, Main Dining" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Assigned Menu</label>
              <select value={formData.menuId} onChange={e => setFormData({ ...formData, menuId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:border-primary outline-none appearance-none">
                <option value="regular">Regular Menu</option>
                <option value="breakfast">Breakfast Menu</option>
                <option value="lunch">Lunch Menu</option>
                <option value="dinner">Dinner Menu</option>
                <option value="special">Special Event</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Initial Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as QRStatus })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:border-primary outline-none appearance-none">
                <option value="active">Active</option>
                <option value="disabled">Disabled (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Design & Customization
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Foreground</label>
                <div className="flex items-center gap-2 border border-border rounded-xl p-1 bg-background">
                  <input type="color" value={customization.fgColor} onChange={e => setCustomization({...customization, fgColor: e.target.value})} className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent" />
                  <span className="text-xs font-mono text-muted-foreground">{customization.fgColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Background</label>
                <div className="flex items-center gap-2 border border-border rounded-xl p-1 bg-background">
                  <input type="color" value={customization.bgColor} onChange={e => setCustomization({...customization, bgColor: e.target.value})} className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent" />
                  <span className="text-xs font-mono text-muted-foreground">{customization.bgColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Pattern</label>
                <select value={customization.style} onChange={e => setCustomization({...customization, style: e.target.value as any})} className="w-full h-[42px] bg-background border border-border rounded-xl px-2 text-sm text-foreground focus:border-primary outline-none">
                  <option value="squares">Squares</option>
                  <option value="dots">Dots</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-foreground">Center Logo URL (Optional)</label>
              <input type="url" value={customization.logoUrl || ""} onChange={e => setCustomization({ ...customization, logoUrl: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:border-primary outline-none placeholder:text-muted-foreground" placeholder="https://your-domain.com/logo.png" />
              <p className="text-xs text-muted-foreground mt-1">Leave empty for a standard QR code without a logo.</p>
            </div>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-32 bg-primary/5 border-b border-border/50"></div>
            
            <div className="relative z-10 w-full max-w-sm mx-auto bg-background rounded-3xl border border-border shadow-xl p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Scan for Menu</h3>
              <p className="text-sm text-muted-foreground mb-8">Point your camera at this code to order from {formData.name || "your table"}.</p>
              
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG 
                  value={previewUrl} 
                  size={200} 
                  level="H" 
                  fgColor={customization.fgColor} 
                  bgColor={customization.bgColor}
                  imageSettings={customization.logoUrl ? {
                    src: customization.logoUrl,
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  } : undefined}
                />
              </div>

              <div className="mt-8 pt-6 border-t border-border w-full flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                <LinkIcon className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{previewUrl}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <Ban className="w-4 h-4" /> Cancel
            </button>
            <button type="submit" form="qr-form" disabled={loading} className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Save className="w-4 h-4" /> {existingQR ? "Save Changes" : "Create QR Code"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
