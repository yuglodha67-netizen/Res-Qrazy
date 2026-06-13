"use client";

import React, { useState } from "react";
import { User, Shield, Lock, Bell, Loader2 } from "lucide-react";
import { RestaurantSettings } from "@/types/settings";
import { auth, db } from "@/utils/firebase/config";
import { updatePassword, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

interface TabProps {
  settings?: RestaurantSettings;
  onUpdate?: (updates: Partial<RestaurantSettings>) => void;
}

export function AccountTab() {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    const id = toast.loading("Updating account...");
    try {
      if (name !== user.displayName) await updateProfile(user, { displayName: name });
      if (email !== user.email) await updateEmail(user, email);
      toast.success("Account updated successfully", { id });
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      toast.error(err.message || "Failed to update account", { id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <User className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-foreground">Owner Account Details</h2>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Display Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-blue-500 outline-none transition-colors" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-blue-500 outline-none transition-colors" 
          />
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading || (name === user?.displayName && email === user?.email)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-muted-foreground text-foreground font-bold rounded-xl transition-all w-full flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Account"}
        </button>
      </div>
    </div>
  );
}

export function SecurityTab() {
  const user = auth.currentUser;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength checks for new password
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Password does not meet security requirements.");
      return;
    }
    
    setLoading(true);
    const id = toast.loading("Updating password...");
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Update
      await updatePassword(user, newPassword);
      toast.success("Password changed successfully", { id });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      toast.error(err.message || "Failed to change password", { id });
    } finally {
      setLoading(false);
    }
  };

  const lastLogin = user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "Unknown";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Shield className="w-6 h-6 text-emerald-400" />
        <h2 className="text-2xl font-bold text-foreground">Security Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Password Change */}
        <form onSubmit={handleChangePassword} className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
          <h3 className="text-lg font-bold text-foreground mb-2">Change Password</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Password</label>
            <input 
              type="password" 
              required
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || !isPasswordValid}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-muted-foreground text-foreground font-bold rounded-xl transition-all w-full flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>

        {/* 2FA UI */}
        <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-card px-4 py-3 rounded-xl border border-amber-500/30 text-amber-500 font-bold shadow-2xl flex items-center gap-2">
              <Lock className="w-4 h-4" /> Requires Google Cloud Identity Platform
            </div>
          </div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account to prevent unauthorized access.</p>
            </div>
            <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20 whitespace-nowrap">
              Not Enabled
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/40 space-y-4 opacity-50">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/40">
              <div>
                <h4 className="font-bold text-foreground">Authenticator App</h4>
                <p className="text-xs text-muted-foreground mt-1">Use an app like Google Authenticator or Authy to generate verification codes.</p>
              </div>
              <button disabled className="px-4 py-2 bg-muted/30 text-muted-foreground font-bold rounded-lg cursor-not-allowed border border-border/60 whitespace-nowrap text-sm">
                Setup
              </button>
            </div>
          </div>
        </div>

        {/* Login Activity & Sessions */}
        <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-4">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border/40 pb-2">Login Activity</h3>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Current Session</h4>
                <p className="text-xs text-muted-foreground mt-1">Last sign-in: {lastLogin}</p>
                <p className="text-xs text-muted-foreground">Windows PC • Chrome browser</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">Active Now</span>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={() => toast.info("To sign out of all other devices securely, please use the Change Password form above. This will automatically invalidate all other sessions.")}
              className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Sign out of all other sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyTab() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading("Gathering your data for export...");
    try {
      const snap = await getDocs(collection(db, "orders"));
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (orders.length === 0) {
        toast.error("No data found to export", { id: toastId });
        return;
      }

      // Very simple CSV conversion
      const headers = ["Order ID", "Table", "Status", "Total Price", "Date"];
      const rows = orders.map((o: any) => [
        o.id, 
        o.table || o.orderType, 
        o.status, 
        o.totalPrice, 
        o.time || ""
      ]);

      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `restaurant_orders_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const confirmDelete = window.prompt("Type 'DELETE' to permanently disable your restaurant account.");
    if (confirmDelete !== "DELETE") {
      toast.error("Account deletion cancelled.");
      return;
    }

    setDeleting(true);
    const toastId = toast.loading("Disabling account...");
    try {
      // Soft delete user record in firestore
      await updateDoc(doc(db, "users", user.uid), {
        deleted: true,
        deletedAt: new Date()
      });
      toast.success("Account disabled successfully. Signing out...", { id: toastId });
      setTimeout(() => {
        signOut(auth);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to disable account. Please contact support.", { id: toastId });
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Lock className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-foreground">Privacy & Data Control</h2>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-2xl border border-border/40 bg-card border border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h3 className="font-bold text-foreground">Download Restaurant Data</h3>
            <p className="text-sm text-muted-foreground mt-1">Export your menus, settings, and orders as CSV.</p>
          </div>
          <button 
            disabled={exporting}
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Export"}
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h3 className="font-bold text-red-400">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">Permanently disable your account and restaurant data.</p>
          </div>
          <button 
            disabled={deleting}
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-foreground font-bold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsTab({ settings, onUpdate }: TabProps) {
  if (!settings || !onUpdate) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <Bell className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-foreground">Notification Preferences</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
          <h3 className="text-lg font-bold text-foreground mb-2">Event Alerts</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">New Orders</h4>
              <p className="text-xs text-muted-foreground mt-1">Notify when a new table order arrives</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.notifyNewOrders} onChange={e => onUpdate({ notifyNewOrders: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Cancelled Orders</h4>
              <p className="text-xs text-muted-foreground mt-1">Notify when an order is cancelled</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.notifyCancelledOrders} onChange={e => onUpdate({ notifyCancelledOrders: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">New Reviews</h4>
              <p className="text-xs text-muted-foreground mt-1">Notify when a customer leaves a review</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.notifyReviews} onChange={e => onUpdate({ notifyReviews: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
          <h3 className="text-lg font-bold text-foreground mb-2">Delivery Channels</h3>
          
          {['email', 'sms', 'push'].map(channel => (
            <div key={channel} className="flex items-center justify-between">
              <div className="capitalize">
                <h4 className="text-sm font-bold text-foreground">{channel} Notifications</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifyChannels[channel as keyof typeof settings.notifyChannels]} 
                  onChange={e => onUpdate({ 
                    notifyChannels: { ...settings.notifyChannels, [channel]: e.target.checked }
                  })} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-muted/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
