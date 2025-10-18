'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ApiService } from '@/services/api';

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
  email: string;
  subjects?: string[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId?: string;
  teacherName?: string;
  credits: number;
}

interface ExamSubject {
  subjectId: string;
  subjectName: string;
  marks: number;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface Exam {
  id: string;
  name: string;
  subjects: ExamSubject[];
  instructions: string;
  type: 'Unit Test' | 'Mid Term' | 'Final' | 'Assignment';
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
}

interface ClassData {
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
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

interface ClassesContentProps {
  userData: UserData;
}

function ClassesContent({ userData }: ClassesContentProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [activeTab, setActiveTab] = useState<
    'students' | 'subjects' | 'exams' | 'monitor'
  >('students');
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] =
    useState<Subject | null>(null);
  const [selectedSubjectForDelete, setSelectedSubjectForDelete] =
    useState<Subject | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState<Exam | null>(
    null,
  );
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [classMonitor, setClassMonitor] = useState<Student | null>(null);

  // Get org ID and user ID directly from userData prop (passed from DashboardWrapper)
  // This avoids making redundant API calls to /users/me
  // Fallback to hardcoded localhost orgId if userData.orgId is not available
  const LOCALHOST_ORG_ID = '68d6b128d88f00c8b1b4a89a';
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('localhost:'));

  const orgId = userData.orgId || (isLocalhost ? LOCALHOST_ORG_ID : '');
  const userId = userData.userId || '';

  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    teacherId: '',
    credits: 1,
  });

  const [editSubjectFormData, setEditSubjectFormData] = useState({
    teacherId: '',
  });

  const [examFormData, setExamFormData] = useState({
    name: '',
    date: '',
    subjects: [] as ExamSubject[],
    instructions: '',
    type: 'Unit Test' as 'Unit Test' | 'Mid Term' | 'Final' | 'Assignment',
  });

  const [tempExamSubject, setTempExamSubject] = useState({
    subjectId: '',
    marks: 50,
    duration: 60,
    date: '',
    startTime: '',
    endTime: '',
  });

  // Get current class data
  const currentStudents = selectedClass?.data.students || [];
  const currentSubjects = selectedClass?.data.subjects || [];
  const currentExams = selectedClass?.data.exams || [];

  useEffect(() => {
    console.log('🔄 useEffect triggered - loading classes data');
    console.log('📋 userData:', userData);
    console.log('🏢 orgId:', orgId);
    console.log('👤 userId:', userId);

    if (!orgId) {
      console.error('❌ Cannot load classes - orgId is missing!');
      console.log('Full userData object:', JSON.stringify(userData, null, 2));
      setIsLoading(false);
      return;
    }

    loadClassesData();
  }, [orgId, userData]);

  const loadClassesData = async () => {
    try {
      setIsLoading(true);

      // Use orgId and userId from userData prop (no API call needed!)
      // This data is already fetched by DashboardWrapper
      if (!orgId) {
        console.error('❌ No orgId available from userData');
        setIsLoading(false);
        return;
      }

      console.log('✅ Using orgId from userData:', orgId);

      const permissions = userData.permission || {};

      // Check if user has team permissions (class teacher permissions)
      const teamPermissions = Object.keys(permissions).filter((key) =>
        key.startsWith('team-'),
      );

      // Fetch all classes from org
      const classesData = await ApiService.getClasses(orgId);

      console.log('📚 Fetched classes:', classesData.data.length);
      console.log('👤 Current userId:', userId);
      console.log('🔑 Team permissions:', teamPermissions);

      // Also fetch teachers for subjects assignment
      const teachersData = await ApiService.getFaculty(orgId);
      const teachersList = teachersData.data.map((t: any) => ({
        id: t.id,
        name: t.attributes.name,
        email: t.attributes.email,
        subjects: t.attributes.subjects || [],
      }));
      setTeachers(teachersList);

      // For localhost development, show all classes for easier testing
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('localhost:'));

      // Filter classes where this teacher is class teacher
      const assignedClasses: Class[] = [];

      for (const classItem of classesData.data) {
        const classAttrs = classItem.attributes;
        const teamId = classItem.id;

        // Check if teacher has permission for this team/class
        const hasPermission =
          isLocalhost || // Show all classes on localhost for development
          teamPermissions.includes(`team-${teamId}`) ||
          (classAttrs as any).class_teacher_id === userId ||
          classAttrs.teacher_id === userId; // Also check teacher_id field

        console.log(
          `Class ${classItem.attributes.class || classItem.id}: hasPermission=${hasPermission}, teacher_id=${classAttrs.teacher_id}, class_teacher_id=${(classAttrs as any).class_teacher_id}`,
        );

        if (hasPermission) {
          // Fetch class details (students, subjects, exams) in parallel
          const [studentsData, subjectsData, examsData] = await Promise.all([
            ApiService.getClassStudents(orgId, teamId),
            ApiService.getClassSubjects(orgId, teamId),
            ApiService.getClassExams(orgId, teamId),
          ]);

          const students: Student[] = studentsData.data.map((s: any) => ({
            id: s.id,
            name:
              s.attributes.name ||
              `${s.attributes.firstName || ''} ${s.attributes.lastName || ''}`.trim(),
            rollNumber:
              s.attributes.rollNumber || s.attributes.roll_number || 'N/A',
            email: s.attributes.email,
            phone: s.attributes.phone || 'N/A',
            status: s.attributes.status === 'active' ? 'Active' : 'Inactive',
          }));

          const subjects: Subject[] = subjectsData.data.map((s: any) => ({
            id: s.id,
            name: s.attributes.name,
            code: s.attributes.code || '',
            teacherId: s.attributes.teacher_id,
            teacherName: s.attributes.teacher_name,
            credits: s.attributes.credits || 1,
          }));

          const exams: Exam[] = examsData.data.map((e: any) => ({
            id: e.id,
            name: e.attributes.name,
            subjects: e.attributes.subjects || [],
            instructions: e.attributes.instructions || '',
            type: e.attributes.type || 'Unit Test',
            status: e.attributes.status || 'Scheduled',
          }));

          assignedClasses.push({
            id: teamId,
            name: classAttrs.name,
            section: classAttrs.section || 'A',
            classTeacherId: classAttrs.class_teacher_id,
            classTeacherName:
              classAttrs.class_teacher_name || userData.firstName,
            academicYear:
              classAttrs.academic_year || classAttrs.academicYear || '2024-25',
            totalStudents: students.length,
            room: classAttrs.room || 'Not Assigned',
            data: {
              students,
              subjects,
              exams,
            },
          });
        }
      }

      setClasses(assignedClasses);
      if (assignedClasses.length > 0) {
        setSelectedClass(assignedClasses[0]);

        // Load class monitor for first class
        loadClassMonitor(orgId, assignedClasses[0].id);
      }
    } catch (error) {
      console.error('Error fetching class info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassMonitor = async (orgId: string, classId: string) => {
    try {
      // Fetch class monitor - this would need to be implemented in your API
      // For now, we'll look for a student with a monitor flag or role
      const studentsData = await ApiService.getClassStudents(orgId, classId);
      const monitor = studentsData.data.find(
        (s: any) => s.attributes.isMonitor || s.attributes.is_monitor,
      );

      if (monitor) {
        setClassMonitor({
          id: monitor.id,
          name:
            monitor.attributes.name ||
            `${monitor.attributes.firstName || ''} ${monitor.attributes.lastName || ''}`.trim(),
          rollNumber:
            monitor.attributes.rollNumber ||
            monitor.attributes.roll_number ||
            'N/A',
          email: monitor.attributes.email,
          phone: monitor.attributes.phone || 'N/A',
          status: 'Active',
        });
      } else {
        setClassMonitor(null);
      }
    } catch (error) {
      console.error('Error loading class monitor:', error);
    }
  };

  const handleClassSelect = (classItem: Class) => {
    setSelectedClass(classItem);
    setActiveTab('students');

    // Load class monitor when class is selected (use cached orgId from userData)
    loadClassMonitor(orgId, classItem.id);
  };

  // Subject handlers
  const handleAddSubject = () => {
    setSubjectFormData({
      name: '',
      code: '',
      teacherId: '',
      credits: 1,
    });
    setShowAddSubjectModal(true);
  };

  const handleCreateSubject = async () => {
    if (!selectedClass || !subjectFormData.name || !subjectFormData.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.createClassSubject(orgId, selectedClass.id, {
        name: subjectFormData.name,
        code: subjectFormData.code,
        teacher_id: subjectFormData.teacherId,
        credits: subjectFormData.credits,
      });

      setShowAddSubjectModal(false);
      loadClassesData();
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Failed to create subject');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubjectForEdit(subject);
    setEditSubjectFormData({
      teacherId: subject.teacherId || '',
    });
    setShowEditSubjectModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!selectedClass || !selectedSubjectForEdit) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.updateClassSubject(
        orgId,
        selectedClass.id,
        selectedSubjectForEdit.id,
        {
          teacher_id: editSubjectFormData.teacherId,
        },
      );

      setShowEditSubjectModal(false);
      loadClassesData();
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject');
    }
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSelectedSubjectForDelete(subject);
    setShowDeleteSubjectModal(true);
  };

  const handleConfirmDeleteSubject = async () => {
    if (!selectedClass || !selectedSubjectForDelete) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.deleteClassSubject(
        orgId,
        selectedClass.id,
        selectedSubjectForDelete.id,
      );

      setShowDeleteSubjectModal(false);
      loadClassesData();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  // Student handlers
  const handleAddStudentToClass = async () => {
    try {
      // Use orgId from userData prop (no API call needed!)
      // Fetch all students and filter unassigned
      const studentsData = await ApiService.getStudents(orgId);
      const allStudents = studentsData.data;

      // Get currently assigned students
      const assignedIds = new Set(currentStudents.map((s) => s.id));

      // Filter unassigned students
      const unassigned = allStudents.filter((s: any) => !assignedIds.has(s.id));

      setUnassignedStudents(unassigned);
      setShowAddStudentModal(true);
    } catch (error) {
      console.error('Error loading unassigned students:', error);
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    if (!selectedClass) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.assignStudentToClass(orgId, selectedClass.id, studentId);

      setShowAddStudentModal(false);
      loadClassesData();
    } catch (error) {
      console.error('Error assigning student:', error);
      alert('Failed to assign student');
    }
  };

  const handleRemoveStudent = async (student: Student) => {
    if (!selectedClass) return;
    if (!confirm(`Remove ${student.name} from this class?`)) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.removeStudentFromClass(
        orgId,
        selectedClass.id,
        student.id,
      );
      loadClassesData();
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Failed to remove student');
    }
  };

  // Exam handlers
  const handleCreateExam = () => {
    setExamFormData({
      name: '',
      date: '',
      subjects: [],
      instructions: '',
      type: 'Unit Test',
    });
    setTempExamSubject({
      subjectId: '',
      marks: 50,
      duration: 60,
      date: '',
      startTime: '',
      endTime: '',
    });
    setShowCreateExamModal(true);
  };

  const handleAddExamSubject = () => {
    if (!tempExamSubject.subjectId) {
      alert('Please select a subject');
      return;
    }

    const subject = currentSubjects.find(
      (s) => s.id === tempExamSubject.subjectId,
    );
    if (!subject) return;

    const newSubject: ExamSubject = {
      subjectId: subject.id,
      subjectName: subject.name,
      marks: tempExamSubject.marks,
      duration: tempExamSubject.duration,
      date: tempExamSubject.date,
      startTime: tempExamSubject.startTime,
      endTime: tempExamSubject.endTime,
    };

    setExamFormData({
      ...examFormData,
      subjects: [...examFormData.subjects, newSubject],
    });

    setTempExamSubject({
      subjectId: '',
      marks: 50,
      duration: 60,
      date: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleRemoveExamSubject = (index: number) => {
    setExamFormData({
      ...examFormData,
      subjects: examFormData.subjects.filter((_, i) => i !== index),
    });
  };

  const handleSubmitExam = async () => {
    if (
      !selectedClass ||
      !examFormData.name ||
      examFormData.subjects.length === 0
    ) {
      alert('Please fill in all required fields and add at least one subject');
      return;
    }

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.createClassExam(orgId, selectedClass.id, {
        name: examFormData.name,
        subjects: examFormData.subjects,
        instructions: examFormData.instructions,
        type: examFormData.type,
        status: 'Scheduled',
      });

      setShowCreateExamModal(false);
      loadClassesData();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam');
    }
  };

  // Class Monitor handlers
  const handleAssignClassMonitor = async (student: Student) => {
    if (!selectedClass) return;
    if (!confirm(`Assign ${student.name} as class monitor?`)) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      // Update student to be class monitor
      await ApiService.updateStudent(orgId, student.id, {
        isMonitor: true,
        classId: selectedClass.id,
      });

      // If there was a previous monitor, remove their monitor status
      if (classMonitor && classMonitor.id !== student.id) {
        await ApiService.updateStudent(orgId, classMonitor.id, {
          isMonitor: false,
        });
      }

      setClassMonitor(student);
      alert(`${student.name} has been assigned as class monitor`);
    } catch (error) {
      console.error('Error assigning class monitor:', error);
      alert('Failed to assign class monitor');
    }
  };

  const handleRemoveClassMonitor = async () => {
    if (!selectedClass || !classMonitor) return;
    if (!confirm(`Remove ${classMonitor.name} as class monitor?`)) return;

    try {
      // Use orgId from userData prop (no API call needed!)
      await ApiService.updateStudent(orgId, classMonitor.id, {
        isMonitor: false,
      });

      setClassMonitor(null);
      alert('Class monitor has been removed');
    } catch (error) {
      console.error('Error removing class monitor:', error);
      alert('Failed to remove class monitor');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class information...</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link
                  href="/teacher-dashboard"
                  className="mr-4 text-gray-600 hover:text-gray-900"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">
                  Class Management
                </h1>
              </div>
              <div className="text-sm text-gray-500">
                {userData.firstName} {userData.lastName}
              </div>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Not a class teacher
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You are not assigned as a class teacher for any class.
            </p>
          </div>
        </main>
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
                href="/teacher-dashboard"
                className="mr-4 text-gray-600 hover:text-gray-900"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Class Management
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {userData.firstName} {userData.lastName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Classes List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  My Classes
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => handleClassSelect(classItem)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedClass?.id === classItem.id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selectedClass?.id === classItem.id
                              ? 'text-indigo-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {classItem.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Section {classItem.section}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {classItem.totalStudents}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Class Details */}
          <div className="lg:col-span-3">
            {selectedClass && (
              <div className="space-y-6">
                {/* Class Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedClass.name} - Section {selectedClass.section}
                      </h2>
                      <p className="text-sm text-blue-600 font-medium">
                        Academic Year {selectedClass.academicYear}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">
                          Students
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedClass.totalStudents}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">
                          Room
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedClass.room}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-500">
                          Subjects
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {currentSubjects.length}
                      </p>
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
                        { id: 'exams', label: 'Exams', icon: '📝' },
                        { id: 'monitor', label: 'Class Monitor', icon: '⭐' },
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
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">
                              {currentStudents.length} students
                            </span>
                            <button
                              onClick={handleAddStudentToClass}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-1.5"
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
                              Add Student
                            </button>
                          </div>
                        </div>

                        {currentStudents.length > 0 ? (
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
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <button
                                        onClick={() =>
                                          handleRemoveStudent(student)
                                        }
                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No students
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Get started by adding students to this class.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subjects Tab */}
                    {activeTab === 'subjects' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Subject List
                          </h3>
                          <button
                            onClick={handleAddSubject}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1.5"
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
                            Create Subject
                          </button>
                        </div>

                        {currentSubjects.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assigned Teacher
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Credits
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentSubjects.map((subject) => (
                                  <tr key={subject.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {subject.name}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {subject.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {subject.teacherName || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {subject.credits}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditSubject(subject)
                                        }
                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                        Assign
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteSubject(subject)
                                        }
                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No subjects
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Get started by creating subjects for this class.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Exams Tab */}
                    {activeTab === 'exams' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Exam List
                          </h3>
                          <button
                            onClick={handleCreateExam}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1.5"
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
                            Create Exam
                          </button>
                        </div>

                        {currentExams.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {currentExams.map((exam) => (
                              <div
                                key={exam.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {exam.name}
                                    </h4>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className="text-sm text-gray-500">
                                        {exam.type}
                                      </span>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          exam.status === 'Scheduled'
                                            ? 'bg-blue-100 text-blue-800'
                                            : exam.status === 'Ongoing'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : exam.status === 'Completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {exam.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {exam.instructions && (
                                  <p className="text-sm text-gray-600 mb-3">
                                    {exam.instructions}
                                  </p>
                                )}
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Subjects ({exam.subjects.length}):
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {exam.subjects.map((subject, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        {subject.subjectName} ({subject.marks}{' '}
                                        marks)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No exams
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Get started by creating exams for this class.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Class Monitor Tab */}
                    {activeTab === 'monitor' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Class Monitor
                        </h3>

                        {classMonitor ? (
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900">
                                    {classMonitor.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Roll Number: {classMonitor.rollNumber}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {classMonitor.email}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={handleRemoveClassMonitor}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                Remove Monitor
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <p className="text-center text-sm text-gray-500 mb-4">
                              No class monitor assigned. Select a student from
                              the list below to assign as class monitor.
                            </p>
                          </div>
                        )}

                        <div className="mt-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">
                            Select a student to assign as monitor:
                          </h4>
                          {currentStudents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {currentStudents
                                .filter((s) => s.id !== classMonitor?.id)
                                .map((student) => (
                                  <button
                                    key={student.id}
                                    onClick={() =>
                                      handleAssignClassMonitor(student)
                                    }
                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Roll: {student.rollNumber}
                                        </p>
                                      </div>
                                      <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          ) : (
                            <p className="text-center text-sm text-gray-500 py-4">
                              No students available in this class.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Student to Class
              </h3>
            </div>
            <div className="px-6 py-4">
              {unassignedStudents.length > 0 ? (
                <div className="space-y-2">
                  {unassignedStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.attributes.name ||
                            `${student.attributes.firstName || ''} ${student.attributes.lastName || ''}`.trim()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.attributes.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignStudent(student.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-8">
                  No unassigned students available.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Subject
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subjectFormData.name}
                  onChange={(e) =>
                    setSubjectFormData({
                      ...subjectFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={subjectFormData.code}
                  onChange={(e) =>
                    setSubjectFormData({
                      ...subjectFormData,
                      code: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., MATH101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Teacher (Optional)
                </label>
                <select
                  value={subjectFormData.teacherId}
                  onChange={(e) =>
                    setSubjectFormData({
                      ...subjectFormData,
                      teacherId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  value={subjectFormData.credits}
                  onChange={(e) =>
                    setSubjectFormData({
                      ...subjectFormData,
                      credits: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditSubjectModal && selectedSubjectForEdit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Teacher to {selectedSubjectForEdit.name}
              </h3>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Teacher
              </label>
              <select
                value={editSubjectFormData.teacherId}
                onChange={(e) =>
                  setEditSubjectFormData({
                    ...editSubjectFormData,
                    teacherId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditSubjectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Assign Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Modal */}
      {showDeleteSubjectModal && selectedSubjectForDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Subject
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete &quot;
                {selectedSubjectForDelete.name}
                &quot;? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteSubjectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Exam
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={examFormData.name}
                  onChange={(e) =>
                    setExamFormData({ ...examFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Mid Term Examination"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type *
                  </label>
                  <select
                    value={examFormData.type}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        type: e.target.value as
                          | 'Unit Test'
                          | 'Mid Term'
                          | 'Final'
                          | 'Assignment',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final">Final</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={examFormData.instructions}
                  onChange={(e) =>
                    setExamFormData({
                      ...examFormData,
                      instructions: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter exam instructions..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Add Subjects to Exam
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={tempExamSubject.subjectId}
                      onChange={(e) =>
                        setTempExamSubject({
                          ...tempExamSubject,
                          subjectId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={tempExamSubject.marks}
                      onChange={(e) =>
                        setTempExamSubject({
                          ...tempExamSubject,
                          marks: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={tempExamSubject.date}
                      onChange={(e) =>
                        setTempExamSubject({
                          ...tempExamSubject,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={tempExamSubject.startTime}
                      onChange={(e) =>
                        setTempExamSubject({
                          ...tempExamSubject,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={tempExamSubject.duration}
                      onChange={(e) =>
                        setTempExamSubject({
                          ...tempExamSubject,
                          duration: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddExamSubject}
                  className="w-full px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Subject to Exam
                </button>

                {examFormData.subjects.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                      Added Subjects ({examFormData.subjects.length}):
                    </h5>
                    <div className="space-y-2">
                      {examFormData.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {subject.subjectName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {subject.marks} marks • {subject.duration} min •{' '}
                              {subject.date} • {subject.startTime}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveExamSubject(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherClassesPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'admin']}>
      {(userData) => <ClassesContent userData={userData} />}
    </DashboardWrapper>
  );
}
