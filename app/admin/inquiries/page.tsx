"use client";

import React, { useState, useEffect } from "react";
import { inquiryService } from "@/services/inquiry.service";
import { Inquiry } from "@/types/inquiry";
import { toast } from "sonner";
import { Loader2, MessageSquare, CheckCircle, Clock, Search, Send, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await inquiryService.getAll();
      if (response.success && response.data) {
        setInquiries(response.data.data || response.data);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        setInquiries([]);
      } else if (!error?._silent) {
        toast.error("Failed to load inquiries");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, closeInquiry: boolean = false) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    if (!replyMessage.trim() && !closeInquiry) {
      toast.error("Please enter a message to reply");
      return;
    }

    setIsReplying(true);
    try {
      await inquiryService.reply(selectedInquiry._id!, {
        message: replyMessage,
        updateStatus: closeInquiry ? "RESOLVED" : undefined
      });
      toast.success(closeInquiry ? "Inquiry resolved and closed" : "Reply sent successfully");
      setReplyMessage("");
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error: any) {
      toast.error(error.message || "Failed to process reply");
    } finally {
      setIsReplying(false);
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    if (statusFilter === "ALL") return true;
    return i.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Support & Inquiry Matrix</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage user support requests, provide assistance, and resolve tickets.</p>
        </div>
        <div className="flex gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === status 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inquiry List */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Ticket Inbox</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredInquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredInquiries.map(inq => (
                  <div 
                    key={inq._id} 
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 cursor-pointer transition-colors ${selectedInquiry?._id === inq._id ? 'bg-red-50 border-l-4 border-[#D00113]' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        inq.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                        inq.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {inq.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(inq.createdAt!)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{inq.subject}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{inq.message}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{(inq.user as any)?.fullName || "Unknown User"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">No tickets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Ticket Thread */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          {selectedInquiry ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{selectedInquiry.subject}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <User className="w-4 h-4" /> {(selectedInquiry.user as any)?.fullName} ({(selectedInquiry.user as any)?.email})
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {formatDate(selectedInquiry.createdAt!)}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg border ${
                  selectedInquiry.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  selectedInquiry.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {selectedInquiry.status.replace("_", " ")}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {/* Original Message */}
                <div className="flex flex-col items-start gap-1 max-w-[85%]">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold ml-2">Original Inquiry</span>
                </div>

                {/* Replies */}
                {selectedInquiry.replies?.map((reply, i) => (
                  <div key={i} className={`flex flex-col gap-1 max-w-[85%] ${reply.isAdmin ? 'items-end self-end ml-auto' : 'items-start self-start mr-auto'}`}>
                    <div className={`rounded-2xl p-4 shadow-sm text-sm ${
                      reply.isAdmin 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                    </div>
                    <span className={`text-[10px] text-slate-400 font-bold ${reply.isAdmin ? 'mr-2' : 'ml-2'}`}>
                      {reply.isAdmin ? 'Support Team' : 'User'} • {formatDate(reply.createdAt)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedInquiry.status !== 'RESOLVED' && (
                <div className="p-4 border-t border-slate-100 bg-white">
                  <form onSubmit={e => handleReplySubmit(e, false)} className="space-y-3">
                    <textarea
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={e => handleReplySubmit(e, true)}
                        disabled={isReplying}
                        className="px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark as Resolved
                      </button>
                      <button
                        type="submit"
                        disabled={isReplying || !replyMessage.trim()}
                        className="px-6 py-2 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 disabled:hover:bg-[#D00113] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Ticket Selected</h3>
              <p className="text-sm text-slate-500">Select an inquiry from the inbox to view details and reply.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
