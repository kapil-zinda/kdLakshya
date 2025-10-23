'use client';

import React, { useEffect, useState } from 'react';

import Api from '@/services/api';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// Add global styles for print media
const printStyles = `
  @media print {
    /* Hide everything by default */
    body * {
      visibility: hidden;
    }

    /* Show only print content */
    .print-only,
    .print-only * {
      visibility: visible !important;
    }

    /* Position print content at top */
    .print-only {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px !important;
      margin: 0 !important;
      background: white !important;
    }

    /* Reset colors for printing */
    .print-only * {
      color: black !important;
      background: white !important;
      border-color: black !important;
    }

    /* Ensure tables print properly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    th, td {
      border: 1px solid black !important;
      padding: 8px !important;
      text-align: left !important;
    }

    /* Reset page margins */
    @page {
      margin: 2cm;
    }
  }
`;

interface AttendanceData {
  month: string;
  year: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  holidayDays: number;
  attendancePercentage: number;
  dailyStatus: {
    date: string;
    day: string;
    status: 'present' | 'absent' | 'late' | 'holiday';
  }[];
}

const StudentAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [studentData, setStudentData] = useState<{
    firstName?: string;
    lastName?: string;
    rollNumber?: string;
    gradeLevel?: string;
    dateOfBirth?: string;
    guardianInfo?: {
      father_name?: string;
    };
  } | null>(null);

  // Default to current month
  const now = new Date();
  const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get student data from localStorage
        const storedStudentData = localStorage.getItem('studentAuth');
        if (!storedStudentData) {
          throw new Error('No student data found');
        }

        const parsed = JSON.parse(storedStudentData);
        setStudentData(parsed);

        if (!parsed.orgId || !parsed.id) {
          throw new Error('Missing student or organization ID');
        }

        // Fetch attendance for the selected month
        const response = await Api.getStudentMonthlyAttendance(
          parsed.orgId,
          parsed.id,
          selectedMonth,
        );

        if (response?.data && Array.isArray(response.data)) {
          // API returns: { data: [{ date: "12/07/2017", status: "P" }] }
          // Status codes: P=Present, A=Absent, L=Late, H=Holiday

          const [monthNum, yearNum] = selectedMonth.split('-');
          const monthDate = new Date(parseInt(yearNum), parseInt(monthNum) - 1);

          // Calculate statistics from daily status
          let presentDays = 0;
          let absentDays = 0;
          let lateDays = 0;
          let holidayDays = 0;

          const dailyStatus = response.data.map(
            (item: { date: string; status: string }) => {
              const statusMap: {
                [key: string]: 'present' | 'absent' | 'late' | 'holiday';
              } = {
                P: 'present',
                A: 'absent',
                L: 'late',
                H: 'holiday',
              };

              const status = statusMap[item.status] || 'absent';

              // Count each status
              if (status === 'present') presentDays++;
              else if (status === 'absent') absentDays++;
              else if (status === 'late') lateDays++;
              else if (status === 'holiday') holidayDays++;

              // Parse date and get day name
              const dateParts = item.date.split('/');
              const dateObj = new Date(
                parseInt(dateParts[2]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[0]),
              );

              return {
                date: dateObj.toISOString().split('T')[0],
                day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                status,
              };
            },
          );

          const totalDays = dailyStatus.length;
          const workingDays = totalDays - holidayDays;
          const attendancePercentage =
            workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

          const transformedData: AttendanceData = {
            month: monthDate.toLocaleString('default', { month: 'long' }),
            year: yearNum,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            holidayDays,
            attendancePercentage,
            dailyStatus,
          };

          setAttendanceData([transformedData]);
        } else {
          // If no data, show empty state
          setAttendanceData([]);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load attendance data',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth]);

  // Get the selected month data
  const monthData =
    attendanceData.find(
      (month) =>
        `${String(new Date(Date.parse(month.month + ' 1, ' + month.year)).getMonth() + 1).padStart(2, '0')}-${month.year}` ===
        selectedMonth,
    ) || attendanceData[0];

  // Prepare chart data
  const pieChartData = [
    {
      name: 'Present',
      value: monthData?.presentDays || 0,
      color: '#4CAF50',
    },
    {
      name: 'Absent',
      value: monthData?.absentDays || 0,
      color: '#F44336',
    },
    {
      name: 'Late',
      value: monthData?.lateDays || 0,
      color: '#FFC107',
    },
    {
      name: 'Holiday',
      value: monthData?.holidayDays || 0,
      color: '#9E9E9E',
    },
  ];

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'holiday':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '✓';
      case 'absent':
        return '✗';
      case 'late':
        return '⟳';
      case 'holiday':
        return '⌛';
      default:
        return '';
    }
  };

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
      const label = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      options.push({ value: monthYear, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="w-full">
      {/* Add print styles */}
      <style>{printStyles}</style>

      {/* UI Controls - Hidden during print */}
      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Attendance Report</h2>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} disabled={loading || !monthData}>
              Print
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error loading attendance</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !monthData && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg mb-6">
            <p>No attendance data available for the selected month.</p>
          </div>
        )}

        {monthData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Summary */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Attendance Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Total Days</h4>
                    <p className="text-2xl font-bold">{monthData.totalDays}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Present Days</h4>
                    <p className="text-2xl font-bold">
                      {monthData.presentDays}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Absent Days</h4>
                    <p className="text-2xl font-bold">{monthData.absentDays}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Late Days</h4>
                    <p className="text-2xl font-bold">{monthData.lateDays}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Holiday Days</h4>
                    <p className="text-2xl font-bold">
                      {monthData.holidayDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Attendance Distribution
                </h3>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend at bottom right */}
                  <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg space-y-2">
                    {pieChartData.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-white">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Calendar View</h3>
              <div className="grid grid-cols-7 gap-2">
                <div className="text-center font-medium p-2">Sun</div>
                <div className="text-center font-medium p-2">Mon</div>
                <div className="text-center font-medium p-2">Tue</div>
                <div className="text-center font-medium p-2">Wed</div>
                <div className="text-center font-medium p-2">Thu</div>
                <div className="text-center font-medium p-2">Fri</div>
                <div className="text-center font-medium p-2">Sat</div>

                {/* Empty cells for alignment */}
                {Array.from({
                  length: new Date(
                    `${monthData.year}-${monthData.month}-01`,
                  ).getDay(),
                }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2"></div>
                ))}

                {/* Calendar days */}
                {monthData.dailyStatus.map((day) => {
                  const date = new Date(day.date);
                  return (
                    <div
                      key={day.date}
                      className={`p-2 rounded-lg text-center ${getStatusColor(day.status)} relative`}
                    >
                      <div className="font-bold">{date.getDate()}</div>
                      <div className="text-xs">{getStatusIcon(day.status)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Late</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                  <span>Holiday</span>
                </div>
              </div>
            </div>

            {/* Daily Status */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Daily Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {monthData.dailyStatus.map((day) => {
                  const date = new Date(day.date);
                  return (
                    <div
                      key={day.date}
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        day.status === 'present'
                          ? 'bg-green-900'
                          : day.status === 'absent'
                            ? 'bg-red-900'
                            : day.status === 'late'
                              ? 'bg-yellow-900'
                              : 'bg-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">
                          {date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs opacity-80">{day.day}</div>
                      </div>
                      <div className="text-sm font-medium capitalize">
                        {day.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print-only content */}
      {monthData && (
        <div className="print-only">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black">
              SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
            </h1>
            <p className="text-black">Phone No. 9897470696</p>
            <h2 className="text-xl font-bold mt-4 text-black">
              Attendance Report - {monthData.month} {monthData.year}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-black">
                <strong>Name:</strong> {studentData?.firstName}{' '}
                {studentData?.lastName}
              </p>
              <p className="text-black">
                <strong>Father&apos;s Name:</strong>{' '}
                {studentData?.guardianInfo?.father_name || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Class:</strong> {studentData?.gradeLevel || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-black">
                <strong>Roll No:</strong> {studentData?.rollNumber || 'N/A'}
              </p>
              <p className="text-black">
                <strong>DOB:</strong> {studentData?.dateOfBirth || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Attendance Percentage:</strong>{' '}
                {monthData.attendancePercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-black">
              Attendance Summary
            </h3>
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-black">
                    Total Days
                  </th>
                  <th className="border border-black p-2 text-black">
                    Present Days
                  </th>
                  <th className="border border-black p-2 text-black">
                    Absent Days
                  </th>
                  <th className="border border-black p-2 text-black">
                    Late Days
                  </th>
                  <th className="border border-black p-2 text-black">
                    Holiday Days
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-center text-black">
                    {monthData.totalDays}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {monthData.presentDays}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {monthData.absentDays}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {monthData.lateDays}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {monthData.holidayDays}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-black">
              Daily Attendance Record
            </h3>
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-black">Date</th>
                  <th className="border border-black p-2 text-black">Day</th>
                  <th className="border border-black p-2 text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthData.dailyStatus.map((day) => (
                  <tr key={day.date}>
                    <td className="border border-black p-2 text-black">
                      {day.date}
                    </td>
                    <td className="border border-black p-2 text-black">
                      {day.day}
                    </td>
                    <td className="border border-black p-2 capitalize text-black">
                      {day.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="text-center">
              <p className="text-black">Sig. of Class Teacher</p>
            </div>
            <div className="text-center">
              <p className="text-black">Sig. of Principal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
