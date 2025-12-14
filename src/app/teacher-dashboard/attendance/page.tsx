'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ApiService } from '@/services/api';

interface AttendanceRecord {
  class_id: string;
  student_id: string;
  status: string; // 'P' = Present, 'A' = Absent, 'L' = Late, 'E' = Excused
  date: string;
  student_roll_no: string;
  student_name?: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface AttendanceContentProps {
  userData: UserData;
}

function AttendanceContent({ userData }: AttendanceContentProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Map<string, string>
  >(new Map());
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedDate] = useState<string>(todayDate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    Array<{ date: string; status: string }>
  >([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7), // YYYY-MM format
  );
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  const orgId = userData.orgId || '68d6b128d88f00c8b1b4a89a';

  // Load classes where teacher is assigned
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const classesData = await ApiService.getClasses(orgId);

        const allowedTeams = userData.allowedTeams || [];

        // Filter classes based on permissions
        const myClasses = classesData.data
          .filter((classItem: any) => {
            const teamId = classItem.id;
            const classAttrs = classItem.attributes;

            return (
              allowedTeams.includes(teamId) ||
              classAttrs.teacher_id === userData.userId ||
              (classAttrs as any).class_teacher_id === userData.userId
            );
          })
          .map((classItem: any) => ({
            id: classItem.id,
            name: classItem.attributes.class,
            section: classItem.attributes.section,
          }));

        setClasses(myClasses);
        if (myClasses.length > 0) {
          setSelectedClass(myClasses[0]);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [orgId, userData]);

  // Load students and attendance when class or date changes
  useEffect(() => {
    if (!selectedClass) return;

    const loadAttendanceData = async () => {
      try {
        setIsLoading(true);

        // Load students
        const studentsData = await ApiService.getClassStudents(
          orgId,
          selectedClass.id,
        );

        const studentsList: Student[] = studentsData.data.map((s: any) => ({
          id: s.attributes.student_id || s.id,
          name: `${s.attributes.first_name || ''} ${s.attributes.last_name || ''}`.trim(),
          rollNumber: s.attributes.roll_number || 'N/A',
          email: s.attributes.email,
        }));

        setStudents(studentsList);

        // Load existing attendance for selected date
        try {
          const attendanceData = await ApiService.getClassAttendance(
            orgId,
            selectedClass.id,
          );

          // Parse attendance data
          const records = new Map<string, string>();

          // First, initialize all students with 'P' (Present)
          studentsList.forEach((student) => {
            records.set(student.id, 'P');
          });

          // Then, override with actual attendance data if it exists for the selected date
          if (attendanceData.data && attendanceData.data.attributes) {
            const attrs = attendanceData.data.attributes;
            const attendanceList = Array.isArray(attrs) ? attrs : [attrs];

            attendanceList.forEach((record: AttendanceRecord) => {
              // Filter by selected date and override default
              if (record.date === formatDateForAPI(selectedDate)) {
                records.set(record.student_id, record.status);
              }
            });
          }

          setAttendanceRecords(records);
          setHasUnsavedChanges(false);
        } catch (error) {
          console.log('No existing attendance data for this date');
          // Initialize with default 'P' (Present) for all students
          const defaultRecords = new Map<string, string>();
          studentsList.forEach((student) => {
            defaultRecords.set(student.id, 'P');
          });
          setAttendanceRecords(defaultRecords);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [selectedClass, orgId]);

  const formatDateForAPI = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, status);
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    const newRecords = new Map<string, string>();
    students.forEach((student) => {
      newRecords.set(student.id, 'P');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const handleMarkAllAbsent = () => {
    const newRecords = new Map<string, string>();
    students.forEach((student) => {
      newRecords.set(student.id, 'A');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;

    try {
      setIsSaving(true);

      const attendanceData: AttendanceRecord[] = students.map((student) => ({
        class_id: selectedClass.id,
        student_id: student.id,
        status: attendanceRecords.get(student.id) || 'P',
        date: formatDateForAPI(selectedDate),
        student_roll_no: student.rollNumber,
      }));

      await ApiService.submitClassAttendance(
        orgId,
        selectedClass.id,
        attendanceData,
      );

      setHasUnsavedChanges(false);
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStats = () => {
    let present = 0;
    let absent = 0;
    let late = 0;

    attendanceRecords.forEach((status) => {
      switch (status) {
        case 'P':
          present++;
          break;
        case 'A':
          absent++;
          break;
        case 'L':
          late++;
          break;
      }
    });

    return { present, absent, late };
  };

  const stats = getAttendanceStats();

  const handleViewMonthlyAttendance = async (student: Student) => {
    setSelectedStudent(student);
    setShowMonthlyModal(true);
    await loadMonthlyAttendance(student.id, selectedMonth);
  };

  const loadMonthlyAttendance = async (studentId: string, month: string) => {
    try {
      setIsLoadingMonthly(true);
      // Convert from YYYY-MM to MM-YYYY format for API
      const [year, monthNum] = month.split('-');
      const apiMonth = `${monthNum}-${year}`;

      const data = await ApiService.getStudentMonthlyAttendance(
        orgId,
        studentId,
        apiMonth,
      );

      setMonthlyAttendance(data.data || []);
    } catch (error) {
      console.error('Error loading monthly attendance:', error);
      setMonthlyAttendance([]);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    if (selectedStudent) {
      loadMonthlyAttendance(selectedStudent.id, newMonth);
    }
  };

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getAttendanceForDate = (day: number) => {
    const [year, month] = selectedMonth.split('-');
    const dateStr = `${day.toString().padStart(2, '0')}/${month}/${year}`;
    return monthlyAttendance.find((a) => a.date === dateStr);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
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
                Attendance Management
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {userData.firstName} {userData.lastName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {classes.length > 0 ? (
          <div className="space-y-6">
            {/* Class Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class
                  </label>
                  <select
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const cls = classes.find((c) => c.id === e.target.value);
                      setSelectedClass(cls || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - Section {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-900 font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                      Today
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.present}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.absent}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-red-600"
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
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.late}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mark All Present
                  </button>
                  <button
                    onClick={handleMarkAllAbsent}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm font-medium"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Mark All Absent
                  </button>
                </div>

                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-orange-600 font-medium flex items-center">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Unsaved changes
                    </span>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={isSaving}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
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
                          Saving...
                        </>
                      ) : (
                        <>
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
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          Save Attendance
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Student Attendance ({students.length} students)
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => {
                      const status = attendanceRecords.get(student.id) || 'P';
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.rollNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'P')
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  status === 'P'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                }`}
                                title="Present"
                              >
                                P
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'A')
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  status === 'A'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                }`}
                                title="Absent"
                              >
                                A
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(student.id, 'L')
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  status === 'L'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                                }`}
                                title="Late"
                              >
                                L
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() =>
                                handleViewMonthlyAttendance(student)
                              }
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium flex items-center mx-auto"
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              View Monthly
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
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
              No classes assigned
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to be assigned to a class to manage attendance.
            </p>
          </div>
        )}
      </main>

      {/* Monthly Attendance Modal */}
      {showMonthlyModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Monthly Attendance - {selectedStudent.name}
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Roll No: {selectedStudent.rollNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowMonthlyModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
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
            </div>

            {/* Month Selector */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Select Month:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  max={new Date().toISOString().slice(0, 7)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Body - Calendar View */}
            <div className="px-6 py-6">
              {isLoadingMonthly ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center font-semibold text-gray-700 py-2 text-sm"
                        >
                          {day}
                        </div>
                      ),
                    )}

                    {/* Calendar days */}
                    {Array.from(
                      { length: getDaysInMonth(selectedMonth) },
                      (_, i) => i + 1,
                    ).map((day) => {
                      const [year, month] = selectedMonth
                        .split('-')
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      const dayOfWeek = date.getDay();
                      const attendance = getAttendanceForDate(day);
                      const isToday =
                        new Date().toDateString() === date.toDateString();

                      // Add empty cells for the first week to align with the correct day
                      if (day === 1) {
                        return (
                          <React.Fragment key={`day-${day}`}>
                            {Array.from({ length: dayOfWeek }).map((_, i) => (
                              <div
                                key={`empty-${i}`}
                                className="aspect-square"
                              />
                            ))}
                            <div
                              className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                                isToday
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200'
                              } ${
                                attendance
                                  ? attendance.status === 'P'
                                    ? 'bg-green-50 border-green-300'
                                    : attendance.status === 'A'
                                      ? 'bg-red-50 border-red-300'
                                      : attendance.status === 'L'
                                        ? 'bg-yellow-50 border-yellow-300'
                                        : 'bg-gray-50'
                                  : 'bg-white'
                              }`}
                            >
                              <span className="text-sm font-semibold text-gray-900">
                                {day}
                              </span>
                              {attendance && (
                                <span
                                  className={`text-xs font-bold mt-1 px-2 py-0.5 rounded ${
                                    attendance.status === 'P'
                                      ? 'bg-green-600 text-white'
                                      : attendance.status === 'A'
                                        ? 'bg-red-600 text-white'
                                        : attendance.status === 'L'
                                          ? 'bg-yellow-600 text-white'
                                          : 'bg-gray-600 text-white'
                                  }`}
                                >
                                  {attendance.status}
                                </span>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      }

                      return (
                        <div
                          key={`day-${day}`}
                          className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                            isToday
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200'
                          } ${
                            attendance
                              ? attendance.status === 'P'
                                ? 'bg-green-50 border-green-300'
                                : attendance.status === 'A'
                                  ? 'bg-red-50 border-red-300'
                                  : attendance.status === 'L'
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-gray-50'
                              : 'bg-white'
                          }`}
                        >
                          <span className="text-sm font-semibold text-gray-900">
                            {day}
                          </span>
                          {attendance && (
                            <span
                              className={`text-xs font-bold mt-1 px-2 py-0.5 rounded ${
                                attendance.status === 'P'
                                  ? 'bg-green-600 text-white'
                                  : attendance.status === 'A'
                                    ? 'bg-red-600 text-white'
                                    : attendance.status === 'L'
                                      ? 'bg-yellow-600 text-white'
                                      : 'bg-gray-600 text-white'
                              }`}
                            >
                              {attendance.status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Legend:
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-600 rounded mr-2"></div>
                        <span className="text-sm text-gray-700">
                          Present (P)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-600 rounded mr-2"></div>
                        <span className="text-sm text-gray-700">
                          Absent (A)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-600 rounded mr-2"></div>
                        <span className="text-sm text-gray-700">Late (L)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-700">No Record</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600">Present</p>
                        <p className="text-xl font-bold text-green-600">
                          {
                            monthlyAttendance.filter((a) => a.status === 'P')
                              .length
                          }
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-gray-600">Absent</p>
                        <p className="text-xl font-bold text-red-600">
                          {
                            monthlyAttendance.filter((a) => a.status === 'A')
                              .length
                          }
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <p className="text-xs text-gray-600">Late</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {
                            monthlyAttendance.filter((a) => a.status === 'L')
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherAttendancePage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'faculty', 'admin']}>
      {(userData) => <AttendanceContent userData={userData} />}
    </DashboardWrapper>
  );
}
