// One flattened enrollment row as returned by GET /courses/enrollments/all.
// The backend flattens student + course into a single record so the admin
// roster and its CSV export share exactly one shape.
export interface EnrollmentRow {
  _id: string;
  student_name: string;
  email: string;
  phone_number: string;
  account_status: string;
  registered_at: string | null;
  user_id: string | null;
  course_title: string;
  course_id: string | null;
  category: string;
  access_type: string;
  price: number;
  enrollment_status: "ACTIVE" | "EXPIRED" | "REVOKED";
  enrolled_at: string;
  access_expires_at: string | null;
}
