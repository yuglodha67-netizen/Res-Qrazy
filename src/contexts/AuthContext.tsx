"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase/config";

// Valid roles in the system
export type UserRole = "customer" | "owner" | "admin" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChanged automatically persists the session and listens for token changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch the user's role from the 'users' collection in Firestore
          // This ensures backend validation of the role
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const rawRole = userData.role;
            const cleanRole = typeof rawRole === "string" ? rawRole.trim() : rawRole;
            setRole(cleanRole as UserRole);
          } else {
            // Default role if none exists
            setRole("customer");
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          setError("Failed to authenticate user role.");
          setRole(null);
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Auth Context easily in components
export const useAuth = () => useContext(AuthContext);
