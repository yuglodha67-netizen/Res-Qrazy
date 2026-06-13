"use client";

import React, { useState } from "react";
import { Category } from "@/types/product";
import { Layers, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

export function CategoriesTab({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", isVisible: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    const toastId = toast.loading(editingId ? "Updating category..." : "Adding category...");

    try {
      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), { ...formData });
        toast.success("Category updated", { id: toastId });
      } else {
        await addDoc(collection(db, "categories"), { 
          ...formData, 
          order: categories.length 
        });
        toast.success("Category created", { id: toastId });
      }
      setEditingId(null);
      setFormData({ name: "", isVisible: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to save category", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products in this category will become uncategorized.")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Category deleted");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Layers className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Menu Categories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
          <h3 className="text-lg font-bold text-foreground mb-4">
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Category Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="e.g. Desserts" />
            </div>
            
            <label className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border cursor-pointer">
              <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({ ...formData, isVisible: e.target.checked })} className="rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm font-bold text-foreground">Visible on Menu</span>
            </label>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({name: "", isVisible: true}); }} className="flex-1 py-3 border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-bold text-sm">
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
          {sortedCategories.length === 0 ? (
            <div className="p-8 text-center border border-border rounded-2xl bg-muted text-muted-foreground">
              No categories created yet.
            </div>
          ) : (
            sortedCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border hover:border-border/80 shadow-sm transition-colors group">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-lg">{cat.name}</span>
                    {!cat.isVisible && <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] uppercase font-bold rounded">Hidden</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(cat.id); setFormData({ name: cat.name, isVisible: cat.isVisible !== false }); }} className="p-2 text-muted-foreground hover:text-primary bg-muted rounded-lg hover:bg-accent transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-muted-foreground hover:text-destructive bg-muted rounded-lg hover:bg-destructive/10 transition-colors">
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
