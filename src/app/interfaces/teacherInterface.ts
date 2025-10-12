// Teacher Dashboard Interfaces

// Student interface for attendance and marks
export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  class?: string;
  section?: string;
}

// Attendance record interface
export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  students: {
    studentId: string;
    status: 'present' | 'absent' | 'late';
  }[];
}

// Mark sheet interface
export interface MarkSheet {
  id: string;
  examId: string;
  classId: string;
  subjectId: string;
  students: {
    studentId: string;
    marks: number;
  }[];
}

// Exam interface
export interface Exam {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  examType: string;
}

// Subject interface
export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  maxMarks: number;
}

// Class interface
export interface Class {
  id: string;
  name: string;
  section?: string;
  academicYear?: string;
  students: Student[];
}

// Result interface
export interface Result {
  id: string;
  examId: string;
  classId: string;
  students: {
    studentId: string;
    totalMarks: number;
    percentage: number;
    grade: string;
    rank: number;
    subjectWiseMarks: {
      [subjectId: string]: number;
    };
  }[];
}

// Academic task interface
export interface AcademicTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  category: string;
}

// Dashboard statistics interface
export interface TeacherDashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  pendingTasks: number;
  upcomingExams?: Exam[];
  recentAttendance?: AttendanceRecord[];
}
