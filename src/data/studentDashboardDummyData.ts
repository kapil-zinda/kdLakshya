// Dummy data for Student Dashboard
import {
  CalendarEvent,
  StudentAttendance,
  StudentDashboardStats,
  StudentFee,
  StudentMarks,
  StudentProfile,
} from '@/app/interfaces/studentInterface';

// Dummy student profile
export const dummyStudentProfile: StudentProfile = {
  id: '1',
  name: 'Rahul Kumar',
  rollNumber: '2211136',
  class: '11',
  section: 'A',
  fatherName: 'Nanak Chand',
  motherName: 'Savitri Devi',
  dateOfBirth: '2008-01-01',
  address: 'Chandpur Khurd, Mant, Mathura',
  contactNumber: '9897470696',
  email: 'rahul.kumar@example.com',
  admissionNumber: '2316',
};

// Dummy student marks data
export const dummyStudentMarks: StudentMarks[] = [
  {
    examId: 'half-yearly',
    examName: 'Half Yearly Exam 2022-2023',
    subjects: [
      {
        id: 'hindi',
        name: 'Hindi',
        maxMarks: 90,
        obtainedMarks: 90,
      },
      {
        id: 'english',
        name: 'English',
        maxMarks: 90,
        obtainedMarks: 83,
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        maxMarks: 90,
        obtainedMarks: 72,
      },
      {
        id: 'physical-education',
        name: 'Physical Education',
        maxMarks: 90,
        obtainedMarks: 90,
      },
      {
        id: 'physics',
        name: 'Physics',
        maxMarks: 90,
        obtainedMarks: 89,
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        maxMarks: 90,
        obtainedMarks: 90,
      },
    ],
    totalMarks: 540,
    totalObtained: 514,
    percentage: 95.19,
    grade: 'A+',
    rank: 1,
  },
  {
    examId: 'quarterly',
    examName: 'Quarterly Exam 2022-2023',
    subjects: [
      {
        id: 'hindi',
        name: 'Hindi',
        maxMarks: 90,
        obtainedMarks: 85,
      },
      {
        id: 'english',
        name: 'English',
        maxMarks: 90,
        obtainedMarks: 80,
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        maxMarks: 90,
        obtainedMarks: 75,
      },
      {
        id: 'physical-education',
        name: 'Physical Education',
        maxMarks: 90,
        obtainedMarks: 88,
      },
      {
        id: 'physics',
        name: 'Physics',
        maxMarks: 90,
        obtainedMarks: 82,
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        maxMarks: 90,
        obtainedMarks: 87,
      },
    ],
    totalMarks: 540,
    totalObtained: 497,
    percentage: 92.04,
    grade: 'A',
    rank: 2,
  },
];

// Dummy student attendance data
export const dummyStudentAttendance: StudentAttendance[] = [
  {
    month: 'September',
    year: '2023',
    totalDays: 30,
    presentDays: 25,
    absentDays: 2,
    lateDays: 1,
    holidayDays: 2,
    attendancePercentage: 92.86,
    dailyStatus: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2023, 8, i + 1); // September 2023
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Weekends are holidays
      if (day === 'Sat' || day === 'Sun') {
        return {
          date: date.toISOString().split('T')[0],
          day,
          status: 'holiday' as const,
        };
      }

      // Random status for other days
      const statuses = [
        'present',
        'present',
        'present',
        'present',
        'absent',
        'late',
      ] as const;
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      return {
        date: date.toISOString().split('T')[0],
        day,
        status: randomStatus,
      };
    }),
  },
  {
    month: 'August',
    year: '2023',
    totalDays: 31,
    presentDays: 27,
    absentDays: 1,
    lateDays: 2,
    holidayDays: 1,
    attendancePercentage: 93.33,
    dailyStatus: Array.from({ length: 31 }, (_, i) => {
      const date = new Date(2023, 7, i + 1); // August 2023
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Weekends are holidays
      if (day === 'Sat' || day === 'Sun') {
        return {
          date: date.toISOString().split('T')[0],
          day,
          status: 'holiday' as const,
        };
      }

      // Random status for other days
      const statuses = [
        'present',
        'present',
        'present',
        'present',
        'absent',
        'late',
      ] as const;
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      return {
        date: date.toISOString().split('T')[0],
        day,
        status: randomStatus,
      };
    }),
  },
];

// Dummy student fee data
export const dummyStudentFee: StudentFee = {
  academicYear: '2022-2023',
  feeStructure: {
    tuitionFee: 25000,
    developmentFee: 5000,
    examFee: 2000,
    transportFee: 8000,
    libraryFee: 1000,
    otherFees: 3000,
    totalFee: 44000,
  },
  feePayments: [
    {
      id: 'payment-1',
      date: '2022-04-15',
      amount: 15000,
      paymentMode: 'Online Transfer',
      receiptNumber: 'REC-001',
      description: 'First installment',
    },
    {
      id: 'payment-2',
      date: '2022-07-20',
      amount: 15000,
      paymentMode: 'Cheque',
      receiptNumber: 'REC-002',
      description: 'Second installment',
    },
    {
      id: 'payment-3',
      date: '2022-11-10',
      amount: 10000,
      paymentMode: 'Cash',
      receiptNumber: 'REC-003',
      description: 'Third installment',
    },
  ],
  totalPaid: 40000,
  totalDue: 4000,
};

// Dummy calendar events
export const dummyCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Annual Sports Day',
    date: '2023-10-15',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Annual sports day celebration with various competitions',
    type: 'event',
  },
  {
    id: 'event-2',
    title: 'Science Exhibition',
    date: '2023-10-20',
    startTime: '10:00',
    endTime: '15:00',
    description: 'Science exhibition showcasing student projects',
    type: 'event',
  },
  {
    id: 'exam-1',
    title: 'Mathematics Test',
    date: '2023-10-10',
    startTime: '10:00',
    endTime: '12:00',
    description: 'Monthly mathematics test',
    type: 'exam',
  },
  {
    id: 'exam-2',
    title: 'Physics Practical Exam',
    date: '2023-10-12',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Physics practical examination',
    type: 'exam',
  },
  {
    id: 'holiday-1',
    title: 'Diwali Holiday',
    date: '2023-11-12',
    description: 'Diwali festival holiday',
    type: 'holiday',
  },
  {
    id: 'assignment-1',
    title: 'English Essay Submission',
    date: '2023-10-18',
    description: 'Submit English essay on environmental conservation',
    type: 'assignment',
  },
];

// Dummy dashboard statistics
export const dummyStudentDashboardStats: StudentDashboardStats = {
  currentAttendancePercentage: 92.5,
  lastExamPercentage: 95.19,
  upcomingEvents: 4,
  pendingAssignments: 2,
};
