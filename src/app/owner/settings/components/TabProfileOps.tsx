"use client";

import React from "react";
import { RestaurantSettings } from "@/types/settings";
import { Store, Clock, Palette, MenuSquare, Type, RefreshCw, UploadCloud } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase/config";
import { toast } from "sonner";

interface TabProps {
  settings: RestaurantSettings;
  onUpdate: (updates: Partial<RestaurantSettings>) => void;
}

export function ProfileTab({ settings, onUpdate }: TabProps) {
  const [logoUploadProgress, setLogoUploadProgress] = React.useState<number | null>(null);
  const [coverUploadProgress, setCoverUploadProgress] = React.useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    const setProgress = field === 'logoUrl' ? setLogoUploadProgress : setCoverUploadProgress;
    const storageRef = ref(storage, `settings/${field}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      }, 
      (error) => {
        console.error(error);
        toast.error(`Failed to upload image`);
        setProgress(null);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUpdate({ [field]: downloadURL });
        setProgress(null);
        toast.success("Image uploaded successfully!");
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Store className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Restaurant Profile</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Restaurant Name</label>
          <input 
            type="text" 
            value={settings.name} 
            onChange={e => onUpdate({ name: e.target.value })} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors" 
            placeholder="The Gourmet Kitchen" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Tagline</label>
          <input 
            type="text" 
            value={settings.tagline} 
            onChange={e => onUpdate({ tagline: e.target.value })} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors" 
            placeholder="Fine dining, reimagined." 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Full Description</label>
          <textarea 
            value={settings.description} 
            onChange={e => onUpdate({ description: e.target.value })} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors min-h-[100px]" 
            placeholder="Tell your customers about your restaurant's story..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Logo Image</label>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl border border-border/60 bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
              {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-xs text-muted-foreground">Logo</span>}
              {logoUploadProgress !== null && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{Math.round(logoUploadProgress)}%</span>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logoUrl')} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                disabled={logoUploadProgress !== null}
              />
              <div className={`w-full bg-muted border ${logoUploadProgress !== null ? 'border-primary border-dashed' : 'border-border/60'} rounded-xl px-4 py-3 text-foreground flex items-center justify-between transition-colors`}>
                <span className="text-sm text-muted-foreground truncate pr-4">
                  {logoUploadProgress !== null ? 'Uploading...' : (settings.logoUrl ? 'Logo uploaded. Click to replace.' : 'Select a logo image...')}
                </span>
                <UploadCloud className={`w-5 h-5 ${logoUploadProgress !== null ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Hero/Cover Image</label>
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl border border-border/60 bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
              {settings.coverUrl ? <img src={settings.coverUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-xs text-muted-foreground">Cover</span>}
              {coverUploadProgress !== null && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{Math.round(coverUploadProgress)}%</span>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'coverUrl')} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                disabled={coverUploadProgress !== null}
              />
              <div className={`w-full bg-muted border ${coverUploadProgress !== null ? 'border-primary border-dashed' : 'border-border/60'} rounded-xl px-4 py-3 text-foreground flex items-center justify-between transition-colors`}>
                <span className="text-sm text-muted-foreground truncate pr-4">
                  {coverUploadProgress !== null ? 'Uploading...' : (settings.coverUrl ? 'Cover uploaded. Click to replace.' : 'Select a cover image...')}
                </span>
                <UploadCloud className={`w-5 h-5 ${coverUploadProgress !== null ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2 pt-4 border-t border-border/40">
          <h3 className="text-lg font-bold text-foreground mb-4">Customer Page Hero Section</h3>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Hero Headline</label>
          <input 
            type="text" 
            value={settings.heroTitle} 
            onChange={e => onUpdate({ heroTitle: e.target.value })} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors text-lg font-bold" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Hero Description Text</label>
          <textarea 
            value={settings.heroDescription} 
            onChange={e => onUpdate({ heroDescription: e.target.value })} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors min-h-[80px]" 
          />
        </div>

      </div>
    </div>
  );
}

export function OperationsTab({ settings, onUpdate }: TabProps) {
  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    const updatedHours = {
      ...settings.businessHours,
      [day]: {
        ...settings.businessHours[day as keyof typeof settings.businessHours],
        [field]: value
      }
    };
    onUpdate({ businessHours: updatedHours as Partial<RestaurantSettings>['businessHours'] });
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Clock className="w-6 h-6 text-amber-400" />
        <h2 className="text-2xl font-bold text-foreground">Operational Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Operations */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border/40 pb-2">Order Preferences</h3>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/40">
            <div>
              <h4 className="text-sm font-bold text-foreground">Accept Online Orders</h4>
              <p className="text-xs text-muted-foreground mt-1">Allow customers to checkout online</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.acceptOrders} onChange={e => onUpdate({ acceptOrders: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/40">
            <div>
              <h4 className="text-sm font-bold text-foreground">Table Reservations</h4>
              <p className="text-xs text-muted-foreground mt-1">Allow advance bookings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.tableReservations} onChange={e => onUpdate({ tableReservations: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Estimated Prep Time</label>
            <input 
              type="text" 
              value={settings.prepTime} 
              onChange={e => onUpdate({ prepTime: e.target.value })} 
              className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none transition-colors" 
              placeholder="e.g. 20-30 mins" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Minimum Order Amount (₹)</label>
            <input 
              type="number" 
              value={settings.minOrderAmount} 
              onChange={e => onUpdate({ minOrderAmount: parseFloat(e.target.value) || 0 })} 
              className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-amber-500 outline-none transition-colors" 
            />
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border/40 pb-2">Business Hours</h3>
          
          <div className="space-y-3">
            {days.map((day) => {
              const dayData = settings.businessHours[day as keyof typeof settings.businessHours];
              return (
                <div key={day} className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-colors ${dayData.closed ? 'bg-card border border-border border-red-500/10 opacity-70' : 'bg-muted/80 border-border/40'}`}>
                  <div className="w-12 sm:w-16 font-medium capitalize text-sm text-foreground shrink-0">
                    {day.substring(0, 3)}
                  </div>
                  
                  <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                    <input 
                      type="time" 
                      disabled={dayData.closed}
                      value={dayData.open} 
                      onChange={e => handleHoursChange(day, 'open', e.target.value)}
                      className="bg-muted/30 border border-border/60 rounded-lg px-1 sm:px-2 py-1 text-xs sm:text-sm text-foreground disabled:opacity-50 w-full min-w-0" 
                    />
                    <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0">to</span>
                    <input 
                      type="time" 
                      disabled={dayData.closed}
                      value={dayData.close} 
                      onChange={e => handleHoursChange(day, 'close', e.target.value)}
                      className="bg-muted/30 border border-border/60 rounded-lg px-1 sm:px-2 py-1 text-xs sm:text-sm text-foreground disabled:opacity-50 w-full min-w-0" 
                    />
                  </div>
                  
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-xs ml-1 sm:ml-2 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={dayData.closed} 
                      onChange={e => handleHoursChange(day, 'closed', e.target.checked)}
                      className="rounded bg-muted/30 border-border/60 text-red-500 focus:ring-red-500/20"
                    />
                    <span className={dayData.closed ? 'text-red-400' : 'text-muted-foreground'}>Closed</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export function MenuTab({ settings, onUpdate }: TabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <MenuSquare className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-foreground">Menu Preferences</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-5 bg-muted/50 rounded-2xl border border-border/40 md:col-span-2">
          <div>
            <h4 className="text-base font-bold text-foreground">Menu Visibility</h4>
            <p className="text-sm text-muted-foreground mt-1">If disabled, the customer menu page will show a &quot;Coming Soon&quot; or &quot;Closed&quot; message.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.menuVisible} onChange={e => onUpdate({ menuVisible: e.target.checked })} className="sr-only peer" />
            <div className="w-14 h-7 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-5 bg-muted/50 rounded-2xl border border-border/40 md:col-span-2">
          <div>
            <h4 className="text-base font-bold text-foreground">Auto-Hide Out of Stock</h4>
            <p className="text-sm text-muted-foreground mt-1">Automatically hide items from the menu when their inventory reaches zero.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.autoHideOutofStock} onChange={e => onUpdate({ autoHideOutofStock: e.target.checked })} className="sr-only peer" />
            <div className="w-14 h-7 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export function BrandingTab({ settings, onUpdate }: TabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Palette className="w-6 h-6 text-pink-400" />
        <h2 className="text-2xl font-bold text-foreground">Appearance & Branding</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium text-muted-foreground">Customer Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {["light", "dark", "system"].map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdate({ themeMode: mode as "light" | "dark" | "system" })}
                className={`py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all ${
                  settings.themeMode === mode 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-muted-foreground">Brand Primary Color</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              value={settings.primaryColor} 
              onChange={e => onUpdate({ primaryColor: e.target.value })} 
              className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0" 
            />
            <input 
              type="text" 
              value={settings.primaryColor} 
              onChange={e => onUpdate({ primaryColor: e.target.value })} 
              className="flex-1 bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors uppercase" 
            />
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl border border-border/60 bg-card border border-border mt-4">
          <h3 className="text-lg font-bold text-foreground mb-4">Preview</h3>
          <div 
            className="w-full h-32 rounded-xl flex items-center justify-center text-foreground font-bold text-xl shadow-inner relative overflow-hidden"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/40 to-transparent" />
            <span className="relative z-10">{settings.name || "Restaurant Name"}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border/60 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Type className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Typography Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">Adjust the overall text size across your restaurant platform.</p>
            </div>
          </div>
          <button
            onClick={() => onUpdate({ fontScale: "default" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-muted/50 hover:bg-muted/30 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground">Global Font Size</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "small", label: "Small", scale: "90%" },
                { id: "default", label: "Default", scale: "100%" },
                { id: "medium", label: "Medium", scale: "110%" },
                { id: "large", label: "Large", scale: "120%" },
                { id: "extra-large", label: "Extra Large", scale: "130%" }
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => onUpdate({ fontScale: size.id as any })}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                    (settings.fontScale || "default") === size.id 
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                      : 'bg-muted/50 border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <span>{size.label}</span>
                  <span className="text-[10px] font-normal opacity-70">{size.scale}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-muted/50 text-[10px] font-bold tracking-widest uppercase text-muted-foreground rounded-bl-xl">
              Live Preview
            </div>
            
            {/* Inline style applied to preview container based on selected scale */}
            <div 
              className="mt-2 space-y-4 transition-all duration-300"
              style={{
                fontSize: {
                  "small": "90%",
                  "default": "100%",
                  "medium": "110%",
                  "large": "120%",
                  "extra-large": "130%"
                }[settings.fontScale || "default"] || "100%"
              }}
            >
              <h4 className="text-xl font-bold text-foreground leading-tight">
                Experience Authentic Cuisine
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                Manage your restaurant efficiently with our powerful dashboard. The text size updates instantly.
              </p>
              <button 
                className="px-5 py-2.5 rounded-lg font-bold text-sm transition-colors text-foreground mt-2"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
