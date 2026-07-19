"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { mockTestService } from "@/services/mock-test.service";
import { MockTest } from "@/types/mock-test";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function UpcomingMocks() {
  const { isAuthenticated } = useAuth();
  const [upcomingMocks, setUpcomingMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaidMocks = async () => {
      try {
        const response = await mockTestService.getAll({ access_type: 'paid', limit: 3 });
        
        let data: MockTest[] = [];
        if (response?.data) {
          data = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
        } else if (Array.isArray(response)) {
          data = response;
        }
        
        setUpcomingMocks(data);
      } catch (err: any) {
        console.error("Failed to load upcoming mocks", err);
        setErrorMsg(typeof err === 'object' ? JSON.stringify(err, Object.getOwnPropertyNames(err), 2) : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchPaidMocks();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50/50 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </section>
    );
  }

  if (errorMsg) {
    return (
      <section className="py-24 bg-slate-50/50 flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-semibold w-full max-w-4xl shadow-sm border border-red-100 overflow-auto">
          Error loading mocks:
          <pre className="mt-3 text-xs bg-red-100/50 p-4 rounded-xl">{errorMsg}</pre>
        </div>
      </section>
    );
  }

  if (upcomingMocks.length === 0) {
    return (
      <section className="py-24 bg-slate-50/50 min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Featured <span className="text-brand">PAID</span> Mocks
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Premium mock tests will be available here soon. Stay tuned!
          </p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Featured <span className="text-brand">PAID</span> Mocks
            </h2>
            <p className="text-xl sm:text-2xl text-slate-500 font-medium leading-relaxed">
              Register early for our premium mocks and stand a chance to earn maximum cashback rewards!
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href="/mocks" 
              className="hidden md:inline-flex px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-slate-700 transition-all shadow-sm hover:shadow-md shrink-0 text-lg"
            >
              View All Schedule
            </Link>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10"
        >
          {upcomingMocks.map((mock) => (
            <motion.div 
              variants={itemVariants}
              key={mock._id} 
              className="group relative bg-white rounded-[2rem] p-[3px] shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
              
              <div className="bg-white rounded-[1.8rem] p-8 relative h-full flex flex-col z-10">
                
                {/* Header: Badges & Price */}
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-full">
                      {mock.difficulty || 'Medium'}
                    </span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-full">
                      {mock.duration_minutes} Mins
                    </span>
                    <span className="px-3 py-1.5 bg-brand/10 text-brand text-xs font-bold uppercase tracking-wide rounded-full">
                      {mock.total_questions || mock.questions?.length || 0} Qs
                    </span>
                  </div>
                  <span className="font-black text-brand text-2xl tracking-tight bg-brand/5 px-4 py-1 rounded-full">
                    ₹{mock.price}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-brand transition-colors duration-300">
                  {mock.title}
                </h3>
                
                {/* Spacer to push remaining content to bottom */}
                <div className="flex-grow" />
                
                {/* Meta info */}
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-6">
                  <span className="text-brand/80 text-lg">📅</span> Available Now
                </div>
                
                {/* Reward Banner */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-inner">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Reward Pool</span>
                  <span className="text-base font-black text-green-600 drop-shadow-sm">₹50 Max Cashback</span>
                </div>

                {/* CTA Button */}
                <Link 
                  href={isAuthenticated ? `/tests/${mock._id}` : `/register?returnUrl=/tests/${mock._id}`} 
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-center transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-brand/20 group-hover:bg-brand"
                >
                  Take Test
                </Link>
                
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 md:hidden">
          <Link 
            href="/mocks" 
            className="w-full flex justify-center px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm"
          >
            View All Schedule
          </Link>
        </div>

      </div>
    </section>
  );
}
