'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApiService } from '@/services/api';
import { useGetClassesQuery } from '@/store/api/classApi';
import { useGetFacultyQuery } from '@/store/api/facultyApi';
import { useGetStudentsQuery } from '@/store/api/studentApi';

export default function AdminDashboard() {
  return (
    <DashboardWrapper allowedRoles={['admin']} redirectTo="/">
      {(userData) => <AdminDashboardContent userData={userData} />}
    </DashboardWrapper>
  );
}

function AdminDashboardContent({ userData }: { userData: UserData }) {
  const orgId = userData?.orgId;

  const { data: studentsResponse } = useGetStudentsQuery(orgId, {
    skip: !orgId,
  });
  const { data: facultyResponse } = useGetFacultyQuery(orgId, {
    skip: !orgId,
  });
  const { data: classesResponse } = useGetClassesQuery(orgId, {
    skip: !orgId,
  });
  const [galleryCount, setGalleryCount] = useState<number | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!orgId) return;
    ApiService.getGalleryImages(orgId)
      .then((images) => setGalleryCount(images.length))
      .catch((error) => {
        console.error('Failed to load gallery count:', error);
        setGalleryCount(null);
      });
    ApiService.getNews(orgId)
      .then((response) => setNotificationsCount(response.data?.length ?? 0))
      .catch((error) => {
        console.error('Failed to load notifications count:', error);
        setNotificationsCount(null);
      });
  }, [orgId]);

  const studentCount = studentsResponse?.data?.length;
  const teacherCount = facultyResponse?.data?.length;
  const classCount = classesResponse?.data?.length;

  // Cursor-paginated endpoints don't return a true total - a count that
  // exactly hits the page size likely means there's more beyond this page.
  const formatCount = (count: number | undefined, pageSize = 50) =>
    count === undefined ? '...' : count >= pageSize ? `${count}+` : `${count}`;

  const handleLogout = () => {
    // Clear all authentication data, including the redux-persist snapshot
    // (without this, a shared computer keeps the session after "logout")
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    localStorage.removeItem('persist:root');
    sessionStorage.removeItem('authCodeProcessed');
    sessionStorage.removeItem('isAuthCallback');

    // Simple redirect to homepage
    window.location.href = '/';
  };

  // Check if user has 'superwise' (clerk) permission. userData.permission is
  // the real UserPermissionsObject shape, so the role lives at `.role`, not
  // the nonexistent `.org` field this used to check.
  const hasSuperWisePermission = userData?.permission?.role === 'superwise';

  const dashboardCards = [
    {
      title: 'Student Management',
      description: 'Manage student records, admissions, and profiles',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      href: '/admin-portal/students',
      stats: `${formatCount(studentCount)} Students`,
    },
    {
      title: 'Teacher Management',
      description: 'Manage faculty, staff, and teacher profiles',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      href: '/admin-portal/teachers',
      stats: `${formatCount(teacherCount)} Teachers`,
    },
    {
      title: 'Notifications',
      description: 'Create, update, and manage school announcements',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM11 16.5l.708-.293a2.121 2.121 0 012.95 0l.342.342.071.071a1 1 0 01.293.707v2.173m-6-6a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-600',
      href: '/admin-portal/notifications',
      stats:
        notificationsCount === null
          ? '...'
          : `${notificationsCount} Notification${notificationsCount === 1 ? '' : 's'}`,
    },
    {
      title: 'Class Management',
      description: 'Organize classes, sections, and academic structure',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      href: '/admin-portal/classes',
      stats: `${formatCount(classCount)} Classes`,
    },
    {
      title: 'Fee Management',
      description: 'Track fee payments, dues, and send payment reminders',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin-portal/fees',
      stats: 'Track Payments',
    },
    {
      title: 'School Settings',
      description: 'Update school information and website content',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      href: '/admin-portal/school-settings',
      stats: 'Configure',
    },
    {
      title: 'Gallery Management',
      description: 'Upload and organize school photos and media',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'from-pink-500 to-pink-600',
      href: '/admin-portal/gallery',
      stats:
        galleryCount === null
          ? '...'
          : `${galleryCount} Photo${galleryCount === 1 ? '' : 's'}`,
    },
    {
      title: 'Statistics Management',
      description: 'Create and update school statistics and achievements',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: 'from-cyan-500 to-cyan-600',
      href: '/admin-portal/school-settings?tab=statistics',
      stats: 'Manage',
    },
    {
      title: 'Role Management',
      description: 'Give trusted teachers admin or clerk access',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      color: 'from-violet-500 to-violet-600',
      href: '/admin-portal/roles',
      stats: 'Manage',
    },
  ];

  return (
    <DashboardWrapper allowedRoles={['admin']}>
      {() => (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-background shadow-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">
                    School Admin Portal
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Welcome, {userData.firstName} {userData.lastName}
                  </div>
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="bg-accent hover:bg-accent/80 text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Dashboard Overview
              </h2>
              <p className="text-muted-foreground">
                Manage all aspects of your school from this central hub.
              </p>
            </div>

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Students
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      1,248
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Teachers
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">86</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Classes
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">45</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM11 16.5l.708-.293a2.121 2.121 0 012.95 0l.342.342.071.071a1 1 0 01.293.707v2.173m-6-6a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Active Notifications
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards
                .filter((card) => {
                  // Hide School Settings, Statistics Management, and Role
                  // Management for users with 'superwise' permission - the
                  // backend restricts all of these to head/super admins.
                  if (
                    hasSuperWisePermission &&
                    (card.href === '/admin-portal/school-settings' ||
                      card.href.startsWith('/admin-portal/school-settings?') ||
                      card.href === '/admin-portal/roles')
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((card, index) => (
                  <Link key={index} href={card.href} className="group">
                    <div className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group-hover:scale-105 border-2 border-foreground/30">
                      <div
                        className={`h-32 bg-gradient-to-br ${card.color} p-6 flex items-center justify-center`}
                      >
                        <div className="text-white">{card.icon}</div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {card.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {card.stats}
                          </span>
                          <svg
                            className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </main>
        </div>
      )}
    </DashboardWrapper>
  );
}
