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

import StudentAttendance from '../dashboard/StudentAttendance';
import StudentCalendar from '../dashboard/StudentCalendar';
import StudentFees from '../dashboard/StudentFees';
import StudentMarks from '../dashboard/StudentMarks';
import StudentResults from '../dashboard/StudentResults';

interface TemplateStudentDashboardProps {
  userData: UserData;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const TemplateStudentDashboard: React.FC<TemplateStudentDashboardProps> = ({
  colors,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Statistics for the dashboard
  const statistics = dummyStudentDashboardStats;

  // Attendance chart data with template colors
  const attendanceChartData = [
    {
      name: 'Present',
      value: dummyStudentAttendance[0].presentDays,
      color: colors.primary,
    },
    {
      name: 'Absent',
      value: dummyStudentAttendance[0].absentDays,
      color: '#EF4444',
    },
    {
      name: 'Late',
      value: dummyStudentAttendance[0].lateDays,
      color: colors.accent,
    },
    {
      name: 'Holiday',
      value: dummyStudentAttendance[0].holidayDays,
      color: '#6B7280',
    },
  ];

  // Performance chart data
  const performanceChartData = dummyStudentMarks[0].subjects.map((subject) => ({
    name: subject.name,
    marks: subject.obtainedMarks,
    maxMarks: subject.maxMarks,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-gray-800 font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Dynamic CSS Variables for template colors */}
      <style jsx>{`
        .template-dashboard {
          --primary-color: ${colors.primary};
          --secondary-color: ${colors.secondary};
          --accent-color: ${colors.accent};
        }
        .template-primary-bg {
          background-color: var(--primary-color);
        }
        .template-secondary-bg {
          background-color: var(--secondary-color);
        }
        .template-accent-bg {
          background-color: var(--accent-color);
        }
        .template-primary-text {
          color: var(--primary-color);
        }
        .template-primary-border {
          border-color: var(--primary-color);
        }
        .template-hover-primary:hover {
          background-color: var(--secondary-color);
        }
      `}</style>

      <div className="template-dashboard p-6">
        {/* Header without global navbar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Welcome to your learning portal</p>
        </div>

        {/* Navigation Tabs with template colors */}
        <div className="flex flex-wrap mb-8 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'marks'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Marks
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'attendance'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'calendar'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'results'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'fees'
                ? 'template-primary-bg text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fees
          </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Welcome Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3 template-primary-bg text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {dummyStudentProfile.name}!
                </h2>
                <p className="opacity-90 mb-2">
                  Ready to continue your learning journey?
                </p>
                <p className="text-sm opacity-75">
                  Class: {dummyStudentProfile.class} | Roll No:{' '}
                  {dummyStudentProfile.rollNumber}
                </p>
              </div>
              <div className="template-accent-bg text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold mb-2">Today&apos;s Date</h3>
                <p className="text-lg font-bold">{currentDate.split(',')[0]}</p>
                <p className="text-sm opacity-90">
                  {currentDate.split(',')[1]}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border template-primary-border">
                <h3 className="font-semibold text-gray-600 mb-2">Attendance</h3>
                <p className="text-3xl font-bold template-primary-text">
                  {statistics.currentAttendancePercentage}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">Last Exam</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.lastExamPercentage}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">Events</h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.upcomingEvents}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Assignments
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.pendingAssignments}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attendance Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
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
                            className="font-medium"
                          >
                            {attendanceChartData[index].name} (
                            {(percent * 100).toFixed(0)}%)
                          </text>
                        );
                      }}
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Last Exam Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performanceChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="marks"
                      fill={colors.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs with template styling */}
        <div className="template-content">
          {activeTab === 'marks' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <StudentMarks />
            </div>
          )}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <StudentAttendance />
            </div>
          )}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <StudentCalendar />
            </div>
          )}
          {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <StudentResults />
            </div>
          )}
          {activeTab === 'fees' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <StudentFees />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateStudentDashboard;
