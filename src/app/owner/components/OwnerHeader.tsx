/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Store } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase/config";

export function OwnerHeader() {
  const [profile, setProfile] = useState<{ name: string; tagline: string; logoUrl: string } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || "Command Center",
          tagline: data.tagline || "Kitchen Display System & Operations",
          logoUrl: data.logoUrl || ""
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-sm text-card-foreground">
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
          {profile?.logoUrl ? (
            <img 
              src={profile.logoUrl} 
              alt="Restaurant Logo" 
              className="w-14 h-14 object-cover rounded-xl relative shadow-sm border border-border" 
            />
          ) : (
            <div className="w-14 h-14 bg-muted rounded-xl relative shadow-sm flex items-center justify-center border border-border">
              <Store className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {profile?.name || "Command Center"}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {profile?.tagline || "System Operations"}
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex items-center gap-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-full border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-bold tracking-widest uppercase">System Online</span>
      </div>
    </header>
  );
}
