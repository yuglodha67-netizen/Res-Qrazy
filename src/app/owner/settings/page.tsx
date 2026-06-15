"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Save, Loader2, Store, User, Shield, Clock, 
  CreditCard, Bell, Palette, MenuSquare, Users, Lock, LifeBuoy,
  CheckCircle2
} from "lucide-react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";
import { RestaurantSettings, defaultSettings } from "@/types/settings";

import { ProfileTab, OperationsTab, MenuTab, BrandingTab } from "./components/TabProfileOps";
import { AccountTab, SecurityTab, PrivacyTab, NotificationsTab } from "./components/TabAccountSec";
import { StaffTab, BillingTab, SupportTab } from "./components/TabTeamMisc";
import { LocationSecurityTab } from "./components/TabLocationSecurity";

const TABS = [
  { id: "profile", label: "Restaurant Profile", icon: Store },
  { id: "account", label: "Account Settings", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "location_security", label: "Location Security", icon: MapPin },
  { id: "operations", label: "Operations", icon: Clock },
  { id: "billing", label: "Payment & Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "branding", label: "Appearance & Brand", icon: Palette },
  { id: "menu", label: "Menu Management", icon: MenuSquare },
  { id: "staff", label: "Staff Management", icon: Users },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "support", label: "Help & Support", icon: LifeBuoy },
];

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...defaultSettings, ...docSnap.data() } as RestaurantSettings);
      }
      setLoading(false);
      setHasUnsavedChanges(false);
    });
    return () => unsub();
  }, []);

  const handleUpdate = (updates: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const loadingToast = toast.loading("Saving settings...");
    
    try {
      await setDoc(doc(db, "settings", "general"), settings, { merge: true });
      setSuccess(true);
      setHasUnsavedChanges(false);
      toast.success("Settings saved successfully!", { id: loadingToast });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
      toast.error("Failed to save settings. Please try again.", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab settings={settings} onUpdate={handleUpdate} />;
      case "account": return <AccountTab />;
      case "security": return <SecurityTab />;
      case "location_security": return <LocationSecurityTab />;
      case "operations": return <OperationsTab settings={settings} onUpdate={handleUpdate} />;
      case "billing": return <BillingTab settings={settings} onUpdate={handleUpdate} />;
      case "notifications": return <NotificationsTab settings={settings} onUpdate={handleUpdate} />;
      case "branding": return <BrandingTab settings={settings} onUpdate={handleUpdate} />;
      case "menu": return <MenuTab settings={settings} onUpdate={handleUpdate} />;
      case "staff": return <StaffTab />;
      case "privacy": return <PrivacyTab />;
      case "support": return <SupportTab />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Settings Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your entire restaurant platform securely.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-amber-500 text-sm font-semibold animate-pulse">Unsaved changes</span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`px-6 py-3 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 ${
              hasUnsavedChanges 
                ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-foreground' 
                : 'bg-slate-800 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
            {success ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-1 bg-muted/30 p-4 rounded-3xl border border-border/60 backdrop-blur-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium text-sm ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-muted/30 p-6 md:p-8 rounded-[2rem] border border-border/60 backdrop-blur-xl shadow-2xl relative min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
