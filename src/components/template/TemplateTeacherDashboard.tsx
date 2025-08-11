'use client';

import React, { useEffect, useState } from 'react';

import { UserData } from '@/app/interfaces/userInterface';
import {
  chartColors,
  dummyAttendanceChartData,
  dummyDashboardStats,
  dummyPerformanceChartData,
} from '@/data/teacherDashboardDummyData';
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

import AcademicTasks from '../dashboard/AcademicTasks';
import AttendanceManagement from '../dashboard/AttendanceManagement';
import MarkSheet from '../dashboard/MarkSheet';
import ResultsTracking from '../dashboard/ResultsTracking';

interface TemplateTeacherDashboardProps {
  userData: UserData;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const TemplateTeacherDashboard: React.FC<TemplateTeacherDashboardProps> = ({
  colors,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [statistics, setStatistics] = useState(dummyDashboardStats);
  const [isLoading, setIsLoading] = useState(true);

  // Get current date in DD/MM/YY format
  const today = new Date();
  const currentDate = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getFullYear()).slice(-2),
  ].join('/');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

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
        {/* Navigation Tabs with template colors */}
        <div className="mb-8">
          <ul className="flex flex-wrap text-sm font-medium text-center border-b border-gray-200">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'template-primary-text border-b-2 template-primary-border bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                  activeTab === 'attendance'
                    ? 'template-primary-text border-b-2 template-primary-border bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Attendance
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('marksheet')}
                className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                  activeTab === 'marksheet'
                    ? 'template-primary-text border-b-2 template-primary-border bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Mark Sheet
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('results')}
                className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                  activeTab === 'results'
                    ? 'template-primary-text border-b-2 template-primary-border bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Results
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                  activeTab === 'tasks'
                    ? 'template-primary-text border-b-2 template-primary-border bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Academic Tasks
              </button>
            </li>
          </ul>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3 template-primary-bg text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
                <p className="opacity-90">Manage your classroom with ease</p>
              </div>
              <div className="template-accent-bg text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold mb-2">Today&apos;s Date</h3>
                <p className="text-xl font-bold">{currentDate}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border template-primary-border">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Total Students
                </h3>
                <p className="text-3xl font-bold template-primary-text">
                  {statistics.totalStudents}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Present Today
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.presentToday}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Absent Today
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.absentToday}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="font-semibold text-gray-600 mb-2">
                  Pending Tasks
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.pendingTasks}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Attendance Overview
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dummyAttendanceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dummyAttendanceChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? colors.primary
                                : index === 1
                                  ? colors.secondary
                                  : chartColors[index % chartColors.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Student Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dummyPerformanceChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill={colors.primary}
                        radius={[4, 4, 0, 0]}
                      >
                        {dummyPerformanceChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index % 2 === 0
                                ? colors.primary
                                : colors.secondary
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="template-primary-bg hover:template-secondary-bg text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Take Attendance
                </button>
                <button
                  onClick={() => setActiveTab('marksheet')}
                  className="template-secondary-bg hover:template-primary-bg text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Update Marks
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className="template-accent-bg text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:opacity-90"
                >
                  View Results
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Manage Tasks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs with template styling */}
        <div className="template-content">
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <AttendanceManagement />
            </div>
          )}
          {activeTab === 'marksheet' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <MarkSheet />
            </div>
          )}
          {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <ResultsTracking />
            </div>
          )}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <AcademicTasks />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateTeacherDashboard;
