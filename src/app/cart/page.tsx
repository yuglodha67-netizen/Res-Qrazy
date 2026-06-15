"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCart, MenuItem } from "@/context/CartContext";
import { InvoicePDF } from "@/components/InvoicePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, Trash2, Download, MessageCircle, AlertCircle, ShoppingCart, Tag, Clock, ChefHat, Star } from "lucide-react";
import { collection, doc, onSnapshot, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/utils/firebase/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LocationGuard } from "@/components/LocationGuard";

function CartContent() {
  const router = useRouter();
  const { cart, updateQuantity, updateItemNote, totalPrice, clearCart, removeFromCart } = useCart();
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"Dine-in" | "Parcel">("Dine-in");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("received");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Advanced Features State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [liveMenu, setLiveMenu] = useState<MenuItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [priceWarnings, setPriceWarnings] = useState<string[]>([]);
  
  const [settings, setSettings] = useState({
    taxRate: 0,
    serviceCharge: 0,
    acceptOrders: true
  });

  useEffect(() => {
    setIsClient(true);
    
    // Security: Check Secure Table Session
    const activeSession = sessionStorage.getItem("qrazy_session_id");
    const activeTable = sessionStorage.getItem("qrazy_table_id");
    if (activeSession && activeTable) {
      setTableId(activeTable);
      setOrderType("Dine-in");
    } else {
      // Unauthenticated, force Parcel
      setOrderType("Parcel");
    }

    // Live Settings Listener
    const unsubSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          taxRate: data.taxRate || 0,
          serviceCharge: data.serviceCharge || 0,
          acceptOrders: data.acceptOrders !== false
        });
      }
    });

    // Zero-Trust: Live Menu Verification Listener
    // We listen to the whole menu so we can display recommendations and verify cart integrity in real-time
    const q = query(collection(db, "products"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setLiveMenu(data);
    });

    return () => {
      unsubSettings();
      unsubProducts();
    };
  }, []);

  // Zero-Trust Calculation & Validation
  const validatedCart = useMemo(() => {
    const warnings: string[] = [];
    const validItems = cart.map(cartItem => {
      const liveItem = liveMenu.find(l => l.id === cartItem.id);
      
      if (!liveItem) return { ...cartItem, isAvailable: false };
      
      // Check for silent price changes
      if (liveItem.price !== cartItem.price && liveItem.price !== undefined) {
        if (!priceWarnings.includes(cartItem.id)) {
           warnings.push(`Price updated for ${cartItem.name} (Now ₹${liveItem.price})`);
        }
        return { ...cartItem, price: liveItem.price, isAvailable: liveItem.isAvailable !== false };
      }

      return { ...cartItem, isAvailable: liveItem.isAvailable !== false };
    });

    if (warnings.length > 0 && warnings.length !== priceWarnings.length) {
      setPriceWarnings(warnings);
      warnings.forEach(w => toast.info(w, { duration: 5000 }));
    }

    return validItems;
  }, [cart, liveMenu]);

  // Derived Calculations
  const verifiedSubtotal = validatedCart.reduce((acc, item) => acc + (item.isAvailable ? item.price * item.quantity : 0), 0);
  const discountAmount = appliedPromo ? (verifiedSubtotal * appliedPromo.discount) / 100 : 0;
  const subtotalAfterDiscount = verifiedSubtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * settings.taxRate) / 100;
  const serviceAmount = (subtotalAfterDiscount * settings.serviceCharge) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount + serviceAmount;

  // Recommendations Logic (Items not in cart)
  const recommendations = useMemo(() => {
    return liveMenu
      .filter(item => item.isAvailable !== false && !cart.find(c => c.id === item.id))
      .sort(() => 0.5 - Math.random()) // Random shuffle for simple recommendations
      .slice(0, 4);
  }, [liveMenu, cart]);

  // Order Status Polling (if placed)
  useEffect(() => {
    if (orderPlaced && placedOrderId) {
      const unsubOrder = onSnapshot(doc(db, "orders", placedOrderId), (docSnap) => {
        if (docSnap.exists()) {
          setOrderStatus(docSnap.data().status || "received");
        }
      });
      return () => unsubOrder();
    }
  }, [orderPlaced, placedOrderId]);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    // Mock Promo Validation
    if (promoCode.toUpperCase() === "WELCOME10") {
      setAppliedPromo({ code: "WELCOME10", discount: 10 });
      toast.success("Promo code applied!");
    } else {
      toast.error("Invalid or expired promo code.");
      setAppliedPromo(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!settings.acceptOrders) {
      toast.error("The restaurant is currently not accepting orders.");
      return;
    }
    
    const availableItems = validatedCart.filter(i => i.isAvailable);
    if (availableItems.length === 0) {
      toast.error("Your cart has no available items.");
      return;
    }

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Securely sending order to kitchen...");
    
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      
      const customerId = auth.currentUser?.uid;
      if (!customerId) {
        toast.error("Session invalid. Please refresh the page.");
        setIsSubmitting(false);
        return;
      }
      
      const activeSession = sessionStorage.getItem("qrazy_session_id");
      
      const orderRef = await addDoc(collection(db, "orders"), {
        customerId: customerId, 
        sessionId: activeSession || null, // Zero-trust binding
        tableId: tableId || "Takeaway",
        table: orderType === "Parcel" ? "Parcel" : (tableId || "Dine-in"),
        phone: phone,
        items: availableItems.map(i => `${i.quantity}x ${i.name} ${i.notes ? `(${i.notes})` : ''}`),
        status: "new",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalPrice: grandTotal,
        subtotal: verifiedSubtotal,
        discount: discountAmount,
        tax: taxAmount,
        serviceCharge: serviceAmount,
        createdAt: new Date(),
        orderType: orderType,
        cartItems: JSON.parse(JSON.stringify(availableItems)),
        promoCode: appliedPromo?.code || null
      });
      
      setPlacedOrderId(orderRef.id);
      setOrderPlaced(true);
      toast.success("Order placed successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Failed to place order:", err);
      toast.error("Failed to place order. Please try again.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDateTime = new Date().toLocaleString();
  const whatsappUrl = `https://wa.me/?text=Here%20is%20my%20QRAZY%20Order:%0A${validatedCart.filter(i => i.isAvailable).map(i => `${i.quantity}x ${i.name}`).join('%0A')}%0ATotal:%20₹${grandTotal.toFixed(2)}%0AType:%20${orderType}`;

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg min-h-screen flex flex-col items-center">
        {/* Dynamic Status Tracking */}
        <div className="w-full bg-card border border-border/50 rounded-2xl p-8 mb-8 shadow-sm">
          {orderStatus === "completed" || orderStatus === "ready" ? (
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <ChefHat className="h-10 w-10" />
            </div>
          )}
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {orderStatus === "completed" || orderStatus === "ready" ? "Order Ready!" : orderStatus === "new" ? "Order Received" : "Order Preparing"}
          </h1>
          <p className="text-muted-foreground mb-6 font-medium uppercase tracking-widest text-sm">
            Status: <span className="text-primary">{orderStatus}</span>
          </p>

          <div className="flex flex-col gap-4">
            {isClient && (
              <PDFDownloadLink
                document={<InvoicePDF items={validatedCart.filter(i => i.isAvailable)} total={grandTotal} orderType={orderType} phone={phone} date={currentDateTime} />}
                fileName="QRAZY_Invoice.pdf"
                className="w-full"
              >
                <Button size="lg" className="w-full rounded-full gap-2 text-lg font-bold">
                  <Download className="w-5 h-5" /> Download PDF Bill
                </Button>
              </PDFDownloadLink>
            )}

            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full rounded-full gap-2 text-lg border-green-500 text-green-500 hover:bg-green-500/10 font-bold">
                <MessageCircle className="w-5 h-5" /> Share to WhatsApp
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              className="mt-4 text-muted-foreground"
              onClick={() => {
                clearCart();
                router.push("/menu" + (tableId ? `?table=${tableId}` : ""));
              }}
            >
              Start New Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Your Cart
        </h1>
        {tableId && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Table {tableId}
          </div>
        )}
      </div>
      
      {!settings.acceptOrders && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3 font-medium text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>The restaurant is currently not accepting orders. You may browse the menu, but checkout is disabled.</p>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">Explore our menu and add your favorite dishes to get started.</p>
          <Link href={tableId ? `/menu?table=${tableId}` : "/menu"}>
            <Button className="rounded-full px-8 py-6 text-lg font-bold shadow-lg">Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="space-y-4 mb-8">
            {validatedCart.map((item) => (
              <div key={item.id} className={`flex flex-col p-4 border rounded-2xl bg-card shadow-sm transition-all ${!item.isAvailable ? 'opacity-60 border-destructive/50 grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                      {!item.isAvailable && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Out of Stock</span>
                      )}
                    </div>
                    <div className="text-primary font-bold mt-1 text-lg">₹{(Number(item.price) || 0).toFixed(2)}</div>
                  </div>
                  
                  {item.isAvailable ? (
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/50">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        {item.quantity === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4" />}
                      </Button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Item Customization / Notes */}
                {item.isAvailable && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <input 
                      type="text" 
                      placeholder="Add special instructions (e.g., less spicy, no onions)..." 
                      value={item.notes || ""}
                      onChange={(e) => updateItemNote(item.id, e.target.value)}
                      className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/70"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations / Upsell */}
          {recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Customers Also Ordered
              </h3>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {recommendations.map(rec => (
                  <div key={rec.id} className="min-w-[200px] flex-shrink-0 border bg-card rounded-2xl p-4 shadow-sm flex flex-col">
                    <h4 className="font-bold text-sm line-clamp-1 mb-1">{rec.name}</h4>
                    <p className="text-primary font-bold text-sm mb-3">₹{(Number(rec.price) || 0).toFixed(2)}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full rounded-full mt-auto text-xs font-bold border-primary/20 hover:bg-primary/10 text-primary"
                      onClick={() => {
                        updateQuantity(rec.id, 1);
                        toast.success(`Added ${rec.name}`);
                      }}
                      disabled={!settings.acceptOrders}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promo Codes */}
          <div className="bg-card p-4 rounded-2xl border mb-6 shadow-sm flex gap-3">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Promo Code (Try WELCOME10)"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm uppercase focus:outline-none focus:border-primary transition-all font-medium"
                disabled={appliedPromo !== null}
              />
            </div>
            {appliedPromo ? (
              <Button variant="destructive" className="rounded-xl px-6" onClick={() => {setAppliedPromo(null); setPromoCode("");}}>Remove</Button>
            ) : (
              <Button variant="secondary" className="rounded-xl px-6 font-bold" onClick={handleApplyPromo}>Apply</Button>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t pt-6 mb-8 space-y-3 bg-muted/10 p-6 rounded-2xl">
            <div className="flex justify-between items-center text-muted-foreground font-medium text-sm">
              <span>Item Subtotal</span>
              <span>₹{verifiedSubtotal.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between items-center text-green-500 font-bold text-sm">
                <span>Discount ({appliedPromo.code})</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {settings.taxRate > 0 && (
              <div className="flex justify-between items-center text-muted-foreground font-medium text-sm">
                <span>Tax ({settings.taxRate}%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            {settings.serviceCharge > 0 && (
              <div className="flex justify-between items-center text-muted-foreground font-medium text-sm">
                <span>Service Charge ({settings.serviceCharge}%)</span>
                <span>₹{serviceAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t border-border/50 text-foreground">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Preparation */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border shadow-lg mb-24">
            <h2 className="font-bold mb-6 text-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Final Details
            </h2>
            
            <div className="flex bg-muted/50 p-1.5 rounded-xl mb-6 border border-border/50">
              <button 
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${orderType === "Dine-in" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setOrderType("Dine-in")}
              >
                Dine-in
              </button>
              <button 
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${orderType === "Parcel" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setOrderType("Parcel")}
              >
                Takeaway / Parcel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Contact Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full p-4 rounded-xl border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>

              <Button 
                className="w-full rounded-2xl py-7 text-xl font-bold shadow-xl hover:shadow-primary/20 transition-all mt-4" 
                disabled={phone.length < 10 || validatedCart.filter(i => i.isAvailable).length === 0 || isSubmitting || !settings.acceptOrders}
                onClick={handlePlaceOrder}
              >
                {isSubmitting ? "Processing Securely..." : `Pay ₹${grandTotal.toFixed(2)}`}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4 font-medium">
                Payments are securely processed. By proceeding, you agree to the restaurant terms.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen animate-pulse text-muted-foreground font-medium">Loading cart...</div>}>
      <LocationGuard>
        <CartContent />
      </LocationGuard>
    </React.Suspense>
  );
}
