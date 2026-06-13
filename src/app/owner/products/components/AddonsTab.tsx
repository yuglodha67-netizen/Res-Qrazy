"use client";

import React, { useState } from "react";
import { AddOn, Category } from "@/types/product";
import { PlusCircle, Plus, Trash2, Save } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

export function AddonsTab({ addons }: { addons: AddOn[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AddOn>>({ name: "", price: 0, isAvailable: true, categoryMapping: [] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    const toastId = toast.loading(editingId ? "Updating add-on..." : "Adding add-on...");

    try {
      if (editingId) {
        await updateDoc(doc(db, "addons", editingId), { ...formData });
        toast.success("Add-on updated", { id: toastId });
      } else {
        await addDoc(collection(db, "addons"), { ...formData });
        toast.success("Add-on created", { id: toastId });
      }
      setEditingId(null);
      setFormData({ name: "", price: 0, isAvailable: true, categoryMapping: [] });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to save add-on", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this add-on?")) return;
    try {
      await deleteDoc(doc(db, "addons", id));
      toast.success("Add-on deleted");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete add-on");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <PlusCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Add-ons & Extras</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Edit Add-on" : "New Add-on"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="e.g. Extra Cheese" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Price (₹)</label>
              <input required type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="0.00" />
            </div>
            
            <label className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border cursor-pointer">
              <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} className="rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm font-bold text-foreground">Available in Menu</span>
            </label>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({name: "", price: 0, isAvailable: true, categoryMapping: []}); }} className="flex-1 py-3 border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-bold text-sm">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 shadow-sm">
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-3">
          {addons.length === 0 ? (
            <div className="p-8 text-center border border-border rounded-2xl bg-muted text-muted-foreground">
              No add-ons created yet.
            </div>
          ) : (
            addons.map((addon) => (
              <div key={addon.id} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm hover:border-border/80 transition-colors group">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-lg">{addon.name}</span>
                      {!addon.isAvailable && <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] uppercase font-bold rounded">Unavailable</span>}
                    </div>
                  </div>
                  <div className="font-bold text-primary text-lg">
                    +₹{addon.price}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4 border-l border-border">
                  <button onClick={() => { setEditingId(addon.id); setFormData(addon); }} className="p-2 text-muted-foreground hover:text-primary bg-muted rounded-lg hover:bg-accent transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(addon.id)} className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
