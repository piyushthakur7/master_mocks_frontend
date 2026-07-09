"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function StudentRegisterPage() {
  const router = useRouter();
  const { login: setAuthUser, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthLoading, isAuthenticated, user, router]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "STUDENT"
      });
      
      if (response.success && response.data) {
        setAuthUser(response.data.accessToken, response.data.user);
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Free Account</h1>
        <p className="text-base text-slate-500 mt-1">Get access to live rankings, performance insights, and free mock downloads.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-slate-400">Full Name</Label>
          <Input 
            id="name"
            placeholder="Enter full name" 
            className="w-full text-base px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="name@example.com" 
            className="w-full text-base px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-slate-400">Phone Number (Optional)</Label>
          <Input 
            id="phone"
            type="tel" 
            placeholder="Enter 10-digit mobile number" 
            className="w-full text-base px-4 py-6 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-slate-400">Password</Label>
          <div className="relative">
            <Input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="Create secure password" 
              className="w-full text-base px-4 py-6 pr-12 rounded-lg border-slate-200 bg-slate-50/50 font-medium text-slate-800" 
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

        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2.5">
            <Checkbox 
              id="terms" 
              checked={form.watch("terms") === true}
              onCheckedChange={(checked) => form.setValue("terms", checked === true ? true : (undefined as any), { shouldValidate: true })}
              className="mt-1 border-slate-300 data-[state=checked]:bg-[#D00113] data-[state=checked]:border-[#D00113]" 
            />
            <Label htmlFor="terms" className="text-sm text-slate-500 font-medium leading-normal cursor-pointer">
              I agree to the Master Mocks terms of service and performance wallet allocation rules policies.
            </Label>
          </div>
          {form.formState.errors.terms && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.terms.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-6 bg-[#D00113] hover:bg-[#b0010f] text-white font-bold text-base rounded-lg shadow-md transition-all mt-4"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
          ) : (
            "Register & Access Portal"
          )}
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-slate-100 text-sm text-slate-500 font-medium">
        Already registered?{" "}
        <Link href="/login" className="text-[#D00113] font-bold hover:underline">
          Sign In Instead
        </Link>
      </div>

      <div className="text-center pt-2 text-sm text-slate-500 font-medium">
        Administrator?{" "}
        <Link href="/admin/login" className="text-slate-900 font-bold hover:underline">
          Access Admin Portal
        </Link>
      </div>
    </div>
  );
}