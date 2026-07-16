"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileText, BookOpen, BarChart2, Settings, LogOut, Menu, X, Bell, CreditCard } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { 
  useStudentDashboard, 
  useAllMocks, 
  usePurchasedMocks, 
  useCompletedAttempts, 
  useResources, 
  useMyPurchases,
  useMyHistory 
} from "@/hooks/queries/use-dashboard-queries";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Prefetching: Fire off all dashboard requests in parallel on layout mount
  // Since these hooks use React Query with staleTime > 0, they will fetch once and cache.
  // The pages will then instantly render using this cached data.
  const { refetch: prefetchDashboard } = useStudentDashboard();
  const { refetch: prefetchMocks } = useAllMocks(50);
  const { refetch: prefetchPurchased } = usePurchasedMocks();
  const { refetch: prefetchAttempts } = useCompletedAttempts(100);
  const { refetch: prefetchResources } = useResources();
  const { refetch: prefetchMyPurchases } = useMyPurchases();
  const { refetch: prefetchHistory } = useMyHistory();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      // Trigger background fetches if authenticated
      prefetchDashboard();
      prefetchMocks();
      prefetchPurchased();
      prefetchAttempts();
      prefetchResources();
      prefetchMyPurchases();
      prefetchHistory();
    }
  }, [isLoading, isAuthenticated, router, prefetchDashboard, prefetchMocks, prefetchPurchased, prefetchAttempts, prefetchResources, prefetchMyPurchases, prefetchHistory]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#D00113] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Free Mocks", href: "/tests", icon: <FileText size={18} /> },
    { name: "Paid Mock Test", href: "/paid-tests", icon: <FileText size={18} /> },
    { name: "Free Pdfs", href: "/resources", icon: <BookOpen size={18} /> },
    { name: "My Results", href: "/results", icon: <BarChart2 size={18} /> },
    { name: "My Purchases", href: "/purchases", icon: <CreditCard size={18} /> },
    { name: "Portal Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      
      {/* ─── MOBILE HEADER NAVIGATION ─── */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" prefetch={false} className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight">
            <span className="text-[#1A1A1A]">MASTER</span><span className="text-[#D00113]">MOCKS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
            <Bell size={20} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DROPDOWN MENU PANEL ─── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bg-white border-b border-slate-200 z-40 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-red-50 text-[#D00113]" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={isActive ? "text-[#D00113]" : "text-slate-400"}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-slate-100">
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
                <LogOut size={18} /> Exit Workspace
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ─── DESKTOP SIDEBAR NAVIGATION ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo Brand Frame */}
          <Link href="/dashboard" prefetch={false} className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 overflow-hidden rounded-md">
              <Image src="/logo.jpeg" alt="Master Mocks Logo" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-[#1A1A1A]">MASTER</span>
              <span className="text-[#D00113]">MOCKS</span>
            </span>
          </Link>

          {/* Nav Stack Links */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isActive 
                      ? "bg-[#D00113] text-white shadow-md shadow-red-600/10" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="px-4 flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Notifications</span>
            <button className="hover:text-slate-900 transition-colors">
              <Bell size={16} />
            </button>
          </div>
          
          {/* Workspace Foot Profile Link */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between p-2 rounded-xl group transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-inner uppercase overflow-hidden relative">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.full_name} fill className="object-cover" />
                  ) : (
                    getInitials(user?.full_name || "Student")
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{user?.full_name}</p>
                </div>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-[#D00113] p-1 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT VARIABLE CONTAINER ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

    </div>
  );
}