'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';

interface ClassesContentProps {
  userData: UserData;
}

function ClassesContent({ userData }: ClassesContentProps) {
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

          // Also check if user has team permissions (class teacher permissions)
          const permissions = attrs.permissions || {};
          const teamPermissions = Object.keys(permissions).filter((key) =>
            key.startsWith('team-'),
          );
          const hasTeamPermission =
            teamPermissions.length > 0 &&
            teamPermissions.some(
              (key) =>
                permissions[key] === 'manage' || permissions[key] === 'edit',
            );

          if (classTeacherOf || hasTeamPermission) {
            // Extract team ID from permissions if available
            let classId = classTeacherOf;
            const className = attrs.class_name || null;

            if (!classId && hasTeamPermission) {
              const teamKey = teamPermissions.find(
                (key) =>
                  permissions[key] === 'manage' || permissions[key] === 'edit',
              );
              if (teamKey) {
                classId = teamKey.replace('team-', '');
              }
            }

            setClassInfo({
              classId: classId,
              className:
                className || (classId ? `Class ${classId}` : 'your class'),
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
          <p className="mt-4 text-gray-600">Loading class information...</p>
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
                Class Management
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
                    {classInfo.className}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    View and manage your class
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                  Class Teacher
                </span>
              </div>

              {/* Placeholder for class details */}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Class details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed class management functionality coming soon.
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
                You are not assigned as a class teacher for any class.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TeacherClassesPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'admin']}>
      {(userData) => <ClassesContent userData={userData} />}
    </DashboardWrapper>
  );
}
