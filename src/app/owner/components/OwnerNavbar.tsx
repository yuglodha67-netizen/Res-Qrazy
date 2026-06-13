"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, Menu, Bell, UserCircle, ChevronDown, Store } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/utils/firebase/config";

export function OwnerNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Listen to scroll events on the window to add shadow (in this layout it's sticky so we check scroll)
  // Actually, since the layout container scrolls and not window, we could either observe that container
  // or just always keep the subtle border. Let's keep a subtle border always, and shadow when scrolling.
  // Do not render navbar on auth pages
  const authRoutes = ["/owner/login", "/owner/register", "/owner/forgot-password"];
  if (authRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    window.location.href = "/owner/login";
  };

  const openMobileSidebar = () => {
    window.dispatchEvent(new Event("toggle-mobile-sidebar"));
  };

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) return "Dashboard Overview";
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-200">
      <div className="h-[72px] px-4 md:px-8 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={openMobileSidebar}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </div>
            <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight mt-0.5">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Mobile Title */}
          <h1 className="md:hidden text-lg font-bold text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors hidden sm:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>
          
          <div className="w-px h-6 bg-border/50 hidden sm:block mx-1" />

          <ThemeToggle />

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-1 ml-1 rounded-full border border-border/40 bg-card hover:bg-muted/50 hover:border-border transition-all shadow-sm"
            >
              <div className="hidden sm:block text-right mr-1">
                <p className="text-xs font-bold text-foreground leading-tight">Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <UserCircle className="w-5 h-5" />
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block mr-1" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-border/40 bg-muted/30">
                    <p className="text-sm font-bold text-foreground">Restaurant Owner</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">Administrator</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/owner/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center w-full p-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      Workspace Settings
                    </Link>
                    <div className="h-px bg-border/50 my-2 mx-2" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full p-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
