"use client";

import React, { useState } from "react";
import { ChefHat, Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { auth } from "@/utils/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      console.error(err);
      // We don't want to explicitly reveal if an email exists or not to prevent user enumeration
      // But for owner dashboard, it's generally fine. Let's provide a generic success message
      // if we want strict security, but Firebase naturally returns an error if not found.
      if (err.code === 'auth/user-not-found') {
        // From a strict security standpoint, we pretend it succeeded to stop enumeration:
        setSuccess(true); 
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error(err.message || "Unable to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
      
      {/* Left Section - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-between overflow-hidden">
        {/* Subtle Background Pattern/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 p-12 xl:p-24 flex-1 flex flex-col justify-center">
          <Link href="/owner/login" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity w-fit">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">QRAZY</span>
          </Link>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Regain access to your <br />
            <span className="text-primary">workspace.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
            Fast, secure, and encrypted account recovery. Get back to managing your restaurant in seconds.
          </p>
        </div>

        <div className="relative z-10 p-12 xl:p-24 border-t border-white/5">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Qrazy SaaS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
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

          <Link href="/owner/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {!success ? (
            <>
              <div className="text-center lg:text-left space-y-2 mt-4">
                <h2 className="text-3xl font-bold tracking-tight">Forgot Password?</h2>
                <p className="text-muted-foreground font-medium">
                  Enter your email address and we'll send you a link to securely reset your password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center lg:text-left space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                If an account exists for <span className="text-foreground font-bold">{email}</span>, we have sent a secure password reset link.
              </p>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full py-3.5 px-4 bg-card border border-border hover:bg-muted active:scale-[0.98] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-8 text-xs font-medium text-muted-foreground/60">
            <ShieldCheck className="w-4 h-4" />
            Secure, End-to-End Encrypted Connection
          </div>
        </div>
      </div>

    </div>
  );
}
