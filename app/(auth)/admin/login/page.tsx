"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid admin email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: setAuthUser, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (user?.role === USER_ROLES.ADMIN) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthLoading, isAuthenticated, user, router]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.adminLogin(data);
      if (response.success && response.data) {
        setAuthUser(response.data.accessToken, response.data.user);
        toast.success("Successfully logged into Admin Portal!");
        
        const returnUrl = searchParams.get("returnUrl");
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        toast.error(response.message || "Invalid email or password.");
      }
    } catch (error: any) {
      if (error?.response?.status === 429 || error?.status === 429 || (typeof error === 'string' && error.includes('429'))) {
        toast.error("Too many login attempts. Please wait a while before trying again.");
      } else if (error.response?.status === 403) {
        toast.error("Access Denied: You do not have admin privileges or your account is locked.");
      } else {
        toast.error(error.message || "Failed to login. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Access</h1>
        <p className="text-sm text-slate-500 mt-1">Provide administrator credentials to access the management portal.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Email</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="admin@example.com" 
            className="w-full text-sm px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</Label>
            <Link href="/forgot-password" className="text-xs font-bold text-[#D00113] hover:underline tab-index-[-1]">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full text-sm px-4 py-6 pr-12 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-md transition-all mt-6"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
          ) : (
            "Sign In to Admin Portal"
          )}
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
        Not an admin?{" "}
        <Link href="/login" className="text-slate-900 font-bold hover:underline">
          Go to Student Login
        </Link>
      </div>
    </div>
  );
}
