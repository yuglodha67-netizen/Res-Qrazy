"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ChefHat, QrCode, Settings, ChevronLeft, ChevronRight, BarChart, Package, X } from "lucide-react";

export function OwnerSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Listen for custom event from Navbar to open sidebar on mobile
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Do not render sidebar on auth pages
  const authRoutes = ["/owner/login", "/owner/register", "/owner/forgot-password"];
  if (authRoutes.includes(pathname)) {
    return null;
  }

  const navItems = [
    { name: "Overview", href: "/owner", icon: LayoutDashboard },
    { name: "Analytics", href: "/owner/analytics", icon: BarChart },
    { name: "KDS", href: "/owner/kds", icon: ChefHat },
    { name: "Products", href: "/owner/products", icon: Package },
    { name: "QR", href: "/owner/qr", icon: QrCode },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop Fixed + Mobile Drawer) */}
      <aside 
        className={`fixed md:relative top-0 left-0 h-screen bg-card border-r border-border/60 shadow-sm flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed && !isMobileOpen ? "md:w-[88px]" : "md:w-72"}`}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] min-h-[72px] px-6 flex items-center justify-between border-b border-border/40">
          {(!isCollapsed || isMobileOpen) && (
            <Link href="/owner" className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">
                Q
              </span>
              QRAZY <span className="text-primary text-sm font-bold tracking-wider uppercase ml-1">SaaS</span>
            </Link>
          )}
          
          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? "mx-auto" : ""}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {(!isCollapsed || isMobileOpen) && (
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">
              Main Navigation
            </p>
          )}
          
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/owner" && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed && !isMobileOpen ? item.name : undefined}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                  } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
                >
                  {/* Active Indicator Accent Line */}
                  {isActive && (!isCollapsed || isMobileOpen) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
                  )}

                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Settings Area (Fixed at bottom of Sidebar) */}
        <div className="p-4 border-t border-border/40 bg-card/50 mt-auto">
          <Link 
            href="/owner/settings"
            title={isCollapsed && !isMobileOpen ? "Settings" : undefined}
            className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
              pathname.startsWith("/owner/settings")
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
            } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
          >
            {pathname.startsWith("/owner/settings") && (!isCollapsed || isMobileOpen) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
            )}
            <Settings className={`w-5 h-5 shrink-0 transition-colors ${pathname.startsWith("/owner/settings") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">Settings</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
