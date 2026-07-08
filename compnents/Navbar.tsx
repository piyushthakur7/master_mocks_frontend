"use client";

import Link from "next/link";
import Image from "next/image"; 
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    title: "Free Mocks",
    sections: [
      {
        category: "Banking & Insurance",
        links: [
          { name: "Reasoning Ability", href: "/free-mocks/reasoning" },
          { name: "Quantitative Aptitude", href: "/free-mocks/quant" },
          { name: "Daily Current Affairs", href: "/free-mocks/current-affairs" },
        ]
      }
    ]
  },
  {
    title: "Paid Mocks",
    sections: [
      {
        category: "Banking & Insurance",
        links: [
          { name: "Reasoning Ability", href: "/paid-mocks/reasoning" },
          { name: "Quantitative Aptitude", href: "/paid-mocks/quant" },
          { name: "Daily Current Affairs", href: "/paid-mocks/current-affairs" },
        ]
      }
    ]
  },
  {
    title: "Free PDFs",
    sections: [
      {
        category: "Banking & Insurance",
        links: [
          { name: "Reasoning Ability", href: "/free-pdfs/reasoning" },
          { name: "Quantitative Aptitude", href: "/free-pdfs/quant" },
          { name: "Daily Current Affairs", href: "/free-pdfs/current-affairs" },
        ]
      }
    ]
  }
];

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

        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
          
          {navItems.map((item, idx) => (
            <div key={idx} className="relative group h-full flex items-center">
              <button className="flex items-center gap-1 hover:text-[#D00113] transition-colors outline-none focus:outline-none py-6">
                {item.title}
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {/* Dropdown Container */}
              <div className="absolute top-[100%] left-0 pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-white rounded-lg shadow-xl border border-slate-100 p-3 transform origin-top translate-y-2 group-hover:translate-y-0 transition-all duration-200 max-h-96 overflow-y-auto">
                  
                  {item.sections.map((section, sIdx) => (
                    <div key={sIdx} className={sIdx > 0 ? "mt-4" : ""}>
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 rounded-md mb-2">
                        {section.category}
                      </div>
                      <div className="flex flex-col gap-1">
                        {section.links.map((link, lIdx) => (
                          <Link key={lIdx} href={link.href} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-[#D00113] rounded-md transition-colors block">
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                </div>
              </div>
            </div>
          ))}

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