"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { mockTestService } from "@/services/mock-test.service";
import { paymentService } from "@/services/payment.service";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Clock, HelpCircle, Target, Lock, CalendarClock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatScheduleTime } from "@/lib/utils";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function StudentTestInstructionsPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // After a confirmed purchase the cached purchase/mock lists are wrong for
  // up to staleTime — mark them stale so the next visit refetches.
  const invalidatePurchaseCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["purchased-mocks"] });
    queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["payment-history"] });
    queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
  };

  const [test, setTest] = useState<MockTest | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [isAttemptExhausted, setIsAttemptExhausted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isCheckoutOpen = useRef(false);

  // Server-clock-corrected countdown state for scheduled tests. The offset is
  // captured from check-access's server_time so a wrong device clock can't
  // show a live test as upcoming (or vice versa). Enforcement stays server-side.
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const didAutoFlipLive = useRef(false);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await mockTestService.getById(unwrappedParams.testId);
        if (response.success && response.data) {
          setTest(response.data);

          // Check access
          const accessResponse = await mockTestService.checkAccess(unwrappedParams.testId);
          if (accessResponse.success && accessResponse.data) {
            setHasAccess(accessResponse.data.has_access);
            setAccessReason(accessResponse.data.reason || "");
            setIsAttemptExhausted(accessResponse.data.attempt_exhausted || false);
            setHasPurchased(accessResponse.data.has_purchased || false);
            if (accessResponse.data.server_time) {
              setClockOffsetMs(new Date(accessResponse.data.server_time).getTime() - Date.now());
            }
          }
        } else {
          toast.error("Test not found");
          router.push("/tests");
        }
      } catch (error) {
        toast.error("Failed to load test details");
        router.push("/tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestDetails();
  }, [unwrappedParams.testId, router]);

  // Tick every second while a schedule window exists, driving the countdown
  // and the automatic upcoming -> live / live -> ended transitions.
  useEffect(() => {
    if (!test?.start_time && !test?.end_time) return;
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [test?.start_time, test?.end_time]);

  const correctedNow = nowTs + clockOffsetMs;
  const scheduleStatus: "unscheduled" | "upcoming" | "live" | "ended" = (() => {
    if (!test || (!test.start_time && !test.end_time)) return "unscheduled";
    if (test.start_time && correctedNow < new Date(test.start_time).getTime()) return "upcoming";
    if (test.end_time && correctedNow > new Date(test.end_time).getTime()) return "ended";
    return "live";
  })();

  // The moment the window opens, re-ask the server for access so the Start
  // button appears without a manual refresh.
  useEffect(() => {
    if (scheduleStatus === "live" && !hasAccess && !isAttemptExhausted && !didAutoFlipLive.current) {
      didAutoFlipLive.current = true;
      recheckAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleStatus]);

  const formatCountdown = (targetIso: string) => {
    let totalSeconds = Math.max(0, Math.floor((new Date(targetIso).getTime() - correctedNow) / 1000));
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds -= days * 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleStart = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      handlePurchase();
      return;
    }
    
    if (!acceptedTerms) {
      e.preventDefault();
      toast.error("Please accept the terms to proceed");
    }
  };

  const recheckAccess = async (): Promise<boolean> => {
    try {
      const accessResponse = await mockTestService.checkAccess(unwrappedParams.testId);
      if (accessResponse.success && accessResponse.data) {
        setHasPurchased(accessResponse.data.has_purchased || false);
        if (accessResponse.data.server_time) {
          setClockOffsetMs(new Date(accessResponse.data.server_time).getTime() - Date.now());
        }
        if (accessResponse.data.has_access) {
          setHasAccess(true);
          setAccessReason(accessResponse.data.reason || "");
          setIsAttemptExhausted(accessResponse.data.attempt_exhausted || false);
          return true;
        }
      }
    } catch {}
    return false;
  };

  const handlePurchase = async () => {
    if (!test || !user) {
      toast.error("Please login to purchase");
      return;
    }

    // Duplicate click guard — prevent opening multiple Razorpay modals
    if (isCheckoutOpen.current) {
      return;
    }
    isCheckoutOpen.current = true;
    setIsProcessingPayment(true);

    try {
      // 1. Create order
      const orderRes = await paymentService.createOrder({
        item_id: test._id,
        item_type: "MockTest",
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const orderId = orderRes.data.orderId || orderRes.data.order_id;
      const key = orderRes.data.key || orderRes.data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const amount = orderRes.data.amount;
      const currency = orderRes.data.currency;

      // 2. Wait for Razorpay SDK to load
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

      // 3. Open Razorpay (Simple Flow)
      let rzp: any = null;
      
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "MasterMock",
        description: `Purchase: ${test.title}`,
        order_id: orderId,
        handler: function (response: any) {
          (async () => {
            try {
              toast.loading("Verifying payment...", { id: 'processing-toast' });
              
              // 4. Verify payment instantly using secret key
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                toast.dismiss('processing-toast');
                toast.success(verifyRes.message || "Payment verified. Redirecting...");
                setHasAccess(true);
                invalidatePurchaseCaches();
                isCheckoutOpen.current = false;
                setIsProcessingPayment(false);

                if (rzp && typeof rzp.close === 'function') {
                  try { rzp.close(); } catch (e) {}
                }

                router.push("/payment-success");
              } else {
                // A 2xx that reports success:false still means the payment did
                // not verify. Without this branch the spinner and the checkout
                // lock stayed on forever, leaving a student who had just been
                // charged with no feedback and no way to retry.
                toast.dismiss('processing-toast');
                toast.error(
                  verifyRes.message ||
                    "We could not confirm your payment. If money was debited it will be reconciled — please check Purchases before paying again."
                );
                isCheckoutOpen.current = false;
                setIsProcessingPayment(false);
              }
            } catch (err: any) {
              toast.dismiss('processing-toast');
              toast.error(err?.message || "Payment verification failed");
              isCheckoutOpen.current = false;
              setIsProcessingPayment(false);
            }
          })();
        },
        prefill: {
          name: user.full_name || "Student",
          email: user.email || "",
          contact: (user as any).phone || "9999999999",
        },
        theme: {
          color: "#D00113",
        },
        modal: {
          ondismiss: function () {
            toast.loading("Verifying payment status...", { id: 'processing-toast' });
            
            // On mobile or when modal is closed, verify actual status from our backend
            paymentService.getPaymentStatus(orderId as string)
              .then((res) => {
                if (res.data?.status === 'SUCCESS') {
                  toast.success("Payment verified! Redirecting...");
                  setHasAccess(true);
                  invalidatePurchaseCaches();
                  router.push("/payment-success");
                } else {
                  isCheckoutOpen.current = false;
                  setIsProcessingPayment(false);
                  toast.dismiss('processing-toast');
                }
              })
              .catch(() => {
                isCheckoutOpen.current = false;
                setIsProcessingPayment(false);
                toast.dismiss('processing-toast');
              });
          },
        },
      };

      rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
        isCheckoutOpen.current = false;
        setIsProcessingPayment(false);
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
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Back button track routing */}
      <Link href="/tests" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors flex items-center gap-1 w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> Return To Test Deck
      </Link>

      {/* Header Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-50 text-[#D00113] border border-red-100 rounded-md inline-block">
          Assessment: {typeof test.category === 'object' && test.category?.name ? test.category.name : "General"}
        </span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{test.title}</h1>
        <p className="text-xs text-slate-400 font-medium">
          {test.description || "Please review structural performance boundaries thoroughly prior to triggering compilation execution steps."}
        </p>
      </div>

      {/* Instructions Framework Blueprint */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {test.start_time && test.end_time && (
          <div className={`rounded-xl p-4 flex flex-col gap-1.5 mb-6 border ${
            scheduleStatus === "live"
              ? "bg-emerald-50 border-emerald-100"
              : "bg-orange-50 border-orange-100"
          }`}>
            <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              scheduleStatus === "live" ? "text-emerald-600" : "text-orange-600"
            }`}>
              <CalendarClock className="w-3.5 h-3.5" />
              {scheduleStatus === "upcoming" && "Test Coming Soon"}
              {scheduleStatus === "live" && "Live Now"}
              {scheduleStatus === "ended" && "Window Closed"}
              {scheduleStatus === "unscheduled" && "Scheduled Window"}
            </span>
            <span className="text-sm font-bold text-slate-700">
              {formatScheduleTime(test.start_time)} — {formatScheduleTime(test.end_time)}
            </span>
            {scheduleStatus === "upcoming" && (
              <span className="text-lg font-black text-orange-600 tabular-nums">
                Starts in {formatCountdown(test.start_time)}
              </span>
            )}
            {scheduleStatus === "live" && (
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                Closes in {formatCountdown(test.end_time)}
              </span>
            )}
          </div>
        )}

        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Examination Protocol Rules</h2>
        
        <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
          <div className="flex gap-3">
            <span className="text-[#D00113] font-bold">01.</span>
            <p><strong className="text-slate-900">Fixed Session Boundary:</strong> The counter tracking mechanism starts immediately upon confirmation. Once initiated, pauses cannot be performed. Closing the workspace automatically terminates compilation evaluation files.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#D00113] font-bold">02.</span>
            <p><strong className="text-slate-900">Negative Score Allocation:</strong> Standard exam marking rules apply. Each accurate choice awards points according to the question's value, while erroneous entries deduct {test.negative_marking ? `-${test.negative_marks_per_wrong}` : "0"} marks.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#D00113] font-bold">03.</span>
            <p><strong className="text-slate-900">Anti-Cheat Matrix:</strong> Tab switching, screen minimized instances, or operating auxiliary secondary peripherals tracks a penalty flag count. Accumulating flags breaks network clearance validation protocols.</p>
          </div>
        </div>

        {/* Structural Metrics Information Grid */}
        <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 text-center">
          <div>
            <div className="flex justify-center mb-1"><Clock className="w-4 h-4 text-slate-400" /></div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Timer</p>
            <p className="text-lg font-black text-slate-900">{test.duration_minutes} Mins</p>
          </div>
          <div>
            <div className="flex justify-center mb-1"><HelpCircle className="w-4 h-4 text-slate-400" /></div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Value</p>
            <p className="text-lg font-black text-slate-900">{test.total_questions || test.questions?.length || 0} MCQs</p>
          </div>
          <div>
            <div className="flex justify-center mb-1"><Target className="w-4 h-4 text-slate-400" /></div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Marks</p>
            <p className="text-lg font-black text-emerald-600">{test.total_marks}</p>
          </div>
        </div>

        {/* Dynamic Launch Triggers / Access Gate */}
        {(() => {
          if (scheduleStatus === "ended") {
            return (
              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Test Window Closed</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    The scheduled time window for this test has ended.
                  </p>
                </div>
              </div>
            );
          }

          if (scheduleStatus === "upcoming") {
            const needsPurchase = test.access_type === "paid" && !hasPurchased && !isAttemptExhausted;
            return (
              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Test Coming Soon</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {test.start_time
                      ? `This test goes live at ${formatScheduleTime(test.start_time)}. The attempt option will unlock automatically at the start time.`
                      : "This test has not started yet."}
                  </p>
                </div>
                {needsPurchase && (
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessingPayment}
                    className="px-6 py-3 bg-[#D00113] hover:bg-[#b0010f] disabled:bg-slate-400 text-white flex items-center justify-center gap-2 text-center font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full sm:w-auto"
                  >
                    {isProcessingPayment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      `Pre-book Now — ₹${test.price}`
                    )}
                  </button>
                )}
                {test.access_type === "paid" && hasPurchased && (
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    ✓ Purchased — come back at the start time
                  </p>
                )}
              </div>
            );
          }

          if (hasAccess) {
            return (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="confirm-rules" 
                    className="mt-0.5 accent-[#D00113]" 
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <label htmlFor="confirm-rules" className="text-[11px] text-slate-400 font-medium leading-tight cursor-pointer">
                    I certify that my workstation hardware configuration meets environment integrity requirements.
                  </label>
                </div>
                
                <Link 
                  href={`/tests/${test._id}/start`}
                  onClick={handleStart}
                  className={`px-6 py-3 text-white text-center font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 ${
                    acceptedTerms 
                      ? "bg-[#D00113] hover:bg-[#b0010f] shadow-red-600/10" 
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  Acknowledge & Start Test
                </Link>
              </div>
            );
          }

          if (isAttemptExhausted) {
            return (
              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Test Completed</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have already completed this paid mock test. Paid tests can only be attempted once.
                  </p>
                </div>
                <Link
                  href={`/tests`}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 text-center font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full sm:w-auto"
                >
                  Return to Tests
                </Link>
              </div>
            );
          }

          return (
            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#D00113]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Premium Access Required</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{accessReason || "You must purchase this test to unlock access."}</p>
              </div>
              <button 
                onClick={handlePurchase}
                disabled={isProcessingPayment}
                className="px-6 py-3 bg-[#D00113] hover:bg-[#b0010f] disabled:bg-slate-400 text-white flex items-center justify-center gap-2 text-center font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full sm:w-auto"
              >
                {isProcessingPayment ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  `Buy Now — ₹${test.price}`
                )}
              </button>
            </div>
          );
        })()}

      </div>

    </div>
  );
}