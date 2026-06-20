/**
 * Central constants file for the Master-Mocks LMS frontend.
 * All enums and constants mirror the backend API specification.
 */

// ─── API Configuration ───
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

// ─── User Roles ───
export const USER_ROLES = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── User Status ───
export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  UNVERIFIED: "unverified",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// ─── Course Access Types ───
export const ACCESS_TYPES = {
  FREE: "free",
  PAID: "paid",
} as const;
export type AccessType = (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];

// ─── Mock Test Difficulty ───
export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;
export type DifficultyLevel =
  (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

// ─── Resource Types ───
export const RESOURCE_TYPES = {
  PDF: "pdf",
  VIDEO: "video",
  NOTES: "notes",
  ASSIGNMENT: "assignment",
  SOLUTION: "solution",
} as const;
export type ResourceType =
  (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

// ─── Enrollment Status ───
export const ENROLLMENT_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const;

// ─── Test Attempt Status ───
export const ATTEMPT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;
export type AttemptStatus =
  (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS];

// ─── Payment Status ───
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── Purchase Status ───
export const PURCHASE_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
} as const;

// ─── Notification Types ───
export const NOTIFICATION_TYPES = {
  SYSTEM: "SYSTEM",
  PURCHASE: "PURCHASE",
  COURSE_UPDATE: "COURSE_UPDATE",
  TEST_RESULT: "TEST_RESULT",
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ─── Inquiry Status ───
export const INQUIRY_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type InquiryStatus =
  (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

// ─── Route Paths ───
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  // Student routes
  STUDENT_DASHBOARD: "/dashboard",
  STUDENT_COURSES: "/courses",
  STUDENT_TESTS: "/tests",
  STUDENT_RESULTS: "/results",
  STUDENT_RESOURCES: "/resources",
  STUDENT_INQUIRIES: "/inquiries",
  STUDENT_SETTINGS: "/settings",
  STUDENT_PURCHASES: "/purchases",
  STUDENT_LEADERBOARD: "/leaderboard",
  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_TESTS: "/admin/tests",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_RESOURCES: "/admin/resources",
  ADMIN_INQUIRIES: "/admin/inquiries",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

// ─── App Metadata ───
export const APP_NAME = "Master Mocks";
export const APP_TAGLINE = "Practice Smart. Score High.";
export const APP_DESCRIPTION =
  "India's 1st Performance-Based Mock Test Platform for Banking & Insurance exam preparation.";

// ─── Brand Colors (kept in sync with tailwind.config.ts) ───
export const BRAND_COLORS = {
  primary: "#D00113",
  primaryHover: "#b0010f",
  dark: "#1A1A1A",
} as const;

// ─── Limits ───
export const MAX_ATTEMPTS_PER_TEST = 3;
export const FILE_UPLOAD_MAX_SIZE_MB = 50;
