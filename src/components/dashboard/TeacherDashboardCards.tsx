'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TeacherDashboardCardsProps {
  userData: UserData;
}

const TeacherDashboardCards: React.FC<TeacherDashboardCardsProps> = ({
  userData,
}) => {
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacherInfo, setClassTeacherInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkClassTeacherStatus = async () => {
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

        // Fetch user/me to check for class teacher info
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

          // Check if user has class_teacher_of or assigned_class field
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
            setIsClassTeacher(true);

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

            setClassTeacherInfo({
              classId: classId,
              className:
                className || (classId ? `Class ${classId}` : 'your class'),
            });
          }

          console.log('Class teacher status:', {
            isClassTeacher: !!(classTeacherOf || hasTeamPermission),
            classInfo: classTeacherOf || teamPermissions,
            permissions: permissions,
          });
        }
      } catch (error) {
        console.error('Error checking class teacher status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkClassTeacherStatus();
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('cachedUserData');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    localStorage.removeItem('adminAuth');
    sessionStorage.clear();
    localStorage.clear();

    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Clear cache
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    window.location.replace('/');
  };

  const dashboardCards = [
    {
      title: 'Profile',
      description: 'View and update your personal information',
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      href: '/teacher-dashboard/profile',
      stats: 'View Info',
    },
    {
      title: 'Result',
      description: 'Manage exams, assessments, and student evaluations',
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: 'from-orange-500 to-red-600',
      href: '/teacher-dashboard/exams',
      stats: 'Manage Exams',
    },
    ...(isClassTeacher
      ? [
          {
            title: 'Classes',
            description: `View and manage ${classTeacherInfo?.className || 'your class'}`,
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            ),
            color: 'from-green-500 to-green-600',
            href: '/teacher-dashboard/classes',
            stats: 'Class Teacher',
          },
          {
            title: 'Attendance',
            description: `Manage attendance for ${classTeacherInfo?.className || 'your class'}`,
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            ),
            color: 'from-purple-500 to-purple-600',
            href: '/teacher-dashboard/attendance',
            stats: 'Class Teacher',
          },
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Teacher Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {userData.firstName} {userData.lastName}
                {isClassTeacher && classTeacherInfo && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Class Teacher - {classTeacherInfo.className}
                  </span>
                )}
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
            Manage your classes, track student progress, and handle academic
            tasks.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {dashboardCards.map((card, index) => (
            <Link key={index} href={card.href} className="group">
              <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group-hover:scale-105">
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
  );
};

export default TeacherDashboardCards;
