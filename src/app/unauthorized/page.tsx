"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Home, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/utils/firebase/config";
import { signOut } from "firebase/auth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { role } = useAuth();

  const handleReturn = () => {
    if (role === "owner" || role === "admin") {
      router.push("/owner");
    } else if (role === "customer") {
      router.push("/menu");
    } else {
      router.push("/");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/owner/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-center p-10">
        <div className="inline-flex p-4 bg-red-100 dark:bg-red-500/20 rounded-full mb-6">
          <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Access Denied
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          You do not have the required permissions to view this page. Please contact an administrator if you believe this is an error.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleReturn}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Dashboard
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-3.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-3.5 px-4 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
