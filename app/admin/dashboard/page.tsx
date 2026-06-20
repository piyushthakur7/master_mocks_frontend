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
    { title: "Total Aspirants", value: d.totalStudents.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { title: "Revenue", value: formatCurrency(d.revenue), icon: <IndianRupee className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { title: "Active Courses", value: d.totalCourses.toString(), icon: <BookOpen className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
    { title: "Mock Tests", value: d.totalTests.toString(), subtext: `${d.totalFreeTests} Free / ${d.totalPaidTests} Paid`, icon: <Flag className="w-5 h-5" />, color: "text-[#D00113]", bg: "bg-red-50 border-red-100" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Status Bar Panel Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">System Operational Overview</h1>
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
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center border ${card.bg} ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
              {card.subtext && <p className="text-[10px] font-bold text-slate-400 mt-1">{card.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Revenue Growth</h3>
          <p className="text-xs text-slate-400 font-medium max-w-sm mb-6">More detailed charting will appear here as more data is collected over time.</p>
          <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
            <span className="text-xs text-slate-400 font-medium">Chart Area Placeholder</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Enrollment Activity</h3>
          <p className="text-xs text-slate-400 font-medium max-w-sm mb-6">Recent user registrations and course enrollments distribution.</p>
          <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
            <span className="text-xs text-slate-400 font-medium">Chart Area Placeholder</span>
          </div>
        </div>
      </div>

    </div>
  );
}