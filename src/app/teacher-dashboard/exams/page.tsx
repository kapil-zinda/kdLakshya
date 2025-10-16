'use client';

import React from 'react';

import Link from 'next/link';

import DashboardWrapper from '@/components/dashboard/DashboardWrapper';

export default function TeacherExamsPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'admin']}>
      {(userData) => (
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
                    Exams Management
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Exams & Assessments
              </h2>
              <p className="text-gray-600 mb-6">
                Manage exams, assessments, and student evaluations.
              </p>

              {/* Placeholder for exams list */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No exams available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Exam management functionality coming soon.
                </p>
              </div>
            </div>
          </main>
        </div>
      )}
    </DashboardWrapper>
  );
}
