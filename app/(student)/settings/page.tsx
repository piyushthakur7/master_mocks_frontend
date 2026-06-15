"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Lock, Camera, Mail, Phone, Shield } from "lucide-react";

export default function StudentSettingsPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await userService.updateAccount(profileForm);
      if (res.success) {
        toast.success("Profile updated successfully");
        // We might want to reload auth context or just trust the new data
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwordForm.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your personal information and security preferences.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <UserIcon className="w-4 h-4" /> Personal Info
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "security" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Lock className="w-4 h-4" /> Security & Password
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center gap-6">
                <label className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-slate-400 relative group overflow-hidden cursor-pointer">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const loadingToast = toast.loading("Processing avatar...");
                      
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const img = new Image();
                        img.src = reader.result as string;
                        img.onload = async () => {
                          // Compress image to bypass 16KB JSON limit
                          const canvas = document.createElement("canvas");
                          const MAX_SIZE = 100; // Small size for avatar to stay under 16KB base64
                          let width = img.width;
                          let height = img.height;
                          
                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext("2d");
                          ctx?.drawImage(img, 0, 0, width, height);
                          
                          // Use low quality jpeg to ensure it stays tiny
                          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
                          
                          toast.loading("Uploading avatar...", { id: loadingToast });
                          
                          try {
                            const res = await userService.updateAvatar({ profile_picture: compressedBase64 });
                            if (res.success) {
                              toast.success("Avatar updated successfully", { id: loadingToast });
                              window.location.reload();
                            }
                          } catch (error: any) {
                            toast.error(error.message || "Failed to upload avatar", { id: loadingToast });
                          }
                        };
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{user?.full_name}</h3>
                  <p className="text-xs text-slate-500 font-medium capitalize">{user?.role.toLowerCase()}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113] font-medium"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113] font-medium"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in max-w-md">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Change Password</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Update your account credentials</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D00113]/20 focus:border-[#D00113]"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
