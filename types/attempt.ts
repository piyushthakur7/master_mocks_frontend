import { AttemptStatus } from "@/lib/constants";
import { MockTest, Question } from "./mock-test";
import { User } from "./user";

export interface Answer {
  question: Question | string;
  selectedOption: string;
  isCorrect?: boolean;
  marksAwarded?: number;
}

export interface TestAttempt {
  _id: string;
  user: User | string;
  mockTest: MockTest | string;
  startTime: string;
  endTime?: string;
  answers: Answer[];
  status: AttemptStatus;
  score?: number;
  totalQuestions?: number;
  attemptedQuestions?: number;
  totalAttempted?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  timeSpent?: number;
  test?: MockTest | string;
  percentage?: number;
  rewardEarned?: number;
  fraudFlags?: number;
  createdAt: string;
  updatedAt: string;
}
