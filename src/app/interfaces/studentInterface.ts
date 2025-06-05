// Student Dashboard Interfaces

// Student profile interface
export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  email: string;
  admissionNumber: string;
}

// Student marks interface
export interface StudentMarks {
  examId: string;
  examName: string;
  subjects: {
    id: string;
    name: string;
    maxMarks: number;
    obtainedMarks: number;
  }[];
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  grade: string;
  rank: number;
}

// Student attendance interface
export interface StudentAttendance {
  month: string;
  year: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  holidayDays: number;
  attendancePercentage: number;
  dailyStatus: {
    date: string;
    day: string;
    status: 'present' | 'absent' | 'late' | 'holiday';
  }[];
}

// Student fee interface
export interface StudentFee {
  academicYear: string;
  feeStructure: {
    tuitionFee: number;
    developmentFee: number;
    examFee: number;
    transportFee: number;
    libraryFee: number;
    otherFees: number;
    totalFee: number;
  };
  feePayments: {
    id: string;
    date: string;
    amount: number;
    paymentMode: string;
    receiptNumber: string;
    description: string;
  }[];
  totalPaid: number;
  totalDue: number;
}

// Student calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  type: 'exam' | 'holiday' | 'event' | 'assignment';
}

// Student dashboard statistics interface
export interface StudentDashboardStats {
  currentAttendancePercentage: number;
  lastExamPercentage: number;
  upcomingEvents: number;
  pendingAssignments: number;
}
