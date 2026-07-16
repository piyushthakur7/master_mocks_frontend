export interface StudentDashboard {
  totalAttempts: number;
  avgScore: string;
  recentActivity: Array<{
    _id: string;
    mock_test: string;
    score: number;
    percentage: number;
    status: string;
    completed_at: string;
    // adding missing properties that dashboard might use based on UI
    type?: string;
    title?: string;
    date?: string;
  }>;
  upcomingTests?: Array<{
    _id: string;
    title: string;
    courseName: string;
    availableFrom?: string;
    start_time?: string;
    end_time?: string;
  }>;
}

export interface AdminDashboard {
  totalStudents: number;
  totalCourses: number;
  totalTests: number;
  totalFreeTests: number;     // v2.0: NEW
  totalPaidTests: number;     // v2.0: NEW
  revenue: number;
}
