"use client";

import Link from "next/link";
import Image from "next/image"; 
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Branding Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Logo Image Wrapper - Added 'sizes' to fix the browser warning */}
          <div className="relative w-9 h-9 overflow-hidden rounded-md">
            <Image
              src="/logo.jpeg" // Placed inside your public/ folder[cite: 1]
              alt="Master Mocks Logo"
              fill
              sizes="36px"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>

          {/* Text Matched Exactly to Logo Typo and Colors */}
          <span className="text-xl font-black tracking-tight font-sans">
            <span className="text-[#1A1A1A]">MASTER</span>
            <span className="text-[#D00113]">MOCKS</span>
          </span>
        </Link>

        {/* Center Navigation Links - Redirect to Login */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
          <Link href="/login" className="hover:text-[#D00113] transition-colors">
            Free Mocks
          </Link>
          <Link href="/login" className="hover:text-[#D00113] transition-colors">
            Free PDFs
          </Link>
        </nav>

        {/* Primary Call to Action */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              className="px-5 py-2.5 rounded-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-md text-sm font-bold text-white bg-[#D00113] hover:bg-[#b0010f] transition-all shadow-sm"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}