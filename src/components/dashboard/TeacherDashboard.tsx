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

import AcademicTasks from './AcademicTasks';
import AttendanceManagement from './AttendanceManagement';
import MarkSheet from './MarkSheet';
import ResultsTracking from './ResultsTracking';

interface TeacherDashboardProps {
  userData: UserData;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ userData }) => {
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
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="bg-gray-800 p-4 md:p-6 font-sans rounded-3xl w-full">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-400 border-b border-gray-700">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'attendance'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Attendance
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('marksheet')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'marksheet'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Mark Sheet
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'results'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Results
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'tasks'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
              <h1 className="text-xl md:text-2xl font-bold">
                TEACHER DASHBOARD
              </h1>
              <p>Classroom Management System</p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg hidden sm:block">
              <h2 className="font-bold text-sm md:text-base">
                TODAY&apos;S DATE
              </h2>
              <p className="text-lg md:text-xl">{currentDate}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">TOTAL STUDENTS</h2>
              <p className="text-xl md:text-2xl">{statistics.totalStudents}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">PRESENT TODAY</h2>
              <p className="text-xl md:text-2xl">{statistics.presentToday}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">ABSENT TODAY</h2>
              <p className="text-xl md:text-2xl">{statistics.absentToday}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">PENDING TASKS</h2>
              <p className="text-xl md:text-2xl">{statistics.pendingTasks}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">
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
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Student Performance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dummyPerformanceChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {dummyPerformanceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('attendance')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Take Attendance
              </button>
              <button
                onClick={() => setActiveTab('marksheet')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Update Marks
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
              >
                View Results
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Manage Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Management Tab */}
      {activeTab === 'attendance' && <AttendanceManagement />}

      {/* Mark Sheet Tab */}
      {activeTab === 'marksheet' && <MarkSheet />}

      {/* Results Tracking Tab */}
      {activeTab === 'results' && <ResultsTracking />}

      {/* Academic Tasks Tab */}
      {activeTab === 'tasks' && <AcademicTasks />}
    </div>
  );
};

export default TeacherDashboard;
