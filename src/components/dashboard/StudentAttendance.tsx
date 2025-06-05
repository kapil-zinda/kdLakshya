'use client';

import React, { useState } from 'react';

import { dummyStudentAttendance } from '@/data/studentDashboardDummyData';
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
    /* Hide UI elements */
    .no-print {
      display: none !important;
    }

    /* Show only print content */
    .print-only {
      display: block !important;
      padding: 20px !important;
      margin: 0 !important;
      width: 100% !important;
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

    /* Hide specific UI elements */
    nav, 
    header,
    footer,
    .sidebar,
    .navigation,
    button,
    select {
      display: none !important;
    }

    /* Reset page margins */
    @page {
      margin: 2cm;
    }

    /* Ensure text is readable */
    body {
      background: white !important;
      color: black !important;
    }
  }
`;

const StudentAttendance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dummyStudentAttendance[0].month,
  );

  // Get the selected month data
  const monthData = dummyStudentAttendance.find(
    (month) => month.month === selectedMonth,
  );

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
                {dummyStudentAttendance.map((month) => (
                  <SelectItem key={month.month} value={month.month}>
                    {month.month} {month.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint}>Print</Button>
          </div>
        </div>

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
                  <div className="bg-blue-600 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Attendance %</h4>
                    <p className="text-2xl font-bold">
                      {monthData.attendancePercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Attendance Distribution
                </h3>
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
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          25 + innerRadius + (outerRadius - innerRadius);
                        const x =
                          cx + radius * Math.cos(-midAngle * RADIAN) * 0.8;
                        const y =
                          cy + radius * Math.sin(-midAngle * RADIAN) * 0.8;

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={pieChartData[index].color}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {pieChartData[index].name} (
                            {pieChartData[index].value})
                          </text>
                        );
                      }}
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
                <strong>Name:</strong> Rahul Kumar
              </p>
              <p className="text-black">
                <strong>{'Fathers Name:'}</strong> Nanak Chand
              </p>
              <p className="text-black">
                <strong>Class:</strong> 11
              </p>
            </div>
            <div>
              <p className="text-black">
                <strong>Roll No:</strong> 2211136
              </p>
              <p className="text-black">
                <strong>S.R.No.:</strong> 2316
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
