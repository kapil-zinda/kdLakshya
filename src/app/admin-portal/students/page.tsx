'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { BulkImportModal } from '@/components/admin/BulkImportModal';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api';
import {
  useGetClassesQuery,
  useGetClassStudentsQuery,
  type ClassStudent,
} from '@/store/api/classApi';
import {
  useCreateStudentMutation,
  useGetStudentsQuery,
  useUpdateStudentMutation,
  type Student as ApiStudent,
  type UpdateStudentRequest,
} from '@/store/api/studentApi';
import { toast } from 'react-toastify';

/**
 * A row from either source this page reads: `/students` returns the full
 * student record, `/classes/{id}/students` returns the thinner enrolment row.
 * Every field is optional because which ones arrive depends on which query
 * ran - the transform below branches on `isClassStudentResponse`.
 */
interface StudentRow {
  id: string;
  attributes: Partial<ApiStudent & ClassStudent>;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed field: firstName + lastName
  email: string;
  phone: string;
  dateOfBirth: string;
  gender?: string;
  uniqueId?: string;
  profile?: string;
  gradeLevel: string;
  guardianInfo: {
    fatherName: string;
    motherName: string;
    phone: string;
    email: string;
    address: string;
  };
  admissionDate: string;
  // Legacy fields for UI compatibility
  rollNumber?: string;
  class?: string;
  section?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  // Always populated by the transform below (falls back to a placeholder),
  // so the avatar renders without a null check.
  photo: string;
  academicYear?: string;
  status?: 'Active' | 'Inactive' | 'Transferred';
  fees?: {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    lastPaymentDate: string;
  };
  attendance?: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  grades?: {
    subject: string;
    marks: number;
    grade: string;
  }[];
}

export default function StudentManagement() {
  return (
    <DashboardWrapper allowedRoles={['admin']} redirectTo="/">
      {() => <StudentManagementContent />}
    </DashboardWrapper>
  );
}

function StudentManagementContent() {
  // Get orgId from Redux
  const { userData } = useUserDataRedux();
  const orgId = userData?.orgId;

  // Local UI state
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    uniqueId: '',
    profile: '',
    guardianInfo: {
      fatherName: '',
      motherName: '',
      phone: '',
      email: '',
      address: '',
    },
  });
  const router = useRouter();

  // RTK Query hooks for data fetching
  const {
    data: classesResponse,
    isLoading: classesLoading,
    isError: classesError,
    refetch: refetchClasses,
  } = useGetClassesQuery(orgId!, {
    skip: !orgId,
  });

  // Get the selected class ID
  const classIdMap = new Map(
    classesResponse?.data.map((cls) => [cls.attributes.class, cls.id]) || [],
  );
  const selectedClassId =
    selectedClass !== 'All' ? classIdMap.get(selectedClass) : undefined;

  // Fetch all students or class-specific students based on selection
  const {
    data: allStudentsResponse,
    isLoading: allStudentsLoading,
    isError: allStudentsError,
    refetch: refetchAllStudents,
  } = useGetStudentsQuery(orgId!, {
    skip: !orgId || selectedClass !== 'All',
  });

  const {
    data: classStudentsResponse,
    isLoading: classStudentsLoading,
    isError: classStudentsError,
    refetch: refetchClassStudents,
  } = useGetClassStudentsQuery(
    { orgId: orgId!, classId: selectedClassId! },
    {
      skip: !orgId || !selectedClassId || selectedClass === 'All',
    },
  );

  // RTK Query mutations
  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();

  // Determine which data source to use
  const studentsData =
    selectedClass === 'All' ? allStudentsResponse : classStudentsResponse;
  const filterLoading =
    selectedClass === 'All' ? allStudentsLoading : classStudentsLoading;
  const filterError =
    selectedClass === 'All' ? allStudentsError : classStudentsError;
  const loading = classesLoading || filterLoading;
  const hasError = classesError || filterError;

  // Transform API data to Student format. The two queries return different
  // shapes, so widen to the row union before mapping.
  const students: Student[] =
    ((studentsData?.data ?? []) as StudentRow[]).map((studentData) => {
      // Handle different response formats for all students vs class students
      const attrs = studentData.attributes;
      const isClassStudentResponse = selectedClass !== 'All';

      return {
        id: studentData.id,
        firstName: attrs.first_name ?? '',
        lastName: attrs.last_name ?? '',
        name: `${attrs.first_name ?? ''} ${attrs.last_name ?? ''}`.trim(),
        email: attrs.email ?? '',
        phone: attrs.phone ?? '',
        dateOfBirth: String(
          (isClassStudentResponse
            ? attrs.enrollment_date
            : attrs.date_of_birth) || '',
        ),
        gender: attrs.gender,
        uniqueId: isClassStudentResponse ? attrs.student_id : attrs.unique_id,
        profile: attrs.profile,
        gradeLevel:
          (isClassStudentResponse ? selectedClass : attrs.grade_level) ?? '',
        guardianInfo: isClassStudentResponse
          ? {
              fatherName: '',
              motherName: '',
              phone: '',
              email: '',
              address: '',
            }
          : {
              fatherName: attrs.guardian_info?.father_name ?? '',
              motherName: attrs.guardian_info?.mother_name ?? '',
              phone: attrs.guardian_info?.phone ?? '',
              email: attrs.guardian_info?.email ?? '',
              address: attrs.guardian_info?.address ?? '',
            },
        admissionDate: String(
          (isClassStudentResponse
            ? attrs.enrollment_date
            : attrs.admission_date) || '',
        ),
        rollNumber: isClassStudentResponse
          ? attrs.roll_number || studentData.id
          : attrs.unique_id || studentData.id,
        class: isClassStudentResponse ? selectedClass : attrs.grade_level,
        section: 'A',
        status: isClassStudentResponse
          ? attrs.status === 'active'
            ? 'Active'
            : 'Inactive'
          : 'Active',
        photo:
          attrs.profile ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        fees: {
          totalFees: 0,
          paidFees: 0,
          pendingFees: 0,
          lastPaymentDate: '',
        },
        attendance: {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          percentage: 0,
        },
        grades: [],
      };
    }) || [];

  // Extract class names
  const classes: string[] = [
    'All',
    ...(classesResponse?.data.map((classData) => classData.attributes.class) ||
      []),
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
    // Data is automatically fetched by RTK Query hooks when orgId is available
  }, [router]);

  // Handle class filter selection - RTK Query automatically fetches based on selectedClass
  const handleClassSelection = (className: string) => {
    setSelectedClass(className);
  };

  // Filter students by search term only (class filtering is done via API)
  const filteredStudents = students.filter((student) => {
    const searchMatch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNumber && student.rollNumber.includes(searchTerm)) ||
      (student.guardianInfo?.fatherName &&
        student.guardianInfo.fatherName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({ ...student });
    setSelectedStudent(null);
  };

  const handleSaveStudent = async () => {
    if (!editingStudent || !editFormData.id || !orgId) return;

    try {
      // Convert editFormData to API format
      const updateData: UpdateStudentRequest = {};

      if (editFormData.firstName) updateData.firstName = editFormData.firstName;
      if (editFormData.lastName) updateData.lastName = editFormData.lastName;
      if (editFormData.email) updateData.email = editFormData.email;
      if (editFormData.phone) updateData.phone = editFormData.phone;
      if (editFormData.dateOfBirth) updateData.dob = editFormData.dateOfBirth;
      if (editFormData.gender) updateData.gender = editFormData.gender;
      if (editFormData.uniqueId) updateData.uniqueId = editFormData.uniqueId;
      if (editFormData.profile) updateData.profile = editFormData.profile;
      if (editFormData.gradeLevel)
        updateData.gradeLevel = editFormData.gradeLevel;
      if (editFormData.guardianInfo)
        updateData.guardianInfo = editFormData.guardianInfo;

      // Use RTK Query mutation - cache will auto-update!
      await updateStudent({
        orgId,
        studentId: editingStudent.id,
        studentData: updateData,
      }).unwrap();

      setEditingStudent(null);
      setEditFormData({});
      toast.success('Student details updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({});
  };

  const updateFormField = (field: keyof Student, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (
    parentField: 'guardianInfo',
    childField: keyof Student['guardianInfo'],
    value: string,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [parentField]: {
        // Seeded with blanks so a partially-filled form still produces the
        // complete guardian block the update request expects.
        fatherName: '',
        motherName: '',
        phone: '',
        email: '',
        address: '',
        ...prev[parentField],
        [childField]: value,
      },
    }));
  };

  const handleAddStudent = async () => {
    if (!addFormData.firstName || !addFormData.lastName) {
      toast.error('Please fill in required fields: First Name and Last Name');
      return;
    }

    if (!orgId) {
      toast.error('Organization ID not found');
      return;
    }

    try {
      // Create student via RTK Query mutation with default grade level
      const studentDataWithDefaults = {
        ...addFormData,
        gradeLevel: '1', // Default grade level
      };

      // Use RTK Query mutation - cache will auto-update!
      await createStudent({
        orgId,
        studentData: studentDataWithDefaults,
      }).unwrap();

      setShowAddModal(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Male',
        uniqueId: '',
        profile: '',
        guardianInfo: {
          fatherName: '',
          motherName: '',
          phone: '',
          email: '',
          address: '',
        },
      });
      toast.success('Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to create student. Please try again.');
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'Male',
      uniqueId: '',
      profile: '',
      guardianInfo: {
        fatherName: '',
        motherName: '',
        phone: '',
        email: '',
        address: '',
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 px-4 text-center">
        <p className="text-muted-foreground">
          Couldn&apos;t load students. This may be a temporary connection issue.
        </p>
        <button
          onClick={() => {
            refetchClasses();
            refetchAllStudents();
            refetchClassStudents();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground mr-4"
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
              <h1 className="text-xl font-semibold text-foreground">
                Student Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setShowBulkImportModal(true)}
                className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 transition-colors"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 12m4-4v12"
                  />
                </svg>
                Import CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
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
                Add New Student
              </button>
              <div className="text-sm text-muted-foreground">
                Total Students: {filteredStudents.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Filter by Class
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleClassSelection(cls)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-foreground hover:bg-accent'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name, roll number, or father's name..."
              className="w-full max-w-md px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Subtle Loading Indicator */}
        {filterLoading && (
          <div className="mb-4 flex items-center justify-center py-2">
            <div className="flex items-center space-x-2 text-indigo-600">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Loading students...</span>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div
          className={`bg-card shadow-sm rounded-lg border border-border transition-opacity duration-200 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          src={student.photo}
                          alt={student.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.guardianInfo.fatherName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No students found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={selectedStudent.photo}
                    alt={selectedStudent.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.class}-{selectedStudent.section} | Roll:{' '}
                      {selectedStudent.rollNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              First Name
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.firstName}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Last Name
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Date of Birth
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Gender
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.gender || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Email
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Phone
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.phone}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Admission Date
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedStudent.admissionDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Family Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Father&apos;s Name
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedStudent.guardianInfo.fatherName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Mother&apos;s Name
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedStudent.guardianInfo.motherName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Guardian Phone
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.guardianInfo.phone}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Guardian Email
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedStudent.guardianInfo.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Address
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedStudent.guardianInfo.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditStudent(selectedStudent)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Edit Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Edit Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={editFormData.photo || editingStudent.photo}
                    alt={editFormData.name || editingStudent.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Edit Student Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {editFormData.name || editingStudent.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Edit Form Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editFormData.firstName || ''}
                              onChange={(e) =>
                                updateFormField('firstName', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editFormData.lastName || ''}
                              onChange={(e) =>
                                updateFormField('lastName', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Date of Birth{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={editFormData.dateOfBirth || ''}
                              onChange={(e) =>
                                updateFormField('dateOfBirth', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Gender
                            </label>
                            <select
                              value={editFormData.gender || ''}
                              onChange={(e) =>
                                updateFormField('gender', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) =>
                                updateFormField('email', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={editFormData.phone || ''}
                              onChange={(e) =>
                                updateFormField('phone', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Profile Photo URL
                          </label>
                          <input
                            type="url"
                            value={editFormData.profile || ''}
                            onChange={(e) =>
                              updateFormField('profile', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Guardian Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Father&apos;s Name{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editFormData.guardianInfo?.fatherName || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'guardianInfo',
                                'fatherName',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Mother&apos;s Name{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editFormData.guardianInfo?.motherName || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'guardianInfo',
                                'motherName',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mother's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Guardian Phone{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={editFormData.guardianInfo?.phone || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'guardianInfo',
                                'phone',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Guardian Email{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={editFormData.guardianInfo?.email || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'guardianInfo',
                                'email',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={editFormData.guardianInfo?.address || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'guardianInfo',
                                'address',
                                e.target.value,
                              )
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter home address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStudent}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <BulkImportModal
          title="Import Students from CSV"
          open={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          templateFilename="students_template.csv"
          templateHeaders={[
            'first_name',
            'last_name',
            'email',
            'date_of_birth (DD/MM/YYYY)',
            'phone',
            'gender',
          ]}
          requiredHeaders={[
            'first_name',
            'last_name',
            'email',
            'date_of_birth (DD/MM/YYYY)',
          ]}
          onImport={async (rows) => {
            if (!orgId) throw new Error('Organization not found');
            const payload = rows.map((row) => ({
              first_name: row['first_name'],
              last_name: row['last_name'],
              email: row['email'],
              date_of_birth: row['date_of_birth (DD/MM/YYYY)'],
              phone: row['phone'] || '',
              gender: row['gender'] || '',
            }));
            const response = await ApiService.bulkCreateStudents(
              orgId,
              payload,
            );
            return {
              succeeded: response.meta?.succeeded ?? 0,
              failed: response.meta?.failed ?? 0,
              errors: (response.errors || []).map((e) => ({
                index: e.index,
                error: e.error,
              })),
            };
          }}
          onSuccess={() => {
            refetchAllStudents();
          }}
        />

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Add Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Add New Student
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the student details below
                  </p>
                </div>
                <button
                  onClick={handleCancelAdd}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Add Form Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.firstName}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.lastName}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Date of Birth{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={addFormData.dob}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  dob: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Gender
                            </label>
                            <select
                              value={addFormData.gender}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  gender: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={addFormData.email}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={addFormData.phone}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Profile Photo URL
                          </label>
                          <input
                            type="url"
                            value={addFormData.profile}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                profile: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Guardian Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Father&apos;s Name{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addFormData.guardianInfo.fatherName}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                guardianInfo: {
                                  ...prev.guardianInfo,
                                  fatherName: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Mother&apos;s Name{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addFormData.guardianInfo.motherName}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                guardianInfo: {
                                  ...prev.guardianInfo,
                                  motherName: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mother's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Guardian Phone{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={addFormData.guardianInfo.phone}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                guardianInfo: {
                                  ...prev.guardianInfo,
                                  phone: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Guardian Email{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={addFormData.guardianInfo.email}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                guardianInfo: {
                                  ...prev.guardianInfo,
                                  email: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={addFormData.guardianInfo.address}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                guardianInfo: {
                                  ...prev.guardianInfo,
                                  address: e.target.value,
                                },
                              }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter home address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
