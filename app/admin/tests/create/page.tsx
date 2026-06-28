"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockTestService } from "@/services/mock-test.service";
import { categoryService } from "@/services/category.service";
import { courseService } from "@/services/course.service";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

interface QuestionTemplate {
  text: string;
  marks: number;
  explanation: string;
  options: { text: string; is_correct: boolean }[];
  correctOptionIndex: number;
}

export default function AdminCreateTestPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    category: "",
    course: "",
    difficulty: "medium",
    total_questions: 1,
    passing_marks: 1,
    negative_marking: false,
    negative_marks_per_wrong: 0,
    total_marks: 1,
    duration_minutes: 20,
    // Hack fields for standalone pricing
    is_standalone: true,
    access_type: "paid",
    price: 0,
    discount_price: 0,
  });

  const [questions, setQuestions] = useState<QuestionTemplate[]>([
    { 
      text: "", 
      marks: 1, 
      explanation: "", 
      options: [
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false }
      ], 
      correctOptionIndex: 0 
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          categoryService.getAll(),
          courseService.getAll()
        ]);
        if (catRes.success) setCategories(catRes.data.data || catRes.data);
        if (courseRes.success) setCourses(courseRes.data.data || courseRes.data);
      } catch (error) {
        toast.error("Failed to load categories/courses");
      } finally {
        setIsLoadingForm(false);
      }
    };
    fetchData();
  }, []);

  const handleAddQuestionNode = () => {
    setQuestions([...questions, { 
      text: "", 
      marks: 1, 
      explanation: "", 
      options: [
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false }
      ], 
      correctOptionIndex: 0 
    }]);
    setTestForm(prev => ({ 
      ...prev, 
      total_questions: prev.total_questions + 1,
      total_marks: prev.total_marks + 1 
    }));
  };

  const handleRemoveQuestionNode = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
    setTestForm(prev => ({ 
      ...prev, 
      total_questions: prev.total_questions - 1,
      total_marks: prev.total_marks - questions[index].marks 
    }));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionTemplate, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    
    // Auto-update total marks if marks changed
    if (field === 'marks') {
      const newTotal = updated.reduce((sum, q) => sum + Number(q.marks), 0);
      setTestForm(prev => ({ ...prev, total_marks: newTotal }));
    }
    
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = oIndex;
    updated[qIndex].options.forEach((opt, idx) => {
      opt.is_correct = (idx === oIndex);
    });
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate options have text
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].text) throw new Error(`Question ${i + 1} text is required`);
        for (let j = 0; j < questions[i].options.length; j++) {
          if (!questions[i].options[j].text) throw new Error(`Option ${String.fromCharCode(65 + j)} for Question ${i + 1} is required`);
        }
      }

      // Create test configuration
      const payload: any = {
        title: testForm.title,
        description: testForm.description,
        difficulty: testForm.difficulty,
        total_questions: questions.length,
        passing_marks: Number(testForm.passing_marks),
        negative_marking: testForm.negative_marking,
        negative_marks_per_wrong: Number(testForm.negative_marks_per_wrong),
        total_marks: testForm.total_marks,
        duration_minutes: Number(testForm.duration_minutes),
        access_type: testForm.access_type,
        price: Number(testForm.price),
        discount_price: Number(testForm.discount_price),
      };

      if (testForm.category) payload.category = testForm.category;

      let courseIdToUse = testForm.course;
      
      // The "Fake It" Hack: If no course is selected (standalone test), we create a hidden utility course
      if (!courseIdToUse) {
        if (!testForm.category && categories.length === 0) {
          throw new Error("You must create at least one Category in the system before creating standalone tests (needed for the utility course).");
        }
        
        const loadingToast = toast.loading("Generating standalone utility configuration...");
        const hiddenCoursePayload = {
          title: `[Standalone Test] ${testForm.title}`,
          description: `Utility course automatically generated for standalone test: ${testForm.title}`,
          category: testForm.category || categories[0]?._id, // Requires a category
          access_type: testForm.access_type,
          price: Number(testForm.price),
        };
        
        try {
          const courseRes = await courseService.create(hiddenCoursePayload);
          if (courseRes.success && (courseRes.data || (courseRes as any).course)) {
            courseIdToUse = courseRes.data?._id || (courseRes as any).course?._id;
          } else {
            throw new Error((courseRes as any).message || "Failed to initialize standalone utility course");
          }
        } finally {
          toast.dismiss(loadingToast);
        }
      }

      payload.course = courseIdToUse;

      const createRes = await mockTestService.create(payload);
      
      if (createRes.success && createRes.data) {
        const testId = createRes.data._id;
        
        // Prepare questions
        const questionsPayload = questions.map(q => ({
          text: q.text,
          marks: Number(q.marks),
          explanation: q.explanation,
          options: q.options
        }));

        // Bulk insert questions
        await mockTestService.addQuestionsBulk(testId!, { questions: questionsPayload });
        
        toast.success("Mock test created successfully!");
        router.push("/admin/tests");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create mock test");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingForm) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#D00113] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-24 animate-in fade-in duration-300">
      
      <Link href="/admin/tests" className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#D00113] transition-colors inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Meta Settings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">1. Exam Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Assessment Title</label>
              <input 
                type="text" 
                placeholder="e.g., SBI PO Full Length Grand Mock - 01" 
                value={testForm.title}
                onChange={e => setTestForm({...testForm, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D00113]"
                required
                minLength={3}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Description</label>
              <textarea 
                placeholder="Details about this mock test..." 
                value={testForm.description}
                onChange={e => setTestForm({...testForm, description: e.target.value})}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Course Linked</label>
              <select 
                value={testForm.course}
                onChange={e => setTestForm({...testForm, course: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
              >
                <option value="">None (General Test)</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Category</label>
              <select 
                value={testForm.category}
                onChange={e => setTestForm({...testForm, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
              >
                <option value="">None</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Test Access & Pricing Configuration */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="md:col-span-3 pb-2 border-b border-red-100">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Access & Pricing Configuration</h3>
                <p className="text-xs text-slate-500 font-medium">Set the access type and pricing for this mock test.</p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Access Type</label>
                <select 
                  value={testForm.access_type}
                  onChange={e => setTestForm({...testForm, access_type: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {testForm.access_type === 'paid' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Price (₹)</label>
                    <input 
                      type="number" 
                      value={testForm.price === 0 ? "" : testForm.price}
                      onChange={e => setTestForm({...testForm, price: e.target.value ? Number(e.target.value) : 0})}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Discount Price (₹)</label>
                    <input 
                      type="number" 
                      value={testForm.discount_price === 0 ? "" : testForm.discount_price}
                      onChange={e => setTestForm({...testForm, discount_price: e.target.value ? Number(e.target.value) : 0})}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                      min={0}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Duration (Mins)</label>
                <input 
                  type="number" 
                  value={testForm.duration_minutes}
                  onChange={e => setTestForm({...testForm, duration_minutes: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D00113]"
                  min={1} required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Passing Marks</label>
                <input 
                  type="number" 
                  value={testForm.passing_marks}
                  onChange={e => setTestForm({...testForm, passing_marks: Number(e.target.value)})}
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
                    checked={testForm.negative_marking}
                    onChange={e => setTestForm({...testForm, negative_marking: e.target.checked})}
                    className="w-4 h-4 accent-[#D00113]"
                  />
                  Enable Negative Marking
                </label>
              </div>
              {testForm.negative_marking && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Penalty per wrong answer</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={testForm.negative_marks_per_wrong}
                    onChange={e => setTestForm({...testForm, negative_marks_per_wrong: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#D00113]"
                    min={0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: QUESTIONS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">2. Question Bank</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Total Marks: {testForm.total_marks} | Total Qs: {testForm.total_questions}</p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestionNode}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          <div className="space-y-8 divide-y divide-slate-100">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className={`pt-6 ${qIndex === 0 ? "pt-0" : ""} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#D00113] uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded">
                    Question #{qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionNode(qIndex)}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Question Text</label>
                    <textarea
                      rows={2}
                      placeholder="Enter the question text here..."
                      value={q.text}
                      onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D00113]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Marks</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={e => handleQuestionChange(qIndex, 'marks', e.target.value)}
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
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className={`flex items-center gap-3 border rounded-xl p-2 px-3 transition-all ${q.correctOptionIndex === oIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <input
                          type="radio"
                          name={`correct-key-${qIndex}`}
                          checked={q.correctOptionIndex === oIndex}
                          onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-400 font-mono">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <input
                          type="text"
                          placeholder={`Option text...`}
                          value={option.text}
                          onChange={e => handleOptionTextChange(qIndex, oIndex, e.target.value)}
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
                    value={q.explanation}
                    onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#D00113]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global form actions */}
        <div className="flex items-center justify-end gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl sticky bottom-6 z-10">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#D00113] hover:bg-[#b0010f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Publish Test Matrix
          </button>
        </div>

      </form>
    </div>
  );
}