'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  address: string;
  admissionDate: string;
  bloodGroup: string;
  emergencyContact: string;
  photo: string;
  academicYear: string;
  status: 'Active' | 'Inactive' | 'Transferred';
  fees: {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    lastPaymentDate: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  grades: {
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
  const [addFormData, setAddFormData] = useState<Partial<Student>>({
    status: 'Active',
    academicYear: '2024-25',
    fees: { totalFees: 0, paidFees: 0, pendingFees: 0, lastPaymentDate: '' },
    attendance: { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 },
    grades: [],
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
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
      router.push('/admin-portal/login');
      return;
    }

    // Load sample student data (in production, fetch from API)
    const sampleStudents: Student[] = [
      {
        id: '1',
        name: 'Aarav Sharma',
        rollNumber: '001',
        class: 'Class 10',
        section: 'A',
        fatherName: 'Rajesh Sharma',
        motherName: 'Priya Sharma',
        dateOfBirth: '2008-05-15',
        gender: 'Male',
        email: 'aarav.sharma@email.com',
        phone: '9876543210',
        address: '123, Green Park, Delhi',
        admissionDate: '2020-04-01',
        bloodGroup: 'B+',
        emergencyContact: '9876543211',
        photo:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 50000,
          paidFees: 35000,
          pendingFees: 15000,
          lastPaymentDate: '2024-01-15',
        },
        attendance: {
          totalDays: 180,
          presentDays: 165,
          absentDays: 15,
          percentage: 91.7,
        },
        grades: [
          { subject: 'Mathematics', marks: 85, grade: 'A' },
          { subject: 'Science', marks: 78, grade: 'B+' },
          { subject: 'English', marks: 92, grade: 'A+' },
          { subject: 'Hindi', marks: 75, grade: 'B' },
          { subject: 'Social Studies', marks: 88, grade: 'A' },
        ],
      },
      {
        id: '2',
        name: 'Ananya Patel',
        rollNumber: '002',
        class: 'Class 10',
        section: 'A',
        fatherName: 'Vikram Patel',
        motherName: 'Kavita Patel',
        dateOfBirth: '2008-08-22',
        gender: 'Female',
        email: 'ananya.patel@email.com',
        phone: '9876543212',
        address: '456, Blue Valley, Mumbai',
        admissionDate: '2020-04-01',
        bloodGroup: 'A+',
        emergencyContact: '9876543213',
        photo:
          'https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 50000,
          paidFees: 50000,
          pendingFees: 0,
          lastPaymentDate: '2024-01-10',
        },
        attendance: {
          totalDays: 180,
          presentDays: 175,
          absentDays: 5,
          percentage: 97.2,
        },
        grades: [
          { subject: 'Mathematics', marks: 95, grade: 'A+' },
          { subject: 'Science', marks: 89, grade: 'A' },
          { subject: 'English', marks: 87, grade: 'A' },
          { subject: 'Hindi', marks: 82, grade: 'A' },
          { subject: 'Social Studies', marks: 91, grade: 'A+' },
        ],
      },
      {
        id: '3',
        name: 'Arjun Kumar',
        rollNumber: '003',
        class: 'Class 9',
        section: 'B',
        fatherName: 'Suresh Kumar',
        motherName: 'Meera Kumar',
        dateOfBirth: '2009-03-10',
        gender: 'Male',
        email: 'arjun.kumar@email.com',
        phone: '9876543214',
        address: '789, Rose Garden, Bangalore',
        admissionDate: '2021-04-01',
        bloodGroup: 'O+',
        emergencyContact: '9876543215',
        photo:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 45000,
          paidFees: 30000,
          pendingFees: 15000,
          lastPaymentDate: '2023-12-20',
        },
        attendance: {
          totalDays: 170,
          presentDays: 155,
          absentDays: 15,
          percentage: 91.2,
        },
        grades: [
          { subject: 'Mathematics', marks: 72, grade: 'B' },
          { subject: 'Science', marks: 85, grade: 'A' },
          { subject: 'English', marks: 79, grade: 'B+' },
          { subject: 'Hindi', marks: 88, grade: 'A' },
          { subject: 'Social Studies', marks: 76, grade: 'B+' },
        ],
      },
      {
        id: '4',
        name: 'Diya Singh',
        rollNumber: '001',
        class: 'Class 5',
        section: 'A',
        fatherName: 'Rohit Singh',
        motherName: 'Sunita Singh',
        dateOfBirth: '2013-11-05',
        gender: 'Female',
        email: 'diya.singh@email.com',
        phone: '9876543216',
        address: '321, Lily Apartments, Pune',
        admissionDate: '2019-04-01',
        bloodGroup: 'AB+',
        emergencyContact: '9876543217',
        photo:
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 35000,
          paidFees: 35000,
          pendingFees: 0,
          lastPaymentDate: '2024-01-05',
        },
        attendance: {
          totalDays: 160,
          presentDays: 158,
          absentDays: 2,
          percentage: 98.8,
        },
        grades: [
          { subject: 'Mathematics', marks: 90, grade: 'A+' },
          { subject: 'Science', marks: 85, grade: 'A' },
          { subject: 'English', marks: 88, grade: 'A' },
          { subject: 'Hindi', marks: 92, grade: 'A+' },
          { subject: 'EVS', marks: 87, grade: 'A' },
        ],
      },
      {
        id: '5',
        name: 'Karan Verma',
        rollNumber: '002',
        class: 'Class 5',
        section: 'A',
        fatherName: 'Amit Verma',
        motherName: 'Pooja Verma',
        dateOfBirth: '2013-07-18',
        gender: 'Male',
        email: 'karan.verma@email.com',
        phone: '9876543218',
        address: '654, Orchid Heights, Chennai',
        admissionDate: '2019-04-01',
        bloodGroup: 'B-',
        emergencyContact: '9876543219',
        photo:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 35000,
          paidFees: 25000,
          pendingFees: 10000,
          lastPaymentDate: '2023-11-30',
        },
        attendance: {
          totalDays: 160,
          presentDays: 145,
          absentDays: 15,
          percentage: 90.6,
        },
        grades: [
          { subject: 'Mathematics', marks: 78, grade: 'B+' },
          { subject: 'Science', marks: 82, grade: 'A' },
          { subject: 'English', marks: 75, grade: 'B' },
          { subject: 'Hindi', marks: 80, grade: 'B+' },
          { subject: 'EVS', marks: 83, grade: 'A' },
        ],
      },
      {
        id: '6',
        name: 'Riya Gupta',
        rollNumber: '004',
        class: 'Class 9',
        section: 'B',
        fatherName: 'Manoj Gupta',
        motherName: 'Suman Gupta',
        dateOfBirth: '2009-12-30',
        gender: 'Female',
        email: 'riya.gupta@email.com',
        phone: '9876543220',
        address: '987, Jasmine Colony, Hyderabad',
        admissionDate: '2021-04-01',
        bloodGroup: 'A-',
        emergencyContact: '9876543221',
        photo:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        academicYear: '2024-25',
        status: 'Active',
        fees: {
          totalFees: 45000,
          paidFees: 45000,
          pendingFees: 0,
          lastPaymentDate: '2024-01-01',
        },
        attendance: {
          totalDays: 170,
          presentDays: 168,
          absentDays: 2,
          percentage: 98.8,
        },
        grades: [
          { subject: 'Mathematics', marks: 93, grade: 'A+' },
          { subject: 'Science', marks: 91, grade: 'A+' },
          { subject: 'English', marks: 89, grade: 'A' },
          { subject: 'Hindi', marks: 85, grade: 'A' },
          { subject: 'Social Studies', marks: 90, grade: 'A+' },
        ],
      },
    ];

    setStudents(sampleStudents);
    setLoading(false);
  }, [router]);

  const filteredStudents = students.filter((student) => {
    const classMatch =
      selectedClass === 'All' || student.class === selectedClass;
    const searchMatch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSaveStudent = () => {
    if (!editingStudent || !editFormData.id) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === editFormData.id
          ? ({ ...student, ...editFormData } as Student)
          : student,
      ),
    );

    setEditingStudent(null);
    setEditFormData({});
    // Show success message (in production, make API call)
    alert('Student details updated successfully!');
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

  const handleAddStudent = () => {
    if (!addFormData.name || !addFormData.rollNumber || !addFormData.class) {
      alert('Please fill in required fields: Name, Roll Number, and Class');
      return;
    }

    const newStudent: Student = {
      id: (students.length + 1).toString(),
      name: addFormData.name || '',
      rollNumber: addFormData.rollNumber || '',
      class: addFormData.class || '',
      section: addFormData.section || 'A',
      fatherName: addFormData.fatherName || '',
      motherName: addFormData.motherName || '',
      dateOfBirth: addFormData.dateOfBirth || '',
      gender: addFormData.gender || 'Male',
      email: addFormData.email || '',
      phone: addFormData.phone || '',
      address: addFormData.address || '',
      admissionDate:
        addFormData.admissionDate || new Date().toISOString().split('T')[0],
      bloodGroup: addFormData.bloodGroup || 'O+',
      emergencyContact: addFormData.emergencyContact || '',
      photo:
        addFormData.photo ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      academicYear: '2024-25',
      status: 'Active',
      fees: addFormData.fees || {
        totalFees: 0,
        paidFees: 0,
        pendingFees: 0,
        lastPaymentDate: '',
      },
      attendance: addFormData.attendance || {
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
      status: 'Active',
      academicYear: '2024-25',
      fees: { totalFees: 0, paidFees: 0, pendingFees: 0, lastPaymentDate: '' },
      attendance: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        percentage: 0,
      },
      grades: [],
    });
    alert('Student added successfully!');
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddFormData({
      status: 'Active',
      academicYear: '2024-25',
      fees: { totalFees: 0, paidFees: 0, pendingFees: 0, lastPaymentDate: '' },
      attendance: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        percentage: 0,
      },
      grades: [],
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
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fees Status
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
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.fatherName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.class}-{student.section}
                      </div>
                      <div className="text-sm text-gray-500">
                        Roll: {student.rollNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.attendance.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.attendance.presentDays}/
                        {student.attendance.totalDays} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{student.fees.paidFees.toLocaleString()}/₹
                        {student.fees.totalFees.toLocaleString()}
                      </div>
                      <div
                        className={`text-sm ${student.fees.pendingFees > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {student.fees.pendingFees > 0
                          ? `₹${student.fees.pendingFees.toLocaleString()} pending`
                          : 'Paid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                      >
                        {student.status}
                      </span>
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
                              {selectedStudent.gender}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Blood Group
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.bloodGroup}
                            </p>
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
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Address
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.address}
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
                            {selectedStudent.fatherName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Mother&apos;s Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.motherName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.phone}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Emergency Contact
                            </label>
                            <p className="text-sm text-gray-900">
                              {selectedStudent.emergencyContact}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Academic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-blue-600">
                            Attendance
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {selectedStudent.attendance.percentage}%
                          </div>
                          <div className="text-xs text-blue-600">
                            {selectedStudent.attendance.presentDays}/
                            {selectedStudent.attendance.totalDays} days
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-green-600">
                            Status
                          </div>
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}
                          >
                            {selectedStudent.status}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Grades
                      </h4>
                      <div className="space-y-2">
                        {selectedStudent.grades.map((grade, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {grade.subject}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-900">
                                {grade.marks}
                              </span>
                              <span
                                className={`ml-2 text-sm font-semibold ${getGradeColor(grade.grade)}`}
                              >
                                {grade.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Fee Details
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500">
                              Total Fees
                            </div>
                            <div className="text-sm font-semibold">
                              ₹{selectedStudent.fees.totalFees.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xs text-green-600">Paid</div>
                            <div className="text-sm font-semibold text-green-900">
                              ₹{selectedStudent.fees.paidFees.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xs text-red-600">Pending</div>
                            <div className="text-sm font-semibold text-red-900">
                              ₹
                              {selectedStudent.fees.pendingFees.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Last Payment Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedStudent.fees.lastPaymentDate}
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
                              Name
                            </label>
                            <input
                              type="text"
                              value={editFormData.name || ''}
                              onChange={(e) =>
                                updateFormField('name', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Roll Number
                            </label>
                            <input
                              type="text"
                              value={editFormData.rollNumber || ''}
                              onChange={(e) =>
                                updateFormField('rollNumber', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Class
                            </label>
                            <select
                              value={editFormData.class || ''}
                              onChange={(e) =>
                                updateFormField('class', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              {classes
                                .filter((c) => c !== 'All')
                                .map((cls) => (
                                  <option key={cls} value={cls}>
                                    {cls}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Section
                            </label>
                            <input
                              type="text"
                              value={editFormData.section || ''}
                              onChange={(e) =>
                                updateFormField('section', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
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
                              Blood Group
                            </label>
                            <select
                              value={editFormData.bloodGroup || ''}
                              onChange={(e) =>
                                updateFormField('bloodGroup', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={editFormData.status || ''}
                              onChange={(e) =>
                                updateFormField('status', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Transferred">Transferred</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            value={editFormData.address || ''}
                            onChange={(e) =>
                              updateFormField('address', e.target.value)
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family & Contact Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Family & Contact Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Father&apos;s Name
                          </label>
                          <input
                            type="text"
                            value={editFormData.fatherName || ''}
                            onChange={(e) =>
                              updateFormField('fatherName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mother&apos;s Name
                          </label>
                          <input
                            type="text"
                            value={editFormData.motherName || ''}
                            onChange={(e) =>
                              updateFormField('motherName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={editFormData.phone || ''}
                              onChange={(e) =>
                                updateFormField('phone', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Emergency Contact
                            </label>
                            <input
                              type="tel"
                              value={editFormData.emergencyContact || ''}
                              onChange={(e) =>
                                updateFormField(
                                  'emergencyContact',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) =>
                              updateFormField('email', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo URL
                          </label>
                          <input
                            type="url"
                            value={editFormData.photo || ''}
                            onChange={(e) =>
                              updateFormField('photo', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Fee Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Fees
                            </label>
                            <input
                              type="number"
                              value={editFormData.fees?.totalFees || ''}
                              onChange={(e) =>
                                updateNestedField(
                                  'fees',
                                  'totalFees',
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Paid Fees
                            </label>
                            <input
                              type="number"
                              value={editFormData.fees?.paidFees || ''}
                              onChange={(e) =>
                                updateNestedField(
                                  'fees',
                                  'paidFees',
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pending Fees
                            </label>
                            <input
                              type="number"
                              value={editFormData.fees?.pendingFees || ''}
                              onChange={(e) =>
                                updateNestedField(
                                  'fees',
                                  'pendingFees',
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Payment Date
                          </label>
                          <input
                            type="date"
                            value={editFormData.fees?.lastPaymentDate || ''}
                            onChange={(e) =>
                              updateNestedField(
                                'fees',
                                'lastPaymentDate',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.name || ''}
                              onChange={(e) =>
                                updateAddFormField('name', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter student name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Roll Number{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.rollNumber || ''}
                              onChange={(e) =>
                                updateAddFormField('rollNumber', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter roll number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Class <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={addFormData.class || ''}
                              onChange={(e) =>
                                updateAddFormField('class', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Class</option>
                              {classes
                                .filter((c) => c !== 'All')
                                .map((cls) => (
                                  <option key={cls} value={cls}>
                                    {cls}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Section
                            </label>
                            <input
                              type="text"
                              value={addFormData.section || ''}
                              onChange={(e) =>
                                updateAddFormField('section', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="A"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={addFormData.dateOfBirth || ''}
                              onChange={(e) =>
                                updateAddFormField(
                                  'dateOfBirth',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <select
                              value={addFormData.gender || 'Male'}
                              onChange={(e) =>
                                updateAddFormField('gender', e.target.value)
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
                              Blood Group
                            </label>
                            <select
                              value={addFormData.bloodGroup || 'O+'}
                              onChange={(e) =>
                                updateAddFormField('bloodGroup', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Admission Date
                            </label>
                            <input
                              type="date"
                              value={addFormData.admissionDate || ''}
                              onChange={(e) =>
                                updateAddFormField(
                                  'admissionDate',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            value={addFormData.address || ''}
                            onChange={(e) =>
                              updateAddFormField('address', e.target.value)
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter student address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family & Contact Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Family & Contact Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Father&apos;s Name
                          </label>
                          <input
                            type="text"
                            value={addFormData.fatherName || ''}
                            onChange={(e) =>
                              updateAddFormField('fatherName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mother&apos;s Name
                          </label>
                          <input
                            type="text"
                            value={addFormData.motherName || ''}
                            onChange={(e) =>
                              updateAddFormField('motherName', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter mother's name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={addFormData.phone || ''}
                              onChange={(e) =>
                                updateAddFormField('phone', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Emergency Contact
                            </label>
                            <input
                              type="tel"
                              value={addFormData.emergencyContact || ''}
                              onChange={(e) =>
                                updateAddFormField(
                                  'emergencyContact',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter emergency contact"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={addFormData.email || ''}
                            onChange={(e) =>
                              updateAddFormField('email', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo URL
                          </label>
                          <input
                            type="url"
                            value={addFormData.photo || ''}
                            onChange={(e) =>
                              updateAddFormField('photo', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Fee Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Fees
                            </label>
                            <input
                              type="number"
                              value={addFormData.fees?.totalFees || ''}
                              onChange={(e) =>
                                updateAddFormNestedField(
                                  'fees',
                                  'totalFees',
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Paid Fees
                            </label>
                            <input
                              type="number"
                              value={addFormData.fees?.paidFees || ''}
                              onChange={(e) => {
                                const paidFees = parseInt(e.target.value) || 0;
                                const totalFees =
                                  addFormData.fees?.totalFees || 0;
                                updateAddFormNestedField(
                                  'fees',
                                  'paidFees',
                                  paidFees,
                                );
                                updateAddFormNestedField(
                                  'fees',
                                  'pendingFees',
                                  totalFees - paidFees,
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pending Fees
                            </label>
                            <input
                              type="number"
                              value={addFormData.fees?.pendingFees || ''}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                              placeholder="Auto calculated"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Payment Date
                          </label>
                          <input
                            type="date"
                            value={addFormData.fees?.lastPaymentDate || ''}
                            onChange={(e) =>
                              updateAddFormNestedField(
                                'fees',
                                'lastPaymentDate',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
