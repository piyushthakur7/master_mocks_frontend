"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Save, AlertTriangle, Settings2, Shield, Activity, CreditCard, Layout } from "lucide-react";

type TabOption = "general" | "exam" | "payment" | "danger";

export default function AdminSettingsConfigPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState({
    platformName: "Master Mocks",
    supportEmail: "support@mastermocks.com",
    minWithdrawLimit: "100",
    maxWarningsAllowed: "3",
    maintenanceMode: false,
    autoApprovePayouts: false,
  });

  const handleToggleMaintenance = () => {
    setConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  const handleTogglePayouts = () => {
    setConfig(prev => ({ ...prev, autoApprovePayouts: !prev.autoApprovePayouts }));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Global system parameters saved successfully");
      setIsSubmitting(false);
    }, 800);
  };

  const handleSystemHardReset = () => {
    if (confirm("CRITICAL WARNING: Are you sure you want to purge cached session metrics? This cannot be undone.")) {
      toast.success("System cache telemetry flushed successfully");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Route Header */}
      <div className="bg-[#141414] border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">System Configuration</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Control global operational limits, security parameters, and maintenance modes.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
          <Settings2 className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === "general" ? "bg-slate-800 text-white shadow-sm border border-slate-700" : "text-slate-400 hover:bg-[#141414] hover:text-white"}`}
          >
            <Layout className="w-4 h-4" /> General
          </button>
          <button 
            onClick={() => setActiveTab("exam")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === "exam" ? "bg-slate-800 text-white shadow-sm border border-slate-700" : "text-slate-400 hover:bg-[#141414] hover:text-white"}`}
          >
            <Activity className="w-4 h-4" /> Exam & Security
          </button>
          <button 
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === "payment" ? "bg-slate-800 text-white shadow-sm border border-slate-700" : "text-slate-400 hover:bg-[#141414] hover:text-white"}`}
          >
            <CreditCard className="w-4 h-4" /> Payments
          </button>
          <button 
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === "danger" ? "bg-red-900/20 text-red-400 shadow-sm border border-red-900/50" : "text-slate-400 hover:bg-red-900/10 hover:text-red-400"}`}
          >
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            
            {activeTab === "general" && (
              <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Platform Properties</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Public Brand Name</label>
                    <input 
                      type="text" 
                      value={config.platformName}
                      onChange={e => setConfig({...config, platformName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-medium focus:outline-none focus:border-[#D00113] transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Support Email Address</label>
                    <input 
                      type="email" 
                      value={config.supportEmail}
                      onChange={e => setConfig({...config, supportEmail: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-medium focus:outline-none focus:border-[#D00113] transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "exam" && (
              <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Exam & Security Boundaries</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Max Allowed Anti-Cheat Flags Before Auto-Ban</label>
                    <input 
                      type="number" 
                      value={config.maxWarningsAllowed}
                      onChange={e => setConfig({...config, maxWarningsAllowed: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#D00113] transition-colors"
                      min="1" required
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800 mt-2">
                    <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">Emergency Maintenance Lockout Mode</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 max-w-md">When activated, all candidate mock taking endpoints freeze and users see a maintenance banner.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleMaintenance}
                        className={`px-4 py-2 font-black uppercase tracking-wider text-[10px] rounded-xl border transition-all shrink-0 ${
                          config.maintenanceMode 
                            ? "bg-red-900/20 text-[#D00113] border-red-900" 
                            : "bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {config.maintenanceMode ? "🛑 ACTIVE LOCKOUT" : "🟢 STANDBY NORMAL"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="bg-[#141414] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Financial Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Minimum Wallet Cash-Out Trigger (INR)</label>
                    <input 
                      type="number" 
                      value={config.minWithdrawLimit}
                      onChange={e => setConfig({...config, minWithdrawLimit: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-[#D00113] transition-colors"
                      min="0" required
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800 mt-2">
                    <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">Automated Direct Ledger Payouts</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 max-w-md">Bypasses the human audit checklist step and routes winnings directly into student balance accounts.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTogglePayouts}
                        className={`px-4 py-2 font-black uppercase tracking-wider text-[10px] rounded-xl border transition-all shrink-0 ${
                          config.autoApprovePayouts 
                            ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/50" 
                            : "bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {config.autoApprovePayouts ? "⚡ AUTOMATED EXECUTE" : "👤 MANUAL REVIEW"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "danger" && (
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </form>

          {activeTab === "danger" && (
            <div className="bg-[#1A0505] border border-red-900/30 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-red-500 uppercase tracking-wider">System Purge Operations</h4>
                  <p className="text-[11px] text-red-400/80 font-medium mt-0.5 max-w-md">These operations erase cached memory fields and require maximum cluster authority level clearances. Data cannot be recovered.</p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-red-900/20">
                <button
                  type="button"
                  onClick={handleSystemHardReset}
                  className="px-5 py-2.5 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-sm"
                >
                  Clear Cached Session Logs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}