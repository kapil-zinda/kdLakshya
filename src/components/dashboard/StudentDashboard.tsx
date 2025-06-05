'use client';

import React, { useState } from 'react';

import { UserData } from '@/app/interfaces/userInterface';
import {
  dummyStudentAttendance,
  dummyStudentDashboardStats,
  dummyStudentMarks,
  dummyStudentProfile,
} from '@/data/studentDashboardDummyData';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import StudentAttendance from './StudentAttendance';
import StudentCalendar from './StudentCalendar';
import StudentFees from './StudentFees';
import StudentMarks from './StudentMarks';
import StudentResults from './StudentResults';

interface StudentDashboardProps {
  userData: UserData;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Statistics for the dashboard
  const statistics = dummyStudentDashboardStats;

  // Attendance chart data
  const attendanceChartData = [
    {
      name: 'Present',
      value: dummyStudentAttendance[0].presentDays,
      color: '#4CAF50',
    },
    {
      name: 'Absent',
      value: dummyStudentAttendance[0].absentDays,
      color: '#F44336',
    },
    {
      name: 'Late',
      value: dummyStudentAttendance[0].lateDays,
      color: '#FFC107',
    },
    {
      name: 'Holiday',
      value: dummyStudentAttendance[0].holidayDays,
      color: '#9E9E9E',
    },
  ];

  // Performance chart data
  const performanceChartData = dummyStudentMarks[0].subjects.map((subject) => ({
    name: subject.name,
    marks: subject.obtainedMarks,
    maxMarks: subject.maxMarks,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded shadow-md">
          <p className="text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      {/* Tabs */}
      <div className="flex flex-wrap mb-6 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'marks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Marks
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'results'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Fees
        </button>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
              <h1 className="text-xl md:text-2xl font-bold">
                STUDENT DASHBOARD
              </h1>
              <p>Welcome, {dummyStudentProfile.name}</p>
              <p className="text-sm">
                Class: {dummyStudentProfile.class} | Roll No:{' '}
                {dummyStudentProfile.rollNumber}
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg hidden sm:block">
              <h2 className="font-bold text-sm md:text-base">
                TODAY&apos;S DATE
              </h2>
              <p className="text-lg md:text-xl">{currentDate}</p>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">ATTENDANCE</h2>
              <p className="text-xl md:text-2xl">
                {statistics.currentAttendancePercentage}%
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">LAST EXAM</h2>
              <p className="text-xl md:text-2xl">
                {statistics.lastExamPercentage}%
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">
                UPCOMING EVENTS
              </h2>
              <p className="text-xl md:text-2xl">{statistics.upcomingEvents}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">
                PENDING ASSIGNMENTS
              </h2>
              <p className="text-xl md:text-2xl">
                {statistics.pendingAssignments}
              </p>
            </div>
          </div> */}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Attendance Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Current Month Attendance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceChartData}
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
                          fill={attendanceChartData[index].color}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {attendanceChartData[index].name} (
                          {(percent * 100).toFixed(0)}%)
                        </text>
                      );
                    }}
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Last Exam Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'white' }}
                    tickLine={{ stroke: 'white' }}
                  />
                  <YAxis
                    tick={{ fill: 'white' }}
                    tickLine={{ stroke: 'white' }}
                  />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          {/* <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('attendance')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                View Attendance
              </button>
              <button
                onClick={() => setActiveTab('marks')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Check Marks
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
              >
                View Results
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Fee Details
              </button>
            </div>
          </div> */}

          {/* Upcoming Events */}
          {/* <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {dummyCalendarEvents
                .filter((event) => new Date(event.date) > new Date())
                .slice(0, 3)
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-300">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {event.startTime &&
                          ` • ${event.startTime} - ${event.endTime}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        event.type === 'exam'
                          ? 'bg-red-500'
                          : event.type === 'holiday'
                          ? 'bg-green-500'
                          : event.type === 'assignment'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                ))}
            </div>
          </div> */}
        </div>
      )}

      {/* Marks Tab */}
      {activeTab === 'marks' && <StudentMarks />}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && <StudentAttendance />}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && <StudentCalendar />}

      {/* Results Tab */}
      {activeTab === 'results' && <StudentResults />}

      {/* Fees Tab */}
      {activeTab === 'fees' && <StudentFees />}
    </div>
  );
};

export default StudentDashboard;
