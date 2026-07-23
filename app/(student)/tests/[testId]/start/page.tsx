"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { mockTestService } from "@/services/mock-test.service";
import { attemptService } from "@/services/attempt.service";
import { MockTest } from "@/types/mock-test";
import { TestAttempt } from "@/types/attempt";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function InteractiveTestEnginePage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [test, setTest] = useState<MockTest | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The timer's auto-submit must fire at most once. Without this, a failed
  // auto-submit set isSubmitting back to false, which re-ran the timer effect
  // with timeLeft still <= 0 and submitted again — an endless retry loop
  // hammering the API with no way for the student to stop it.
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    const initializeTest = async () => {
      try {
        // Fetch test details to get questions
        const testRes = await mockTestService.getById(unwrappedParams.testId);
        if (!testRes.success || !testRes.data) {
          toast.error("Test not found");
          router.push("/tests");
          return;
        }
        
        setTest(testRes.data);

        // Start attempt
        const attemptRes = await attemptService.start(unwrappedParams.testId);
        if (attemptRes.success && attemptRes.data) {
          setAttempt(attemptRes.data);

          // Pre-fill any existing answers if the attempt was already started and resumed
          if (attemptRes.data.answers) {
            const answersMap: Record<string, string> = {};
            attemptRes.data.answers.forEach((ans: any) => {
              answersMap[(ans.question_id || ans.question).toString()] = (ans.selected_option_id || ans.selectedOption).toString();
            });
            setSelectedAnswers(answersMap);
          }

          // The server clamps a scheduled test's real deadline (expires_at)
          // below the test's nominal duration_minutes once the window is
          // closing, and that clamped value — not the nominal duration — is
          // what it actually enforces on every answer save. Always derive
          // the countdown from expires_at so a student who starts late in
          // the window isn't shown time the server has already cut off.
          const expiresAt = attemptRes.data.expires_at;
          if (expiresAt) {
            const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
          } else {
            const duration = testRes.data.duration_minutes || testRes.data.durationMinutes || 60;
            setTimeLeft(duration * 60);
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to start test");
        router.push("/tests");
      } finally {
        setIsLoading(false);
      }
    };

    initializeTest();
  }, [unwrappedParams.testId, router]);

  // Live timer simulation effect
  useEffect(() => {
    if (isLoading || isSubmitting || !test) return;
    
    if (timeLeft <= 0) {
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        handleFinalSubmit();
      }
      return;
    }
    
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isLoading, isSubmitting, test]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = async (questionId: string, optionId: string) => {
    if (!attempt || isSubmitting) return;

    // Optimistic UI update
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });

    try {
      // Sync with server
      await attemptService.answer(attempt._id, { question_id: questionId, selected_option_id: optionId });
    } catch (error) {
      toast.error("Failed to save answer. Please check your connection.");
    }
  };

  const handleClearResponse = async (questionId: string) => {
    if (!attempt || isSubmitting) return;
    // Nothing selected — nothing to clear.
    if (selectedAnswers[questionId] === undefined) return;

    // Optimistically drop the selection from local state.
    const next = { ...selectedAnswers };
    delete next[questionId];
    setSelectedAnswers(next);

    try {
      // Clear it on the server too, otherwise the stale choice is still
      // stored and gets counted when the attempt is evaluated.
      await attemptService.clearAnswer(attempt._id, questionId);
    } catch (error: any) {
      // Surface the real backend reason instead of a generic "connection"
      // message — helps distinguish a rejected clear payload from an actual
      // network fault. Local state stays cleared regardless.
      toast.error(error?.message || "Couldn't clear the saved answer on the server.");
    }
  };

  const handleFinalSubmit = async () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // A 400 here means the attempt was already submitted/evaluated (e.g. the
      // answer-sync race, or a retry after a flaky network) — that is a success
      // from the student's point of view, so swallow it and move on. The
      // rejection shape from api-client is { message, status }, NOT statusCode:
      // reading the wrong field made every 400 rethrow and stranded students on
      // the exam screen with "Failed to submit" after a successful submit.
      try {
        await attemptService.submit(attempt._id);
      } catch (e: any) {
        if (e?.status !== 400) throw e;
      }
      try {
        await attemptService.evaluate(attempt._id);
      } catch (e: any) {
        if (e?.status !== 400) throw e;
      }
      // The attempt list and dashboard stats just changed — mark their cached
      // queries stale so the next visit refetches instead of serving the
      // 15-minute-fresh cache without this submission.
      queryClient.invalidateQueries({ queryKey: ["completed-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      toast.success("Test submitted successfully!");
      router.push(`/results/${attempt._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit test");
      setIsSubmitting(false); // Let them try again
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-[#D00113] animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Preparing Environment...</h2>
      </div>
    );
  }

  if (!test || !attempt || !test.questions || test.questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center z-50">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Error loading test</h2>
        <Link href="/tests" className="px-6 py-2.5 bg-[#D00113] text-white rounded-xl text-sm font-bold">Return to Dashboard</Link>
      </div>
    );
  }

  const currentQObj = test.questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col z-50 animate-in fade-in duration-200 select-none">
      
      {/* ─── SYSTEM HEADER ─── */}
      <header className="h-14 bg-[#1A1A1A] text-white px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black tracking-wider bg-[#D00113] px-2.5 py-1 rounded">LIVE EXAM</span>
          <span className="text-xs font-bold text-slate-300">{test.title} // Section: {typeof test.course === 'object' && test.course?.title ? test.course.title : "General"}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Remaining Clock</span>
            <span className={`text-base font-black font-mono ${timeLeft < 120 ? "text-[#D00113] animate-pulse" : "text-emerald-400"}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* ─── MAIN COCKPIT INTERFACE ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE: Question & Submission Panel */}
        <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto p-8 lg:p-12 relative">
          
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#D00113] animate-spin mb-4" />
              <h2 className="text-lg font-bold text-slate-800">Submitting Assessment...</h2>
              <p className="text-sm text-slate-500">Please do not close this window.</p>
            </div>
          )}

          <div className="max-w-3xl w-full mx-auto space-y-8">
            
            {/* Question Identity Indicator */}
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider">Question Reference {currentQuestion + 1} of {test.questions.length}</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Marks: +{currentQObj.marks || 1} / -{currentQObj.negativeMarks || 0}</span>
            </div>

            {/* Prompt String Description */}
            <div className="text-slate-800 font-semibold text-base leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentQObj.text || "" }} />

            {/* Multiple Choice Radio List */}
            <div className="space-y-3 pt-2">
              {(currentQObj.options || []).map((option, idx) => {
                const isSelected = selectedAnswers[currentQObj._id!] === option._id;
                return (
                  <button
                    key={option._id}
                    onClick={() => handleOptionSelect(currentQObj._id!, option._id!)}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-between group ${
                      isSelected
                        ? "border-[#D00113] bg-red-50/40 text-[#D00113]"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs border shrink-0 ${
                        isSelected ? "bg-[#D00113] text-white border-[#D00113]" : "bg-slate-100 border-slate-200 text-slate-500 font-bold"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: option.text }} />
                    </div>
                    <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#D00113]" : "border-slate-300"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#D00113]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigational Trigger Bottom Foot Row */}
          <div className="max-w-3xl w-full mx-auto border-t border-slate-100 pt-6 mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              ← Previous MCQ
            </button>

            <button
              onClick={() => handleClearResponse(currentQObj._id!)}
              disabled={selectedAnswers[currentQObj._id!] === undefined}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Clear Response
            </button>

            {currentQuestion < (test.questions?.length || 1) - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => Math.min((test.questions?.length || 1) - 1, prev + 1))}
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Save & Next →
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/10 transition-all text-center flex items-center gap-2"
              >
                Submit Exam Script ✓
              </button>
            )}
          </div>
        </div>

        {/* RIGHT WORKSPACE: Index Matrix Navigation Sidebar */}
        <aside className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Question Grid Navigation</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Click any node block index to move focus coordinates directly.</p>
            </div>

            {/* Grid Mapping Core Output */}
            <div className="grid grid-cols-4 gap-2.5 max-h-[60vh] overflow-y-auto pb-4 pr-1">
              {test.questions.map((q, idx) => {
                const isCurrent = currentQuestion === idx;
                const isAnswered = selectedAnswers[q._id!] !== undefined;
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`h-11 rounded-lg text-xs font-black border transition-all flex items-center justify-center ${
                      isCurrent
                        ? "border-[#D00113] bg-[#D00113] text-white shadow-md shadow-red-600/10"
                        : isAnswered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {(idx + 1).toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Guide Footer */}
          <div className="border-t border-slate-200/80 pt-4 space-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#D00113] rounded" /> Active Selection Focus</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded" /> Answered Metric Saved</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-slate-200 rounded" /> Unvisited Question Node</div>
          </div>
        </aside>

      </div>
    </div>
  );
}