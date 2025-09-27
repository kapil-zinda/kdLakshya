'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const currentExams = selectedClass?.data.exams || [];
  const currentTimeSlots = selectedClass?.data.timeSlots || [];
  const [loading, setLoading] = useState(true);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRollNumberModal, setShowRollNumberModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] =
    useState<Subject | null>(null);
  const [selectedSubjectForDelete, setSelectedSubjectForDelete] =
    useState<Subject | null>(null);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] =
    useState<any>(null);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classFormData, setClassFormData] = useState({
    name: '',
    section: '',
    academicYear: '2024-25',
    room: '',
  });
  const [editClassFormData, setEditClassFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
    room: '',
  });
  const [assignTeacherFormData, setAssignTeacherFormData] = useState({
    teacherId: '',
  });
  const [rollNumberFormData, setRollNumberFormData] = useState({
    rollNumber: '',
  });
  const [editSubjectFormData, setEditSubjectFormData] = useState({
    teacherId: '',
  });
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Development flags
  const SKIP_CLASS_STUDENTS_ON_LOAD = true; // Set to true to skip loading class students during initial load
  const [cachedOrgId, setCachedOrgId] = useState<string | null>(null);

  // Helper function to get org ID (with caching)
  const getOrgId = async (): Promise<string> => {
    if (cachedOrgId) {
      return cachedOrgId;
    }
    const orgId = await ApiService.getCurrentOrgId();
    setCachedOrgId(orgId);
    return orgId;
  };
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
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      router.push('/');
      return;
    }
    try {
      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();
      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        router.push('/');
        return;
      }
    } catch (e) {
      localStorage.removeItem('bearerToken');
      router.push('/');
      return;
    }

    // Load data from API
    const loadData = async () => {
      try {
        setLoading(true);

        // Get organization ID first
        const orgId = await getOrgId();

        // Load teachers, classes, and students data
        const [teachersResponse, classesResponse, studentsResponse] =
          await Promise.all([
            ApiService.getFaculty(orgId),
            ApiService.getClasses(orgId),
            ApiService.getStudents(orgId),
          ]);

        // Transform teachers data first (needed for subject mapping)
        const transformedTeachers: Teacher[] = teachersResponse.data.map(
          (teacher) => ({
            id: teacher.id,
            name: teacher.attributes.name,
            employeeId: teacher.attributes.employee_id || '',
            department: teacher.attributes.subject || '',
            email: teacher.attributes.email,
            phone: teacher.attributes.phone,
          }),
        );

        // Transform classes data from API response
        const transformedClasses: Class[] = await Promise.all(
          classesResponse.data.map(async (classData) => {
            // Fetch students for each class
            let classStudents: Student[] = [];
            try {
              const studentsResponse = await ApiService.getClassStudents(
                orgId,
                classData.id,
              );
              classStudents = studentsResponse.data.map((student: any) => ({
                id: student.id,
                name: `${student.attributes.first_name || ''} ${student.attributes.last_name || ''}`.trim(),
                rollNumber: student.attributes.roll_number,
                email: student.attributes.email,
                phone: student.attributes.phone,
                status:
                  student.attributes.status === 'active'
                    ? ('Active' as const)
                    : ('Inactive' as const),
              }));
            } catch (error) {
              console.error(
                `Error fetching students for class ${classData.id}:`,
                error,
              );
            }

            // Fetch subjects for each class
            let classSubjects: Subject[] = [];
            try {
              const subjectsResponse = await ApiService.getSubjectsForClass(
                orgId,
                classData.id,
              );
              classSubjects = subjectsResponse.data.map((subject: any) => ({
                id: subject.id,
                name: subject.attributes.subject_name,
                code: '', // API doesn't provide code, use empty string
                teacherId: subject.attributes.teacher_id,
                teacherName: transformedTeachers.find(
                  (t) => t.id === subject.attributes.teacher_id,
                )?.name,
                credits: 1, // Default value, API doesn't provide this
                type: 'Core' as const, // Default value, API doesn't provide this
              }));
            } catch (error) {
              console.error(
                `Error fetching subjects for class ${classData.id}:`,
                error,
              );
            }

            return {
              id: classData.id,
              name: classData.attributes.class,
              section: classData.attributes.section,
              classTeacherId: classData.attributes.teacher_id,
              classTeacherName: classData.attributes.teacher_name,
              academicYear: classData.attributes.academic_year,
              totalStudents: classStudents.length,
              room: classData.attributes.room,
              data: {
                students: classStudents,
                subjects: classSubjects,
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
          }),
        );

        // Transform students data
        console.log('Raw student data from API:', studentsResponse.data[0]); // Debug log
        const allStudents = studentsResponse.data.map((student: any) => ({
          id: student.id,
          firstName:
            student.attributes.firstName || student.attributes.first_name || '',
          lastName:
            student.attributes.lastName || student.attributes.last_name || '',
          email: student.attributes.email || '',
          phone: student.attributes.phone || '',
        }));

        // Get all enrolled student IDs from all classes
        const enrolledStudentIds = new Set();
        transformedClasses.forEach((classData) => {
          classData.data.students.forEach((student) => {
            enrolledStudentIds.add(student.id);
          });
        });

        // Filter students that are not enrolled in any class
        const unassigned = allStudents.filter(
          (student: any) => !enrolledStudentIds.has(student.id),
        );

        setClasses(transformedClasses);
        setTeachers(transformedTeachers);
        setUnassignedStudents(unassigned);
        if (transformedClasses.length > 0) {
          setSelectedClass(transformedClasses[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading classes data:', error);
        // Fall back to empty arrays if API fails
        setClasses([]);
        setTeachers([]);
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleCreateClass = async () => {
    if (!classFormData.name || !classFormData.section) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Create class via API
      const response = await ApiService.createClass(orgId, {
        class: classFormData.name,
        section: classFormData.section,
        room: classFormData.room,
        academic_year: classFormData.academicYear,
        description: `${classFormData.name} ${classFormData.section}`,
      });

      // Create new class object for local state
      const newClass: Class = {
        id: response.data.id,
        name: response.data.attributes.class,
        section: response.data.attributes.section,
        classTeacherId: response.data.attributes.teacher_id,
        classTeacherName: response.data.attributes.teacher_name,
        academicYear: response.data.attributes.academic_year,
        totalStudents: 0,
        room: response.data.attributes.room,
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
        academicYear: '2024-25',
        room: '',
      });
      setLoading(false);
      alert('Class created successfully!');
    } catch (error) {
      console.error('Error creating class:', error);
      setLoading(false);
      alert('Failed to create class. Please try again.');
    }
  };

  const handleEditClass = (classToEdit: Class) => {
    setEditingClass(classToEdit);
    setEditClassFormData({
      name: classToEdit.name,
      section: classToEdit.section,
      academicYear: classToEdit.academicYear,
      room: classToEdit.room,
    });
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async () => {
    if (
      !editClassFormData.name ||
      !editClassFormData.section ||
      !editingClass
    ) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Update class via API
      const response = await ApiService.updateClass(orgId, editingClass.id, {
        class: editClassFormData.name,
        section: editClassFormData.section,
        room: editClassFormData.room,
        academic_year: editClassFormData.academicYear,
        description: `${editClassFormData.name} ${editClassFormData.section}`,
      });

      // Update local state
      const updatedClass: Class = {
        ...editingClass,
        name: response.data.attributes.class,
        section: response.data.attributes.section,
        academicYear: response.data.attributes.academic_year,
        room: response.data.attributes.room,
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === editingClass.id ? updatedClass : c)),
      );

      if (selectedClass?.id === editingClass.id) {
        setSelectedClass(updatedClass);
      }

      setShowEditClassModal(false);
      setEditingClass(null);
      setEditClassFormData({
        name: '',
        section: '',
        academicYear: '',
        room: '',
      });
      setLoading(false);
      alert('Class updated successfully!');
    } catch (error) {
      console.error('Error updating class:', error);
      setLoading(false);
      alert('Failed to update class. Please try again.');
    }
  };

  const handleDeleteClass = async (classToDelete: Class) => {
    if (
      !confirm(
        `Are you sure you want to delete ${classToDelete.name} - ${classToDelete.section}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Delete class via API
      await ApiService.deleteClass(orgId, classToDelete.id);

      // Update local state
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));

      // If the deleted class was selected, clear selection
      if (selectedClass?.id === classToDelete.id) {
        const remainingClasses = classes.filter(
          (c) => c.id !== classToDelete.id,
        );
        setSelectedClass(
          remainingClasses.length > 0 ? remainingClasses[0] : null,
        );
      }

      setLoading(false);
      alert('Class deleted successfully!');
    } catch (error) {
      console.error('Error deleting class:', error);
      setLoading(false);
      alert('Failed to delete class. Please try again.');
    }
  };

  const handleAssignTeacher = () => {
    if (!selectedClass) return;

    setAssignTeacherFormData({
      teacherId: selectedClass.classTeacherId || '',
    });
    setShowAssignTeacherModal(true);
  };

  const handleUpdateClassTeacher = async () => {
    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Get teacher name if teacher ID is provided
      const teacherName = assignTeacherFormData.teacherId
        ? teachers.find((t) => t.id === assignTeacherFormData.teacherId)?.name
        : undefined;

      // Update class via API
      const response = await ApiService.updateClass(orgId, selectedClass.id, {
        teacher_id: assignTeacherFormData.teacherId || null,
      });

      // Update local state
      const updatedClass: Class = {
        ...selectedClass,
        classTeacherId: response.data.attributes.teacher_id,
        classTeacherName: response.data.attributes.teacher_name,
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
      );
      setSelectedClass(updatedClass);

      setShowAssignTeacherModal(false);
      setAssignTeacherFormData({ teacherId: '' });
      setLoading(false);
      alert('Class teacher updated successfully!');
    } catch (error) {
      console.error('Error updating class teacher:', error);
      setLoading(false);
      alert('Failed to update class teacher. Please try again.');
    }
  };

  const handleAddStudentToClass = () => {
    setStudentSearchQuery('');
    setShowAddStudentModal(true);
  };

  const handleSelectStudentForAssignment = (student: any) => {
    setSelectedStudentForAssignment(student);
    setRollNumberFormData({ rollNumber: '' });
    setShowAddStudentModal(false);
    setShowRollNumberModal(true);
  };

  const handleAssignStudentWithRollNumber = async () => {
    if (
      !selectedStudentForAssignment ||
      !rollNumberFormData.rollNumber ||
      !selectedClass
    ) {
      alert('Please enter a roll number');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Enroll student in class using the API
      await ApiService.enrollStudentInClass(orgId, selectedClass.id, {
        student_id: selectedStudentForAssignment.id,
        roll_number: rollNumberFormData.rollNumber,
        academic_year: selectedClass.academicYear,
      });

      // Refresh class students to get updated data
      const studentsResponse = await ApiService.getClassStudents(
        orgId,
        selectedClass.id,
      );
      const updatedStudents = studentsResponse.data.map((student: any) => ({
        id: student.id,
        name: `${student.attributes.first_name || ''} ${student.attributes.last_name || ''}`.trim(),
        rollNumber: student.attributes.roll_number,
        email: student.attributes.email,
        phone: student.attributes.phone,
        status:
          student.attributes.status === 'active'
            ? ('Active' as const)
            : ('Inactive' as const),
      }));

      const updatedClass = {
        ...selectedClass,
        data: {
          ...selectedClass.data,
          students: updatedStudents,
        },
        totalStudents: updatedStudents.length,
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
      );
      setSelectedClass(updatedClass);

      // Remove student from unassigned list
      setUnassignedStudents((prev) =>
        prev.filter((s) => s.id !== selectedStudentForAssignment.id),
      );

      setShowRollNumberModal(false);
      setSelectedStudentForAssignment(null);
      setRollNumberFormData({ rollNumber: '' });
      setLoading(false);
      alert('Student added to class successfully!');
    } catch (error) {
      console.error('Error assigning student to class:', error);
      setLoading(false);
      alert('Failed to add student to class. Please try again.');
    }
  };

  const handleUnenrollStudent = async (student: Student) => {
    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove ${student.name} from ${selectedClass.name} - Section ${selectedClass.section}? This action will unenroll the student from this class.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await getOrgId();

      // Unenroll student from class using the API
      await ApiService.unenrollStudentFromClass(
        orgId,
        selectedClass.id,
        student.id,
        selectedClass.academicYear,
      );

      // Update local state by removing the student from the class
      const updatedStudents = selectedClass.data.students.filter(
        (s) => s.id !== student.id,
      );

      const updatedClass = {
        ...selectedClass,
        data: {
          ...selectedClass.data,
          students: updatedStudents,
        },
        totalStudents: updatedStudents.length,
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
      );
      setSelectedClass(updatedClass);

      // Add student back to unassigned list
      const unenrolledStudent = {
        id: student.id,
        firstName: student.name.split(' ')[0] || '',
        lastName: student.name.split(' ').slice(1).join(' ') || '',
        email: student.email,
        phone: student.phone,
      };

      setUnassignedStudents((prev) => [...prev, unenrolledStudent]);

      setLoading(false);
      alert('Student removed from class successfully!');
    } catch (error) {
      console.error('Error unenrolling student from class:', error);
      setLoading(false);
      alert('Failed to remove student from class. Please try again.');
    }
  };

  const handleAddSubject = async () => {
    if (!subjectFormData.name || !subjectFormData.teacherId) {
      alert('Please fill in required fields (Subject Name and Teacher)');
      return;
    }

    if (!selectedClass) {
      alert('No class selected');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await getOrgId();

      // Create subject via API
      const response = await ApiService.createSubject(orgId, {
        subject_name: subjectFormData.name,
        class_id: selectedClass.id,
        teacher_id: subjectFormData.teacherId,
      });

      // Create the new subject object for local state
      const newSubject: Subject = {
        id: response.data.id,
        name: response.data.attributes.subject_name,
        code: subjectFormData.code || '', // Code might not be in API response
        teacherId: response.data.attributes.teacher_id,
        teacherName: teachers.find(
          (t) => t.id === response.data.attributes.teacher_id,
        )?.name,
        credits: subjectFormData.credits,
        type: subjectFormData.type,
      };

      // Update local state
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
      setLoading(false);
      alert('Subject added successfully!');
    } catch (error) {
      console.error('Error creating subject:', error);
      setLoading(false);
      alert('Failed to create subject. Please try again.');
    }
  };

  const handleEditSubject = async () => {
    if (!editSubjectFormData.teacherId) {
      alert('Please select a teacher');
      return;
    }

    if (!selectedClass || !selectedSubjectForEdit) {
      alert('No class or subject selected');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await getOrgId();

      // Update subject via API
      await ApiService.updateSubject(
        orgId,
        selectedSubjectForEdit.id,
        editSubjectFormData.teacherId,
      );

      // Update local state
      const updatedSubjects = selectedClass.data.subjects.map((subject) =>
        subject.id === selectedSubjectForEdit.id
          ? {
              ...subject,
              teacherId: editSubjectFormData.teacherId,
              teacherName: teachers.find(
                (t) => t.id === editSubjectFormData.teacherId,
              )?.name,
            }
          : subject,
      );

      const updatedClass = {
        ...selectedClass,
        data: {
          ...selectedClass.data,
          subjects: updatedSubjects,
        },
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
      );
      setSelectedClass(updatedClass);
      setShowEditSubjectModal(false);
      setSelectedSubjectForEdit(null);
      setEditSubjectFormData({ teacherId: '' });
      setLoading(false);
      alert('Subject updated successfully!');
    } catch (error) {
      console.error('Error updating subject:', error);
      setLoading(false);
      alert('Failed to update subject. Please try again.');
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedClass || !selectedSubjectForDelete) {
      alert('No class or subject selected');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await getOrgId();

      // Delete subject via API
      await ApiService.deleteSubject(orgId, selectedSubjectForDelete.id);

      // Update local state
      const updatedSubjects = selectedClass.data.subjects.filter(
        (subject) => subject.id !== selectedSubjectForDelete.id,
      );

      const updatedClass = {
        ...selectedClass,
        data: {
          ...selectedClass.data,
          subjects: updatedSubjects,
        },
      };

      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)),
      );
      setSelectedClass(updatedClass);
      setShowDeleteSubjectModal(false);
      setSelectedSubjectForDelete(null);
      setLoading(false);
      alert('Subject deleted successfully!');
    } catch (error) {
      console.error('Error deleting subject:', error);
      setLoading(false);
      alert('Failed to delete subject. Please try again.');
    }
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
                href="/dashboard"
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
                    className={`p-4 transition-colors ${
                      selectedClass?.id === cls.id
                        ? 'bg-indigo-50 border-r-4 border-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => setSelectedClass(cls)}
                        className="flex-1 cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-gray-900">
                          {cls.name} - {cls.section}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.classTeacherName || 'No Class Teacher'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls.totalStudents} Students • {cls.room}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cls.academicYear}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClass(cls);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                          title="Edit Class"
                        >
                          <svg
                            className="w-4 h-4"
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
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls);
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title="Delete Class"
                        >
                          <svg
                            className="w-4 h-4"
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
                        </button>
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
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
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
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedClass.name} - Section{' '}
                            {selectedClass.section}
                          </h2>
                          <p className="text-sm text-blue-600 font-medium">
                            Academic Year {selectedClass.academicYear}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-500">
                              Class Teacher
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {selectedClass.classTeacherName || 'Not Assigned'}
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
                            {selectedClass.room || 'Not Assigned'}
                          </p>
                        </div>

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
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <button
                          onClick={handleAssignTeacher}
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg h-10"
                        >
                          <svg
                            className="w-4 h-4 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="whitespace-nowrap">
                            {selectedClass.classTeacherName
                              ? 'Change Teacher'
                              : 'Assign Teacher'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleEditClass(selectedClass)}
                          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg h-10"
                        >
                          <svg
                            className="w-4 h-4 mr-2 flex-shrink-0"
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
                          <span className="whitespace-nowrap">Edit Class</span>
                        </button>
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
                                      {student.name || 'No name provided'}
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
                                        handleUnenrollStudent(student)
                                      }
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      title="Remove student from class"
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
                              <div className="border-t pt-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Teacher:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {subject.teacherName || 'Not Assigned'}
                                </p>
                              </div>
                              <div className="border-t pt-3 mt-3 flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSubjectForEdit(subject);
                                    setEditSubjectFormData({
                                      teacherId: subject.teacherId || '',
                                    });
                                    setShowEditSubjectModal(true);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSubjectForDelete(subject);
                                    setShowDeleteSubjectModal(true);
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
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

        {/* Edit Class Modal */}
        {showEditClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Class
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editClassFormData.name}
                      onChange={(e) =>
                        setEditClassFormData((prev) => ({
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
                      value={editClassFormData.section}
                      onChange={(e) =>
                        setEditClassFormData((prev) => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="A, B, C..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={editClassFormData.academicYear}
                      onChange={(e) =>
                        setEditClassFormData((prev) => ({
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
                      value={editClassFormData.room}
                      onChange={(e) =>
                        setEditClassFormData((prev) => ({
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
                  onClick={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClass}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Update Class
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
                    Assign Teacher <span className="text-red-500">*</span>
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

        {/* Assign Teacher Modal */}
        {showAssignTeacherModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedClass?.classTeacherName
                    ? 'Change Class Teacher'
                    : 'Assign Class Teacher'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedClass?.name} - Section {selectedClass?.section}
                </p>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Teacher
                  </label>
                  <select
                    value={assignTeacherFormData.teacherId}
                    onChange={(e) =>
                      setAssignTeacherFormData((prev) => ({
                        ...prev,
                        teacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a teacher...</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.department})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to remove the current class teacher assignment.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setAssignTeacherFormData({ teacherId: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClassTeacher}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {selectedClass?.classTeacherName
                    ? 'Update Teacher'
                    : 'Assign Teacher'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Student to {selectedClass?.name} - Section{' '}
                  {selectedClass?.section}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select an unassigned student to add to this class
                </p>
              </div>

              <div className="p-6">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search students by name, email, or phone..."
                    />
                  </div>
                  {studentSearchQuery && (
                    <p className="mt-2 text-sm text-gray-600">
                      Showing results for &quot;{studentSearchQuery}&quot;
                    </p>
                  )}
                </div>

                {(() => {
                  // Filter students based on search query
                  const filteredStudents = unassignedStudents.filter(
                    (student) => {
                      const searchLower = studentSearchQuery.toLowerCase();
                      const fullName =
                        `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
                      const email = (student.email || '').toLowerCase();
                      const phone = student.phone || '';
                      const displayName =
                        student.firstName || student.lastName
                          ? fullName
                          : email;
                      return (
                        displayName.includes(searchLower) ||
                        email.includes(searchLower) ||
                        phone.includes(searchLower)
                      );
                    },
                  );

                  if (unassignedStudents.length === 0) {
                    return (
                      <div className="text-center py-8">
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
                          No unassigned students
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          All students are already assigned to classes.
                        </p>
                      </div>
                    );
                  }

                  if (filteredStudents.length === 0) {
                    return (
                      <div className="text-center py-8">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No students found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search or clear the search to see
                          all unassigned students.
                        </p>
                        {studentSearchQuery && (
                          <button
                            onClick={() => setStudentSearchQuery('')}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                          {filteredStudents.length} student
                          {filteredStudents.length !== 1 ? 's' : ''} available
                        </p>
                      </div>

                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                          onClick={() =>
                            handleSelectStudentForAssignment(student)
                          }
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-semibold text-blue-600">
                                  {(student.firstName?.[0] || '') +
                                    (student.lastName?.[0] || '') ||
                                    student.email?.[0]?.toUpperCase() ||
                                    '?'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-gray-900 truncate">
                                {student.firstName || student.lastName
                                  ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
                                  : student.email || 'Unknown Student'}
                              </h4>
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                    />
                                  </svg>
                                  {student.email || 'No email provided'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {student.phone || 'No phone provided'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <svg
                                className="w-5 h-5 text-green-600"
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setStudentSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roll Number Assignment Modal */}
        {showRollNumberModal && selectedStudentForAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Roll Number
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Assign a roll number to{' '}
                  {selectedStudentForAssignment.firstName || ''}{' '}
                  {selectedStudentForAssignment.lastName || ''}
                </p>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    {selectedStudentForAssignment.firstName || ''}{' '}
                    {selectedStudentForAssignment.lastName || ''}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStudentForAssignment.email || 'No email provided'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedStudentForAssignment.phone || 'No phone provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rollNumberFormData.rollNumber}
                    onChange={(e) =>
                      setRollNumberFormData((prev) => ({
                        ...prev,
                        rollNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter roll number (e.g., 001, A01, etc.)"
                    autoFocus
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRollNumberModal(false);
                    setSelectedStudentForAssignment(null);
                    setRollNumberFormData({ rollNumber: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStudentWithRollNumber}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEditSubjectModal && selectedSubjectForEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Subject
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Edit teacher for {selectedSubjectForEdit.name}
                </p>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">
                    {selectedSubjectForEdit.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Current Teacher:{' '}
                    {selectedSubjectForEdit.teacherName || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editSubjectFormData.teacherId}
                    onChange={(e) =>
                      setEditSubjectFormData((prev) => ({
                        ...prev,
                        teacherId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditSubjectModal(false);
                    setSelectedSubjectForEdit(null);
                    setEditSubjectFormData({ teacherId: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubject}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Subject Modal */}
        {showDeleteSubjectModal && selectedSubjectForDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Subject
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete this subject?
                </p>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900">
                    {selectedSubjectForDelete.name}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Teacher:{' '}
                    {selectedSubjectForDelete.teacherName || 'Not Assigned'}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Warning:</strong> This action cannot be undone. The
                    subject will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteSubjectModal(false);
                    setSelectedSubjectForDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete Subject
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
