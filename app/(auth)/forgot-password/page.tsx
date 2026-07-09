"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      if (response.success) {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recover Secure Credentials</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your recovery email to issue a secure password adjustment token path.</p>
      </div>

      {!isSubmitted ? (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="name@example.com" 
              className="w-full text-sm px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 bg-[#D00113] hover:bg-[#b0010f] text-white font-bold text-sm rounded-lg shadow-md transition-all mt-4"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              "Transmit Reset Signature"
            )}
          </Button>
        </form>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-900 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <span>✉️</span> Email Sent!
          </p>
          <p className="text-xs font-medium leading-relaxed">
            If an account exists with this email, we've sent you a password reset link. Please check your inbox (and spam folder).
          </p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
        Remembered credentials?{" "}
        <Link href="/login" className="text-[#D00113] font-bold hover:underline">
          Return to Login
        </Link>
      </div>
    </div>
  );
}