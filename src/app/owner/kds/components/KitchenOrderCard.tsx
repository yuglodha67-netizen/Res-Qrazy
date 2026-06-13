"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, MoveRight, RotateCcw, AlertCircle, ChefHat } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

export interface KDSOrder {
  id: string;
  tableId: string;
  table: string;
  items: string[];
  cartItems?: any[];
  status: "new" | "preparing" | "ready" | "completed" | "archived";
  time: string;
  createdAt: any;
  orderType: string;
  isPriority?: boolean;
}

interface Props {
  order: KDSOrder;
}

export function KitchenOrderCard({ order }: Props) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!order.createdAt || order.status === "completed" || order.status === "archived" || order.status === "ready") {
      return;
    }

    const calculateElapsed = () => {
      const start = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000);
    return () => clearInterval(interval);
  }, [order.createdAt, order.status]);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus,
        ...(newStatus === "completed" ? { completedAt: new Date() } : {})
      });
      toast.success(`Order #${order.id.slice(0,4)} updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePriority = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "orders", order.id), {
        isPriority: !order.isPriority
      });
      toast.success(order.isPriority ? "Priority removed" : "Marked as Priority");
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const isDelayed = elapsedMinutes > 20 && order.status !== "new";
  const isDanger = elapsedMinutes > 35;

  return (
    <div className={`bg-card p-5 rounded-xl border-2 transition-all duration-300 shadow-sm flex flex-col group/card relative overflow-hidden ${
      order.isPriority ? 'border-purple-500/50 shadow-purple-500/10' : 
      isDanger ? 'border-red-500/50 shadow-red-500/10' : 
      isDelayed ? 'border-amber-500/50 shadow-amber-500/10' : 
      'border-border hover:border-primary/30'
    }`}>
      
      {/* Top Banner / Priority Marker */}
      {order.isPriority && (
        <div className="absolute top-0 left-0 w-full bg-purple-500 text-white text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">
          Priority Order
        </div>
      )}

      {/* Header */}
      <div className={`flex justify-between items-start mb-4 ${order.isPriority ? 'mt-3' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">
            #{order.id.slice(0, 4)}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
            order.orderType === 'Parcel' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}>
            {order.orderType === 'Parcel' ? 'Takeaway' : (order.table.includes('Table') ? order.table : `Table ${order.table}`)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button 
            onClick={togglePriority}
            className={`p-1.5 rounded-md transition-colors ${order.isPriority ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'}`}
            title="Toggle Priority"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer (if not ready/completed) */}
      {(order.status === "new" || order.status === "preparing") && (
        <div className={`flex items-center gap-2 mb-4 text-xs font-bold px-3 py-1.5 rounded-lg border ${
          isDanger ? 'bg-red-500/10 text-red-500 border-red-500/20' :
          isDelayed ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          'bg-muted/50 text-muted-foreground border-border'
        }`}>
          <Clock className="w-4 h-4" />
          {elapsedMinutes} min elapsed
          {isDanger && <span className="ml-auto uppercase tracking-wider">Severely Delayed</span>}
          {!isDanger && isDelayed && <span className="ml-auto uppercase tracking-wider">Delayed</span>}
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-6 bg-muted/20 p-3 rounded-lg border border-border/50">
        {order.cartItems && order.cartItems.length > 0 ? (
          order.cartItems.map((item, idx) => (
            <div key={idx} className="flex flex-col border-b border-border/50 last:border-0 pb-2 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-foreground text-sm">
                  <span className="text-primary mr-1.5">{item.quantity}x</span>
                  {item.name}
                </span>
              </div>
              {item.notes && (
                <div className="mt-1 flex items-start gap-1.5 text-xs text-amber-500 font-medium bg-amber-500/10 p-1.5 rounded-md border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Fallback for old orders without cartItems array */
          <ul className="text-sm space-y-2 text-muted-foreground font-medium">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto">
        {order.status === "new" && (
          <button 
            disabled={isUpdating}
            onClick={() => updateStatus("preparing")}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            <ChefHat className="w-4 h-4" /> Accept & Prepare
          </button>
        )}
        
        {order.status === "preparing" && (
          <button 
            disabled={isUpdating}
            onClick={() => updateStatus("ready")}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            Mark Ready <MoveRight className="w-4 h-4" />
          </button>
        )}

        {order.status === "ready" && (
          <button 
            disabled={isUpdating}
            onClick={() => updateStatus("completed")}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete Order
          </button>
        )}

        {order.status === "completed" && (
          <button 
            disabled={isUpdating}
            onClick={() => updateStatus("archived")}
            className="w-full py-2.5 bg-muted hover:bg-muted-foreground/10 text-muted-foreground transition-all rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}
