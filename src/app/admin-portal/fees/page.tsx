'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiService } from '@/services/api';

// Types
type FeeType =
  | 'Monthly Fee'
  | 'Exam Fee'
  | 'Registration Fee'
  | 'Admission Fee'
  | 'Other Fees';

interface FeeComponent {
  type: FeeType;
  amount: number;
  isPaid: boolean;
  dueDate?: string;
  month?: string;
}

interface FeeStructure {
  id: string;
  className: string;
  academicYear: string;
  totalAmount: number;
  components: {
    admissionFee: number;
    registrationFee: number;
    monthlyFees: { month: string; amount: number; dueDate: string }[];
    examFees: { name: string; amount: number; dueDate: string }[];
    otherFees: { name: string; amount: number; dueDate: string }[];
  };
}

interface StudentFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  rollNumber: string;
  email: string;
  phone: string;
  academicYear: string;
  feeStructure: FeeStructure;
  payments: Payment[];
  totalPaid: number;
  totalDue: number;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Pending';
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  feeType: FeeType;
  description: string;
  month?: string;
  method: 'Cash' | 'Online' | 'Cheque' | 'Bank Transfer' | 'UPI';
  receiptNumber: string;
  remarks: string;
}

interface ClassFeeSummary {
  className: string;
  totalStudents: number;
  totalCollected: number;
  totalDue: number;
  paidStudents: number;
  pendingStudents: number;
  overdueStudents: number;
}

// Helper function to map API fee types to our FeeType
const mapFeeType = (apiType: string): FeeType => {
  const lowerType = (apiType || '').toLowerCase();
  if (lowerType.includes('admission')) return 'Admission Fee';
  if (lowerType.includes('registration')) return 'Registration Fee';
  if (lowerType.includes('monthly') || lowerType.includes('tuition'))
    return 'Monthly Fee';
  if (lowerType.includes('exam')) return 'Exam Fee';
  return 'Other Fees';
};

export default function FeeManagementERP() {
  // View mode
  const [viewMode, setViewMode] = useState<'student' | 'class' | 'month'>(
    'student',
  );

  // Data states
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [allFeeRecords, setAllFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StudentFeeRecord[]>(
    [],
  );
  const [classSummaries, setClassSummaries] = useState<ClassFeeSummary[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [classIdMap, setClassIdMap] = useState<Map<string, string>>(new Map());
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  // Filter states
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [searchTerm, setSearchTerm] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showEditFeeStructureModal, setShowEditFeeStructureModal] =
    useState(false);
  const [showCreateFeeStructureModal, setShowCreateFeeStructureModal] =
    useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(
    null,
  );
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(
    null,
  );

  // Create fee structure form state
  const [createFeeStructureData, setCreateFeeStructureData] = useState({
    className: '',
    admissionFee: 0,
    registrationFee: 0,
    tuitionFees: 0,
    examFees: 0,
    otherFees: 0,
  });

  // Payment form states
  const [paymentData, setPaymentData] = useState({
    amount: '',
    feeType: 'Monthly Fee' as FeeType,
    description: '',
    month: '',
    method: 'Cash' as Payment['method'],
    receiptNumber: '',
    remarks: '',
  });

  const router = useRouter();

  const months = [
    'All',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
  ];

  const academicYears = ['2024-25', '2023-24', '2022-23'];

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

    loadFeeData();
  }, [router, selectedYear]);

  const loadFeeData = async () => {
    try {
      setLoading(true);
      const orgId = await ApiService.getCurrentOrgId();

      // Fetch classes
      const classesResponse = await ApiService.getClasses(orgId);
      const classNames = classesResponse.data.map(
        (classData) => `${classData.attributes.class}`,
      );

      // Build class ID mapping
      const idMap = new Map<string, string>();
      classesResponse.data.forEach((classData) => {
        idMap.set(classData.attributes.class, classData.id);
      });
      setClassIdMap(idMap);
      setClasses(['All', ...classNames]);

      // Fetch fee structures from API
      const feeStructuresResponse = await ApiService.getFeeStructures(orgId, {
        academic_year: selectedYear,
      }).catch(() => ({ data: [] }));

      // Fetch fees for all classes
      const allFeesPromises = classesResponse.data.map((classData) =>
        ApiService.getClassFees(orgId, classData.id, {
          academic_year: selectedYear,
        }).catch(() => ({ data: [] })),
      );

      const allFeesResponses = await Promise.all(allFeesPromises);
      const allFees = allFeesResponses.flatMap(
        (response) => response.data || [],
      );

      // Build map of fee structures by class
      const structuresByClass = new Map<string, any>();
      (feeStructuresResponse.data || []).forEach((structure: any) => {
        const className = structure.attributes.class_name;
        structuresByClass.set(className, structure);
      });

      // Create fee structures ONLY from API data (no defaults)
      const structures: FeeStructure[] = (feeStructuresResponse.data || [])
        .map((apiStructure: any) => {
          if (!apiStructure || !apiStructure.attributes.components) {
            return null;
          }

          const components = apiStructure.attributes.components;
          const className = apiStructure.attributes.class_name;
          const monthlyFees = months.slice(1).map((month) => ({
            month,
            amount: components.tuition_fees ? components.tuition_fees / 12 : 0,
            dueDate: `2024-${months.indexOf(month).toString().padStart(2, '0')}-05`,
          }));

          return {
            id: apiStructure.id,
            className,
            academicYear: apiStructure.attributes.academic_year,
            totalAmount: apiStructure.attributes.total_amount || 0,
            components: {
              admissionFee: components.admission_fee || 0,
              registrationFee: components.registration_fee || 0,
              monthlyFees,
              examFees: [
                {
                  name: 'Mid-Term Exam',
                  amount: components.exam_fees ? components.exam_fees / 2 : 0,
                  dueDate: '2024-09-15',
                },
                {
                  name: 'Final Exam',
                  amount: components.exam_fees ? components.exam_fees / 2 : 0,
                  dueDate: '2025-02-15',
                },
              ],
              otherFees: components.other_fees
                ? [
                    {
                      name: 'Other Fees',
                      amount: components.other_fees,
                      dueDate: '2024-04-15',
                    },
                  ]
                : [],
            },
          };
        })
        .filter((s: FeeStructure | null): s is FeeStructure => s !== null);
      setFeeStructures(structures);

      // Transform API fees into student fee records
      const records: StudentFeeRecord[] = allFees.map((feeData) => {
        const attributes = feeData.attributes;
        const classId = attributes.class_id;
        const className =
          classesResponse.data.find((c) => c.id === classId)?.attributes
            .class || 'Unknown';
        const structure =
          structures.find((s) => s.className === className) || structures[0];

        // Transform API payments
        const payments: Payment[] = (attributes.payments || []).map(
          (payment: any) => ({
            id: payment.id,
            date: payment.date,
            amount: payment.amount,
            feeType: mapFeeType(payment.description || attributes.fee_type),
            description: payment.description,
            month: payment.month,
            method: (payment.method as Payment['method']) || 'Cash',
            receiptNumber: payment.receipt_number,
            remarks: payment.remarks || '',
          }),
        );

        const totalPaid = attributes.total_paid || 0;
        const totalDue =
          attributes.total_due || attributes.remaining_amount || 0;

        // Determine status from API data
        const status: StudentFeeRecord['status'] =
          (attributes.status as StudentFeeRecord['status']) ||
          (totalDue === 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending');

        return {
          id: feeData.id,
          studentId: attributes.student_id,
          studentName: attributes.student_name || 'Unknown Student',
          class: className,
          rollNumber: attributes.roll_number || '',
          email: attributes.email || '',
          phone: attributes.phone || '',
          academicYear: attributes.academic_year || selectedYear,
          feeStructure: structure,
          payments,
          totalPaid,
          totalDue,
          status,
        };
      });

      setFeeRecords(records);
      setAllFeeRecords(records);
      setFilteredRecords(records);

      // Generate class summaries
      const summaries: ClassFeeSummary[] = classNames.map((className) => {
        const classRecords = records.filter((r) => r.class === className);
        return {
          className,
          totalStudents: classRecords.length,
          totalCollected: classRecords.reduce((sum, r) => sum + r.totalPaid, 0),
          totalDue: classRecords.reduce((sum, r) => sum + r.totalDue, 0),
          paidStudents: classRecords.filter((r) => r.status === 'Paid').length,
          pendingStudents: classRecords.filter((r) => r.status === 'Pending')
            .length,
          overdueStudents: classRecords.filter((r) => r.status === 'Overdue')
            .length,
        };
      });
      setClassSummaries(summaries);

      setLoading(false);
    } catch (error) {
      console.error('Error loading fee data:', error);
      setLoading(false);
    }
  };

  // Handle class selection to fetch students by class
  const handleClassSelection = async (className: string) => {
    setSelectedClass(className);

    // If "All" is selected, show all students
    if (className === 'All') {
      setFeeRecords(allFeeRecords);
      return;
    }

    // Get the class ID from the map
    const classId = classIdMap.get(className);
    if (!classId) {
      console.error(`No class ID found for class: ${className}`);
      return;
    }

    try {
      setFilterLoading(true);
      const orgId = await ApiService.getCurrentOrgId();

      // Fetch students for the selected class
      console.log(
        `🔵 Fetching fee records for class: ${className} (ID: ${classId})`,
      );
      const classStudentsResponse = await ApiService.getClassStudents(
        orgId,
        classId,
      );

      // Find the fee structure for this class
      const structure =
        feeStructures.find((s) => s.className === className) ||
        feeStructures[0];

      // Transform API response to fee records
      const records: StudentFeeRecord[] = classStudentsResponse.data.map(
        (studentData: any) => {
          // No payments - show as Pending
          const payments: Payment[] = [];
          const totalPaid = 0;
          const totalDue = structure.totalAmount;
          const status: StudentFeeRecord['status'] = 'Pending';

          return {
            id: studentData.id,
            studentId: studentData.attributes.student_id || studentData.id,
            studentName: `${studentData.attributes.first_name} ${studentData.attributes.last_name}`,
            class: className,
            rollNumber: studentData.attributes.roll_number || studentData.id,
            email: studentData.attributes.email,
            phone: studentData.attributes.phone,
            academicYear: selectedYear,
            feeStructure: structure,
            payments,
            totalPaid,
            totalDue,
            status,
          };
        },
      );

      console.log(
        `✅ Loaded ${records.length} fee records for class ${className}`,
      );
      setFeeRecords(records);
    } catch (error) {
      console.error('Error loading class fee records:', error);
      setFeeRecords([]);
    } finally {
      setFilterLoading(false);
    }
  };

  // Apply filters (status, month, search - class is handled by handleClassSelection)
  useEffect(() => {
    let filtered = feeRecords;

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (selectedMonth !== 'All') {
      filtered = filtered.filter((r) =>
        r.payments.some((p) => p.month === selectedMonth),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.rollNumber.includes(searchTerm) ||
          r.studentId.includes(searchTerm),
      );
    }

    setFilteredRecords(filtered);
  }, [selectedClass, selectedStatus, selectedMonth, searchTerm, feeRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = (record: StudentFeeRecord) => {
    setSelectedRecord(record);
    setPaymentData({
      amount: '',
      feeType: 'Monthly Fee',
      description: '',
      month: '',
      method: 'Cash',
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      remarks: '',
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedRecord || !paymentData.amount) return;

    try {
      const orgId = await ApiService.getCurrentOrgId();

      // We need the fee_id to record payment
      const feeId = selectedRecord.id;
      console.log('Recording payment for:', {
        orgId,
        feeId,
        studentName: selectedRecord.studentName,
        studentId: selectedRecord.studentId,
      });

      // Prepare payment data for API
      // Format date as DD/MM/YYYY
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      const paymentApiData = {
        amount: parseFloat(paymentData.amount),
        date: formattedDate,
        receipt_number: paymentData.receiptNumber,
        method: paymentData.method,
        description: paymentData.description || paymentData.feeType,
        month: paymentData.month || '',
        remarks: paymentData.remarks,
      };

      // Call API to record payment
      await ApiService.recordPayment(orgId, feeId, paymentApiData);

      alert(
        `Payment of ₹${paymentData.amount} recorded successfully for ${selectedRecord.studentName}`,
      );
      setShowPaymentModal(false);

      // Reload fee data to show updated information
      loadFeeData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const sendReminder = (record: StudentFeeRecord) => {
    alert(`Payment reminder sent to ${record.studentName} (${record.email})`);
  };

  // Create fee structure handler
  const handleCreateFeeStructure = async () => {
    try {
      if (!createFeeStructureData.className) {
        alert('Please select a class');
        return;
      }

      setLoading(true);
      const orgId = await ApiService.getCurrentOrgId();
      const classId = classIdMap.get(createFeeStructureData.className);

      if (!classId) {
        alert('Invalid class selected');
        setLoading(false);
        return;
      }

      await ApiService.createFeeStructure(orgId, classId, {
        class_name: createFeeStructureData.className,
        academic_year: selectedYear,
        components: {
          admission_fee: createFeeStructureData.admissionFee,
          registration_fee: createFeeStructureData.registrationFee,
          tuition_fees: createFeeStructureData.tuitionFees,
          exam_fees: createFeeStructureData.examFees,
          other_fees: createFeeStructureData.otherFees,
        },
      });

      alert('Fee structure created successfully!');
      setShowCreateFeeStructureModal(false);
      setCreateFeeStructureData({
        className: '',
        admissionFee: 0,
        registrationFee: 0,
        tuitionFees: 0,
        examFees: 0,
        otherFees: 0,
      });

      // Reload fee data
      await loadFeeData();
      setLoading(false);
    } catch (error) {
      console.error('Error creating fee structure:', error);
      alert('Failed to create fee structure. Please try again.');
      setLoading(false);
    }
  };

  // Delete fee structure handler
  const handleDeleteFeeStructure = async (
    structureId: string,
    className: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the fee structure for ${className}?`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const orgId = await ApiService.getCurrentOrgId();
      await ApiService.deleteFeeStructure(orgId, structureId);

      alert('Fee structure deleted successfully!');

      // Reload fee data
      await loadFeeData();
      setLoading(false);
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      alert('Failed to delete fee structure. Please try again.');
      setLoading(false);
    }
  };

  // Calculate overall statistics
  const totalCollected = feeRecords.reduce((sum, r) => sum + r.totalPaid, 0);
  const totalDue = feeRecords.reduce((sum, r) => sum + r.totalDue, 0);
  const totalExpected = totalCollected + totalDue;
  const collectionPercentage =
    totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  const paidCount = feeRecords.filter((r) => r.status === 'Paid').length;
  const overdueCount = feeRecords.filter((r) => r.status === 'Overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fee management system...</p>
        </div>
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
                Fee Management System
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    A.Y. {year}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFeeStructureModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Fee Structure
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Total Collected
              </p>
              <div className="bg-green-100 p-2 rounded-lg">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalCollected.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {collectionPercentage.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <div className="bg-red-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-red-600"
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
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalDue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending collection</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Fully Paid</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
            <p className="text-sm text-gray-600 mt-1">Students paid in full</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Overdue Alerts
              </p>
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
            <p className="text-sm text-gray-600 mt-1">Need follow-up</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setViewMode('student')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  viewMode === 'student'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Student-wise View
              </button>
              <button
                onClick={() => setViewMode('class')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  viewMode === 'class'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Class-wise Summary
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  viewMode === 'month'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Month-wise Collection
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassSelection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name, Roll No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
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
              <span className="text-sm font-medium">
                Loading fee records...
              </span>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'student' && (
          <div
            className={`bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden transition-opacity duration-200 ${filterLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Roll: {record.rollNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.class}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{record.feeStructure.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        ₹{record.totalPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        ₹{record.totalDue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              // Fetch student fees from API
                              const orgId = await ApiService.getCurrentOrgId();
                              const studentFeesResponse =
                                await ApiService.getStudentFees(
                                  orgId,
                                  record.studentId,
                                  {
                                    academic_year: selectedYear,
                                  },
                                );

                              // Update the record with fresh data from API
                              const updatedRecord = { ...record };

                              // Process the API response to update payments and fee details
                              if (
                                studentFeesResponse.data &&
                                studentFeesResponse.data.length > 0
                              ) {
                                const feeData = studentFeesResponse.data[0];
                                const attributes = feeData.attributes;

                                // Update payment information
                                updatedRecord.totalPaid =
                                  attributes.amount_paid || 0;
                                updatedRecord.totalDue =
                                  attributes.amount_due || 0;

                                // Update status based on API response
                                const status =
                                  attributes.payment_status?.toLowerCase();
                                if (
                                  status === 'completed' ||
                                  status === 'paid'
                                ) {
                                  updatedRecord.status = 'Paid';
                                } else if (status === 'partial') {
                                  updatedRecord.status = 'Partial';
                                } else if (status === 'overdue') {
                                  updatedRecord.status = 'Overdue';
                                } else {
                                  updatedRecord.status = 'Pending';
                                }

                                // Update payments array if available
                                if (
                                  attributes.payments &&
                                  Array.isArray(attributes.payments)
                                ) {
                                  updatedRecord.payments =
                                    attributes.payments.map(
                                      (p: any, idx: number) => ({
                                        id: `payment-${idx}`,
                                        date:
                                          p.payment_date ||
                                          new Date()
                                            .toISOString()
                                            .split('T')[0],
                                        amount: p.amount || 0,
                                        feeType: mapFeeType(p.fee_type || ''),
                                        description: p.description || '',
                                        method: p.payment_method || 'Cash',
                                        receiptNumber:
                                          p.receipt_number || `RCP-${idx + 1}`,
                                        remarks: p.remarks || '',
                                      }),
                                    );
                                }
                              }

                              setSelectedRecord(updatedRecord);
                              setShowDetailsModal(true);
                            } catch (error) {
                              console.error(
                                'Error fetching student fees:',
                                error,
                              );
                              // Fall back to showing existing record data
                              setSelectedRecord(record);
                              setShowDetailsModal(true);
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </button>
                        {record.status !== 'Paid' && (
                          <>
                            <button
                              onClick={() => handlePayment(record)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => sendReminder(record)}
                              className="text-orange-600 hover:text-orange-900 font-medium"
                            >
                              Remind
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No records found</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'class' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classSummaries
              .filter(
                (s) => selectedClass === 'All' || s.className === selectedClass,
              )
              .map((summary) => (
                <div
                  key={summary.className}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {summary.className}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Students:
                      </span>
                      <span className="text-sm font-semibold">
                        {summary.totalStudents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collected:</span>
                      <span className="text-sm font-semibold text-green-600">
                        ₹{summary.totalCollected.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due:</span>
                      <span className="text-sm font-semibold text-red-600">
                        ₹{summary.totalDue.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">
                          Paid: {summary.paidStudents}
                        </span>
                        <span className="text-gray-600">
                          Pending: {summary.pendingStudents}
                        </span>
                        <span className="text-red-600">
                          Overdue: {summary.overdueStudents}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Month-wise Collection Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {months.slice(1).map((month) => {
                const monthPayments = feeRecords.flatMap((r) =>
                  r.payments.filter((p) => p.month === month),
                );
                const monthTotal = monthPayments.reduce(
                  (sum, p) => sum + p.amount,
                  0,
                );
                const monthCount = monthPayments.length;

                return (
                  <div
                    key={month}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {month}
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{monthTotal.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {monthCount} transactions
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-md w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Record Payment
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Student</p>
              <p className="text-lg font-semibold">
                {selectedRecord.studentName} ({selectedRecord.class})
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentData.feeType}
                onChange={(e) => {
                  const feeType = e.target.value as FeeType;
                  let amount = '';
                  let description = '';
                  let month = '';

                  // Auto-fill amount based on fee type
                  if (feeType === 'Admission Fee') {
                    amount =
                      selectedRecord.feeStructure.components.admissionFee.toString();
                    description = 'Admission Fee';
                  } else if (feeType === 'Registration Fee') {
                    amount =
                      selectedRecord.feeStructure.components.registrationFee.toString();
                    description = 'Registration Fee';
                  } else if (feeType === 'Monthly Fee') {
                    const firstUnpaid =
                      selectedRecord.feeStructure.components.monthlyFees.find(
                        (m) =>
                          !selectedRecord.payments.some(
                            (p) =>
                              p.month === m.month &&
                              p.feeType === 'Monthly Fee',
                          ),
                      );
                    amount = firstUnpaid?.amount.toString() || '5000';
                    month = firstUnpaid?.month || '';
                    description = firstUnpaid
                      ? `Monthly Fee - ${firstUnpaid.month}`
                      : 'Monthly Fee';
                  } else if (feeType === 'Exam Fee') {
                    const firstUnpaid =
                      selectedRecord.feeStructure.components.examFees.find(
                        (e) =>
                          !selectedRecord.payments.some(
                            (p) => p.description === e.name,
                          ),
                      );
                    amount = firstUnpaid?.amount.toString() || '1500';
                    description = firstUnpaid?.name || 'Exam Fee';
                  } else if (feeType === 'Other Fees') {
                    const firstUnpaid =
                      selectedRecord.feeStructure.components.otherFees.find(
                        (o) =>
                          !selectedRecord.payments.some(
                            (p) => p.description === o.name,
                          ),
                      );
                    amount = firstUnpaid?.amount.toString() || '1000';
                    description = firstUnpaid?.name || 'Other Fees';
                  }

                  setPaymentData({
                    ...paymentData,
                    feeType,
                    amount,
                    description,
                    month,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Monthly Fee">Monthly Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Registration Fee">Registration Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Other Fees">Other Fees</option>
              </select>
            </div>

            {paymentData.feeType === 'Monthly Fee' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentData.month}
                  onChange={(e) => {
                    const monthFee =
                      selectedRecord.feeStructure.components.monthlyFees.find(
                        (m) => m.month === e.target.value,
                      );
                    setPaymentData({
                      ...paymentData,
                      month: e.target.value,
                      amount: monthFee?.amount.toString() || '',
                      description: `Monthly Fee - ${e.target.value}`,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Month</option>
                  {selectedRecord.feeStructure.components.monthlyFees.map(
                    (monthFee) => (
                      <option key={monthFee.month} value={monthFee.month}>
                        {monthFee.month} - ₹{monthFee.amount.toLocaleString()}{' '}
                        (Due: {monthFee.dueDate})
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={paymentData.description}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Payment description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.method}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    method: e.target.value as Payment['method'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number
              </label>
              <input
                type="text"
                value={paymentData.receiptNumber}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    receiptNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={paymentData.remarks}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, remarks: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={submitPayment}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
              >
                Record Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Fee Details - {selectedRecord.studentName}
            </h2>

            {/* Student Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-semibold text-gray-900">
                  {selectedRecord.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="font-semibold text-gray-900">
                  {selectedRecord.class}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {selectedRecord.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">
                  {selectedRecord.phone}
                </p>
              </div>
            </div>

            {/* Fee Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Fee Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Fee:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{selectedRecord.feeStructure.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Paid Amount:</span>
                  <span className="font-semibold text-green-600">
                    ₹{selectedRecord.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700">Due Amount:</span>
                  <span className="font-semibold text-red-600">
                    ₹{selectedRecord.totalDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Components Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Fee Components Status
              </h3>
              <div className="space-y-4">
                {/* Admission Fee */}
                <div className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Admission Fee</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹
                        {selectedRecord.feeStructure.components.admissionFee.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${selectedRecord.payments.some((p) => p.feeType === 'Admission Fee') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {selectedRecord.payments.some(
                          (p) => p.feeType === 'Admission Fee',
                        )
                          ? 'Paid'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration Fee */}
                <div className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        Registration Fee
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹
                        {selectedRecord.feeStructure.components.registrationFee.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${selectedRecord.payments.some((p) => p.feeType === 'Registration Fee') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {selectedRecord.payments.some(
                          (p) => p.feeType === 'Registration Fee',
                        )
                          ? 'Paid'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monthly Fees */}
                <div className="border-b pb-3">
                  <p className="font-medium text-gray-900 mb-2">Monthly Fees</p>
                  <div className="space-y-2 ml-4">
                    {selectedRecord.feeStructure.components.monthlyFees.map(
                      (monthFee) => {
                        const paid = selectedRecord.payments.some(
                          (p) =>
                            p.month === monthFee.month &&
                            p.feeType === 'Monthly Fee',
                        );
                        return (
                          <div
                            key={monthFee.month}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {monthFee.month}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                ₹{monthFee.amount.toLocaleString()}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                              >
                                {paid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Exam Fees */}
                <div className="border-b pb-3">
                  <p className="font-medium text-gray-900 mb-2">Exam Fees</p>
                  <div className="space-y-2 ml-4">
                    {selectedRecord.feeStructure.components.examFees.map(
                      (examFee) => {
                        const paid = selectedRecord.payments.some(
                          (p) => p.description === examFee.name,
                        );
                        return (
                          <div
                            key={examFee.name}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {examFee.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                ₹{examFee.amount.toLocaleString()}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                              >
                                {paid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Other Fees */}
                <div>
                  <p className="font-medium text-gray-900 mb-2">Other Fees</p>
                  <div className="space-y-2 ml-4">
                    {selectedRecord.feeStructure.components.otherFees.map(
                      (otherFee) => {
                        const paid = selectedRecord.payments.some(
                          (p) => p.description === otherFee.name,
                        );
                        return (
                          <div
                            key={otherFee.name}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {otherFee.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                ₹{otherFee.amount.toLocaleString()}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                              >
                                {paid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Payment History
              </h3>
              {selectedRecord.payments.length > 0 ? (
                <div className="space-y-3">
                  {selectedRecord.payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-green-600">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.date}
                            {payment.month ? ` - ${payment.month}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                            {payment.feeType}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {payment.method}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {payment.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Receipt: {payment.receiptNumber}
                      </p>
                      {payment.remarks && (
                        <p className="text-sm text-gray-500 mt-1">
                          Remarks: {payment.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No payments recorded yet
                </p>
              )}
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Fee Structure Modal */}
      {showFeeStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Fee Structure - Academic Year {selectedYear}
              </h2>
              <button
                onClick={() => setShowCreateFeeStructureModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                + Create New
              </button>
            </div>

            {feeStructures.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No fee structures found</p>
                <p className="text-sm">
                  Click &quot;Create New&quot; to add a fee structure
                </p>
              </div>
            ) : null}

            {feeStructures.map((structure) => (
              <div
                key={structure.id}
                className="mb-6 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {structure.className}
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-indigo-600">
                      ₹{structure.totalAmount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => {
                        setEditingStructure(structure);
                        setShowEditFeeStructureModal(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteFeeStructure(
                          structure.id,
                          structure.className,
                        )
                      }
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Admission & Registration */}
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900">Admission Fee</p>
                    <p className="font-semibold text-blue-900">
                      ₹{structure.components.admissionFee.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900">
                      Registration Fee
                    </p>
                    <p className="font-semibold text-blue-900">
                      ₹{structure.components.registrationFee.toLocaleString()}
                    </p>
                  </div>

                  {/* Monthly Fees */}
                  <div className="p-2 bg-green-50 rounded">
                    <p className="font-medium text-green-900 mb-2">
                      Monthly Fees (₹
                      {structure.components.monthlyFees[0]?.amount.toLocaleString()}
                      /month)
                    </p>
                    <p className="text-sm text-green-700">
                      12 months × ₹
                      {structure.components.monthlyFees[0]?.amount.toLocaleString()}{' '}
                      = ₹
                      {(
                        structure.components.monthlyFees[0]?.amount * 12 || 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Exam Fees */}
                  <div className="p-2 bg-yellow-50 rounded">
                    <p className="font-medium text-yellow-900 mb-1">
                      Exam Fees
                    </p>
                    {structure.components.examFees.map((exam) => (
                      <div
                        key={exam.name}
                        className="flex justify-between text-sm text-yellow-800"
                      >
                        <span>{exam.name}</span>
                        <span>₹{exam.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Other Fees */}
                  <div className="p-2 bg-purple-50 rounded">
                    <p className="font-medium text-purple-900 mb-1">
                      Other Fees
                    </p>
                    {structure.components.otherFees.map((other) => (
                      <div
                        key={other.name}
                        className="flex justify-between text-sm text-purple-800"
                      >
                        <span>{other.name}</span>
                        <span>₹{other.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowFeeStructureModal(false)}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Fee Structure Modal */}
      {showEditFeeStructureModal && editingStructure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Fee Structure - {editingStructure.className}
            </h2>

            <div className="space-y-6">
              {/* Admission Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Fee
                </label>
                <input
                  type="number"
                  value={editingStructure.components.admissionFee}
                  onChange={(e) => {
                    const newStructure = {
                      ...editingStructure,
                      components: {
                        ...editingStructure.components,
                        admissionFee: parseInt(e.target.value) || 0,
                      },
                    };
                    setEditingStructure(newStructure);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Enter admission fee"
                />
              </div>

              {/* Registration Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Fee
                </label>
                <input
                  type="number"
                  value={editingStructure.components.registrationFee}
                  onChange={(e) => {
                    const newStructure = {
                      ...editingStructure,
                      components: {
                        ...editingStructure.components,
                        registrationFee: parseInt(e.target.value) || 0,
                      },
                    };
                    setEditingStructure(newStructure);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Enter registration fee"
                />
              </div>

              {/* Monthly Fee Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Fee (per month)
                </label>
                <input
                  type="number"
                  value={
                    editingStructure.components.monthlyFees[0]?.amount || 0
                  }
                  onChange={(e) => {
                    const newAmount = parseInt(e.target.value) || 0;
                    const newMonthlyFees =
                      editingStructure.components.monthlyFees.map((mf) => ({
                        ...mf,
                        amount: newAmount,
                      }));
                    const newStructure = {
                      ...editingStructure,
                      components: {
                        ...editingStructure.components,
                        monthlyFees: newMonthlyFees,
                      },
                    };
                    setEditingStructure(newStructure);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Enter monthly fee"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Total for 12 months: ₹
                  {(
                    (editingStructure.components.monthlyFees[0]?.amount || 0) *
                    12
                  ).toLocaleString()}
                </p>
              </div>

              {/* Exam Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Fees
                </label>
                <div className="space-y-2">
                  {editingStructure.components.examFees.map((exam, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={exam.name}
                        onChange={(e) => {
                          const newExamFees = [
                            ...editingStructure.components.examFees,
                          ];
                          newExamFees[index] = {
                            ...exam,
                            name: e.target.value,
                          };
                          setEditingStructure({
                            ...editingStructure,
                            components: {
                              ...editingStructure.components,
                              examFees: newExamFees,
                            },
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Exam name"
                      />
                      <input
                        type="number"
                        value={exam.amount}
                        onChange={(e) => {
                          const newExamFees = [
                            ...editingStructure.components.examFees,
                          ];
                          newExamFees[index] = {
                            ...exam,
                            amount: parseInt(e.target.value) || 0,
                          };
                          setEditingStructure({
                            ...editingStructure,
                            components: {
                              ...editingStructure.components,
                              examFees: newExamFees,
                            },
                          });
                        }}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Amount"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Fees
                </label>
                <div className="space-y-2">
                  {editingStructure.components.otherFees.map((other, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={other.name}
                        onChange={(e) => {
                          const newOtherFees = [
                            ...editingStructure.components.otherFees,
                          ];
                          newOtherFees[index] = {
                            ...other,
                            name: e.target.value,
                          };
                          setEditingStructure({
                            ...editingStructure,
                            components: {
                              ...editingStructure.components,
                              otherFees: newOtherFees,
                            },
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Fee name"
                      />
                      <input
                        type="number"
                        value={other.amount}
                        onChange={(e) => {
                          const newOtherFees = [
                            ...editingStructure.components.otherFees,
                          ];
                          newOtherFees[index] = {
                            ...other,
                            amount: parseInt(e.target.value) || 0,
                          };
                          setEditingStructure({
                            ...editingStructure,
                            components: {
                              ...editingStructure.components,
                              otherFees: newOtherFees,
                            },
                          });
                        }}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Amount"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    New Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹
                    {(
                      editingStructure.components.admissionFee +
                      editingStructure.components.registrationFee +
                      (editingStructure.components.monthlyFees[0]?.amount ||
                        0) *
                        12 +
                      editingStructure.components.examFees.reduce(
                        (sum, e) => sum + e.amount,
                        0,
                      ) +
                      editingStructure.components.otherFees.reduce(
                        (sum, o) => sum + o.amount,
                        0,
                      )
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    // Calculate new total
                    const monthlyTotal =
                      (editingStructure.components.monthlyFees[0]?.amount ||
                        0) * 12;
                    const examTotal =
                      editingStructure.components.examFees.reduce(
                        (sum, e) => sum + e.amount,
                        0,
                      );
                    const otherTotal =
                      editingStructure.components.otherFees.reduce(
                        (sum, o) => sum + o.amount,
                        0,
                      );
                    const newTotal =
                      editingStructure.components.admissionFee +
                      editingStructure.components.registrationFee +
                      monthlyTotal +
                      examTotal +
                      otherTotal;

                    // Get orgId and classId
                    const orgId = await ApiService.getCurrentOrgId();
                    const classId = classIdMap.get(editingStructure.className);

                    if (!classId) {
                      alert('Class ID not found');
                      return;
                    }

                    // Prepare API payload
                    const feeStructureData = {
                      class_name: editingStructure.className,
                      academic_year: editingStructure.academicYear,
                      components: {
                        admission_fee: editingStructure.components.admissionFee,
                        registration_fee:
                          editingStructure.components.registrationFee,
                        tuition_fees: monthlyTotal,
                        exam_fees: examTotal,
                        other_fees: otherTotal,
                      },
                    };

                    // Call API to update fee structure
                    await ApiService.updateFeeStructure(
                      orgId,
                      editingStructure.id,
                      feeStructureData,
                    );
                    alert('Fee structure updated successfully!');

                    // Update the fee structure in the state
                    const updatedStructures = feeStructures.map((s) =>
                      s.id === editingStructure.id
                        ? { ...editingStructure, totalAmount: newTotal }
                        : s,
                    );
                    setFeeStructures(updatedStructures);

                    // Update all fee records with this class to use the new structure
                    const updatedRecords = allFeeRecords.map((record) => {
                      if (record.class === editingStructure.className) {
                        const newDue = newTotal - record.totalPaid;
                        return {
                          ...record,
                          feeStructure: {
                            ...editingStructure,
                            totalAmount: newTotal,
                          },
                          totalDue: newDue,
                          status:
                            record.totalPaid >= newTotal
                              ? 'Paid'
                              : record.totalPaid > 0
                                ? 'Partial'
                                : ('Pending' as
                                    | 'Paid'
                                    | 'Partial'
                                    | 'Overdue'
                                    | 'Pending'),
                        };
                      }
                      return record;
                    });
                    setAllFeeRecords(updatedRecords);
                    setFeeRecords(updatedRecords);
                    setFilteredRecords(updatedRecords);

                    // Close modal
                    setShowEditFeeStructureModal(false);
                    setEditingStructure(null);

                    // Reload data to get fresh API data
                    loadFeeData();
                  } catch (error) {
                    console.error('Error saving fee structure:', error);
                    alert('Failed to save fee structure. Please try again.');
                  }
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditFeeStructureModal(false);
                  setEditingStructure(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Fee Structure Modal */}
      {showCreateFeeStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Fee Structure
            </h2>

            <div className="space-y-6">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class *
                </label>
                <select
                  value={createFeeStructureData.className}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      className: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a class...</option>
                  {classes
                    .filter((c) => c !== 'All')
                    .filter(
                      (c) => !feeStructures.find((s) => s.className === c),
                    )
                    .map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                </select>
              </div>

              {/* Admission Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Fee (₹)
                </label>
                <input
                  type="number"
                  value={createFeeStructureData.admissionFee}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      admissionFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Registration Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Fee (₹)
                </label>
                <input
                  type="number"
                  value={createFeeStructureData.registrationFee}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      registrationFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tuition Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Tuition Fees (₹) - Annual
                </label>
                <input
                  type="number"
                  value={createFeeStructureData.tuitionFees}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      tuitionFees: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Monthly: ₹
                  {(createFeeStructureData.tuitionFees / 12).toFixed(2)}
                </p>
              </div>

              {/* Exam Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Exam Fees (₹)
                </label>
                <input
                  type="number"
                  value={createFeeStructureData.examFees}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      examFees: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Other Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Fees (₹)
                </label>
                <input
                  type="number"
                  value={createFeeStructureData.otherFees}
                  onChange={(e) =>
                    setCreateFeeStructureData({
                      ...createFeeStructureData,
                      otherFees: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Total Display */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-indigo-900">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹
                    {(
                      createFeeStructureData.admissionFee +
                      createFeeStructureData.registrationFee +
                      createFeeStructureData.tuitionFees +
                      createFeeStructureData.examFees +
                      createFeeStructureData.otherFees
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateFeeStructure}
                disabled={!createFeeStructureData.className}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Fee Structure
              </button>
              <button
                onClick={() => {
                  setShowCreateFeeStructureModal(false);
                  setCreateFeeStructureData({
                    className: '',
                    admissionFee: 0,
                    registrationFee: 0,
                    tuitionFees: 0,
                    examFees: 0,
                    otherFees: 0,
                  });
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
