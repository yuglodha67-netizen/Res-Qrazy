"use client";

import React, { useState } from "react";
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User, Store, CheckCircle2, AlertCircle } from "lucide-react";
import { auth, db } from "@/utils/firebase/config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [ownerName, setOwnerName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ownerName || !restaurantName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please ensure your password meets all security requirements.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create User Document with Role
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: ownerName,
        role: "owner",
        createdAt: serverTimestamp(),
      });

      // 3. Create initial general settings document for the restaurant
      await setDoc(doc(db, "settings", "general"), {
        name: restaurantName,
        ownerName: ownerName,
        email: user.email,
        themeMode: "system",
        primaryColor: "#3b82f6", // Default blue
        menuVisible: true,
        acceptOrders: true,
        tableReservations: false,
        businessHours: {
          monday: { open: "10:00", close: "22:00", closed: false },
          tuesday: { open: "10:00", close: "22:00", closed: false },
          wednesday: { open: "10:00", close: "22:00", closed: false },
          thursday: { open: "10:00", close: "22:00", closed: false },
          friday: { open: "10:00", close: "23:00", closed: false },
          saturday: { open: "10:00", close: "23:00", closed: false },
          sunday: { open: "10:00", close: "21:00", closed: false },
        },
        createdAt: serverTimestamp(),
      }, { merge: true });

      // 4. Send Verification Email
      await sendEmailVerification(user);

      setSuccess(true);
      toast.success("Workspace created successfully!");

    } catch (err: any) {
      console.error(err);
      
      // Professional Error Handling
      if (err.code === 'auth/email-already-in-use') {
        toast.error("An account with this email already exists.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Invalid email format.");
      } else {
        toast.error(err.message || "Failed to create account. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
      
      {/* Left Section - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-background to-background z-0" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 p-12 xl:p-24 flex-1 flex flex-col justify-center">
          <Link href="/owner/login" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity w-fit">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">QRAZY</span>
          </Link>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Start your journey with <br />
            <span className="text-primary">Qrazy Workspace.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
            Create an owner account to instantly provision your highly-available restaurant management database.
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md">
            <p className="italic text-slate-300 font-medium leading-relaxed">
              "Switching to Qrazy entirely transformed how our kitchen operates. We handle 3x the volume with zero missed orders."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <p className="font-bold text-white text-sm">Michael Chang</p>
                <p className="text-xs text-slate-400">Owner, The Golden Wok</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 xl:p-24 border-t border-white/5">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Qrazy SaaS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-8 my-auto py-8">
          
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">QRAZY</span>
            </div>
          </div>

          {!success ? (
            <>
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create workspace</h2>
                <p className="text-muted-foreground font-medium">
                  Enter your details to provision your restaurant dashboard.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Your Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium disabled:opacity-50 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Restaurant Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium disabled:opacity-50 text-sm"
                        placeholder="The Great Diner"
                      />
                    </div>
                  </div>
                </div>

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
                      placeholder="owner@restaurant.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Secure Password</label>
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

                  {/* Password Strength UI */}
                  {password.length > 0 && (
                    <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex gap-1 mb-2">
                        <div className={`h-1.5 flex-1 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-border'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${hasUpperCase ? 'bg-emerald-500' : 'bg-border'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-border'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${hasSpecialChar ? 'bg-emerald-500' : 'bg-border'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-muted-foreground">
                        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500' : ''}`}>
                          {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          8+ Characters
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-500' : ''}`}>
                          {hasUpperCase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          Uppercase Letter
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500' : ''}`}>
                          {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          Number (0-9)
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-500' : ''}`}>
                          {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          Special Character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-8 text-sm font-medium text-muted-foreground">
                  Already have an account? 
                  <Link href="/owner/login" className="text-primary hover:text-primary/80 transition-colors font-bold">
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Workspace Created!</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Your database has been securely provisioned. We've sent a verification email to <span className="text-foreground font-bold">{email}</span>.
              </p>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  Please verify your email to access all owner features.
                </p>
                <Link
                  href="/owner"
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Proceed to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-8 text-xs font-medium text-muted-foreground/60">
            <ShieldCheck className="w-4 h-4" />
            Secure, End-to-End Encrypted Provisioning
          </div>
        </div>
      </div>

    </div>
  );
}
