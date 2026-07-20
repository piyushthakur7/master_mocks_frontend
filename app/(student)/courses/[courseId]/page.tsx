"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { paymentService } from "@/services/payment.service";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { Loader2, ArrowLeft, BookOpen, Clock, CheckCircle2, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const isCheckoutOpen = useRef(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await courseService.getById(unwrappedParams.courseId);
        if (response.success && response.data) {
          if (response.data.description?.includes("Utility course automatically generated")) {
            toast.info("This is a standalone resource, not a course.");
            router.push("/courses");
            return;
          }
          setCourse(response.data);
        } else {
          toast.error("Course not found");
          router.push("/courses");
        }
      } catch (error) {
        toast.error("Failed to load course details");
        router.push("/courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [unwrappedParams.courseId, router]);

  const handleEnroll = async () => {
    if (!course) return;
    setIsEnrolling(true);
    try {
      const res = await courseService.enroll(course._id!);
      if (res.success) {
        toast.success("Successfully enrolled in course!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Paid courses can't go through /courses/:id/enroll - the backend rejects
  // that outright ("Paid courses require purchase to enroll"). This mirrors
  // the mock-test Razorpay flow in app/(student)/tests/[testId]/page.tsx;
  // the backend's payment service already fully supports item_type "Course"
  // (price lookup, Purchase + Enrollment creation on verify), only the
  // checkout UI was missing.
  const handlePurchase = async () => {
    if (!course || !user) {
      toast.error("Please login to purchase");
      return;
    }
    if (isCheckoutOpen.current) return;
    isCheckoutOpen.current = true;
    setIsEnrolling(true);

    try {
      const orderRes = await paymentService.createOrder({
        item_id: course._id!,
        item_type: "Course",
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const orderId = orderRes.data.orderId || orderRes.data.order_id;
      const key = orderRes.data.key || orderRes.data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const amount = orderRes.data.amount;
      const currency = orderRes.data.currency;

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          let elapsed = 0;
          const interval = setInterval(() => {
            if ((window as any).Razorpay) {
              clearInterval(interval);
              resolve();
            }
            elapsed += 200;
            if (elapsed >= 5000) {
              clearInterval(interval);
              reject(new Error("Payment system failed to load. Please refresh the page."));
            }
          }, 200);
        });
      }

      let rzp: any = null;

      const finishSuccess = async (message?: string) => {
        toast.dismiss("processing-toast");
        toast.success(message || "Payment verified! You're enrolled.");
        queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
        queryClient.invalidateQueries({ queryKey: ["payment-history"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
        await refreshUser();
        isCheckoutOpen.current = false;
        setIsEnrolling(false);
        if (rzp && typeof rzp.close === "function") {
          try { rzp.close(); } catch {}
        }
        router.push("/dashboard");
      };

      const options = {
        key,
        amount,
        currency,
        name: "MasterMock",
        description: `Purchase: ${course.title}`,
        order_id: orderId,
        handler: function (response: any) {
          (async () => {
            try {
              toast.loading("Verifying payment...", { id: "processing-toast" });
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await finishSuccess(verifyRes.message);
              } else {
                toast.dismiss("processing-toast");
                toast.error(
                  verifyRes.message ||
                    "We could not confirm your payment. If money was debited it will be reconciled — please check Purchases before paying again."
                );
                isCheckoutOpen.current = false;
                setIsEnrolling(false);
              }
            } catch (err: any) {
              toast.dismiss("processing-toast");
              toast.error(err?.message || "Payment verification failed");
              isCheckoutOpen.current = false;
              setIsEnrolling(false);
            }
          })();
        },
        prefill: {
          name: user.full_name || "Student",
          email: user.email || "",
          contact: (user as any).phone || "9999999999",
        },
        theme: { color: "#D00113" },
        modal: {
          ondismiss: function () {
            toast.loading("Verifying payment status...", { id: "processing-toast" });
            paymentService.getPaymentStatus(orderId as string)
              .then(async (res) => {
                if (res.data?.status === "SUCCESS") {
                  await finishSuccess("Payment verified! Redirecting...");
                } else {
                  isCheckoutOpen.current = false;
                  setIsEnrolling(false);
                  toast.dismiss("processing-toast");
                }
              })
              .catch(() => {
                isCheckoutOpen.current = false;
                setIsEnrolling(false);
                toast.dismiss("processing-toast");
              });
          },
        },
      };

      rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error?.description || "Payment failed");
        isCheckoutOpen.current = false;
        setIsEnrolling(false);
      });
      rzp.open();
    } catch (error: any) {
      if (error?.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error?.message?.includes("Network") || error?.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(error.message || "Something went wrong during checkout");
      }
      isCheckoutOpen.current = false;
      setIsEnrolling(false);
    }
  };

  const handleEnrollOrPurchase = course?.access_type === "free" ? handleEnroll : handlePurchase;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = user?.enrolledCourses?.includes(course._id!);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Back button */}
      <Link href="/courses" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors flex items-center gap-1 w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header & Thumbnail */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-48 md:h-64 bg-slate-100 relative">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <BookOpen className="w-16 h-16 text-slate-700" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-900 rounded-md shadow-sm">
                  {(course.category as any)?.name || "General Category"}
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">{course.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm font-medium text-slate-500 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Validity: <strong className="text-slate-800">Lifetime</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Access: <strong className="text-slate-800">Premium Tests</strong></span>
                </div>
              </div>

              <div className="prose prose-sm md:prose-base prose-slate max-w-none">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">Course Description</h3>
                <div dangerouslySetInnerHTML={{ __html: course.description || "<p>No description provided.</p>" }} />
              </div>
            </div>
          </div>

          {/* Features / Requirements */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-6">What you'll get</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-slate-600">Access to all premium mock tests in this category.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-slate-600">Detailed performance analytics and reports.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-slate-600">Earn wallet rewards for top percentile rankings.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-slate-600">Lifetime validity from enrollment.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar - Enrollment/Pricing */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm sticky top-6 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 text-center">
              {course.access_type === "free" ? (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Free Access</span>
                  <p className="text-3xl font-black text-slate-900 mt-3">₹0</p>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">Premium</span>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <p className="text-4xl font-black text-[#D00113]">
                      {formatCurrency(course.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              {isEnrolled ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Already Enrolled</h3>
                    <p className="text-xs text-slate-500 mt-1">You have active access to this course.</p>
                  </div>
                  <Link href="/dashboard" className="w-full block py-3 bg-[#1A1A1A] hover:bg-slate-800 text-white text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleEnrollOrPurchase}
                    disabled={isEnrolling}
                    className="w-full py-3.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-center text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                    {course.access_type === "free" ? "Enroll for Free" : "Purchase Course"}
                  </button>
                  <p className="text-[10px] text-center font-medium text-slate-400 px-4">
                    {course.access_type === "free" ? "No credit card required for free courses." : "Secure checkout via Razorpay."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
