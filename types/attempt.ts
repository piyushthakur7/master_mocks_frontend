import { AttemptStatus } from "@/lib/constants";
import { MockTest, Question } from "./mock-test";
import { User } from "./user";

export interface Answer {
  question: Question | string;
  question_id?: string;
  question_text?: string;               // v2.0: included in evaluation
  selected_option_id?: string;           // v2.0: snake_case
  selected_option_text?: string;         // v2.0: included in evaluation
  is_correct?: boolean;                  // v2.0: included in evaluation
  is_marked_for_review?: boolean;        // v2.0: new field
  // Legacy camelCase aliases
  selectedOption?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
}

export interface TestAttempt {
  _id: string;
  user: User | string;
  mock_test: MockTest | string;          // v2.0: snake_case
  started_at: string;                    // v2.0: snake_case
  expires_at?: string;                   // hard deadline the server enforces (may be clamped below the test's nominal duration for scheduled windows)
  completed_at?: string;
  status: AttemptStatus;
  answers: Answer[];
  score?: number;
  percentage?: number;                   // v2.0: included in evaluation
  // Legacy camelCase aliases (still used in some UI code)
  mockTest?: MockTest | string;
  startTime?: string;
  endTime?: string;
  totalQuestions?: number;
  attemptedQuestions?: number;
  totalAttempted?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  timeSpent?: number;
  test?: MockTest | string;
  rewardEarned?: number;
  fraudFlags?: number;
  createdAt: string;
  updatedAt: string;
}
