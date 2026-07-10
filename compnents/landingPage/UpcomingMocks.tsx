"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { mockTestService } from "@/services/mock-test.service";
import { MockTest } from "@/types/mock-test";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function UpcomingMocks() {
  const { isAuthenticated } = useAuth();
  const [upcomingMocks, setUpcomingMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaidMocks = async () => {
      try {
        const response = await mockTestService.getAll({ access_type: 'paid', limit: 3 });
        // @ts-ignore - response.data structure depends on API response
        const data = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
        setUpcomingMocks(data);
      } catch (err) {
        console.error("Failed to load upcoming mocks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaidMocks();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50/50 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </section>
    );
  }

  if (upcomingMocks.length === 0) {
    return (
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Featured <span className="text-brand">PAID</span> Hacks
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Premium mock tests will be available here soon. Stay tuned!
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Featured <span className="text-brand">PAID</span> Hacks
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600">
              Register early for our premium mocks and stand a chance to earn maximum cashback rewards!
            </p>
          </div>
          <Link 
            href="/mocks" 
            className="hidden md:inline-flex px-8 py-4 border-2 border-slate-200 hover:border-slate-300 rounded-lg font-bold text-slate-700 hover:text-slate-900 transition-colors shrink-0 text-lg sm:text-xl"
          >
            View All Schedule
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcomingMocks.map((mock) => (
            <div 
              key={mock._id} 
              className="bg-white rounded-3xl p-1 relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-brand/20 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Highlight border on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand via-orange-400 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="bg-white rounded-[1.4rem] p-7 relative h-full flex flex-col z-10">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                      {mock.difficulty || 'Medium'}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                      {mock.duration_minutes} Mins
                    </span>
                  </div>
                  <span className="font-black text-brand text-xl">₹{mock.price}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {mock.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6 mt-auto pt-4">
                  <span className="text-brand">📅</span> Available Now
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 mb-6 flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-slate-600 uppercase">Reward Pool</span>
                  <span className="text-sm font-black text-green-600 drop-shadow-sm">₹50 Max Cashback</span>
                </div>

                <Link 
                  href={isAuthenticated ? `/tests/${mock._id}` : `/register?returnUrl=/tests/${mock._id}`} 
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-brand hover:to-orange-500 text-white font-bold text-sm text-center transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-brand/30 block"
                >
                  Take Test
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
