"use client";

import React, { useState } from "react";
import { Product, Category, AddOn, ProductAvailability, ProductVariant } from "@/types/product";
import { PlusSquare, Save, Plus, Trash2, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/utils/firebase/config";
import { toast } from "sonner";

interface Props {
  existingProduct: Product | null;
  categories: Category[];
  addons: AddOn[];
  onComplete: () => void;
  onCancel: () => void;
}

export function ProductFormTab({ existingProduct, categories, addons, onComplete, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);
  const [modelUploadProgress, setModelUploadProgress] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: existingProduct?.name || "",
    description: existingProduct?.description || "",
    shortDescription: existingProduct?.shortDescription || "",
    price: existingProduct?.price || 0,
    discountPrice: existingProduct?.discountPrice || undefined,
    category: existingProduct?.category || (categories[0]?.name || "Mains"),
    spiceLevel: existingProduct?.spiceLevel || 0,
    imageUrl: existingProduct?.imageUrl || "",
    modelUrl: existingProduct?.modelUrl || "",
    availability: existingProduct?.availability || "available",
    stockQuantity: existingProduct?.stockQuantity || null,
    variants: existingProduct?.variants || [],
    addonIds: existingProduct?.addonIds || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) {
      toast.error("Please fill in required fields (Name, Price).");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading(existingProduct ? "Updating product..." : "Saving product...");
    
    try {
      const payload: any = { ...formData };
      
      // Remove undefined fields to prevent Firestore crashes
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      payload.updatedAt = new Date();

      if (existingProduct) {
        await updateDoc(doc(db, "products", existingProduct.id), payload);
        toast.success("Product updated successfully", { id: toastId });
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: new Date(),
        });
        toast.success("Product created successfully", { id: toastId });
      }
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { id: Date.now().toString(), name: "", price: 0, available: true }]
    }));
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const toggleAddon = (addonId: string) => {
    const current = formData.addonIds || [];
    if (current.includes(addonId)) {
      setFormData(prev => ({ ...prev, addonIds: current.filter(id => id !== addonId) }));
    } else {
      setFormData(prev => ({ ...prev, addonIds: [...current, addonId] }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'model') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    if (type === 'model' && !file.name.endsWith('.glb')) {
      toast.error("AR Model must be a .glb file");
      return;
    }

    const storageRef = ref(storage, `products/${type}s/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const setProgress = type === 'image' ? setImageUploadProgress : setModelUploadProgress;
    
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      }, 
      (error) => {
        toast.error(`Failed to upload ${type}`);
        console.error(error);
        setProgress(null);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({
          ...prev,
          [type === 'image' ? 'imageUrl' : 'modelUrl']: downloadURL
        }));
        setProgress(null);
        toast.success(`${type === 'image' ? 'Image' : 'AR Model'} uploaded successfully!`);
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {existingProduct ? <Edit2 className="w-6 h-6 text-primary" /> : <PlusSquare className="w-6 h-6 text-primary" />}
          <h2 className="text-2xl font-bold text-foreground">{existingProduct ? "Edit Product" : "Add New Product"}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-bold text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {existingProduct ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info */}
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Basic Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Product Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="e.g. Truffle Mushroom Burger" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Category *</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow appearance-none">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  {categories.length === 0 && <option value="Mains">Mains</option>}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Spice Level (0-5)</label>
                <input type="number" min="0" max="5" value={formData.spiceLevel} onChange={e => setFormData({ ...formData, spiceLevel: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Short Description</label>
              <input type="text" value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="Brief summary for menu card" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Full Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow min-h-[120px] placeholder:text-muted-foreground" placeholder="Detailed description of ingredients and preparation..." />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-bold text-foreground">Variants (Sizes/Types)</h3>
              <button type="button" onClick={handleAddVariant} className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary/80">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            
            {(!formData.variants || formData.variants.length === 0) ? (
              <p className="text-sm text-muted-foreground">No variants. The product will use the base price.</p>
            ) : (
              <div className="space-y-4">
                {formData.variants.map((variant, idx) => (
                  <div key={variant.id} className="flex items-center gap-4 bg-muted/50 p-3 rounded-xl border border-border/50">
                    <input type="text" placeholder="e.g. Large" value={variant.name} onChange={e => handleUpdateVariant(idx, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-foreground outline-none placeholder:text-muted-foreground font-medium" />
                    <input type="number" placeholder="Price" value={variant.price || ''} onChange={e => handleUpdateVariant(idx, 'price', parseFloat(e.target.value))} className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <button type="button" onClick={() => handleRemoveVariant(idx)} className="p-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Pricing, Images, Settings */}
        <div className="space-y-8">
          
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Pricing & Inventory</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Base Price (₹) *</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full text-2xl font-bold bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Discounted Price (₹) (Optional)</label>
                <input type="number" step="0.01" value={formData.discountPrice || ''} onChange={e => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || undefined })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Availability Status</label>
                <select value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value as ProductAvailability })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow appearance-none">
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="hidden">Hidden from Menu</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Stock Quantity</label>
                <input type="number" value={formData.stockQuantity ?? ''} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow placeholder:text-muted-foreground" placeholder="Leave empty for unlimited" />
                <p className="text-xs text-muted-foreground">Leave empty if you don&apos;t track inventory for this item.</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Media</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Product Image</label>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview"/> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                  {imageUploadProgress !== null && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{Math.round(imageUploadProgress)}%</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    disabled={imageUploadProgress !== null}
                  />
                  <div className={`w-full bg-background border ${imageUploadProgress !== null ? 'border-primary border-dashed' : 'border-border'} rounded-xl px-4 py-3 text-foreground flex items-center justify-between transition-colors`}>
                    <span className="text-sm text-muted-foreground truncate pr-4">
                      {imageUploadProgress !== null ? 'Uploading...' : (formData.imageUrl ? 'Image uploaded. Click to replace.' : 'Select an image...')}
                    </span>
                    <UploadCloud className={`w-5 h-5 ${imageUploadProgress !== null ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">AR Model (.glb)</label>
              <div className="flex-1 relative">
                <input 
                  type="file" 
                  accept=".glb"
                  onChange={(e) => handleFileUpload(e, 'model')} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  disabled={modelUploadProgress !== null}
                />
                <div className={`w-full bg-background border ${modelUploadProgress !== null ? 'border-primary border-dashed' : 'border-border'} rounded-xl px-4 py-3 text-foreground flex items-center justify-between transition-colors`}>
                  <span className="text-sm text-muted-foreground truncate pr-4">
                    {modelUploadProgress !== null ? `Uploading Model: ${Math.round(modelUploadProgress)}%` : (formData.modelUrl ? 'AR Model uploaded. Click to replace.' : 'Select a .glb file...')}
                  </span>
                  <UploadCloud className={`w-5 h-5 ${modelUploadProgress !== null ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Linked Add-ons</h3>
            {addons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No add-ons created yet.</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {addons.map(addon => (
                  <label key={addon.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/50">
                    <input 
                      type="checkbox" 
                      checked={(formData.addonIds || []).includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{addon.name}</p>
                      <p className="text-xs text-muted-foreground">₹{addon.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}

const Edit2 = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
