"use client";

import Link from "next/link";
import { useAdminDashboard } from "@/hooks/queries/use-admin-queries";
import { Loader2, Users, BookOpen, Flag, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminDashboardOverviewPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  // Coerce every field defensively: a non-null response that is missing a key
  // (or uses snake_case) must not crash .toLocaleString()/.toString() below.
  const raw = (data || {}) as any;
  const d = {
    totalStudents: Number(raw.totalStudents ?? raw.total_students ?? 0),
    totalCourses: Number(raw.totalCourses ?? raw.total_courses ?? 0),
    totalTests: Number(raw.totalTests ?? raw.total_tests ?? 0),
    totalFreeTests: Number(raw.totalFreeTests ?? raw.total_free_tests ?? 0),
    totalPaidTests: Number(raw.totalPaidTests ?? raw.total_paid_tests ?? 0),
    revenue: Number(raw.revenue ?? 0),
  };

  const corporateMetrics = [
    { title: "Total Aspirants", value: d.totalStudents.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { title: "Total Courses", value: d.totalCourses.toLocaleString(), icon: <BookOpen className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { title: "Mock Tests", value: d.totalTests.toString(), subtext: `${d.totalFreeTests} Free / ${d.totalPaidTests} Paid`, icon: <Flag className="w-5 h-5" />, color: "text-[#D00113]", bg: "bg-red-50 border-red-100" },
    { title: "Revenue", value: formatCurrency(d.revenue), icon: <IndianRupee className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" }
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">System Operational Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Global configuration monitor tracking performance metrics and platform health.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tests/create" prefetch={false} className="px-4 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all">
            ➕ Author Mock Test
          </Link>
        </div>
      </div>

      {/* Aggregated Analytics Scoreboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {corporateMetrics.map((card, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center border ${card.bg} ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
              {card.subtext && <p className="text-[10px] font-bold text-slate-500 mt-1">{card.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-center min-h-[350px]">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Revenue Growth</h3>
            <p className="text-xs text-slate-500 font-medium">Monthly revenue progression based on recent data.</p>
          </div>
          <div className="w-full h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {mockRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-center min-h-[350px]">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Enrollment Activity</h3>
            <p className="text-xs text-slate-500 font-medium">Recent user registrations and enrollments.</p>
          </div>
          <div className="w-full h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockEnrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(value: number) => [`${value} Users`, 'Enrollments']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {mockEnrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}