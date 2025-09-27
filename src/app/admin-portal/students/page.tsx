'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiService } from '@/services/api';

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

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const classes = [
    'All',
    'Nursery',
    'LKG',
    'UKG',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
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

    // Load students data from API
    const loadStudents = async () => {
      try {
        setLoading(true);

        // Get organization ID
        const orgId = await ApiService.getCurrentOrgId();

        // Fetch students from API
        const studentsResponse = await ApiService.getStudents(orgId);

        // Transform API response to local interface
        const transformedStudents: Student[] = studentsResponse.data.map(
          (studentData) => ({
            id: studentData.id,
            firstName: studentData.attributes.first_name,
            lastName: studentData.attributes.last_name,
            name: `${studentData.attributes.first_name} ${studentData.attributes.last_name}`,
            email: studentData.attributes.email,
            phone: studentData.attributes.phone,
            dateOfBirth: studentData.attributes.date_of_birth || '', // API returns DD/MM/YYYY format
            gender: studentData.attributes.gender,
            uniqueId: studentData.attributes.unique_id,
            profile: studentData.attributes.profile,
            gradeLevel: studentData.attributes.grade_level,
            guardianInfo: {
              fatherName: studentData.attributes.guardian_info.father_name,
              motherName: studentData.attributes.guardian_info.mother_name,
              phone: studentData.attributes.guardian_info.phone,
              email: studentData.attributes.guardian_info.email,
              address: studentData.attributes.guardian_info.address,
            },
            admissionDate: studentData.attributes.admission_date || '', // API returns DD/MM/YYYY format
            // Legacy fields for UI compatibility
            rollNumber: studentData.attributes.unique_id || studentData.id,
            class: studentData.attributes.grade_level,
            section: 'A', // Default section
            status: 'Active',
            photo:
              studentData.attributes.profile ||
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
          }),
        );

        setStudents(transformedStudents);
        setLoading(false);
      } catch (error) {
        console.error('Error loading students:', error);
        // Fall back to empty array if API fails
        setStudents([]);
        setLoading(false);
      }
    };

    loadStudents();
  }, [router]);

  const filteredStudents = students.filter((student) => {
    const classMatch =
      selectedClass === 'All' ||
      student.class === selectedClass ||
      student.gradeLevel === selectedClass;
    const searchMatch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNumber && student.rollNumber.includes(searchTerm)) ||
      student.guardianInfo.fatherName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return classMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
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

  const getGradeColor = (grade: string) => {
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
    if (!editingStudent || !editFormData.id) return;

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Convert editFormData to API format
      const updateData: any = {};

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

      if (editFormData.guardianInfo) {
        updateData.guardianInfo = editFormData.guardianInfo;
      }

      // Update student via API
      const response = await ApiService.updateStudent(
        orgId,
        editingStudent.id,
        updateData,
      );

      // Transform API response and update local state
      const updatedStudent: Student = {
        id: response.data.id,
        firstName: response.data.attributes.first_name,
        lastName: response.data.attributes.last_name,
        name: `${response.data.attributes.first_name} ${response.data.attributes.last_name}`,
        email: response.data.attributes.email,
        phone: response.data.attributes.phone,
        dateOfBirth: response.data.attributes.date_of_birth || '', // API returns DD/MM/YYYY format
        gender: response.data.attributes.gender,
        uniqueId: response.data.attributes.unique_id,
        profile: response.data.attributes.profile,
        gradeLevel: response.data.attributes.grade_level,
        guardianInfo: {
          fatherName: response.data.attributes.guardian_info.father_name,
          motherName: response.data.attributes.guardian_info.mother_name,
          phone: response.data.attributes.guardian_info.phone,
          email: response.data.attributes.guardian_info.email,
          address: response.data.attributes.guardian_info.address,
        },
        admissionDate: response.data.attributes.admission_date || '', // API returns DD/MM/YYYY format
        // Legacy fields for UI compatibility
        rollNumber: response.data.attributes.unique_id || response.data.id,
        class: response.data.attributes.grade_level,
        section: 'A',
        status: 'Active',
        photo:
          response.data.attributes.profile ||
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

      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id ? updatedStudent : student,
        ),
      );

      setEditingStudent(null);
      setEditFormData({});
      setLoading(false);
      alert('Student details updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      setLoading(false);
      alert('Failed to update student. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({});
  };

  const updateFormField = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (
    parentField: string,
    childField: string,
    value: any,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof Student] as any),
        [childField]: value,
      },
    }));
  };

  const updateAddFormField = (field: string, value: any) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddFormNestedField = (
    parentField: string,
    childField: string,
    value: any,
  ) => {
    setAddFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof Student] as any),
        [childField]: value,
      },
    }));
  };

  const handleAddStudent = async () => {
    if (!addFormData.firstName || !addFormData.lastName) {
      alert('Please fill in required fields: First Name and Last Name');
      return;
    }

    try {
      setLoading(true);

      // Get organization ID
      const orgId = await ApiService.getCurrentOrgId();

      // Create student via API with default grade level
      const studentDataWithDefaults = {
        ...addFormData,
        gradeLevel: '1', // Default grade level
      };
      const response = await ApiService.createStudent(
        orgId,
        studentDataWithDefaults,
      );

      // Transform API response to local interface
      const newStudent: Student = {
        id: response.data.id,
        firstName: response.data.attributes.first_name,
        lastName: response.data.attributes.last_name,
        name: `${response.data.attributes.first_name} ${response.data.attributes.last_name}`,
        email: response.data.attributes.email,
        phone: response.data.attributes.phone,
        dateOfBirth: response.data.attributes.date_of_birth || '', // API returns DD/MM/YYYY format
        gender: response.data.attributes.gender,
        uniqueId: response.data.attributes.unique_id,
        profile: response.data.attributes.profile,
        gradeLevel: response.data.attributes.grade_level,
        guardianInfo: {
          fatherName: response.data.attributes.guardian_info.father_name,
          motherName: response.data.attributes.guardian_info.mother_name,
          phone: response.data.attributes.guardian_info.phone,
          email: response.data.attributes.guardian_info.email,
          address: response.data.attributes.guardian_info.address,
        },
        admissionDate: response.data.attributes.admission_date || '', // API returns DD/MM/YYYY format
        // Legacy fields for UI compatibility
        rollNumber: response.data.attributes.unique_id || response.data.id,
        class: response.data.attributes.grade_level,
        section: 'A',
        status: 'Active',
        photo:
          response.data.attributes.profile ||
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

      setStudents((prev) => [...prev, newStudent]);
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
      setLoading(false);
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      setLoading(false);
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
                Student Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="text-sm text-gray-500">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Class
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name, roll number, or father's name..."
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.guardianInfo.fatherName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
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
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={selectedStudent.photo}
                    alt={selectedStudent.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.class}-{selectedStudent.section} | Roll:{' '}
                      {selectedStudent.rollNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              First Name
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.firstName}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Last Name
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Date of Birth
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Gender
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.gender || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Email
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.phone}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Admission Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.admissionDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Family Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Father&apos;s Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.guardianInfo.fatherName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Mother&apos;s Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.guardianInfo.motherName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Guardian Phone
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.guardianInfo.phone}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Guardian Email
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.guardianInfo.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Address
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.guardianInfo.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
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
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Edit Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={editFormData.photo || editingStudent.photo}
                    alt={editFormData.name || editingStudent.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Student Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editFormData.name || editingStudent.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editFormData.firstName || ''}
                              onChange={(e) =>
                                updateFormField('firstName', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editFormData.lastName || ''}
                              onChange={(e) =>
                                updateFormField('lastName', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={editFormData.dateOfBirth || ''}
                              onChange={(e) =>
                                updateFormField('dateOfBirth', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <select
                              value={editFormData.gender || ''}
                              onChange={(e) =>
                                updateFormField('gender', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) =>
                                updateFormField('email', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={editFormData.phone || ''}
                              onChange={(e) =>
                                updateFormField('phone', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Photo URL
                          </label>
                          <input
                            type="url"
                            value={editFormData.profile || ''}
                            onChange={(e) =>
                              updateFormField('profile', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Guardian Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mother's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter home address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
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
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Add Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Add New Student
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fill in the student details below
                  </p>
                </div>
                <button
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600"
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Guardian Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mother's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter guardian email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter home address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
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
