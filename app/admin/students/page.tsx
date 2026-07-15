"use client";

import React, { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { toast } from "sonner";
import { Loader2, UserX, UserCheck, ShieldAlert, IndianRupee } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AdminStudentsRosterPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await userService.getAllUsers({ role: "STUDENT" });
      if (response.success && response.data) {
        setStudents(Array.isArray(response.data) ? response.data : response.data?.data || []);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setStudents([]);
      } else {
        toast.error("Failed to load students");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === "active" ? "suspended" : "active";
      await userService.updateUserStatus(user._id, { status: newStatus });
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  const activeStudents = students.filter(s => s.status === "active").length;
  // Use either walletBalance or wallet_balance depending on backend
  const totalWalletBalance = students.reduce((sum, s) => sum + ((s as any).wallet_balance || s.walletBalance || 0), 0);
  const inactiveStudents = students.filter(s => s.status !== "active").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Descriptive Column */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Roster & Directory</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Audit complete user registrations, manage access, and oversee wallet balances.</p>
      </div>

      {/* Grid Quick Indicators Summary Track */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Registered</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{students.length} Candidates</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Wallet Liability</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalWalletBalance)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Suspended / Inactive</p>
            <p className="text-2xl font-black text-[#D00113] mt-1">{inactiveStudents} Users</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-[#D00113]" />
          </div>
        </div>
      </div>

      {/* Main Roster Matrix Grid Table Layout */}
      {students.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-6">Candidate Profile</th>
                  <th className="py-3.5 px-6">Registration Date</th>
                  <th className="py-3.5 px-6">Wallet Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img 
                        src={student.avatar || `https://ui-avatars.com/api/?name=${student.full_name}&background=random`} 
                        alt={student.full_name} 
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{student.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(student.createdAt)}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600">{formatCurrency((student as any).wallet_balance || student.walletBalance || 0)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        student.status === "active" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-red-50 text-[#D00113] border-red-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === "active" ? "bg-emerald-500" : "bg-[#D00113]"}`} />
                        {student.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button 
                        onClick={() => toggleUserStatus(student)}
                        className={`text-xs font-bold transition-colors ${student.status === "active" ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {student.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <UserX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Students Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">There are no registered students on the platform yet.</p>
        </div>
      )}

    </div>
  );
}