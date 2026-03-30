'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import {
  useGetClassesQuery,
  useGetClassStudentsQuery,
} from '@/store/api/classApi';
import {
  UpdateStudentRequest,
  useCreateStudentMutation,
  useGetStudentsQuery,
  useUpdateStudentMutation,
} from '@/store/api/studentApi';
import { makeApiCall } from '@/utils/ApiRequest';
import * as XLSX from 'xlsx';

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
  photo?: string;
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

// Bulk upload types
interface BulkStudentRow {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  class_name: string;
  phone?: string;
  gender?: string;
  roll_number?: string;
  father_name?: string;
  mother_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  admission_date?: string;
}

export default function StudentManagement() {
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
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadData, setBulkUploadData] = useState<BulkStudentRow[]>([]);
  const [bulkUploadErrors, setBulkUploadErrors] = useState<string[]>([]);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    uniqueId: '',
    profile: '',
    classId: '',
    className: '',
    rollNumber: '',
    admissionDate: '',
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
  const { data: classesResponse, isLoading: classesLoading } =
    useGetClassesQuery(orgId!, {
      skip: !orgId,
    });

  // Get the selected class ID
  const classIdMap = new Map(
    classesResponse?.data.map((cls) => [cls.attributes.class, cls.id]) || [],
  );
  const selectedClassId =
    selectedClass !== 'All' ? classIdMap.get(selectedClass) : undefined;

  // Fetch all students or class-specific students based on selection
  const { data: allStudentsResponse, isLoading: allStudentsLoading } =
    useGetStudentsQuery(orgId!, {
      skip: !orgId || selectedClass !== 'All',
    });

  const { data: classStudentsResponse, isLoading: classStudentsLoading } =
    useGetClassStudentsQuery(
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
  const loading = classesLoading || filterLoading;

  // Transform API data to Student format
  const students: Student[] =
    (
      studentsData?.data as
        | { id: string; attributes: Record<string, unknown> }[]
        | undefined
    )?.map((studentData) => {
      // Handle different response formats for all students vs class students
      const attrs = studentData.attributes;
      const isClassStudentResponse = selectedClass !== 'All';

      // For class students, name is combined; for all students, we have first_name/last_name
      const hasFirstName =
        'first_name' in attrs && typeof attrs.first_name === 'string';
      const firstName = hasFirstName
        ? (attrs.first_name as string)
        : (attrs.name as string)?.split(' ')[0] || '';
      const lastName = hasFirstName
        ? (attrs.last_name as string)
        : (attrs.name as string)?.split(' ').slice(1).join(' ') || '';
      const fullName = hasFirstName
        ? `${attrs.first_name} ${attrs.last_name}`
        : (attrs.name as string) || '';

      // Cast guardian_info if it exists
      const guardianInfo = attrs.guardian_info as
        | {
            father_name?: string;
            mother_name?: string;
            phone?: string;
            email?: string;
            address?: string;
          }
        | undefined;

      return {
        id: studentData.id,
        firstName,
        lastName,
        name: fullName,
        email: (attrs.email as string) || '',
        phone: (attrs.phone as string) || '',
        dateOfBirth: isClassStudentResponse
          ? (typeof attrs.enrollment_date === 'number'
              ? new Date(attrs.enrollment_date as number).toISOString()
              : (attrs.enrollment_date as string)) || ''
          : (attrs.date_of_birth as string) || '',
        gender: attrs.gender as string | undefined,
        uniqueId: isClassStudentResponse
          ? (attrs.student_id as string)
          : (attrs.unique_id as string),
        profile: attrs.profile as string | undefined,
        gradeLevel: isClassStudentResponse
          ? selectedClass
          : (attrs.grade_level as string) || '',
        guardianInfo:
          isClassStudentResponse || !guardianInfo
            ? {
                fatherName: '',
                motherName: '',
                phone: '',
                email: '',
                address: '',
              }
            : {
                fatherName: guardianInfo.father_name || '',
                motherName: guardianInfo.mother_name || '',
                phone: guardianInfo.phone || '',
                email: guardianInfo.email || '',
                address: guardianInfo.address || '',
              },
        admissionDate: isClassStudentResponse
          ? (typeof attrs.enrollment_date === 'number'
              ? new Date(attrs.enrollment_date as number).toISOString()
              : (attrs.enrollment_date as string)) || ''
          : (attrs.admission_date as string) || '',
        rollNumber: isClassStudentResponse
          ? (attrs.roll_number as string) || studentData.id
          : (attrs.unique_id as string) || studentData.id,
        class: isClassStudentResponse
          ? selectedClass
          : (attrs.grade_level as string),
        section: 'A',
        status: isClassStudentResponse
          ? (attrs.status as string) === 'active'
            ? 'Active'
            : 'Inactive'
          : 'Active',
        photo:
          (attrs.profile as string) ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        academicYear: (attrs.academic_year as string) || '2024-25',
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

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Transferred':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const _getGradeColor = (grade: string) => {
    if (grade.includes('A+')) return 'text-green-600';
    if (grade.includes('A')) return 'text-blue-600';
    if (grade.includes('B')) return 'text-yellow-600';
    return 'text-red-600';
  };

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
      alert('Student details updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({});
  };

  const updateFormField = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (
    parentField: string,
    childField: string,
    value: string,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof Student] as Record<string, string>),
        [childField]: value,
      },
    }));
  };

  const _updateAddFormField = (field: string, value: string) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const _updateAddFormNestedField = (
    parentField: string,
    childField: string,
    value: string,
  ) => {
    setAddFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as Record<string, string>),
        [childField]: value,
      },
    }));
  };

  const handleAddStudent = async () => {
    if (!addFormData.firstName || !addFormData.lastName) {
      alert('Please fill in required fields: First Name and Last Name');
      return;
    }

    if (!orgId) {
      alert('Organization ID not found');
      return;
    }

    try {
      // Create student via RTK Query mutation
      const studentDataWithDefaults = {
        ...addFormData,
        gradeLevel: addFormData.className || '1', // Use class name or default
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
        classId: '',
        className: '',
        rollNumber: '',
        admissionDate: '',
        guardianInfo: {
          fatherName: '',
          motherName: '',
          phone: '',
          email: '',
          address: '',
        },
      });
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student. Please try again.');
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
      classId: '',
      className: '',
      rollNumber: '',
      admissionDate: '',
      guardianInfo: {
        fatherName: '',
        motherName: '',
        phone: '',
        email: '',
        address: '',
      },
    });
  };

  // Bulk Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      setBulkUploadErrors([
        'Please upload a valid Excel (.xlsx, .xls) or CSV file',
      ]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData =
          XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

        // Map Excel columns to expected format
        const mappedData: BulkStudentRow[] = jsonData.map((row) => ({
          first_name:
            row['First Name'] || row['first_name'] || row['FirstName'] || '',
          last_name:
            row['Last Name'] || row['last_name'] || row['LastName'] || '',
          email: row['Email'] || row['email'] || '',
          date_of_birth:
            row['Date of Birth'] ||
            row['date_of_birth'] ||
            row['DOB'] ||
            row['dob'] ||
            '',
          class_name:
            row['Class Name'] ||
            row['class_name'] ||
            row['Class'] ||
            row['class'] ||
            row['ClassName'] ||
            '',
          phone:
            row['Phone'] ||
            row['phone'] ||
            row['Mobile'] ||
            row['mobile'] ||
            '',
          gender: row['Gender'] || row['gender'] || '',
          roll_number:
            row['Roll Number'] || row['roll_number'] || row['Roll No'] || '',
          father_name:
            row['Father Name'] ||
            row['father_name'] ||
            row["Father's Name"] ||
            '',
          mother_name:
            row['Mother Name'] ||
            row['mother_name'] ||
            row["Mother's Name"] ||
            '',
          guardian_phone:
            row['Guardian Phone'] ||
            row['guardian_phone'] ||
            row['Parent Phone'] ||
            '',
          guardian_email:
            row['Guardian Email'] ||
            row['guardian_email'] ||
            row['Parent Email'] ||
            '',
          address: row['Address'] || row['address'] || '',
          admission_date: row['Admission Date'] || row['admission_date'] || '',
        }));

        // Validate required fields
        const errors: string[] = [];
        mappedData.forEach((row, index) => {
          if (!row.first_name)
            errors.push(`Row ${index + 2}: First Name is required`);
          if (!row.last_name)
            errors.push(`Row ${index + 2}: Last Name is required`);
          if (!row.email) errors.push(`Row ${index + 2}: Email is required`);
          if (!row.date_of_birth)
            errors.push(`Row ${index + 2}: Date of Birth is required`);
          if (!row.class_name)
            errors.push(`Row ${index + 2}: Class Name is required`);
        });

        setBulkUploadErrors(errors);
        setBulkUploadData(mappedData);
        setBulkUploadResult(null);
      } catch (error) {
        console.error('Error parsing file:', error);
        setBulkUploadErrors([
          'Error parsing file. Please check the file format.',
        ]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (!orgId) {
      alert('Organization ID not found');
      return;
    }

    if (bulkUploadData.length === 0) {
      alert('No data to upload');
      return;
    }

    if (bulkUploadErrors.length > 0) {
      alert('Please fix the errors before uploading');
      return;
    }

    setBulkUploadLoading(true);

    try {
      // Transform data to API format
      const apiData = {
        data: bulkUploadData.map((row) => ({
          attributes: {
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            date_of_birth: row.date_of_birth,
            class_name: row.class_name,
            phone: row.phone || undefined,
            gender: row.gender?.toLowerCase() || undefined,
            roll_number: row.roll_number || undefined,
            guardian_info: {
              father_name: row.father_name || '',
              mother_name: row.mother_name || '',
              phone: row.guardian_phone || '',
              email: row.guardian_email || '',
              address: row.address || '',
            },
            admission_date: row.admission_date || undefined,
          },
        })),
      };

      const response = await makeApiCall({
        path: `/${orgId}/students/bulk`,
        method: 'POST',
        payload: apiData,
        baseUrl: 'auth',
      });

      const result = {
        success: response.meta?.succeeded || bulkUploadData.length,
        failed: response.meta?.failed || 0,
        errors:
          response.errors?.map(
            (e: { detail?: string }) => e.detail || 'Unknown error',
          ) || [],
      };

      setBulkUploadResult(result);

      if (result.failed === 0) {
        alert(`Successfully uploaded ${result.success} students!`);
        // Reset and close modal
        setBulkUploadData([]);
        setBulkUploadErrors([]);
        setShowBulkUploadModal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // Refresh the student list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error uploading students:', error);
      setBulkUploadResult({
        success: 0,
        failed: bulkUploadData.length,
        errors: ['Failed to upload students. Please try again.'],
      });
    } finally {
      setBulkUploadLoading(false);
    }
  };

  const handleCloseBulkUploadModal = () => {
    setShowBulkUploadModal(false);
    setBulkUploadData([]);
    setBulkUploadErrors([]);
    setBulkUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        Email: 'john.doe@example.com',
        'Date of Birth': '15/08/2005',
        'Class Name': '10-A',
        Phone: '9876543210',
        Gender: 'Male',
        'Roll Number': '101',
        'Father Name': 'Robert Doe',
        'Mother Name': 'Jane Doe',
        'Guardian Phone': '9876543211',
        'Guardian Email': 'parent@example.com',
        Address: '123 Main St, City',
        'Admission Date': '01/04/2024',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_upload_template.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Bulk Upload
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters Row - Full Width */}
        <div className="mb-6">
          <div className="flex items-end gap-6">
            {/* Search - Takes remaining space */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name, roll number, or father's name..."
                className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Class Filter Dropdown */}
            <div className="w-52">
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassSelection(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Students Count */}
            <div className="flex items-center h-[42px] px-6 bg-indigo-600/10 border border-indigo-500/30 rounded-md">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Total:{' '}
                <span className="text-indigo-500 text-lg ml-1">
                  {filteredStudents.length}
                </span>
              </span>
            </div>
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
                          src={student.photo || '/placeholder-avatar.png'}
                          alt={student.name}
                          width={40}
                          height={40}
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
                    src={selectedStudent.photo || '/placeholder-avatar.png'}
                    alt={selectedStudent.name}
                    width={64}
                    height={64}
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
                    src={
                      editFormData.photo ||
                      editingStudent.photo ||
                      '/placeholder-avatar.png'
                    }
                    alt={editFormData.name || editingStudent.name}
                    width={64}
                    height={64}
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Class
                            </label>
                            <select
                              value={addFormData.classId}
                              onChange={(e) => {
                                const selectedClassData =
                                  classesResponse?.data.find(
                                    (cls) => cls.id === e.target.value,
                                  );
                                setAddFormData((prev) => ({
                                  ...prev,
                                  classId: e.target.value,
                                  className: selectedClassData
                                    ? `${selectedClassData.attributes.class}-${selectedClassData.attributes.section}`
                                    : '',
                                }));
                              }}
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Class</option>
                              {classesResponse?.data.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.attributes.class} -{' '}
                                  {cls.attributes.section}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Roll Number
                            </label>
                            <input
                              type="text"
                              value={addFormData.rollNumber}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  rollNumber: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter roll number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Admission Date
                          </label>
                          <input
                            type="date"
                            value={addFormData.admissionDate}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                admissionDate: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                            Guardian Email
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
                            Address
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

        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Bulk Upload Students
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload Excel (.xlsx, .xls) or CSV file with student data
                  </p>
                </div>
                <button
                  onClick={handleCloseBulkUploadModal}
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
              <div className="p-6 space-y-6">
                {/* Download Template Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Download the template file to see the required format.
                        Required fields:
                        <strong>
                          {' '}
                          First Name, Last Name, Email, Date of Birth, Class
                          Name
                        </strong>
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="bulk-upload-input"
                    />
                    <label
                      htmlFor="bulk-upload-input"
                      className="cursor-pointer"
                    >
                      <svg
                        className="w-12 h-12 mx-auto text-muted-foreground mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="text-indigo-600 font-medium">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Excel (.xlsx, .xls) or CSV files only
                      </p>
                    </label>
                  </div>
                </div>

                {/* Errors Section */}
                {bulkUploadErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                          Validation Errors ({bulkUploadErrors.length})
                        </p>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                          {bulkUploadErrors.slice(0, 10).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {bulkUploadErrors.length > 10 && (
                            <li className="text-red-500">
                              ...and {bulkUploadErrors.length - 10} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Result */}
                {bulkUploadResult && (
                  <div
                    className={`border rounded-lg p-4 ${
                      bulkUploadResult.failed === 0
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-2 ${
                        bulkUploadResult.failed === 0
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      Upload Results: {bulkUploadResult.success} succeeded,{' '}
                      {bulkUploadResult.failed} failed
                    </p>
                    {bulkUploadResult.errors.length > 0 && (
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {bulkUploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Preview Table */}
                {bulkUploadData.length > 0 && bulkUploadErrors.length === 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Preview ({bulkUploadData.length} students)
                    </h4>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-64">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                #
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                Email
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                DOB
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                Class
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                Phone
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                            {bulkUploadData.slice(0, 10).map((row, index) => (
                              <tr key={index} className="hover:bg-muted/50">
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground">
                                  {row.first_name} {row.last_name}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                  {row.email}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                  {row.date_of_birth}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                  {row.class_name}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                  {row.phone || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {bulkUploadData.length > 10 && (
                        <div className="px-3 py-2 bg-muted text-sm text-muted-foreground text-center">
                          ...and {bulkUploadData.length - 10} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                <button
                  onClick={handleCloseBulkUploadModal}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={
                    bulkUploadData.length === 0 ||
                    bulkUploadErrors.length > 0 ||
                    bulkUploadLoading
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {bulkUploadLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload {bulkUploadData.length} Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
