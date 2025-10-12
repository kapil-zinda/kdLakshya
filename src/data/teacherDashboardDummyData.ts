// Dummy data for Teacher Dashboard

import {
  AcademicTask,
  Student,
  Subject,
  TeacherDashboardStats,
} from '@/app/interfaces/teacherInterface';

// Dummy students data
export const dummyStudents: Student[] = [
  { id: '1', name: 'John Doe', rollNumber: '101' },
  { id: '2', name: 'Jane Smith', rollNumber: '102' },
  { id: '3', name: 'Michael Johnson', rollNumber: '103' },
  { id: '4', name: 'Emily Brown', rollNumber: '104' },
  { id: '5', name: 'David Wilson', rollNumber: '105' },
  { id: '6', name: 'Sarah Taylor', rollNumber: '106' },
  { id: '7', name: 'James Anderson', rollNumber: '107' },
  { id: '8', name: 'Olivia Martinez', rollNumber: '108' },
  { id: '9', name: 'Robert Garcia', rollNumber: '109' },
  { id: '10', name: 'Sophia Rodriguez', rollNumber: '110' },
];

// Dummy subjects data
export const dummySubjects: Subject[] = [
  { id: 'math', name: 'Mathematics', maxMarks: 100 },
  { id: 'science', name: 'Science', maxMarks: 100 },
  { id: 'english', name: 'English', maxMarks: 100 },
  { id: 'social', name: 'Social Studies', maxMarks: 100 },
];

// Dummy class options
export const dummyClassOptions = [
  { value: 'class-1', label: 'Class 1' },
  { value: 'class-2', label: 'Class 2' },
  { value: 'class-3', label: 'Class 3' },
  { value: 'class-4', label: 'Class 4' },
  { value: 'class-5', label: 'Class 5' },
];

// Dummy exam options
export const dummyExamOptions = [
  { value: 'midterm', label: 'Mid-Term Examination' },
  { value: 'final', label: 'Final Examination' },
  { value: 'unit-test-1', label: 'Unit Test 1' },
  { value: 'unit-test-2', label: 'Unit Test 2' },
  { value: 'practical', label: 'Practical Examination' },
];

// Dummy attendance data
export const dummyAttendanceData = dummyStudents.map((student) => ({
  ...student,
  status: '' as 'present' | 'absent' | 'late' | '',
}));

// Dummy mark sheet data
export const dummyMarkSheetData = dummyStudents.map((student) => ({
  ...student,
  marks: {
    math: null,
    science: null,
    english: null,
    social: null,
  },
}));

// Dummy results data
export const dummyResultsData = [
  {
    id: '1',
    name: 'John Doe',
    rollNumber: '101',
    totalMarks: 342,
    percentage: 85.5,
    grade: 'A',
    rank: 2,
    subjectWiseMarks: { math: 88, science: 92, english: 78, social: 84 },
  },
  {
    id: '2',
    name: 'Jane Smith',
    rollNumber: '102',
    totalMarks: 356,
    percentage: 89.0,
    grade: 'A',
    rank: 1,
    subjectWiseMarks: { math: 95, science: 88, english: 82, social: 91 },
  },
  {
    id: '3',
    name: 'Michael Johnson',
    rollNumber: '103',
    totalMarks: 312,
    percentage: 78.0,
    grade: 'B',
    rank: 4,
    subjectWiseMarks: { math: 76, science: 82, english: 80, social: 74 },
  },
  {
    id: '4',
    name: 'Emily Brown',
    rollNumber: '104',
    totalMarks: 324,
    percentage: 81.0,
    grade: 'B',
    rank: 3,
    subjectWiseMarks: { math: 84, science: 78, english: 86, social: 76 },
  },
  {
    id: '5',
    name: 'David Wilson',
    rollNumber: '105',
    totalMarks: 280,
    percentage: 70.0,
    grade: 'C',
    rank: 5,
    subjectWiseMarks: { math: 68, science: 72, english: 74, social: 66 },
  },
];

// Dummy performance data
export const dummyPerformanceData = [
  {
    subjectName: 'Mathematics',
    averageMarks: 82.2,
    highestMarks: 95,
    lowestMarks: 68,
  },
  {
    subjectName: 'Science',
    averageMarks: 82.4,
    highestMarks: 92,
    lowestMarks: 72,
  },
  {
    subjectName: 'English',
    averageMarks: 80.0,
    highestMarks: 86,
    lowestMarks: 74,
  },
  {
    subjectName: 'Social Studies',
    averageMarks: 78.2,
    highestMarks: 91,
    lowestMarks: 66,
  },
];

// Dummy grade distribution data
export const dummyGradeDistribution = [
  { grade: 'A+', count: 0 },
  { grade: 'A', count: 2 },
  { grade: 'B', count: 2 },
  { grade: 'C', count: 1 },
  { grade: 'D', count: 0 },
  { grade: 'F', count: 0 },
];

// Dummy academic tasks
export const dummyAcademicTasks: AcademicTask[] = [
  {
    id: '1',
    title: 'Prepare Math Quiz',
    description: 'Create a quiz for Chapter 5 on Algebra',
    dueDate: '2023-11-15',
    status: 'completed',
    priority: 'high',
    assignedTo: 'self',
    category: 'assessment',
  },
  {
    id: '2',
    title: 'Grade Science Projects',
    description: 'Review and grade student science fair projects',
    dueDate: '2023-11-20',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'self',
    category: 'grading',
  },
  {
    id: '3',
    title: 'Parent-Teacher Meeting Preparation',
    description:
      'Prepare student progress reports for upcoming parent-teacher meetings',
    dueDate: '2023-11-25',
    status: 'pending',
    priority: 'high',
    assignedTo: 'self',
    category: 'meeting',
  },
  {
    id: '4',
    title: 'Update Lesson Plans',
    description: 'Update lesson plans for next week',
    dueDate: '2023-11-18',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'self',
    category: 'planning',
  },
  {
    id: '5',
    title: 'Prepare End-of-Term Exam',
    description: 'Create end-of-term examination papers',
    dueDate: '2023-12-01',
    status: 'pending',
    priority: 'high',
    assignedTo: 'self',
    category: 'assessment',
  },
];

// Status options for tasks
export const dummyStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Priority options for tasks
export const dummyPriorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Category options for tasks
export const dummyCategoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'grading', label: 'Grading' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'planning', label: 'Planning' },
  { value: 'homework', label: 'Homework' },
];

// Dummy dashboard statistics
export const dummyDashboardStats: TeacherDashboardStats = {
  totalStudents: 45,
  presentToday: 38,
  absentToday: 7,
  pendingTasks: 3,
};

// Dummy attendance chart data
export const dummyAttendanceChartData = [
  { name: 'Present', value: 85 },
  { name: 'Absent', value: 15 },
];

// Dummy performance chart data
export const dummyPerformanceChartData = [
  { name: 'Excellent', value: 30 },
  { name: 'Good', value: 45 },
  { name: 'Average', value: 20 },
  { name: 'Below Average', value: 5 },
];

// Chart colors
export const chartColors = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  'red',
  'pink',
];
