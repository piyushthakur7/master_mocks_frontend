"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockTestService } from "@/services/mock-test.service";
import { MockTest, Question } from "@/types/mock-test";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft, Save } from "lucide-react";

interface PageProps {
  params: Promise<{ testId: string }>;
}

export default function AdminEditTestPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const [test, setTest] = useState<MockTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For adding a single new question dynamically
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    marks: 1,
    explanation: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ],
    correctOptionIndex: 0
  });

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [unwrappedParams.testId]);

  const fetchTest = async () => {
    try {
      const response = await mockTestService.getById(unwrappedParams.testId);
      if (response.success && response.data) {
        setTest(response.data);
      } else {
        toast.error("Test not found");
        router.push("/admin/tests");
      }
    } catch (error) {
      toast.error("Failed to load mock test");
      router.push("/admin/tests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: test.title,
        description: test.description,
        durationMinutes: Number(test.durationMinutes),
        passingMarks: Number(test.passingMarks),
        negativeMarking: test.negativeMarking,
        negativeMarksPerWrong: Number(test.negativeMarksPerWrong),
        difficulty: test.difficulty,
        access_type: test.access_type,
        price: Number(test.price || 0),
      };
      await mockTestService.update(test._id!, payload);
      toast.success("Test configuration updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!test) return;
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await mockTestService.removeQuestion(test._id!, questionId);
      toast.success("Question deleted");
      fetchTest();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  const handleAddNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;
    setIsAddingQuestion(true);
    try {
      const payload = {
        text: newQuestion.text,
        marks: Number(newQuestion.marks),
        explanation: newQuestion.explanation,
        options: newQuestion.options
      };
      await mockTestService.addQuestion(test._id!, payload);
      toast.success("Question added successfully");
      
      // Reset new question form
      setNewQuestion({
        text: "", marks: 1, explanation: "", correctOptionIndex: 0,
        options: [
          { text: "", isCorrect: true }, { text: "", isCorrect: false },
          { text: "", isCorrect: false }, { text: "", isCorrect: false }
        ]
      });
      fetchTest();
    } catch (error: any) {
      toast.error(error.message || "Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleNewQuestionOptionChange = (index: number, text: string) => {
    const updated = { ...newQuestion };
    updated.options[index].text = text;
    setNewQuestion(updated);
  };

  const handleNewQuestionCorrectOptionChange = (index: number) => {
    const updated = { ...newQuestion };
    updated.correctOptionIndex = index;
    updated.options.forEach((opt, idx) => {
      opt.isCorrect = (idx === index);
    });
    setNewQuestion(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 mb-24 animate-in fade-in duration-300">
      
      <Link href="/admin/tests" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
      </Link>

      {/* SECTION 1: Meta Settings */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">1. Exam Configuration</h2>
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
            test.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
          }`}>
            {test.isActive ? "Live" : "Draft"}
          </span>
        </div>

        <form id="test-config-form" onSubmit={handleTestUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Assessment Title</label>
              <input 
                type="text" 
                value={test.title}
                onChange={e => setTest({...test, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D00113]"
                required
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Access Type</label>
                <select 
                  value={test.access_type || "free"}
                  onChange={e => setTest({...test, access_type: e.target.value as "free" | "paid"})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {test.access_type === 'paid' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Price (₹)</label>
                  <input 
                    type="number" 
                    value={test.price === 0 ? "" : test.price}
                    onChange={e => setTest({...test, price: e.target.value ? Number(e.target.value) : 0})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                    min={0}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Duration (Mins)</label>
                <input 
                  type="number" 
                  value={test.durationMinutes}
                  onChange={e => setTest({...test, durationMinutes: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                  min={1} required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Passing Marks</label>
                <input 
                  type="number" 
                  value={test.passingMarks}
                  onChange={e => setTest({...test, passingMarks: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                  min={1} required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={test.negativeMarking}
                    onChange={e => setTest({...test, negativeMarking: e.target.checked})}
                    className="w-4 h-4 accent-[#D00113]"
                  />
                  Enable Negative Marking
                </label>
              </div>
              {test.negativeMarking && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Penalty per wrong answer</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={test.negativeMarksPerWrong}
                    onChange={e => setTest({...test, negativeMarksPerWrong: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#D00113]"
                    min={0}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Existing Questions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">2. Question Bank</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Questions: {test.questions?.length || 0}</p>
          </div>
        </div>

        <div className="space-y-4">
          {test.questions?.map((q, qIndex) => (
            <div key={q._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 relative group">
              <button
                onClick={() => handleDeleteQuestion(q._id!)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm mb-3">{q.text}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={opt._id || oIndex} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                        <span className="font-bold w-5 h-5 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm shrink-0">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span>{opt.text}</span>
                        {opt.isCorrect && <span className="ml-auto text-[10px] font-black uppercase text-emerald-600 tracking-wider">Correct</span>}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="mt-2 text-xs text-slate-500 bg-slate-100 p-2 rounded-lg">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-200 px-2 py-1 rounded">
                      Marks: {q.marks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!test.questions || test.questions.length === 0) && (
            <p className="text-sm text-center text-slate-500 py-4">No questions added yet.</p>
          )}
        </div>
      </div>

      {/* SECTION 3: Add New Question */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">3. Add New Question</h2>
        </div>

        <form onSubmit={handleAddNewQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Question Text</label>
              <textarea
                rows={2}
                placeholder="Enter the question text here..."
                value={newQuestion.text}
                onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D00113]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Marks</label>
              <input
                type="number"
                value={newQuestion.marks}
                onChange={e => setNewQuestion({...newQuestion, marks: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D00113]"
                min={1} required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              Options (Select radio for correct answer)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newQuestion.options.map((option, oIndex) => (
                <div key={oIndex} className={`flex items-center gap-3 border rounded-xl p-2 px-3 transition-all ${newQuestion.correctOptionIndex === oIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <input
                    type="radio"
                    name="new-correct-key"
                    checked={newQuestion.correctOptionIndex === oIndex}
                    onChange={() => handleNewQuestionCorrectOptionChange(oIndex)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-400 font-mono">
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option text...`}
                    value={option.text}
                    onChange={e => handleNewQuestionOptionChange(oIndex, e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Explanation (Optional)</label>
            <textarea
              rows={1}
              placeholder="Explanation for the correct answer..."
              value={newQuestion.explanation}
              onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#D00113]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isAddingQuestion}
              className="px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isAddingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Question to Bank
            </button>
          </div>
        </form>
      </div>

      {/* Global save action for test configuration */}
      <div className="flex items-center justify-end gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl sticky bottom-6 z-10 mt-8">
        <button 
          type="submit" 
          form="test-config-form"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

    </div>
  );
}
