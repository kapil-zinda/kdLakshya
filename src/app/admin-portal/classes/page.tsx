'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  email: string;
  phone: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  teacherName?: string;
  credits: number;
  type: 'Core' | 'Elective';
}

interface TimetableSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  room?: string;
}

interface ExamSubject {
  subjectId: string;
  subjectName: string;
  marks: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface Exam {
  id: string;
  name: string;
  subjects: ExamSubject[];
  instructions: string;
  type: 'Unit Test' | 'Mid Term' | 'Final' | 'Assignment';
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
}

interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface ClassData {
  students: Student[];
  subjects: Subject[];
  timetable: TimetableSlot[];
  exams: Exam[];
  timeSlots: TimeSlot[];
}

interface Class {
  id: string;
  name: string;
  section: string;
  classTeacherId?: string;
  classTeacherName?: string;
  academicYear: string;
  totalStudents: number;
  room: string;
  data: ClassData;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [activeTab, setActiveTab] = useState<
    'students' | 'subjects' | 'timetable' | 'exams'
  >('students');
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Get current class data
  const currentStudents = selectedClass?.data.students || [];
  const currentSubjects = selectedClass?.data.subjects || [];
  const currentTimetable = selectedClass?.data.timetable || [];
  const currentExams = selectedClass?.data.exams || [];
  const currentTimeSlots = selectedClass?.data.timeSlots || [];
  const [loading, setLoading] = useState(true);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: '',
    section: '',
    classTeacherId: '',
    academicYear: '2024-25',
    room: '',
  });
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    teacherId: '',
    credits: 1,
    type: 'Core' as 'Core' | 'Elective',
  });
  const [examFormData, setExamFormData] = useState({
    name: '',
    subjects: [] as ExamSubject[],
    instructions: '',
    type: 'Unit Test' as 'Unit Test' | 'Mid Term' | 'Final' | 'Assignment',
    room: '',
  });
  const [tempExamSubject, setTempExamSubject] = useState({
    subjectId: '',
    marks: 50,
    duration: 60,
    date: '',
    startTime: '',
    endTime: '',
    room: '',
  });
  const [timeSlotFormData, setTimeSlotFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
  });
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    period: number;
    timeSlotId?: string;
  } | null>(null);
  const [slotFormData, setSlotFormData] = useState({
    subjectId: '',
    teacherId: '',
    room: '',
  });
  const router = useRouter();

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
      router.push('/admin-portal/login');
      return;
    }

    // Load sample data
    // Sample data for different classes
    const class10AData: ClassData = {
      students: [
        {
          id: '1',
          name: 'Aarav Sharma',
          rollNumber: '10A001',
          email: 'aarav@student.com',
          phone: '9876543215',
          status: 'Active',
        },
        {
          id: '2',
          name: 'Diya Patel',
          rollNumber: '10A002',
          email: 'diya@student.com',
          phone: '9876543216',
          status: 'Active',
        },
        {
          id: '3',
          name: 'Arjun Singh',
          rollNumber: '10A003',
          email: 'arjun@student.com',
          phone: '9876543217',
          status: 'Active',
        },
        {
          id: '4',
          name: 'Priya Gupta',
          rollNumber: '10A004',
          email: 'priya@student.com',
          phone: '9876543218',
          status: 'Active',
        },
        {
          id: '5',
          name: 'Rohit Kumar',
          rollNumber: '10A005',
          email: 'rohit@student.com',
          phone: '9876543219',
          status: 'Active',
        },
      ],
      subjects: [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH10A',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          credits: 4,
          type: 'Core',
        },
        {
          id: '2',
          name: 'English',
          code: 'ENG10A',
          teacherId: '2',
          teacherName: 'Mrs. Priya Sharma',
          credits: 3,
          type: 'Core',
        },
        {
          id: '3',
          name: 'Science',
          code: 'SCI10A',
          teacherId: '3',
          teacherName: 'Mr. Amit Patel',
          credits: 4,
          type: 'Core',
        },
        {
          id: '4',
          name: 'Hindi',
          code: 'HIN10A',
          teacherId: '4',
          teacherName: 'Ms. Kavita Singh',
          credits: 3,
          type: 'Core',
        },
        {
          id: '5',
          name: 'Social Studies',
          code: 'SS10A',
          teacherId: '5',
          teacherName: 'Mr. Suresh Gupta',
          credits: 3,
          type: 'Core',
        },
      ],
      timetable: [
        {
          id: '1',
          day: 'Monday',
          period: 1,
          startTime: '09:00',
          endTime: '09:45',
          subjectId: '1',
          subjectName: 'Mathematics',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          room: 'Room 101',
        },
        {
          id: '2',
          day: 'Monday',
          period: 2,
          startTime: '09:45',
          endTime: '10:30',
          subjectId: '2',
          subjectName: 'English',
          teacherId: '2',
          teacherName: 'Mrs. Priya Sharma',
          room: 'Room 101',
        },
        {
          id: '3',
          day: 'Tuesday',
          period: 1,
          startTime: '09:00',
          endTime: '09:45',
          subjectId: '3',
          subjectName: 'Science',
          teacherId: '3',
          teacherName: 'Mr. Amit Patel',
          room: 'Room 101',
        },
      ],
      exams: [
        {
          id: '1',
          name: 'Unit Test 1 - Class 10A',
          subjects: [
            {
              subjectId: '1',
              subjectName: 'Mathematics',
              marks: 50,
              duration: 90,
              date: '2024-02-15',
              startTime: '10:00',
              endTime: '11:30',
              room: 'Room 101',
            },
            {
              subjectId: '3',
              subjectName: 'Science',
              marks: 50,
              duration: 90,
              date: '2024-02-15',
              startTime: '12:00',
              endTime: '13:30',
              room: 'Room 101',
            },
          ],
          instructions: 'Bring calculator and geometry box.',
          type: 'Unit Test',
          status: 'Scheduled',
        },
      ],
      timeSlots: [
        {
          id: '1',
          name: 'Period 1',
          startTime: '09:00',
          endTime: '09:45',
          duration: 45,
        },
        {
          id: '2',
          name: 'Period 2',
          startTime: '09:45',
          endTime: '10:30',
          duration: 45,
        },
        {
          id: '3',
          name: 'Break',
          startTime: '10:30',
          endTime: '10:45',
          duration: 15,
        },
        {
          id: '4',
          name: 'Period 3',
          startTime: '10:45',
          endTime: '11:30',
          duration: 45,
        },
        {
          id: '5',
          name: 'Period 4',
          startTime: '11:30',
          endTime: '12:15',
          duration: 45,
        },
        {
          id: '6',
          name: 'Lunch Break',
          startTime: '12:15',
          endTime: '01:00',
          duration: 45,
        },
        {
          id: '7',
          name: 'Period 5',
          startTime: '01:00',
          endTime: '01:45',
          duration: 45,
        },
        {
          id: '8',
          name: 'Period 6',
          startTime: '01:45',
          endTime: '02:30',
          duration: 45,
        },
      ],
    };

    const class10BData: ClassData = {
      students: [
        {
          id: '1',
          name: 'Kavya Verma',
          rollNumber: '10B001',
          email: 'kavya@student.com',
          phone: '9876543220',
          status: 'Active',
        },
        {
          id: '2',
          name: 'Ishaan Joshi',
          rollNumber: '10B002',
          email: 'ishaan@student.com',
          phone: '9876543221',
          status: 'Active',
        },
        {
          id: '3',
          name: 'Ananya Roy',
          rollNumber: '10B003',
          email: 'ananya@student.com',
          phone: '9876543222',
          status: 'Active',
        },
      ],
      subjects: [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH10B',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          credits: 4,
          type: 'Core',
        },
        {
          id: '2',
          name: 'English',
          code: 'ENG10B',
          teacherId: '2',
          teacherName: 'Mrs. Priya Sharma',
          credits: 3,
          type: 'Core',
        },
        {
          id: '3',
          name: 'Physics',
          code: 'PHY10B',
          teacherId: '3',
          teacherName: 'Mr. Amit Patel',
          credits: 4,
          type: 'Core',
        },
      ],
      timetable: [
        {
          id: '1',
          day: 'Monday',
          period: 1,
          startTime: '09:00',
          endTime: '09:45',
          subjectId: '2',
          subjectName: 'English',
          teacherId: '2',
          teacherName: 'Mrs. Priya Sharma',
          room: 'Room 102',
        },
        {
          id: '2',
          day: 'Monday',
          period: 2,
          startTime: '09:45',
          endTime: '10:30',
          subjectId: '1',
          subjectName: 'Mathematics',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          room: 'Room 102',
        },
      ],
      exams: [
        {
          id: '1',
          name: 'Mid Term - Class 10B',
          subjects: [
            {
              subjectId: '1',
              subjectName: 'Mathematics',
              marks: 80,
              duration: 120,
              date: '2024-02-20',
              startTime: '09:00',
              endTime: '11:00',
              room: 'Room 102',
            },
            {
              subjectId: '3',
              subjectName: 'Physics',
              marks: 80,
              duration: 120,
              date: '2024-02-21',
              startTime: '09:00',
              endTime: '11:00',
              room: 'Room 102',
            },
          ],
          instructions: 'Scientific calculator allowed.',
          type: 'Mid Term',
          status: 'Scheduled',
        },
      ],
      timeSlots: [
        {
          id: '1',
          name: '1st Period',
          startTime: '08:30',
          endTime: '09:15',
          duration: 45,
        },
        {
          id: '2',
          name: '2nd Period',
          startTime: '09:15',
          endTime: '10:00',
          duration: 45,
        },
        {
          id: '3',
          name: 'Short Break',
          startTime: '10:00',
          endTime: '10:15',
          duration: 15,
        },
        {
          id: '4',
          name: '3rd Period',
          startTime: '10:15',
          endTime: '11:00',
          duration: 45,
        },
        {
          id: '5',
          name: '4th Period',
          startTime: '11:00',
          endTime: '11:45',
          duration: 45,
        },
        {
          id: '6',
          name: 'Lunch Time',
          startTime: '11:45',
          endTime: '12:30',
          duration: 45,
        },
        {
          id: '7',
          name: '5th Period',
          startTime: '12:30',
          endTime: '01:15',
          duration: 45,
        },
        {
          id: '8',
          name: '6th Period',
          startTime: '01:15',
          endTime: '02:00',
          duration: 45,
        },
      ],
    };

    const class9AData: ClassData = {
      students: [
        {
          id: '1',
          name: 'Ravi Sharma',
          rollNumber: '9A001',
          email: 'ravi@student.com',
          phone: '9876543223',
          status: 'Active',
        },
        {
          id: '2',
          name: 'Meera Patel',
          rollNumber: '9A002',
          email: 'meera@student.com',
          phone: '9876543224',
          status: 'Active',
        },
      ],
      subjects: [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH9A',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          credits: 4,
          type: 'Core',
        },
        {
          id: '2',
          name: 'English',
          code: 'ENG9A',
          teacherId: '2',
          teacherName: 'Mrs. Priya Sharma',
          credits: 3,
          type: 'Core',
        },
      ],
      timetable: [],
      exams: [],
      timeSlots: [
        {
          id: '1',
          name: 'Morning Session 1',
          startTime: '09:30',
          endTime: '10:15',
          duration: 45,
        },
        {
          id: '2',
          name: 'Morning Session 2',
          startTime: '10:15',
          endTime: '11:00',
          duration: 45,
        },
        {
          id: '3',
          name: 'Break Time',
          startTime: '11:00',
          endTime: '11:20',
          duration: 20,
        },
        {
          id: '4',
          name: 'Mid Morning',
          startTime: '11:20',
          endTime: '12:05',
          duration: 45,
        },
        {
          id: '5',
          name: 'Pre Lunch',
          startTime: '12:05',
          endTime: '12:50',
          duration: 45,
        },
        {
          id: '6',
          name: 'Lunch Break',
          startTime: '12:50',
          endTime: '01:40',
          duration: 50,
        },
        {
          id: '7',
          name: 'Afternoon 1',
          startTime: '01:40',
          endTime: '02:25',
          duration: 45,
        },
        {
          id: '8',
          name: 'Afternoon 2',
          startTime: '02:25',
          endTime: '03:10',
          duration: 45,
        },
      ],
    };

    const class9BData: ClassData = {
      students: [
        {
          id: '1',
          name: 'Vikram Singh',
          rollNumber: '9B001',
          email: 'vikram@student.com',
          phone: '9876543225',
          status: 'Active',
        },
      ],
      subjects: [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH9B',
          teacherId: '1',
          teacherName: 'Dr. Rajesh Kumar',
          credits: 4,
          type: 'Core',
        },
      ],
      timetable: [],
      exams: [],
      timeSlots: [
        {
          id: '1',
          name: 'Block A',
          startTime: '10:00',
          endTime: '10:50',
          duration: 50,
        },
        {
          id: '2',
          name: 'Block B',
          startTime: '10:50',
          endTime: '11:40',
          duration: 50,
        },
        {
          id: '3',
          name: 'Recess',
          startTime: '11:40',
          endTime: '12:00',
          duration: 20,
        },
        {
          id: '4',
          name: 'Block C',
          startTime: '12:00',
          endTime: '12:50',
          duration: 50,
        },
        {
          id: '5',
          name: 'Block D',
          startTime: '12:50',
          endTime: '01:40',
          duration: 50,
        },
        {
          id: '6',
          name: 'Extended Lunch',
          startTime: '01:40',
          endTime: '02:40',
          duration: 60,
        },
        {
          id: '7',
          name: 'Block E',
          startTime: '02:40',
          endTime: '03:30',
          duration: 50,
        },
      ],
    };

    const sampleClasses: Class[] = [
      {
        id: '1',
        name: 'Class 10',
        section: 'A',
        classTeacherId: '1',
        classTeacherName: 'Dr. Rajesh Kumar',
        academicYear: '2024-25',
        totalStudents: 5,
        room: 'Room 101',
        data: class10AData,
      },
      {
        id: '2',
        name: 'Class 10',
        section: 'B',
        classTeacherId: '2',
        classTeacherName: 'Mrs. Priya Sharma',
        academicYear: '2024-25',
        totalStudents: 3,
        room: 'Room 102',
        data: class10BData,
      },
      {
        id: '3',
        name: 'Class 9',
        section: 'A',
        classTeacherId: '3',
        classTeacherName: 'Mr. Amit Patel',
        academicYear: '2024-25',
        totalStudents: 2,
        room: 'Room 201',
        data: class9AData,
      },
      {
        id: '4',
        name: 'Class 9',
        section: 'B',
        academicYear: '2024-25',
        totalStudents: 1,
        room: 'Room 202',
        data: class9BData,
      },
    ];

    const sampleTeachers: Teacher[] = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        employeeId: 'EMP001',
        department: 'Mathematics',
        email: 'rajesh@school.com',
        phone: '9876543210',
      },
      {
        id: '2',
        name: 'Mrs. Priya Sharma',
        employeeId: 'EMP002',
        department: 'English',
        email: 'priya@school.com',
        phone: '9876543211',
      },
      {
        id: '3',
        name: 'Mr. Amit Patel',
        employeeId: 'EMP003',
        department: 'Science',
        email: 'amit@school.com',
        phone: '9876543212',
      },
      {
        id: '4',
        name: 'Ms. Kavita Singh',
        employeeId: 'EMP004',
        department: 'Hindi',
        email: 'kavita@school.com',
        phone: '9876543213',
      },
      {
        id: '5',
        name: 'Mr. Suresh Gupta',
        employeeId: 'EMP005',
        department: 'Social Studies',
        email: 'suresh@school.com',
        phone: '9876543214',
      },
    ];

    setClasses(sampleClasses);
    setTeachers(sampleTeachers);
    setSelectedClass(sampleClasses[0]);
    setLoading(false);
  }, [router]);

  const handleCreateClass = () => {
    if (!classFormData.name || !classFormData.section) {
      alert('Please fill in required fields');
      return;
    }

    const newClass: Class = {
      id: (classes.length + 1).toString(),
      name: classFormData.name,
      section: classFormData.section,
      classTeacherId: classFormData.classTeacherId || undefined,
      classTeacherName: classFormData.classTeacherId
        ? teachers.find((t) => t.id === classFormData.classTeacherId)?.name
        : undefined,
      academicYear: classFormData.academicYear,
      totalStudents: 0,
      room: classFormData.room,
      data: {
        students: [],
        subjects: [],
        timetable: [],
        exams: [],
        timeSlots: [
          {
            id: '1',
            name: 'Period 1',
            startTime: '09:00',
            endTime: '09:45',
            duration: 45,
          },
          {
            id: '2',
            name: 'Period 2',
            startTime: '09:45',
            endTime: '10:30',
            duration: 45,
          },
          {
            id: '3',
            name: 'Break',
            startTime: '10:30',
            endTime: '10:45',
            duration: 15,
          },
          {
            id: '4',
            name: 'Period 3',
            startTime: '10:45',
            endTime: '11:30',
            duration: 45,
          },
          {
            id: '5',
            name: 'Period 4',
            startTime: '11:30',
            endTime: '12:15',
            duration: 45,
          },
          {
            id: '6',
            name: 'Lunch Break',
            startTime: '12:15',
            endTime: '01:00',
            duration: 45,
          },
          {
            id: '7',
            name: 'Period 5',
            startTime: '01:00',
            endTime: '01:45',
            duration: 45,
          },
          {
            id: '8',
            name: 'Period 6',
            startTime: '01:45',
            endTime: '02:30',
            duration: 45,
          },
        ],
      },
    };

    setClasses((prev) => [...prev, newClass]);
    setShowCreateClassModal(false);
    setClassFormData({
      name: '',
      section: '',
      classTeacherId: '',
      academicYear: '2024-25',
      room: '',
    });
    alert('Class created successfully!');
  };

  const handleAddSubject = () => {
    if (!subjectFormData.name || !subjectFormData.code) {
      alert('Please fill in required fields');
      return;
    }

    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    const newSubject: Subject = {
      id: (currentSubjects.length + 1).toString(),
      name: subjectFormData.name,
      code: subjectFormData.code,
      teacherId: subjectFormData.teacherId || undefined,
      teacherName: subjectFormData.teacherId
        ? teachers.find((t) => t.id === subjectFormData.teacherId)?.name
        : undefined,
      credits: subjectFormData.credits,
      type: subjectFormData.type,
    };

    const updatedClass = {
      ...selectedClass,
      data: {
        ...selectedClass.data,
        subjects: [...selectedClass.data.subjects, newSubject],
      },
    };

    setClasses((prev) =>
      prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
    );
    setSelectedClass(updatedClass);
    setShowAddSubjectModal(false);
    setSubjectFormData({
      name: '',
      code: '',
      teacherId: '',
      credits: 1,
      type: 'Core',
    });
    alert('Subject added successfully!');
  };

  const handleCreateExam = () => {
    if (!examFormData.name || examFormData.subjects.length === 0) {
      alert('Please fill in required fields and add at least one subject');
      return;
    }

    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    const newExam: Exam = {
      id: (currentExams.length + 1).toString(),
      name: examFormData.name,
      subjects: examFormData.subjects,
      instructions: examFormData.instructions,
      type: examFormData.type,
      status: 'Scheduled',
    };

    const updatedClass = {
      ...selectedClass,
      data: {
        ...selectedClass.data,
        exams: [...selectedClass.data.exams, newExam],
      },
    };

    setClasses((prev) =>
      prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
    );
    setSelectedClass(updatedClass);
    setShowCreateExamModal(false);
    setExamFormData({
      name: '',
      subjects: [],
      instructions: '',
      type: 'Unit Test',
      room: '',
    });
    setTempExamSubject({
      subjectId: '',
      marks: 50,
      duration: 60,
      date: '',
      startTime: '',
      endTime: '',
      room: '',
    });
    alert('Exam created successfully!');
  };

  const handleAddExamSubject = () => {
    if (
      !tempExamSubject.subjectId ||
      !tempExamSubject.date ||
      !tempExamSubject.startTime ||
      !tempExamSubject.endTime
    ) {
      alert(
        'Please fill in all subject details including date, start time, and end time',
      );
      return;
    }

    const subject = currentSubjects.find(
      (s) => s.id === tempExamSubject.subjectId,
    );
    if (!subject) return;

    const newExamSubject: ExamSubject = {
      subjectId: tempExamSubject.subjectId,
      subjectName: subject.name,
      marks: tempExamSubject.marks,
      duration: tempExamSubject.duration,
      date: tempExamSubject.date,
      startTime: tempExamSubject.startTime,
      endTime: tempExamSubject.endTime,
      room: tempExamSubject.room,
    };

    setExamFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newExamSubject],
    }));
    setTempExamSubject({
      subjectId: '',
      marks: 50,
      duration: 60,
      date: '',
      startTime: '',
      endTime: '',
      room: '',
    });
  };

  const handleRemoveExamSubject = (index: number) => {
    setExamFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleAddTimetableSlot = () => {
    if (!selectedSlot || !slotFormData.subjectId) {
      alert('Please select a subject');
      return;
    }

    const timeSlot = currentTimeSlots.find(
      (t) => t.id === selectedSlot.timeSlotId,
    );
    if (!timeSlot) return;

    const existingSlot = currentTimetable.find(
      (slot) =>
        slot.day === selectedSlot.day && slot.period === selectedSlot.period,
    );

    const newSlot: TimetableSlot = {
      id: existingSlot
        ? existingSlot.id
        : (currentTimetable.length + 1).toString(),
      day: selectedSlot.day,
      period: selectedSlot.period,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      subjectId: slotFormData.subjectId,
      subjectName: currentSubjects.find((s) => s.id === slotFormData.subjectId)
        ?.name,
      teacherId:
        slotFormData.teacherId ||
        currentSubjects.find((s) => s.id === slotFormData.subjectId)?.teacherId,
      teacherName: slotFormData.teacherId
        ? teachers.find((t) => t.id === slotFormData.teacherId)?.name
        : currentSubjects.find((s) => s.id === slotFormData.subjectId)
            ?.teacherName,
      room: slotFormData.room || selectedClass?.room,
    };

    if (!selectedClass) return;

    const updatedTimetable = existingSlot
      ? currentTimetable.map((slot) =>
          slot.id === existingSlot.id ? newSlot : slot,
        )
      : [...currentTimetable, newSlot];

    const updatedClass = {
      ...selectedClass,
      data: {
        ...selectedClass.data,
        timetable: updatedTimetable,
      },
    };

    setClasses((prev) =>
      prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
    );
    setSelectedClass(updatedClass);

    setShowTimetableModal(false);
    setSelectedSlot(null);
    setSlotFormData({ subjectId: '', teacherId: '', room: '' });
    alert('Timetable updated successfully!');
  };

  const handleAddTimeSlot = () => {
    if (
      !timeSlotFormData.name ||
      !timeSlotFormData.startTime ||
      !timeSlotFormData.endTime
    ) {
      alert('Please fill in all time slot fields');
      return;
    }

    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    const startTime = new Date(`2024-01-01T${timeSlotFormData.startTime}`);
    const endTime = new Date(`2024-01-01T${timeSlotFormData.endTime}`);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    const newTimeSlot: TimeSlot = {
      id: (currentTimeSlots.length + 1).toString(),
      name: timeSlotFormData.name,
      startTime: timeSlotFormData.startTime,
      endTime: timeSlotFormData.endTime,
      duration: Math.round(duration),
    };

    const updatedClass = {
      ...selectedClass,
      data: {
        ...selectedClass.data,
        timeSlots: [...selectedClass.data.timeSlots, newTimeSlot],
      },
    };

    setClasses((prev) =>
      prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
    );
    setSelectedClass(updatedClass);
    setShowTimeSlotModal(false);
    setTimeSlotFormData({ name: '', startTime: '', endTime: '' });
    alert('Time slot added successfully!');
  };

  const getTimetableSlot = (day: string, period: number) => {
    return currentTimetable.find(
      (slot) => slot.day === day && slot.period === period,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin-portal/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Class Management
              </h1>
            </div>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Class
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Class List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
                <p className="text-sm text-gray-500">
                  Select a class to manage
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedClass?.id === cls.id
                        ? 'bg-indigo-50 border-r-4 border-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {cls.name} - {cls.section}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.classTeacherName || 'No Class Teacher'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls.totalStudents} Students • {cls.room}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {cls.academicYear}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedClass ? (
              <div className="space-y-6">
                {/* Class Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedClass.name} - Section {selectedClass.section}
                      </h2>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Class Teacher:{' '}
                          {selectedClass.classTeacherName || 'Not Assigned'}
                        </span>
                        <span>•</span>
                        <span>Room: {selectedClass.room}</span>
                        <span>•</span>
                        <span>Students: {selectedClass.totalStudents}</span>
                        <span>•</span>
                        <span>Academic Year: {selectedClass.academicYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'students', label: 'Students', icon: '👥' },
                        { id: 'subjects', label: 'Subjects', icon: '📚' },
                        { id: 'timetable', label: 'Timetable', icon: '⏰' },
                        { id: 'exams', label: 'Exams', icon: '📝' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                            activeTab === tab.id
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {/* Students Tab */}
                    {activeTab === 'students' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Student List
                          </h3>
                          <span className="text-sm text-gray-500">
                            {currentStudents.length} students
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Roll Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {currentStudents.map((student) => (
                                <tr key={student.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.rollNumber}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {student.email}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.phone}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        student.status === 'Active'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {student.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Subjects Tab */}
                    {activeTab === 'subjects' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Subjects & Teachers
                          </h3>
                          <button
                            onClick={() => setShowAddSubjectModal(true)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                          >
                            Add Subject
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {currentSubjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {subject.name}
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    subject.type === 'Core'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {subject.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Code: {subject.code}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Credits: {subject.credits}
                              </p>
                              <div className="border-t pt-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Teacher:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {subject.teacherName || 'Not Assigned'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timetable Tab */}
                    {activeTab === 'timetable' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Class Timetable
                          </h3>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => setShowTimeSlotModal(true)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Manage Time Slots
                            </button>
                            <p className="text-sm text-gray-500">
                              Click on a slot to assign subject
                            </p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r">
                                  Time / Day
                                </th>
                                {days.map((day) => (
                                  <th
                                    key={day}
                                    className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r"
                                  >
                                    {day}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentTimeSlots.map((timeSlot, index) => (
                                <tr key={timeSlot.id} className="border-b">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r bg-gray-50">
                                    <div>{timeSlot.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {timeSlot.startTime} - {timeSlot.endTime}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      ({timeSlot.duration} min)
                                    </div>
                                  </td>
                                  {days.map((day) => {
                                    const slot = getTimetableSlot(
                                      day,
                                      index + 1,
                                    );
                                    return (
                                      <td
                                        key={`${day}-${timeSlot.id}`}
                                        className="px-2 py-3 text-center border-r cursor-pointer hover:bg-gray-50 h-20"
                                        onClick={() => {
                                          setSelectedSlot({
                                            day,
                                            period: index + 1,
                                            timeSlotId: timeSlot.id,
                                          });
                                          setSlotFormData({
                                            subjectId: slot?.subjectId || '',
                                            teacherId: slot?.teacherId || '',
                                            room: slot?.room || '',
                                          });
                                          setShowTimetableModal(true);
                                        }}
                                      >
                                        {slot ? (
                                          <div className="text-xs">
                                            <div className="font-medium text-blue-600">
                                              {slot.subjectName}
                                            </div>
                                            <div className="text-gray-500">
                                              {slot.teacherName}
                                            </div>
                                            <div className="text-gray-400">
                                              {slot.room}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-gray-400 text-xs">
                                            <div>Click to</div>
                                            <div>assign</div>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Exams Tab */}
                    {activeTab === 'exams' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Exams & Assessments
                          </h3>
                          <button
                            onClick={() => setShowCreateExamModal(true)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                          >
                            Create Exam
                          </button>
                        </div>
                        <div className="space-y-4">
                          {currentExams.map((exam) => (
                            <div
                              key={exam.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {exam.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {exam.subjects
                                      .map((s) => s.subjectName)
                                      .join(', ')}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(exam.status)}`}
                                >
                                  {exam.status}
                                </span>
                              </div>
                              <div className="mb-4">
                                <span className="font-medium text-gray-700 text-sm">
                                  Subjects & Schedule:
                                </span>
                                <div className="mt-3 space-y-3">
                                  {exam.subjects.map((subject, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-semibold text-gray-900">
                                          {subject.subjectName}
                                        </h5>
                                        <span className="text-sm text-gray-600">
                                          {subject.marks} marks •{' '}
                                          {subject.duration} min
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-600">
                                            Date:
                                          </span>
                                          <p className="text-gray-800">
                                            {new Date(
                                              subject.date,
                                            ).toLocaleDateString('en-GB')}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">
                                            Time:
                                          </span>
                                          <p className="text-gray-800">
                                            {subject.startTime} -{' '}
                                            {subject.endTime}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">
                                            Room:
                                          </span>
                                          <p className="text-gray-800">
                                            {subject.room || 'TBA'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Total Marks:
                                  </span>
                                  <p className="text-gray-600">
                                    {exam.subjects.reduce(
                                      (sum, s) => sum + s.marks,
                                      0,
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Type:
                                  </span>
                                  <p className="text-gray-600">{exam.type}</p>
                                </div>
                              </div>
                              {exam.instructions && (
                                <div className="mt-3 pt-3 border-t">
                                  <span className="font-medium text-gray-700">
                                    Instructions:
                                  </span>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {exam.instructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Class
                </h3>
                <p className="text-gray-600">
                  Choose a class from the sidebar to manage students, subjects,
                  timetable, and exams.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Class Modal */}
        {showCreateClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Class
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={classFormData.name}
                      onChange={(e) =>
                        setClassFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Class</option>
                      <option value="Nursery">Nursery</option>
                      <option value="LKG">LKG</option>
                      <option value="UKG">UKG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={classFormData.section}
                      onChange={(e) =>
                        setClassFormData((prev) => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="A, B, C..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher
                  </label>
                  <select
                    value={classFormData.classTeacherId}
                    onChange={(e) =>
                      setClassFormData((prev) => ({
                        ...prev,
                        classTeacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={classFormData.academicYear}
                      onChange={(e) =>
                        setClassFormData((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="2024-25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      value={classFormData.room}
                      onChange={(e) =>
                        setClassFormData((prev) => ({
                          ...prev,
                          room: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Room 101"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Subject Modal */}
        {showAddSubjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Subject
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjectFormData.name}
                    onChange={(e) =>
                      setSubjectFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjectFormData.code}
                    onChange={(e) =>
                      setSubjectFormData((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="MATH10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Teacher
                  </label>
                  <select
                    value={subjectFormData.teacherId}
                    onChange={(e) =>
                      setSubjectFormData((prev) => ({
                        ...prev,
                        teacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={subjectFormData.credits}
                      onChange={(e) =>
                        setSubjectFormData((prev) => ({
                          ...prev,
                          credits: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={subjectFormData.type}
                      onChange={(e) =>
                        setSubjectFormData((prev) => ({
                          ...prev,
                          type: e.target.value as 'Core' | 'Elective',
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Core">Core</option>
                      <option value="Elective">Elective</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Exam Modal */}
        {showCreateExamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Exam
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={examFormData.name}
                    onChange={(e) =>
                      setExamFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Unit Test 1"
                  />
                </div>

                {/* Add Subjects Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Exam Subjects
                  </h4>

                  {/* Add Subject Form */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <select
                          value={tempExamSubject.subjectId}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              subjectId: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Subject</option>
                          {currentSubjects
                            .filter(
                              (sub) =>
                                !examFormData.subjects.find(
                                  (es) => es.subjectId === sub.id,
                                ),
                            )
                            .map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Room
                        </label>
                        <input
                          type="text"
                          value={tempExamSubject.room}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              room: e.target.value,
                            }))
                          }
                          placeholder="Room 101"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date (dd/mm/yyyy) *
                        </label>
                        <input
                          type="date"
                          value={tempExamSubject.date}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={tempExamSubject.startTime}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={tempExamSubject.endTime}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={tempExamSubject.marks}
                          onChange={(e) =>
                            setTempExamSubject((prev) => ({
                              ...prev,
                              marks: parseInt(e.target.value) || 50,
                            }))
                          }
                          placeholder="50"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddExamSubject}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Add Subject to Exam
                      </button>
                    </div>
                  </div>

                  {/* Subject List */}
                  {examFormData.subjects.length > 0 && (
                    <div className="space-y-3">
                      {examFormData.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {subject.subjectName}
                              </h5>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">
                                  {subject.marks} marks
                                </span>{' '}
                                •
                                <span className="ml-1">
                                  {subject.duration} minutes
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveExamSubject(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>
                              <p className="text-gray-600">
                                {new Date(subject.date).toLocaleDateString(
                                  'en-GB',
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Time:
                              </span>
                              <p className="text-gray-600">
                                {subject.startTime} - {subject.endTime}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Room:
                              </span>
                              <p className="text-gray-600">
                                {subject.room || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {examFormData.subjects.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No subjects added yet. Add at least one subject for the
                      exam.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      value={examFormData.room}
                      onChange={(e) =>
                        setExamFormData((prev) => ({
                          ...prev,
                          room: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Room 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type
                    </label>
                    <select
                      value={examFormData.type}
                      onChange={(e) =>
                        setExamFormData((prev) => ({
                          ...prev,
                          type: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Unit Test">Unit Test</option>
                      <option value="Mid Term">Mid Term</option>
                      <option value="Final">Final</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                {examFormData.subjects.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Exam Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
                      <div>
                        <span className="font-medium">Total Subjects:</span>
                        <p className="text-blue-900">
                          {examFormData.subjects.length}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total Marks:</span>
                        <p className="text-blue-900">
                          {examFormData.subjects.reduce(
                            (sum, s) => sum + s.marks,
                            0,
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total Duration:</span>
                        <p className="text-blue-900">
                          {examFormData.subjects.reduce(
                            (sum, s) => sum + s.duration,
                            0,
                          )}{' '}
                          minutes
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-blue-700">
                      <span className="font-medium">Exam Dates:</span>{' '}
                      {Array.from(
                        new Set(
                          examFormData.subjects.map((s) =>
                            new Date(s.date).toLocaleDateString('en-GB'),
                          ),
                        ),
                      ).join(', ')}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={examFormData.instructions}
                    onChange={(e) =>
                      setExamFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Exam instructions for students..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExam}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  Create Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timetable Slot Modal */}
        {showTimetableModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Subject - {selectedSlot.day} Period{' '}
                  {selectedSlot.period}
                </h3>
                <p className="text-sm text-gray-500">
                  {
                    currentTimeSlots.find(
                      (t) => t.id === selectedSlot.timeSlotId,
                    )?.startTime
                  }{' '}
                  -{' '}
                  {
                    currentTimeSlots.find(
                      (t) => t.id === selectedSlot.timeSlotId,
                    )?.endTime
                  }
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={slotFormData.subjectId}
                    onChange={(e) =>
                      setSlotFormData((prev) => ({
                        ...prev,
                        subjectId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    {currentSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    value={slotFormData.teacherId}
                    onChange={(e) =>
                      setSlotFormData((prev) => ({
                        ...prev,
                        teacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Use Subject Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={slotFormData.room}
                    onChange={(e) =>
                      setSlotFormData((prev) => ({
                        ...prev,
                        room: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={selectedClass?.room || 'Room 101'}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTimetableModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      slotFormData.subjectId &&
                      selectedSlot &&
                      selectedClass
                    ) {
                      const existingSlot = currentTimetable.find(
                        (slot) =>
                          slot.day === selectedSlot.day &&
                          slot.period === selectedSlot.period,
                      );
                      if (
                        existingSlot &&
                        confirm('Remove this subject from timetable?')
                      ) {
                        const updatedTimetable = currentTimetable.filter(
                          (slot) => slot.id !== existingSlot.id,
                        );
                        const updatedClass = {
                          ...selectedClass,
                          data: {
                            ...selectedClass.data,
                            timetable: updatedTimetable,
                          },
                        };
                        setClasses((prev) =>
                          prev.map((c) =>
                            c.id === selectedClass.id ? updatedClass : c,
                          ),
                        );
                        setSelectedClass(updatedClass);
                        setShowTimetableModal(false);
                        alert('Subject removed from timetable');
                      }
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md mr-2"
                  style={{
                    display: getTimetableSlot(
                      selectedSlot.day,
                      selectedSlot.period,
                    )
                      ? 'block'
                      : 'none',
                  }}
                >
                  Remove
                </button>
                <button
                  onClick={handleAddTimetableSlot}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {getTimetableSlot(selectedSlot.day, selectedSlot.period)
                    ? 'Update'
                    : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Slot Management Modal */}
        {showTimeSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Time Slots
                </h3>
              </div>
              <div className="p-6">
                {/* Add Time Slot Form */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Add New Time Slot
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slot Name
                      </label>
                      <input
                        type="text"
                        value={timeSlotFormData.name}
                        onChange={(e) =>
                          setTimeSlotFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Period 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={timeSlotFormData.startTime}
                        onChange={(e) =>
                          setTimeSlotFormData((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={timeSlotFormData.endTime}
                        onChange={(e) =>
                          setTimeSlotFormData((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddTimeSlot}
                        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Add Time Slot
                      </button>
                    </div>
                  </div>
                </div>

                {/* Time Slots List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Current Time Slots
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentTimeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {slot.name}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {slot.startTime} - {slot.endTime} ({slot.duration}{' '}
                            min)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              selectedClass &&
                              confirm(
                                'Remove this time slot? This will affect existing timetable entries.',
                              )
                            ) {
                              const updatedTimeSlots = currentTimeSlots.filter(
                                (t) => t.id !== slot.id,
                              );
                              const updatedClass = {
                                ...selectedClass,
                                data: {
                                  ...selectedClass.data,
                                  timeSlots: updatedTimeSlots,
                                },
                              };
                              setClasses((prev) =>
                                prev.map((c) =>
                                  c.id === selectedClass.id ? updatedClass : c,
                                ),
                              );
                              setSelectedClass(updatedClass);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
