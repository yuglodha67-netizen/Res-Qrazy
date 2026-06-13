"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { Star, MessageSquare, Filter } from "lucide-react";

export function ReviewsTab({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");

  // In a real app, this would fetch from a 'reviews' collection.
  // For now, this is a placeholder UI as requested.
  const mockReviews = [
    { id: "1", productName: "Truffle Pasta", customer: "Alice M.", rating: 5, comment: "Absolutely delicious! Will order again.", date: "2026-06-10", status: "new" },
    { id: "2", productName: "Margherita Pizza", customer: "John D.", rating: 3, comment: "Crust was a bit too crispy, but good flavor.", date: "2026-06-09", status: "handled" },
    { id: "3", productName: "Mushroom Soup", customer: "Sarah K.", rating: 1, comment: "Arrived cold.", date: "2026-06-08", status: "reported" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <h2 className="text-2xl font-bold text-foreground">Product Reviews</h2>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-1 shadow-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="bg-transparent border-none text-sm text-foreground focus:outline-none py-2"
          >
            <option value="all">All Reviews</option>
            <option value="new">New / Unhandled</option>
            <option value="handled">Handled</option>
            <option value="reported">Reported</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border font-bold text-muted-foreground text-xs uppercase tracking-wider bg-muted">
          <div className="col-span-2">Customer / Product</div>
          <div>Rating</div>
          <div>Date</div>
          <div className="text-right">Action</div>
        </div>

        <div className="divide-y divide-border">
          {mockReviews.map((review) => (
            <div key={review.id} className="grid grid-cols-5 gap-4 p-4 items-start hover:bg-muted/50 transition-colors">
              <div className="col-span-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  {review.customer}
                  {review.status === "new" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <div className="text-xs text-muted-foreground mt-1">on <span className="font-semibold text-foreground">{review.productName}</span></div>
                <div className="mt-3 text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border flex gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>{review.comment}</p>
                </div>
              </div>
              
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground pt-1">
                {review.date}
              </div>
              
              <div className="text-right flex flex-col items-end gap-2">
                {review.status === "new" && (
                  <>
                    <button className="px-3 py-1 bg-background border border-border hover:bg-muted text-foreground text-xs font-bold rounded-lg transition-colors">
                      Mark Handled
                    </button>
                    <button className="px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold rounded-lg transition-colors border border-destructive/20">
                      Report
                    </button>
                  </>
                )}
                {review.status === "handled" && <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Handled</span>}
                {review.status === "reported" && <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">Reported</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
