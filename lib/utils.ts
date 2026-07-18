import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

export type TestScheduleStatus = "unscheduled" | "upcoming" | "live" | "ended";

// Prefer the server-computed schedule_status when the API provided one;
// fall back to the device clock only when it didn't.
export function getTestScheduleStatus(test: {
  start_time?: string | null;
  end_time?: string | null;
  schedule_status?: TestScheduleStatus;
}): TestScheduleStatus {
  if (test.schedule_status) return test.schedule_status;
  if (!test.start_time && !test.end_time) return "unscheduled";
  const now = new Date();
  if (test.start_time && now < new Date(test.start_time)) return "upcoming";
  if (test.end_time && now > new Date(test.end_time)) return "ended";
  return "live";
}

// "18 Jul, 09:00 AM" — compact schedule label for cards and banners.
export function formatScheduleTime(dateString: string | Date): string {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}
