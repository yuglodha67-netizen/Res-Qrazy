"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Order } from "./types";

interface OwnerContextType {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  moveOrder: (id: string, newStatus: "preparing" | "ready") => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const moveOrder = (id: string, newStatus: "preparing" | "ready") => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <OwnerContext.Provider value={{ orders, setOrders, moveOrder }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwnerData() {
  const context = useContext(OwnerContext);
  if (context === undefined) {
    throw new Error("useOwnerData must be used within an OwnerProvider");
  }
  return context;
}
