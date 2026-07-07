"use client";

import Link from "next/link";

export default function UpcomingMocks() {
  const upcomingMocks = [
    {
      id: 1,
      title: "SBI PO Mains Full Mock 2026",
      date: "Upcoming Sunday, 10:00 AM",
      prize: "₹50 Max Cashback",
      tags: ["High Level", "New Pattern"],
      price: "₹19"
    },
    {
      id: 2,
      title: "IBPS Clerk Prelims - All India Live",
      date: "Oct 15th, 2026",
      prize: "₹25 Max Cashback",
      tags: ["Speed Test", "Live Rank"],
      price: "₹9"
    },
    {
      id: 3,
      title: "RBI Assistant Mains Special Mock",
      date: "Coming Soon",
      prize: "₹40 Max Cashback",
      tags: ["GA Focused", "Strict Timer"],
      price: "₹29"
    }
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Upcoming <span className="text-brand">PAID</span> Mocks
            </h2>
            <p className="text-lg text-slate-600">
              Register early for our premium mocks and stand a chance to earn maximum cashback rewards!
            </p>
          </div>
          <Link 
            href="/mocks" 
            className="hidden md:inline-flex px-6 py-3 border-2 border-slate-200 hover:border-slate-300 rounded-lg font-bold text-slate-700 hover:text-slate-900 transition-colors shrink-0"
          >
            View All Schedule
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingMocks.map((mock) => (
            <div 
              key={mock.id} 
              className="bg-white rounded-3xl p-1 relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-brand/20 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Highlight border on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand via-orange-400 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="bg-white rounded-[1.4rem] p-7 relative h-full flex flex-col z-10">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {mock.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-black text-brand text-xl">{mock.price}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {mock.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 mt-auto pt-4">
                  <span className="text-brand">📅</span> {mock.date}
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 mb-6 flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-slate-600 uppercase">Reward Pool</span>
                  <span className="text-sm font-black text-green-600 drop-shadow-sm">{mock.prize}</span>
                </div>

                <Link 
                  href="/signup" 
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-brand hover:to-orange-500 text-white font-bold text-sm text-center transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-brand/30"
                >
                  Pre-Register Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Link 
          href="/mocks" 
          className="mt-8 md:hidden w-full flex justify-center px-6 py-3 border-2 border-slate-200 rounded-lg font-bold text-slate-700 transition-colors"
        >
          View All Schedule
        </Link>
      </div>
    </section>
  );
}
