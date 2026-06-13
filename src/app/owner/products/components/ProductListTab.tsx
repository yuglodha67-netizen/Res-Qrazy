"use client";

import React, { useState } from "react";
import { Product, Category } from "@/types/product";
import { List, Search, Edit2, Trash2, Copy } from "lucide-react";
import { deleteDoc, doc, addDoc, collection } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

interface Props {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
}

export function ProductListTab({ products, categories, onEdit }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.availability === filterStatus;
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleDuplicate = async (product: Product) => {
    const toastId = toast.loading("Duplicating product...");
    try {
      const { id: _id, ...dataToCopy } = product;
      await addDoc(collection(db, "products"), {
        ...dataToCopy,
        name: `${product.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Product duplicated successfully", { id: toastId });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to duplicate product", { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return;
    
    const toastId = toast.loading(`Deleting ${selectedIds.size} products...`);
    try {
      for (const id of Array.from(selectedIds)) {
        await deleteDoc(doc(db, "products", id));
      }
      setSelectedIds(new Set());
      toast.success("Products deleted successfully", { id: toastId });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete some products", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <List className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">All Products</h2>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground"
          />
        </div>
        
        <select 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow appearance-none min-w-[150px]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          {categories.length === 0 && <option value="Mains">Mains</option>}
        </select>

        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow appearance-none min-w-[150px]"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-accent border border-border p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-accent-foreground font-bold px-2">{selectedIds.size} products selected</span>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-card border border-destructive/50 text-destructive hover:bg-destructive/10 rounded-lg font-bold text-sm transition-colors">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-xs overflow-hidden text-muted-foreground">
                          {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name}/> : "Img"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-semibold text-foreground">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">₹{product.price}</span>
                        {product.discountPrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{product.discountPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {product.availability === "available" && <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Available</span>}
                      {product.availability === "out_of_stock" && <span className="text-destructive bg-destructive/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-destructive"/> Out of Stock</span>}
                      {product.availability === "hidden" && <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"/> Hidden</span>}
                      {!product.availability && <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Available</span>}
                    </td>
                    <td className="p-4">
                      {product.stockQuantity === null || product.stockQuantity === undefined ? (
                        <span className="text-muted-foreground text-xs">Unlimited</span>
                      ) : (
                        <span className={`text-xs font-semibold ${product.stockQuantity < 5 ? 'text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded' : 'text-foreground'}`}>
                          {product.stockQuantity} items
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(product)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(product)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
