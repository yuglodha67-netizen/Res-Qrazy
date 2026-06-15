"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart, MenuItem } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { LocationGuard } from "@/components/LocationGuard";
import { ARViewer } from "@/components/ARViewer";
import { X, AlertTriangle, Search, Filter, Heart, Star, Minus, Plus, ShoppingCart, Info, CheckCircle2, SlidersHorizontal, Box } from "lucide-react";
import { collection, onSnapshot, query, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/utils/firebase/config";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Drinks"];

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, addToCart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  
  // States
  const [activeCategory, setActiveCategory] = useState("All");
  const [arItem, setArItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "available" | "popular" | "price-low" | "price-high">("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);

  const [settings, setSettings] = useState<{name: string, tagline: string, acceptOrders: boolean}>({
    name: "Curated Menu",
    tagline: "Experience our culinary masterpieces. Scan, visualize, and order.",
    acceptOrders: true
  });

  // Load favorites & table context
  useEffect(() => {
    // Favorites
    const savedFavs = localStorage.getItem("qrazy_favorites");
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    // Zero-Trust Session Validation
    // The session is created securely in HeroScrollAnimation.tsx
    // The menu just consumes the already validated session.
    const sessionId = sessionStorage.getItem("qrazy_session_id");
    const sessionTable = sessionStorage.getItem("qrazy_table_id");
    
    if (sessionId && sessionTable) {
      setTableId(sessionTable);
    } else {
      setTableId(null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("qrazy_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    // Fetch Menu
    const q = query(collection(db, "products"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      // Inject some mock advanced properties if they don't exist in DB yet
      // This ensures the professional features work immediately
      const enhancedData = data.map(item => ({
        ...item,
        isAvailable: item.isAvailable !== false, // Default to true if missing
        rating: item.rating || (Math.random() * 1 + 4).toFixed(1), // Mock 4.0 - 5.0 rating
        reviewCount: item.reviewCount || Math.floor(Math.random() * 200) + 15,
        popular: item.popular || Math.random() > 0.8,
        ingredients: item.ingredients || ["Fresh Ingredients", "Signature Spices", "Chef's Special Sauce"]
      }));

      setMenuItems(enhancedData as MenuItem[]);
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error("Unable to load menu. Please try again.");
      setLoading(false);
    });

    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          name: data.name || "Curated Menu",
          tagline: data.tagline || "Experience our culinary masterpieces.",
          acceptOrders: data.acceptOrders !== undefined ? data.acceptOrders : true
        });
      }
    });

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Advanced Filtering & Search Memoization
  const filteredMenu = useMemo(() => {
    let result = menuItems;

    // 1. Category
    if (activeCategory !== "All") {
      result = result.filter(item => item.category === activeCategory);
    }

    // 2. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    // 3. Filter Types
    if (filterType === "available") result = result.filter(item => item.isAvailable);
    if (filterType === "popular") result = result.filter(item => item.popular);
    if (filterType === "price-low") result = [...result].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (filterType === "price-high") result = [...result].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

    return result;
  }, [menuItems, activeCategory, searchQuery, filterType]);

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (!settings.acceptOrders) {
      toast.error("Orders are currently closed.");
      return;
    }
    if (!item.isAvailable) {
      toast.error("This item is currently unavailable.");
      return;
    }
    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  };

  const getCartQuantity = (id: string) => {
    return cart.find(i => i.id === id)?.quantity || 0;
  };

  return (
    <div className="w-full flex flex-col min-h-screen pb-24 relative">
      {/* Responsive Hero Section */}
      <div className="relative w-full h-[35vh] min-h-[250px] md:min-h-[350px] flex items-center justify-center overflow-hidden bg-black mb-8 rounded-b-3xl md:rounded-b-[4rem] border-b border-border/50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] translate-y-1/2 opacity-50" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            {settings.name}
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-lg">
            {settings.tagline}
          </p>
          {tableId && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              Ordering for Table {tableId}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl flex-grow">

        {!settings.acceptOrders && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-2xl flex items-center justify-center gap-3 font-medium">
            <AlertTriangle className="w-5 h-5" />
            We are currently closed and not accepting online orders at this time.
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search dishes, categories, ingredients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/50 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          
          <div className="relative group">
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-full px-4 py-3 text-sm font-medium cursor-pointer shadow-sm hover:border-primary transition-all">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <select 
                className="bg-transparent border-none outline-none appearance-none cursor-pointer pr-4"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">Sort: Recommended</option>
                <option value="available">Available Only</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide sticky top-4 z-30 bg-background/80 backdrop-blur-xl py-2 rounded-xl">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className="rounded-full px-6 flex-shrink-0 shadow-sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Dish Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border bg-card/50 shadow-sm overflow-hidden flex flex-col animate-pulse">
                <div className="aspect-video w-full bg-muted/50" />
                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-muted/50 rounded w-1/2" />
                    <div className="h-4 bg-muted/50 rounded w-8" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-full" />
                    <div className="h-4 bg-muted/50 rounded w-4/5" />
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="h-6 bg-muted/50 rounded w-16" />
                    <div className="h-9 bg-muted/50 rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border rounded-3xl bg-card shadow-sm flex flex-col items-center justify-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xl font-bold text-foreground">No dishes found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            <Button variant="outline" className="mt-6 rounded-full" onClick={() => { setSearchQuery(""); setFilterType("all"); setActiveCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => {
              const qty = getCartQuantity(item.id);
              const isFav = favorites.includes(item.id);
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col transition-all cursor-pointer hover:border-primary/50 hover:shadow-md relative group ${!item.isAvailable ? 'opacity-75 grayscale-[0.5]' : ''}`}
                >
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {item.popular && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Popular
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => toggleFavorite(e, item.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-border/50 hover:bg-background transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </button>

                  <div className="aspect-video w-full bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-50">
                      [Image / 3D Model]
                    </div>
                    {item.modelUrl && (
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setArItem(item); }}
                        className="absolute bottom-2 right-2 z-20 bg-background/90 backdrop-blur-md border border-border/50 shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-foreground hover:bg-background transition-colors"
                      >
                        <Box className="w-4 h-4 text-primary" />
                        View in AR
                      </button>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow relative">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-1" title={item.name}>{item.name}</h3>
                      {item.spiceLevel > 0 && (
                        <span className="text-red-500 text-xs shrink-0 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                          {"🌶️".repeat(item.spiceLevel)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold">{item.rating}</span>
                      <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-semibold text-xl">₹{(Number(item.price) || 0).toFixed(2)}</span>
                      
                      {/* Interactive Cart Buttons */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {!item.isAvailable ? (
                          <Button disabled variant="secondary" className="rounded-full px-4 opacity-50">
                            Unavailable
                          </Button>
                        ) : qty > 0 ? (
                          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-full p-1 shadow-sm">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full hover:bg-background" 
                              onClick={() => updateQuantity(item.id, qty - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-4 text-center font-bold text-sm text-primary">{qty}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full hover:bg-background text-primary" 
                              onClick={() => updateQuantity(item.id, qty + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={(e) => handleAddToCart(e, item)} 
                            size="sm" 
                            className="rounded-full px-6 font-bold shadow-sm"
                            disabled={!settings.acceptOrders}
                          >
                            Add +
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Action Button (Cart Quick Access) */}
      {totalItems > 0 && (
        <Link href="/cart">
          <div className="fixed bottom-6 inset-x-0 mx-auto w-11/12 max-w-sm z-40 bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between cursor-pointer hover:bg-primary/90 transition-all border border-white/10 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs opacity-80 font-medium">View order</span>
                <span className="text-sm font-bold">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="font-bold text-sm flex items-center gap-1">
              Checkout &rarr;
            </div>
          </div>
        </Link>
      )}

      {/* Product Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setSelectedItem(null)}
          />
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl relative z-10 border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-20 rounded-full bg-background/50 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="w-full aspect-video bg-muted relative">
               <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-50">
                  [High Res Image]
               </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-foreground">{selectedItem.name}</h2>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-primary">₹{(Number(selectedItem.price) || 0).toFixed(2)}</span>
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="text-xs font-bold">{selectedItem.rating}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Key Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground border border-border/50">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                {(() => {
                  const qty = getCartQuantity(selectedItem.id);
                  if (!selectedItem.isAvailable) {
                    return (
                      <Button disabled className="w-full rounded-full py-6 text-lg font-bold">
                        Currently Unavailable
                      </Button>
                    );
                  }
                  if (qty > 0) {
                    return (
                      <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-full p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-full hover:bg-background" 
                          onClick={() => updateQuantity(selectedItem.id, qty - 1)}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="text-lg font-bold text-primary">{qty} in cart</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-full hover:bg-background text-primary" 
                          onClick={() => updateQuantity(selectedItem.id, qty + 1)}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <Button 
                      className="w-full rounded-full py-6 text-lg font-bold shadow-lg"
                      onClick={(e) => {
                        handleAddToCart(e, selectedItem);
                      }}
                      disabled={!settings.acceptOrders}
                    >
                      Add to Cart - ₹{(Number(selectedItem.price) || 0).toFixed(2)}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AR Modal Overlay */}
      {arItem && arItem.modelUrl && (
        <div className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-6 right-6 z-50 rounded-full border border-border/50"
            onClick={() => setArItem(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="w-full max-w-4xl p-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">{arItem.name} in AR</h2>
              <p className="text-muted-foreground">Scan your table area and place the dish.</p>
            </div>
            <ARViewer modelUrl={arItem.modelUrl} altText={arItem.name} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen text-muted-foreground animate-pulse font-medium">Loading amazing dishes...</div>}>
      <LocationGuard>
        <MenuContent />
      </LocationGuard>
    </React.Suspense>
  );
}
