"use client";

import React from "react";
import { Search, Filter } from "lucide-react";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  orderTypeFilter: string;
  setOrderTypeFilter: (type: string) => void;
}

export function KDSHeader({ searchQuery, setSearchQuery, orderTypeFilter, setOrderTypeFilter }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm mb-6 relative z-20">
      
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by Order ID, Table, or Item..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all font-medium placeholder:text-muted-foreground"
        />
      </div>

      <div className="relative group w-full md:w-auto shrink-0">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer hover:border-primary transition-all w-full">
          <Filter className="w-4 h-4 text-primary" />
          <select 
            className="bg-transparent border-none outline-none appearance-none cursor-pointer w-full pr-4 text-foreground"
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="Dine-in">Dine-in Only</option>
            <option value="Parcel">Takeaway Only</option>
          </select>
        </div>
      </div>
      
    </div>
  );
}
