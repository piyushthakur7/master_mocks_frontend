"use client";

import { useState, useEffect } from "react";
import { inquiryService } from "@/services/inquiry.service";
import { toast } from "sonner";
import { Loader2, MessageSquare, Plus, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const inquirySchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export default function StudentInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await inquiryService.getMyInquiries();
      if (response.success && response.data) {
        setInquiries(response.data.data || response.data);
      }
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await inquiryService.create(data);
      if (response.success) {
        toast.success("Inquiry submitted successfully");
        setIsFormOpen(false);
        reset();
        fetchInquiries();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Need help? Raise a ticket and our team will get back to you.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D00113] hover:bg-[#b0010f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4">Submit New Inquiry</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input 
                {...register("subject")}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                placeholder="Brief subject of your inquiry"
              />
              {errors.subject && <p className="text-[10px] text-[#D00113] mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
              <textarea 
                {...register("message")}
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                placeholder="Describe your issue in detail..."
              />
              {errors.message && <p className="text-[10px] text-[#D00113] mt-1">{errors.message.message}</p>}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
        </div>
      ) : inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    inquiry.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {inquiry.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{inquiry.subject}</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{formatDate(inquiry.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                  inquiry.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  inquiry.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {inquiry.status}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700">
                <p>{inquiry.message}</p>
              </div>

              {inquiry.admin_reply && (
                <div className="mt-4 ml-6 border-l-2 border-emerald-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Admin Response</span>
                    <span className="text-[10px] text-slate-400">{formatDate(inquiry.replied_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 bg-white p-3 border border-slate-100 rounded-xl inline-block">{inquiry.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Support Tickets</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">You haven't submitted any inquiries yet.</p>
        </div>
      )}

    </div>
  );
}
