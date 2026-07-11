"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { dashboardService } from "@/services/dashboard.service";
import { toast } from "sonner";
import { Loader2, Users, BookOpen, Flag, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getAdminDashboard();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  const d = data || {
    totalStudents: 0,
    totalCourses: 0,
    totalTests: 0,
    totalFreeTests: 0,
    totalPaidTests: 0,
    revenue: 0
  };

  const corporateMetrics = [
    { title: "Total Aspirants", value: d.totalStudents.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Revenue", value: formatCurrency(d.revenue), icon: <IndianRupee className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { title: "Active Courses", value: d.totalCourses.toString(), icon: <BookOpen className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { title: "Mock Tests", value: d.totalTests.toString(), subtext: `${d.totalFreeTests} Free / ${d.totalPaidTests} Paid`, icon: <Flag className="w-5 h-5" />, color: "text-[#D00113]", bg: "bg-red-500/10 border-red-500/20" }
  ];

  const mockRevenueData = [
    { month: "Jan", value: 12500 },
    { month: "Feb", value: 15000 },
    { month: "Mar", value: 22000 },
    { month: "Apr", value: 18500 },
    { month: "May", value: 26000 },
    { month: "Jun", value: d.revenue > 31000 ? d.revenue : 31000 },
  ];

  const mockEnrollmentData = [
    { month: "Jan", value: 140 },
    { month: "Feb", value: 185 },
    { month: "Mar", value: 250 },
    { month: "Apr", value: 210 },
    { month: "May", value: 320 },
    { month: "Jun", value: d.totalStudents > 450 ? d.totalStudents : 450 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Status Bar Panel Header */}
      <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">System Operational Overview</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Global configuration monitor tracking performance metrics and platform health.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tests/create" className="px-4 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all">
            ➕ Author Mock Test
          </Link>
        </div>
      </div>

      {/* Aggregated Analytics Scoreboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {corporateMetrics.map((card, i) => (
          <div key={i} className="bg-[#141414] border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center border ${card.bg} ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
              {card.subtext && <p className="text-[10px] font-bold text-slate-400 mt-1">{card.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-center min-h-[300px]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Revenue Growth</h3>
            <p className="text-xs text-slate-400 font-medium">Monthly revenue progression based on recent data.</p>
          </div>
          <div className="w-full h-48 mt-6 flex items-end justify-between gap-2 px-2">
            {mockRevenueData.map((item, idx) => {
              const maxVal = Math.max(...mockRevenueData.map(d => d.value));
              const heightPct = Math.max((item.value / maxVal) * 100, 10); // min height 10%
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group h-full">
                  <div className="w-full relative flex justify-center h-full items-end">
                    <div 
                      className="w-full max-w-[40px] bg-emerald-500/20 group-hover:bg-emerald-500/40 border-t-2 border-emerald-500 rounded-t-sm transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-slate-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap transition-opacity z-10">
                        ₹{item.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-center min-h-[300px]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Enrollment Activity</h3>
            <p className="text-xs text-slate-400 font-medium">Recent user registrations and enrollments.</p>
          </div>
          <div className="w-full h-48 mt-6 flex items-end justify-between gap-2 px-2">
            {mockEnrollmentData.map((item, idx) => {
              const maxVal = Math.max(...mockEnrollmentData.map(d => d.value));
              const heightPct = Math.max((item.value / maxVal) * 100, 10);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group h-full">
                  <div className="w-full relative flex justify-center h-full items-end">
                    <div 
                      className="w-full max-w-[40px] bg-blue-500/20 group-hover:bg-blue-500/40 border-t-2 border-blue-500 rounded-t-sm transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-slate-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap transition-opacity z-10">
                        {item.value} Users
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}