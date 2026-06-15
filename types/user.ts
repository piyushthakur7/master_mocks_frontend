import { UserRole, UserStatus } from "@/lib/constants";

export interface User {
  _id: string;
  full_name: string;
  email: string;
  phone?: string;
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
