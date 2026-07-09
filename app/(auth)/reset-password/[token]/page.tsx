"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PageParameters {
  params: Promise<{ token: string }>;
}

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordTokenPage({ params }: PageParameters) {
  // Unwraps the parameters object dynamically using React's unwrap hook
  const unwrappedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(unwrappedParams.token, {
        password: data.password,
      });
      if (response.success) {
        setIsSuccess(true);
        toast.success("Password reset successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password. Please try again or request a new link.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-emerald-900 space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Password Updated</h2>
          <p className="text-sm font-medium leading-relaxed">
            Your credentials have been securely updated. You can now use your new password to sign in.
          </p>
          <div className="pt-4">
            <Link 
              href="/login" 
              className="inline-block py-3 px-8 bg-[#D00113] hover:bg-[#b0010f] text-white font-bold text-sm rounded-lg shadow-md transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Establish New Password</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your entry sequence. Your verified network signature is validated.</p>
      </div>

      {/* Debug string tracker showing security validation layer status */}
      <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-md font-mono text-[10px] text-slate-400 select-none">
        Secure Handshake Validation Token: {unwrappedParams.token.slice(0, 12)}...
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</Label>
          <Input 
            id="password"
            type="password" 
            placeholder="Minimum 8 characters" 
            className="w-full text-sm px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">Re-enter New Password</Label>
          <Input 
            id="confirmPassword"
            type="password" 
            placeholder="Confirm selection mismatch matches" 
            className="w-full text-sm px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-6 bg-[#D00113] hover:bg-[#b0010f] text-white font-bold text-sm rounded-lg shadow-md transition-all mt-6"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
          ) : (
            "Update Credentials & Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}