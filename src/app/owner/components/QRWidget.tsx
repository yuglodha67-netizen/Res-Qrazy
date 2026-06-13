import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy } from "lucide-react";

export function QRWidget() {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
        <QrCode className="w-5 h-5 text-primary" />
        AR Menu Access
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Scan to instantly view the menu in AR. Zero app installation required.
      </p>
      
      <div className="relative mx-auto w-fit mb-6 transition-transform duration-300 hover:scale-105">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <QRCodeSVG value="https://qrazy.example.com/scan?table=4" size={160} level="H" />
        </div>
      </div>
      
      <button className="w-full py-2.5 bg-primary hover:bg-primary/90 transition-all rounded-lg text-sm font-medium text-primary-foreground flex items-center justify-center gap-2">
        <Copy className="w-4 h-4" />
        Copy Link (Table 4)
      </button>
    </div>
  );
}
