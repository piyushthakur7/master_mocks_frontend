"use client";

import Link from "next/link";
import Image from "next/image"; 
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    title: "Free Mocks",
    href: "/free-mocks"
  },
  {
    title: "Paid Mocks",
    href: "/paid-mocks"
  },
  {
    title: "Free PDFs",
    href: "/free-pdfs"
  }
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Branding Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo Image Wrapper */}
          <div className="relative w-10 h-10 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">
            <Image
              src="/logo.jpeg"
              alt="Master Minds Logo"
              fill
              sizes="40px"
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              priority
            />
          </div>

          {/* Text Matched Exactly to Logo Typo and Colors */}
          <span className="text-2xl font-black tracking-tight font-sans flex items-center">
            <span className="text-slate-900 drop-shadow-sm">MASTER</span>
            <span className="text-brand drop-shadow-sm">MOCKS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
          
          {navItems.map((item, idx) => (
            <div key={idx} className="relative h-full flex items-center group/nav">
              <Link href={item.href} className="flex items-center gap-1 text-slate-600 hover:text-brand transition-colors duration-300 py-6">
                {item.title}
              </Link>
              {/* Animated underline */}
              <div className="absolute bottom-4 left-0 w-full h-[3px] bg-brand scale-x-0 origin-left group-hover/nav:scale-x-100 transition-transform duration-300 ease-out rounded-full" />
            </div>
          ))}

        </nav>

        {/* Primary Call to Action */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover transition-all shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-0.5 active:translate-y-0 duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}