"use client";

import React, { useState, useEffect } from "react";
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { auth } from "@/utils/firebase/config";
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/loaders/ButtonLoader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Prefetch dashboard for faster transition
  useEffect(() => {
    router.prefetch("/owner");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Set persistence based on "Remember Me"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Attempt login
      await signInWithEmailAndPassword(auth, email, password);
      
      toast.success("Login successful! Redirecting...");
      
      // Wait for AuthContext to fetch role
      setTimeout(() => {
        router.push("/owner");
      }, 600);
      
    } catch (err: any) {
      console.error(err);
      
      // Professional Error Handling
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.error("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        toast.error("Account temporarily locked due to many failed attempts. Try again later or reset your password.");
      } else {
        toast.error(err.message || "Unable to connect. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
      
      {/* Left Section - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-between overflow-hidden">
        {/* Subtle Background Pattern/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 p-12 xl:p-24 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">QRAZY</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Manage your restaurant <br />
            <span className="text-primary">smarter & faster.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
            Everything you need to manage orders, menus, customers, and real-time analytics in one powerful command center.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Real-time Kitchen Display System
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Dynamic QR Menu Management
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Deep Customer & Sales Analytics
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 xl:p-24 border-t border-white/5">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Qrazy SaaS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px] space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">QRAZY</span>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground font-medium">
              Enter your credentials to access the owner dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium disabled:opacity-50"
                    placeholder="name@restaurant.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">Password</label>
                  <Link 
                    href="/owner/forgot-password" 
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-11 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium disabled:opacity-50 font-sans tracking-wide"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-card"
                />
                <span className="text-sm font-medium text-muted-foreground select-none">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <ButtonLoader label="Signing In..." />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-8 text-sm font-medium text-muted-foreground">
              Don't have an account? 
              <Link href="/owner/register" className="text-primary hover:text-primary/80 transition-colors font-bold">
                Create workspace
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mt-8 text-xs font-medium text-muted-foreground/60">
              <ShieldCheck className="w-4 h-4" />
              Secure, End-to-End Encrypted Connection
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
