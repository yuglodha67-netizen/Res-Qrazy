"use client";

import React, { useState, useEffect } from "react";
import { RestaurantSettings } from "@/types/settings";
import { Users, CreditCard, LifeBuoy, Plus, Check, X, Loader2 } from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

interface TabProps {
  settings?: RestaurantSettings;
  onUpdate?: (updates: Partial<RestaurantSettings>) => void;
}

export function StaffTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ displayName: "", email: "", role: "kitchen" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({ displayName: "", email: "", role: "kitchen" });
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditId(u.id);
    setFormData({ displayName: u.displayName || "", email: u.email || "", role: typeof u.role === 'string' ? u.role : "kitchen" });
    setShowModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving staff member...");

    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Staff updated", { id: toastId });
      } else {
        await addDoc(collection(db, "users"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success("Staff member added", { id: toastId });
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save staff member", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member? They will lose access immediately.")) return;
    
    const toastId = toast.loading("Removing staff member...");
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Staff member removed", { id: toastId });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove staff member", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-teal-400" />
          <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-foreground font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl border border-border/40 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border/40 font-bold text-muted-foreground text-sm">
          <div className="col-span-2">Name / Email</div>
          <div className="col-span-2">Role</div>
          <div className="text-right">Actions</div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
             <Loader2 className="w-6 h-6 animate-spin mb-2" /> Loading staff...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No staff members found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(u => (
              <div key={u.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                <div className="col-span-2 min-w-0">
                  <div className="font-bold text-foreground truncate">{u.displayName || "No Name"}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email || u.id}</div>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    u.role === 'owner' ? 'bg-amber-500/20 text-amber-500' :
                    u.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                    u.role === 'kitchen' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-500/20 text-muted-foreground'
                  }`}>
                    {typeof u.role === 'string' ? u.role.trim() : (u.role || 'customer')}
                  </span>
                </div>
                <div className="text-right flex items-center justify-end gap-3">
                  <button onClick={() => openEditModal(u)} className="text-sm text-teal-400 hover:text-teal-300 font-bold">Edit</button>
                  <button onClick={() => handleDelete(u.id)} disabled={u.role === 'owner'} className="text-sm text-red-400 hover:text-red-300 font-bold disabled:opacity-30">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">{editId ? "Edit Staff Member" : "Add New Staff"}</h3>
            
            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <input required type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground outline-none" />
                {!editId && <p className="text-[10px] text-amber-500 font-bold">Staff must register using this exact email to gain access.</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground outline-none appearance-none">
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="delivery">Delivery Staff</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <button disabled={saving} type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? "Update Staff" : "Add Staff")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function BillingTab({ settings, onUpdate }: TabProps) {
  if (!settings || !onUpdate) return null;

  const togglePaymentMethod = (method: string) => {
    const methods = settings.paymentMethods || [];
    if (methods.includes(method)) {
      onUpdate({ paymentMethods: methods.filter(m => m !== method) });
    } else {
      onUpdate({ paymentMethods: [...methods, method] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <CreditCard className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-foreground">Payment & Billing</h2>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Accepted Payment Methods</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "card", label: "Credit/Debit Card" },
            { id: "cash", label: "Cash on Delivery" },
            { id: "upi", label: "UPI / QR Scan" },
            { id: "wallet", label: "Digital Wallets" }
          ].map(method => {
            const isSelected = settings.paymentMethods?.includes(method.id);
            return (
              <button
                key={method.id}
                onClick={() => togglePaymentMethod(method.id)}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-muted/80 border-border/60 hover:border-border'
                }`}
              >
                <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-muted-foreground'}`}>{method.label}</span>
                {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl border border-border/40 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground">Subscription Plan</h3>
            <p className="text-muted-foreground text-sm mt-1">You are currently on the Pro Tier.</p>
          </div>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
        </div>
        
        <div className="pt-4 border-t border-border/40">
          <button className="text-sm font-bold text-cyan-400 hover:text-cyan-300">Manage Billing on Stripe &rarr;</button>
        </div>
      </div>
    </div>
  );
}

export function SupportTab() {
  const [showModal, setShowModal] = useState(false);
  const [ticketType, setTicketType] = useState("support");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const openSupport = (type: string) => {
    setTicketType(type);
    setFormData({ title: "", description: "" });
    setShowModal(true);
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Submitting ticket...");

    try {
      await addDoc(collection(db, "support_tickets"), {
        ...formData,
        type: ticketType,
        status: "open",
        createdAt: serverTimestamp()
      });
      toast.success("Support ticket submitted successfully. We will be in touch soon!", { id: toastId });
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit ticket. Please try again.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
        <LifeBuoy className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div onClick={() => window.open('https://support.google.com/firebase', '_blank')} className="bg-card border border-border p-6 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-400 transition-colors">Help Center</h3>
          <p className="text-sm text-muted-foreground">Browse tutorials, FAQs, and guides to manage your restaurant better.</p>
        </div>
        
        <div onClick={() => openSupport('support')} className="bg-card border border-border p-6 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-400 transition-colors">Contact Support</h3>
          <p className="text-sm text-muted-foreground">Reach out to our technical team for immediate assistance.</p>
        </div>
        
        <div onClick={() => openSupport('bug')} className="bg-card border border-border p-6 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-400 transition-colors">Report a Bug</h3>
          <p className="text-sm text-muted-foreground">Spotted an issue? Let us know so we can fix it.</p>
        </div>

        <div onClick={() => openSupport('feature')} className="bg-card border border-border p-6 rounded-2xl border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer group">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-orange-400 transition-colors">Feature Request</h3>
          <p className="text-sm text-muted-foreground">Have an idea? Submit feature suggestions to our product team.</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-1 capitalize">{ticketType === 'bug' ? 'Report a Bug' : ticketType === 'feature' ? 'Request a Feature' : 'Contact Support'}</h3>
            <p className="text-sm text-muted-foreground mb-6">Please provide as much detail as possible.</p>
            
            <form onSubmit={submitTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground outline-none" placeholder="Brief summary of the issue..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full min-h-[120px] bg-muted border border-border/60 rounded-xl px-4 py-3 text-foreground outline-none" placeholder="Provide detailed information here..." />
              </div>
              <button disabled={saving} type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
