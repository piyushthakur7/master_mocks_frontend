import { UserRole, UserStatus } from "@/lib/constants";

export interface User {
  _id: string;
  full_name: string;
  email: string;
  // The backend field is phone_number (user.model.js). `phone` was never
  // populated by the API — kept only so older call sites still typecheck.
  phone_number?: string;
  phone?: string;
  profile_picture?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  walletBalance: number;
  totalMocksCompleted: number;
  fraudFlags: number;
  enrolledCourses?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}
