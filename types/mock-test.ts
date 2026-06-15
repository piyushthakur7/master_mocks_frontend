import { DifficultyLevel } from "@/lib/constants";
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
  category: Category | string;
  course?: Course | string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarksPerWrong: number;
  difficulty: DifficultyLevel;
  isActive: boolean;
  totalAttempts: number;
  questions?: Question[]; // Array of populated questions or IDs depending on endpoint
  rewardPool?: {
    isActive: boolean;
    tiers: RewardTier[];
  };
  createdAt: string;
  updatedAt: string;
}
