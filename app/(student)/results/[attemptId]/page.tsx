"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { attemptService } from "@/services/attempt.service";
import { mockTestService } from "@/services/mock-test.service";
import { TestAttempt } from "@/types/attempt";
import { toast } from "sonner";
import { Loader2, CheckCircle, Clock, Target, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { leaderboardService } from "@/services/leaderboard.service";
import { LeaderboardEntry } from "@/types/leaderboard";
interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default function PostExamPerformanceAnalyticsPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [testDetail, setTestDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);
  const [isLbLoading, setIsLbLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await attemptService.getById(unwrappedParams.attemptId);
        if (response.success && response.data) {
          setAttempt(response.data);
          
          // Fetch leaderboard
          const testObj: any = response.data.test || response.data.mock_test;
          const testId = testObj?._id || testObj;
          if (testId) {
             // The attempt's embedded test object often omits total_marks (and
             // the questions array), which made the score read "Out of 0".
             // Pull the full test so the denominator and marking scheme are real.
             mockTestService.getById(testId)
               .then(tRes => {
                 if (tRes.success && tRes.data) setTestDetail(tRes.data);
               })
               .catch(() => {});

             setIsLbLoading(true);
             leaderboardService.getLeaderboard(testId, { page: 1, limit: 10 })
               .then(lbRes => {
                 if (lbRes.success && lbRes.data) {
                   setLbEntries(lbRes.data.entries || []);
                 }
               })
               .finally(() => setIsLbLoading(false));
          }
        } else {
          toast.error("Failed to load attempt details");
        }
      } catch (error) {
        toast.error("Error loading attempt report");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [unwrappedParams.attemptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Report Not Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">We couldn't locate the performance analytics for this attempt.</p>
        <Link href="/dashboard" className="inline-block px-6 py-2.5 bg-[#D00113] text-white text-xs font-bold rounded-lg transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCompleted = attempt.status === "COMPLETED";
  const rewardEarned = attempt.rewardEarned || 0;
  const hasReward = rewardEarned > 0;
  
  const totalAttempted = attempt.totalAttempted || 0;
  const correctAnswers = attempt.correctAnswers || 0;
  const score = attempt.score || 0;

  // The score is marks-based (each question carries `marks`, wrong answers
  // deduct `negativeMarks`), so the ceiling is the test's total marks — not
  // the number of questions. Falling back to the question count only works
  // for 1-mark tests and understated the maximum everywhere else.
  // Prefer the separately-fetched full test (testDetail) — the attempt's
  // embedded test object frequently omits total_marks and the questions array.
  const testObj = testDetail || (attempt.test || attempt.mock_test) as any;

  // A COMPLETED attempt returns the full question set with the answer key
  // attached (GET /attempts/:id). Prefer it over the copy on the test object:
  // /hacks/:id strips options.is_correct for students, so that copy can never
  // say which option was right.
  const solutionQuestions = (attempt as any).questions;
  const questionsList =
    Array.isArray(solutionQuestions) && solutionQuestions.length > 0
      ? solutionQuestions
      : testObj?.questions;
  const totalMarks =
    testObj?.total_marks ||
    testObj?.totalMarks ||
    // Sum per-question marks when the count isn't precomputed…
    (Array.isArray(questionsList)
      ? questionsList.reduce((sum: number, q: any) => sum + (Number(q?.marks) || 1), 0)
      : 0) ||
    testObj?.total_questions ||
    attempt.totalQuestions ||
    0;

  const accuracy = totalAttempted > 0
    ? ((correctAnswers / totalAttempted) * 100).toFixed(1)
    : "0.0";

  // Make the score self-explanatory: with negative marking a student can get
  // most answers right yet score below their correct count, which reads as a
  // "wrong" calculation. Surface the wrong count and the penalty that was
  // applied so the compiled score is transparent.
  const wrongAnswers = attempt.wrongAnswers ?? Math.max(0, totalAttempted - correctAnswers);
  const hasNegativeMarking = testObj?.negative_marking ?? testObj?.negativeMarking ?? false;
  const negPerWrong = hasNegativeMarking
    ? (testObj?.negative_marks_per_wrong ?? testObj?.negativeMarksPerWrong ?? 0)
    : 0;

  // Derive the two halves of the score from what the server actually awarded
  // per answer (marks_awarded is signed: +marks when right, -penalty when
  // wrong). Summing those is exact even when questions carry different marks;
  // the count × marks estimate below is only a fallback for older attempts
  // saved before marks_awarded existed.
  const awarded = (attempt.answers || []).map((a: any) => Number(a?.marks_awarded));
  const hasAwarded = awarded.some((n: number) => Number.isFinite(n) && n !== 0);
  const marksGained = hasAwarded
    ? awarded.filter((n: number) => Number.isFinite(n) && n > 0).reduce((s: number, n: number) => s + n, 0)
    : correctAnswers * (Number(questionsList?.[0]?.marks) || 1);
  const marksLost = hasAwarded
    ? Math.abs(awarded.filter((n: number) => Number.isFinite(n) && n < 0).reduce((s: number, n: number) => s + n, 0))
    : wrongAnswers * negPerWrong;

  const totalQuestions =
    (Array.isArray(questionsList) ? questionsList.length : 0) ||
    testObj?.total_questions ||
    attempt.totalQuestions ||
    0;
  const unattempted = Math.max(0, totalQuestions - totalAttempted);

  // ─── Solution review model ───
  // The attempt only stores what the student picked (selected_option_id /
  // selected_option_text) — it carries no option list and no correct option.
  // The full test (testDetail) is what supplies every option, so drive the
  // review off the question list and attach each saved answer to it. That also
  // surfaces questions the student never touched, which the answers array omits.
  const answersByQuestion = new Map<string, any>();
  (attempt.answers || []).forEach((a: any) => {
    const qid = String(a.question_id || a.question?._id || a.question || "");
    if (qid) answersByQuestion.set(qid, a);
  });

  const hasPopulatedQuestions =
    Array.isArray(questionsList) &&
    questionsList.length > 0 &&
    typeof questionsList[0] === "object";

  const reviewItems: { question: any; answer: any }[] = hasPopulatedQuestions
    ? questionsList.map((q: any) => ({ question: q, answer: answersByQuestion.get(String(q._id)) }))
    : (attempt.answers || []).map((a: any) => ({
        question: typeof a.question === "object" ? a.question : null,
        answer: a,
      }));

  const optionIdOf = (v: any) => (v && typeof v === "object" ? String(v._id ?? "") : v ? String(v) : "");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Success Payout Status Header */}
      {isCompleted && (
        <div className={`p-6 sm:p-8 rounded-2xl text-white border shadow-lg relative overflow-hidden ${hasReward ? 'bg-gradient-to-r from-emerald-900 to-slate-950 border-emerald-800' : 'bg-gradient-to-r from-slate-800 to-slate-950 border-slate-700'}`}>
          <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-[linear-gradient(to_right,transparent,#ffffff05)] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full inline-block ${hasReward ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-500/20 border-slate-500/30 text-slate-300'}`}>
              {hasReward ? '✓ Performance Verified Ledger Checked' : '✓ Evaluation Completed'}
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              {hasReward ? 'Congratulations! Payout Triggered Successfully' : 'Assessment Result Processed'}
            </h1>
            <p className="text-xs text-slate-300 font-medium max-w-xl">
              {hasReward 
                ? `Your performance tracking module cleared the target threshold. A compensation credit value of ${formatCurrency(rewardEarned)} has been dispatched to your dashboard student wallet.`
                : 'Your mock test submission has been processed. Review your performance metrics below to identify areas of improvement.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── SCORES DATA METRIC SECTION ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Target className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Your Compiled Score</p>
          <p className="text-3xl font-black text-[#D00113] relative z-10">{score.toFixed(2)}</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Out of {totalMarks}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><CheckCircle className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Accuracy Rating</p>
          <p className="text-3xl font-black text-slate-900 relative z-10">{accuracy}%</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">{correctAnswers} correct / {totalAttempted} attempted</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Clock className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Time Invested</p>
          <p className="text-3xl font-black text-slate-900 relative z-10">
            {attempt.timeSpent ? `${Math.floor(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s` : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Duration of assessment</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-1 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform"><Trophy className="w-24 h-24" /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">Reward Earned</p>
          <p className={`text-3xl font-black relative z-10 ${hasReward ? 'text-emerald-600' : 'text-slate-900'}`}>{formatCurrency(rewardEarned)}</p>
          <p className="text-xs text-slate-400 font-medium relative z-10">Added to wallet</p>
        </div>
      </div>

      {/* ─── HOW THE SCORE WAS CALCULATED ─── */}
      {/* With negative marking a student can answer most questions correctly
          and still score below their correct count, which reads as a broken
          calculation. Show the arithmetic line by line so the total is
          obviously right. */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 tracking-tight">How Your Score Was Calculated</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {hasNegativeMarking
              ? `Each correct answer adds its marks. Each wrong answer costs ${negPerWrong} mark${negPerWrong === 1 ? '' : 's'}. Skipped questions cost nothing.`
              : 'Each correct answer adds its marks. There is no penalty for a wrong or skipped answer.'}
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-700">Correct answers</span>
              <span className="text-xs font-medium text-slate-400">{correctAnswers} question{correctAnswers === 1 ? '' : 's'}</span>
            </div>
            <span className="font-black text-emerald-600 shrink-0">+{marksGained.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="font-bold text-slate-700">Wrong answers</span>
              <span className="text-xs font-medium text-slate-400">
                {wrongAnswers} question{wrongAnswers === 1 ? '' : 's'}
                {hasNegativeMarking ? ` × ${negPerWrong}` : ' — no penalty on this test'}
              </span>
            </div>
            <span className={`font-black shrink-0 ${marksLost > 0 ? 'text-red-600' : 'text-slate-400'}`}>
              {marksLost > 0 ? `−${marksLost.toFixed(2)}` : '0.00'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
              <span className="font-bold text-slate-700">Not attempted</span>
              <span className="text-xs font-medium text-slate-400">{unattempted} question{unattempted === 1 ? '' : 's'} — never penalised</span>
            </div>
            <span className="font-black text-slate-400 shrink-0">0.00</span>
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-5 bg-slate-50">
            <span className="font-black text-slate-900 uppercase text-xs tracking-wider">Final score</span>
            <span className="font-black text-lg text-[#D00113] shrink-0">
              {score.toFixed(2)} <span className="text-slate-400 font-bold text-sm">/ {totalMarks}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── REVIEW SECTION ─── */}
      {reviewItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Question Analysis</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Every option with the correct answer and your response.</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Correct</span>
              <span className="flex items-center gap-1.5 text-red-600"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Your Answer</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {reviewItems.map(({ question, answer }, idx) => {
              const questionText =
                question?.text || question?.questionText || answer?.question_text || "Question text not available";
              const options: any[] = Array.isArray(question?.options) ? question.options : [];

              const selectedId = optionIdOf(answer?.selected_option_id ?? answer?.selectedOption);
              const isAttempted = Boolean(selectedId || answer?.selected_option_text);
              const isCorrect = Boolean(answer?.is_correct ?? answer?.isCorrect);

              // The correct option can come from four places, in order of
              // reliability: correct_option_id on the question, an option
              // flagged is_correct, correct_option_id denormalised onto the
              // answer, or — when the student got it right — their own pick.
              const flagged = options.find((o) => o.is_correct === true || o.isCorrect === true);
              const correctId =
                optionIdOf(question?.correct_option_id) ||
                optionIdOf(flagged?._id) ||
                optionIdOf(answer?.correct_option_id ?? answer?.correctOption) ||
                (isCorrect ? selectedId : "");
              const correctText =
                question?.correct_option_text ||
                flagged?.text ||
                answer?.correct_option_text ||
                (isCorrect ? answer?.selected_option_text : "");
              const correctKnown = Boolean(correctId || correctText);
              const explanation = question?.explanation || answer?.explanation;

              return (
                <div key={question?._id || idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 font-bold rounded-lg text-sm">
                        {idx + 1}
                      </span>
                      {!isAttempted ? (
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">–</div>
                      ) : isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">X</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          !isAttempted ? 'bg-slate-100 text-slate-500' : isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {!isAttempted ? 'Unattempted' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Marks: +{question?.marks ?? 1}{hasNegativeMarking ? ` / -${question?.negativeMarks ?? negPerWrong}` : ''}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-slate-800" dangerouslySetInnerHTML={{ __html: questionText }} />

                      {options.length > 0 ? (
                        <div className="space-y-2">
                          {options.map((option, oIdx) => {
                            const oid = optionIdOf(option?._id);
                            // Fall back to a text match when only the correct
                            // option's text came back without its id.
                            const isTheCorrectOne = correctId
                              ? oid === correctId
                              : Boolean(correctText) && option?.text === correctText;
                            const isTheSelectedOne = selectedId ? oid === selectedId : false;

                            const tone = isTheCorrectOne
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : isTheSelectedOne
                                ? 'border-red-300 bg-red-50 text-red-900'
                                : 'border-slate-200 bg-white text-slate-600';

                            return (
                              <div key={oid || oIdx} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs font-semibold ${tone}`}>
                                <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[11px] font-black border ${
                                  isTheCorrectOne
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : isTheSelectedOne
                                      ? 'bg-red-500 text-white border-red-500'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="flex-1 min-w-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: option?.text ?? "" }} />
                                <span className="shrink-0 flex flex-wrap justify-end gap-1.5">
                                  {isTheSelectedOne && (
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      isTheCorrectOne ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                      Your Answer
                                    </span>
                                  )}
                                  {isTheCorrectOne && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                      Correct Answer
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // No option list available (the full test failed to load,
                        // or the attempt was rendered from answers alone).
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className={`p-3 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                            <span className="font-bold block mb-1">Your Answer:</span>
                            <span dangerouslySetInnerHTML={{ __html: answer?.selected_option_text || (answer?.selectedOption as any)?.text || "Not attempted" }} />
                          </div>
                          {correctKnown && (
                            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                              <span className="font-bold block mb-1">Correct Answer:</span>
                              <span dangerouslySetInnerHTML={{ __html: correctText || "" }} />
                            </div>
                          )}
                        </div>
                      )}

                      {!correctKnown && (
                        <p className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          The correct answer for this question is not available yet.
                        </p>
                      )}

                      {explanation && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Solution</span>
                          <div className="text-xs font-medium text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── LEADERBOARD SECTION ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Global Leaderboard</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Top performers on this assessment.</p>
          </div>
          {isLbLoading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-4 px-6 font-bold w-16 text-center">Rank</th>
                <th className="py-4 px-6 font-bold">Aspirant</th>
                <th className="py-4 px-6 font-bold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {lbEntries.length > 0 ? lbEntries.map((entry, idx) => (
                <tr key={entry?.user?._id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 text-center">
                    {entry.rank === 1 ? <Trophy className="w-4 h-4 text-amber-500 mx-auto" /> : <span className="font-black text-slate-400">#{entry.rank}</span>}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {entry.user?.full_name || "Anonymous"}
                  </td>
                  <td className="py-4 px-6 font-black text-[#D00113] text-right">
                    {(entry.best_score ?? 0).toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">Leaderboard data not available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom return navigation actions track button link layout */}
      <div className="text-center pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/dashboard" className="inline-block px-6 py-3 bg-[#1A1A1A] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all">
          ← Return To Dashboard
        </Link>
        <Link href={`/leaderboard/${(attempt.test || attempt.mock_test as any)?._id || attempt.test || attempt.mock_test}`} className="inline-block px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all">
          View Full Leaderboard
        </Link>
      </div>

    </div>
  );
}