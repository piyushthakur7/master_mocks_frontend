"use client";

import React, { useMemo, useState } from "react";
import { useAdminEnrollments } from "@/hooks/queries/use-admin-queries";
import { EnrollmentRow } from "@/types/enrollment";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CsvColumn, buildCsv, downloadCsv, datedFilename } from "@/lib/csv";
import { Download, Search, Users, Phone, GraduationCap, Copy, Check } from "lucide-react";
import { SkeletonTableBodyLight } from "@/components/admin/admin-skeletons";
import { toast } from "sonner";

const COLUMNS: CsvColumn<EnrollmentRow>[] = [
  { key: "student_name", label: "Student Name" },
  { key: "phone_number", label: "Phone Number", text: true },
  { key: "email", label: "Email" },
  { key: "course_title", label: "Course" },
  { key: "category", label: "Category" },
  { key: "access_type", label: "Access Type" },
  { key: "price", label: "Course Price (INR)" },
  { key: "enrollment_status", label: "Enrollment Status" },
  { key: "enrolled_at", label: "Enrolled On", format: (r) => formatDate(r.enrolled_at) },
  {
    key: "access_expires_at",
    label: "Access Expires",
    format: (r) => (r.access_expires_at ? formatDate(r.access_expires_at) : "Lifetime"),
  },
  { key: "account_status", label: "Account Status" },
  {
    key: "registered_at",
    label: "Registered On",
    format: (r) => (r.registered_at ? formatDate(r.registered_at) : ""),
  },
  { key: "user_id", label: "User ID" },
];

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const { data: enrollments = [], isLoading, error } = useAdminEnrollments();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrollments.filter((e) => {
      if (statusFilter !== "ALL" && e.enrollment_status !== statusFilter) return false;
      if (!term) return true;
      return (
        e.student_name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.phone_number.toLowerCase().includes(term) ||
        e.course_title.toLowerCase().includes(term)
      );
    });
  }, [enrollments, search, statusFilter]);

  const withPhone = useMemo(
    () => enrollments.filter((e) => e.phone_number).length,
    [enrollments]
  );

  const copyAllPhones = async () => {
    const numbers = filtered.map((e) => e.phone_number).filter(Boolean);
    if (numbers.length === 0) {
      toast.error("No phone numbers in the current view");
      return;
    }
    try {
      await navigator.clipboard.writeText(numbers.join(", "));
      setCopied(true);
      toast.success(`${numbers.length} phone numbers copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard blocked by the browser — use Download CSV instead");
    }
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(datedFilename("enrollments"), buildCsv(filtered, COLUMNS));
    toast.success(`Exported ${filtered.length} enrollments`);
  };

  // No blocking early return: the header, filters and summary tiles are static
  // chrome and paint immediately, with only the table body waiting on data.
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Enrollment Records</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Every course enrollment with full student contact details in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAllPhones}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            Copy Phone Numbers
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D00113] text-xs font-bold text-white hover:bg-[#b00010] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-[#D00113] rounded-2xl p-4 text-sm font-semibold">
          Failed to load enrollments: {(error as any)?.message || "Unknown error"}
        </div>
      ) : null}

      {/* Summary indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Enrollments</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{enrollments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">With Phone Number</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {withPhone}
              <span className="text-sm text-slate-400 font-bold"> / {enrollments.length}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Phone className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Enrollments</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {enrollments.filter((e) => e.enrollment_status === "ACTIVE").length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#D00113]/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="REVOKED">Revoked</option>
        </select>
        <span className="text-[11px] font-bold text-slate-400">
          Showing {filtered.length} of {enrollments.length}
        </span>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Access</th>
                  <th className="py-3.5 px-6">Enrolled On</th>
                  <th className="py-3.5 px-6">Expires</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <SkeletonTableBodyLight columns={7} rows={8} />
            </table>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Access</th>
                  <th className="py-3.5 px-6">Enrolled On</th>
                  <th className="py-3.5 px-6">Expires</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filtered.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{e.student_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{e.email || "—"}</p>
                    </td>
                    <td className="py-4 px-6">
                      {e.phone_number ? (
                        <a
                          href={`tel:${e.phone_number}`}
                          className="font-bold text-slate-900 font-mono text-sm hover:text-[#D00113] transition-colors"
                        >
                          {e.phone_number}
                        </a>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                          Not provided
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-700">{e.course_title}</p>
                      {e.category ? (
                        <p className="text-[11px] text-slate-400 mt-0.5">{e.category}</p>
                      ) : null}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {e.access_type || "—"}
                      </span>
                      {e.price > 0 ? (
                        <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                          {formatCurrency(e.price)}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(e.enrolled_at)}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {e.access_expires_at ? formatDate(e.access_expires_at) : "Lifetime"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          e.enrollment_status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-[#D00113] border-red-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.enrollment_status === "ACTIVE" ? "bg-emerald-500" : "bg-[#D00113]"
                          }`}
                        />
                        {e.enrollment_status}
                      </span>
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
            <GraduationCap className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Enrollments Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {enrollments.length > 0
              ? "No records match your current search or status filter."
              : "No student has enrolled in a course yet."}
          </p>
        </div>
      )}
    </div>
  );
}
