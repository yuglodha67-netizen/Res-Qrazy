import React, { useState, useRef } from "react";
import { QRCodeData } from "@/types/qr";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, CheckSquare, Square, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

export function QRPrintTab({ qrcodes }: { qrcodes: QRCodeData[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState<"minimal" | "table_tent" | "sticker">("table_tent");
  
  const printRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === qrcodes.length) setSelectedIds(newSet => new Set());
    else setSelectedIds(new Set(qrcodes.map(q => q.id)));
  };

  const selectedQRs = qrcodes.filter(qr => selectedIds.has(qr.id));

  const handlePrint = () => {
    if (selectedQRs.length === 0) {
      toast.error("Please select at least one QR code to print.");
      return;
    }
    window.print();
  };

  const handleDownloadSingle = (qr: QRCodeData) => {
    const svgElement = document.getElementById(`qr-svg-${qr.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${qr.name || qr.tableNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success(`Downloaded ${qr.name || qr.tableNumber}`);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:m-0 print:p-0">
      
      {/* Non-printable UI */}
      <div className="print:hidden space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Printer className="w-6 h-6 text-primary" />
            Print & Export Templates
          </h2>
          
          <div className="flex items-center gap-3">
            <select 
              value={template} 
              onChange={e => setTemplate(e.target.value as any)}
              className="bg-background border border-border text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary text-foreground"
            >
              <option value="minimal">Minimal Labels</option>
              <option value="table_tent">Table Tent (Foldable)</option>
              <option value="sticker">Sticker Design</option>
            </select>
            <button 
              onClick={handlePrint}
              className="py-2.5 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Selected ({selectedIds.size})
            </button>
          </div>
        </div>

        <div className="flex-1 bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
            <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              {selectedIds.size === qrcodes.length && qrcodes.length > 0 ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
              Select All
            </button>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{qrcodes.length} Available QRs</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 overflow-y-auto custom-scrollbar flex-1">
            {qrcodes.map(qr => {
              const isSelected = selectedIds.has(qr.id);
              return (
                <div 
                  key={qr.id} 
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
                  onClick={() => toggleSelection(qr.id)}
                >
                  <div className="absolute top-2 right-2">
                    {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground opacity-50" />}
                  </div>
                  
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <QRCodeSVG 
                      id={`qr-svg-${qr.id}`}
                      value={qr.url} 
                      size={80} 
                      level="H" 
                      fgColor={qr.customization?.fgColor || "#000"} 
                      bgColor={qr.customization?.bgColor || "#fff"}
                    />
                  </div>
                  
                  <div className="text-center w-full">
                    <p className="font-bold text-foreground text-sm truncate">{qr.name || qr.tableNumber}</p>
                    <p className="text-[10px] text-muted-foreground uppercase truncate">{qr.section || "N/A"}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownloadSingle(qr); }}
                    className="w-full mt-2 py-1.5 border border-border bg-background text-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" /> PNG
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Area (Hidden normally, visible during print) */}
      <div className="hidden print:block print:w-full">
        {template === "table_tent" && (
          <div className="print:grid print:grid-cols-2 print:gap-8 print:p-8">
            {selectedQRs.map((qr) => (
              <div key={qr.id} className="border-4 border-black p-8 flex flex-col items-center justify-center text-center rounded-3xl" style={{ breakInside: 'avoid', height: '400px' }}>
                <h1 className="text-4xl font-black mb-4">ORDER HERE</h1>
                <p className="text-xl font-medium mb-8 text-slate-600">Scan this code with your phone camera</p>
                <div className="p-4 border-2 border-slate-200 rounded-2xl mb-8">
                  <QRCodeSVG 
                    value={qr.url} 
                    size={200} 
                    level="H" 
                    fgColor={qr.customization?.fgColor || "#000"} 
                    bgColor={qr.customization?.bgColor || "#fff"}
                  />
                </div>
                <div className="w-full bg-black text-white py-3 rounded-xl text-2xl font-bold uppercase tracking-widest">
                  {qr.name || `Table ${qr.tableNumber}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {template === "sticker" && (
          <div className="print:grid print:grid-cols-4 print:gap-4 print:p-4">
            {selectedQRs.map((qr) => (
              <div key={qr.id} className="border-2 border-slate-300 p-4 flex flex-col items-center text-center rounded-full aspect-square justify-center" style={{ breakInside: 'avoid' }}>
                <div className="p-2">
                  <QRCodeSVG 
                    value={qr.url} 
                    size={100} 
                    level="H" 
                    fgColor={qr.customization?.fgColor || "#000"} 
                    bgColor={qr.customization?.bgColor || "#fff"}
                  />
                </div>
                <p className="text-xs font-black mt-2 uppercase">{qr.name || qr.tableNumber}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Scan to Order</p>
              </div>
            ))}
          </div>
        )}

        {template === "minimal" && (
          <div className="print:grid print:grid-cols-5 print:gap-4 print:p-4">
            {selectedQRs.map((qr) => (
              <div key={qr.id} className="border border-slate-200 p-2 flex flex-col items-center text-center" style={{ breakInside: 'avoid' }}>
                <QRCodeSVG 
                  value={qr.url} 
                  size={100} 
                  level="H" 
                  fgColor={qr.customization?.fgColor || "#000"} 
                  bgColor={qr.customization?.bgColor || "#fff"}
                />
                <p className="text-xs font-bold mt-2 truncate w-full">{qr.name || qr.tableNumber}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: auto;  margin: 0mm; }
        }
      `}} />
    </div>
  );
}
