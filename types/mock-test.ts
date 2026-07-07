import { DifficultyLevel, AccessType } from "@/lib/constants";
import { Category } from "./category";
import { Course } from "./course";

export interface Option {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  text: string;
  options: Option[];
  marks: number;
  negativeMarks: number;
  difficulty: DifficultyLevel;
  explanation?: string;
}

export interface RewardTier {
  minRank: number;
  maxRank: number;
  rewardAmount: number;
}

export interface MockTest {
  _id: string;
  title: string;
  description?: string;
  access_type: AccessType;            // v2.0: "free" | "paid"
  price: number;                       // v2.0: 0 for free, > 0 for paid
  category: Category | string;
  course?: Course | string;
  total_questions: number;             // v2.0: count from API
  total_marks: number;
  duration_minutes: number;
  passing_marks: number;
  negative_marking: boolean;
  negative_marks_per_wrong: number;
  difficulty: DifficultyLevel;
  is_active: boolean;
  start_time?: string;                 // v2.0: ISO timestamp
  end_time?: string;                   // v2.0: ISO timestamp
  // Legacy camelCase aliases (still used in some UI code)
  durationMinutes?: number;
  totalMarks?: number;
  passingMarks?: number;
  negativeMarking?: boolean;
  negativeMarksPerWrong?: number;
  isActive?: boolean;
  totalAttempts?: number;
  questions?: Question[]; // Array of populated questions or IDs depending on endpoint
  rewardPool?: {
    isActive: boolean;
    tiers: RewardTier[];
  };
  createdAt: string;
  updatedAt: string;
}
