'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import DashboardWrapper from '@/components/dashboard/DashboardWrapper';

export default function TeacherAttendancePage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'admin']}>
      {(userData) => {
        const [classInfo, setClassInfo] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
          const fetchClassInfo = async () => {
            try {
              const tokenData = localStorage.getItem('bearerToken');
              if (!tokenData) {
                setIsLoading(false);
                return;
              }

              const parsed = JSON.parse(tokenData);
              const BaseURLAuth =
                process.env.NEXT_PUBLIC_BaseURLAuth ||
                'https://apis.testkdlakshya.uchhal.in/auth';

              const response = await fetch(
                `${BaseURLAuth}/users/me?include=permission`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${parsed.value}`,
                    'Content-Type': 'application/vnd.api+json',
                  },
                },
              );

              if (response.ok) {
                const data = await response.json();
                const attrs = data.data.attributes;

                const classTeacherOf =
                  attrs.class_teacher_of ||
                  attrs.assigned_class ||
                  attrs.class_id ||
                  null;

                if (classTeacherOf) {
                  setClassInfo({
                    classId: classTeacherOf,
                    className: attrs.class_name || `Class ${classTeacherOf}`,
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching class info:', error);
            } finally {
              setIsLoading(false);
            }
          };

          fetchClassInfo();
        }, []);

        if (isLoading) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading attendance information...
                </p>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                {classInfo ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Attendance - {classInfo.className}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Manage attendance for your class
                        </p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-full">
                        Class Teacher
                      </span>
                    </div>

                    {/* Placeholder for attendance management */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Attendance tracking
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Attendance management functionality coming soon.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
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
                      Not a class teacher
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You need to be a class teacher to manage attendance.
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        );
      }}
    </DashboardWrapper>
  );
}
