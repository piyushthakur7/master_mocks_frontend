"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockTestService } from "@/services/mock-test.service";
import { paymentService } from "@/services/payment.service";
import { MockTest } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Clock, HelpCircle, Target, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function StudentTestInstructionsPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [test, setTest] = useState<MockTest | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
      if (accessResponse.success && accessResponse.data?.has_access) {
        setHasAccess(true);
        setAccessReason(accessResponse.data.reason || "");
        return true;
      }
    } catch {}
    return false;
  };

  const handlePurchase = async () => {
    if (!test || !user) {
      toast.error("Please login to purchase");
      return;
    }

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

      const { order_id, amount, currency, key_id } = orderRes.data;

      // 2. Check Razorpay SDK is loaded
      if (!(window as any).Razorpay) {
        toast.error("Payment system is still loading. Please try again in a moment.");
        setIsProcessingPayment(false);
        return;
      }

      // 3. Open Razorpay
      const options = {
        key: key_id,
        amount: amount * 100, // convert rupees to paise
        currency: currency,
        name: "MasterMock",
        description: `Purchase: ${test.title}`,
        order_id: order_id,
        handler: async (response: any) => {
          try {
            // 4. Verify payment
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast.success("Payment successful! You can now start the test.");
              setHasAccess(true);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            console.error("Payment verify error:", err);
            // Verify failed but money was deducted — re-check access
            // Backend webhooks may have already processed the payment
            toast.loading("Confirming your payment...");
            await new Promise(r => setTimeout(r, 2000));
            const hasIt = await recheckAccess();
            if (hasIt) {
              toast.dismiss();
              toast.success("Payment confirmed! You can now start the test.");
            } else {
              toast.dismiss();
              toast.error(
                "Payment received but verification is pending. It will be confirmed shortly. Please refresh the page in a minute."
              );
            }
          } finally {
            setIsProcessingPayment(false);
          }
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
          ondismiss: async () => {
            // User closed modal — check if they already paid
            const hasIt = await recheckAccess();
            if (hasIt) {
              toast.success("Payment already confirmed! You can start the test.");
            }
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during checkout");
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
        {hasAccess ? (
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
        ) : (
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
        )}

      </div>

    </div>
  );
}