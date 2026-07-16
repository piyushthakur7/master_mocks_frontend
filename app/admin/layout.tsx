"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileEdit, Users, FolderOpen, FileText, Settings, LogOut, Menu, X } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function AdminWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/admin/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-[#D00113] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // All URL paths explicitly target the clear /admin sub-directory tree
  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Manage Categories", href: "/admin/categories", icon: <FolderOpen size={18} /> },
    { name: "Manage Mock Tests", href: "/admin/tests", icon: <FileEdit size={18} /> },
    { name: "Student Management", href: "/admin/students", icon: <Users size={18} /> },
    { name: "Study Resources", href: "/admin/resources", icon: <FileText size={18} /> },
    { name: "Payments & Reports", href: "/admin/reports", icon: <FileText size={18} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* ─── MOBILE ADMINISTRATIVE HEADER ─── */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50 text-white">
        <Link href="/admin/dashboard" prefetch={false} className="flex items-center gap-2">
          <span className="text-sm font-black tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded">ADMIN CONTROL</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-md text-xl"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ─── MOBILE ADMINISTRATIVE DROPDOWN PANEL ─── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[49px] bg-slate-900 border-b border-slate-800 z-40 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-[#D00113] text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-slate-800">
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-400">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ─── DESKTOP ADMINISTRATIVE SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-white border-r border-slate-800 sticky top-0 h-screen p-6 justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo Brand Frame */}
          <div className="space-y-2">
            <Link href="/admin/dashboard" prefetch={false} className="flex items-center gap-2 group">
              <div className="relative w-6 h-6 overflow-hidden rounded bg-white p-0.5">
                <Image src="/logo.jpeg" alt="Master Mocks Logo" fill sizes="24px" className="object-cover" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                MASTER<span className="text-[#D00113]">MOCKS</span>
              </span>
            </Link>
          </div>

          {/* Admin Command Nav Stack */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Operational Profile Identity Footer */}
        <div className="border-t border-slate-900 pt-4">
          <div className="flex items-center justify-between p-2 rounded-xl group transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center relative overflow-hidden">
                {user?.avatar ? (
                  <Image src={user.avatar} alt={user.full_name} fill className="object-cover" />
                ) : (
                  getInitials(user?.full_name || "Admin")
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 line-clamp-1">{user?.full_name || "Administrator"}</p>
                <p className="text-xs text-slate-500">{user?.email || "admin@system.com"}</p>
              </div>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-[#D00113] text-xs transition-colors p-1" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ADMIN CONTENT VIEWPORT ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

    </div>
  );
}