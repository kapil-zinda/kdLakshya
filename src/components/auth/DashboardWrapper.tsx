'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { UserData } from '@/app/interfaces/userInterface';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';

interface DashboardWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function DashboardWrapper({
  children,
  allowedRoles = ['admin', 'teacher', 'faculty', 'student'],
  redirectTo = '/',
}: DashboardWrapperProps) {
  const router = useRouter();
  const { userData: cachedUserData, isLoading } = useUserDataRedux();

  // Resolve access without side effects during render - router.push() used
  // to be called directly in the render body below, which fired "Cannot
  // update a component while rendering a different component" on every
  // render of every protected page. The actual navigation now happens in
  // the effect further down, once, after render has settled.
  let resolvedUserData: UserData | null = null;
  let shouldRedirect = false;

  if (!isLoading) {
    if (!cachedUserData) {
      // Check student authentication first (legacy support)
      try {
        const studentAuth = localStorage.getItem('studentAuth');
        if (studentAuth) {
          const studentData = JSON.parse(studentAuth);
          const loginTime = new Date(studentData.loginTime);
          const now = new Date();
          const hoursDiff =
            (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

          if (hoursDiff > 24) {
            localStorage.removeItem('studentAuth');
            shouldRedirect = true;
          } else if (allowedRoles.includes('student')) {
            resolvedUserData = {
              userId: studentData.username,
              keyId: `student_${studentData.username}`,
              orgKeyId: 'student_org',
              orgId: 'student_organization',
              userEmail: `${studentData.username}@student.edu`,
              firstName: studentData.username,
              lastName: '',
              permission: { role: 'student' },
              allowedTeams: ['students'],
            };
          } else {
            shouldRedirect = true;
          }
        } else {
          // No valid authentication found
          shouldRedirect = true;
        }
      } catch (error) {
        console.error('Invalid student auth data:', error);
        localStorage.removeItem('studentAuth');
        shouldRedirect = true;
      }
    } else if (!allowedRoles.includes(cachedUserData.role)) {
      // User doesn't have the required role
      shouldRedirect = true;
    } else {
      // Convert cached user data to the expected UserData format
      resolvedUserData = {
        userId: cachedUserData.id,
        keyId: 'user-' + cachedUserData.id,
        orgKeyId: 'org-' + cachedUserData.orgId,
        orgId: cachedUserData.orgId,
        userEmail: cachedUserData.email,
        firstName: cachedUserData.firstName || '',
        lastName: cachedUserData.lastName || '',
        permission: cachedUserData.permissions,
        allowedTeams: Object.keys(cachedUserData.permissions || {})
          .filter((key) => key.startsWith('team-'))
          .map((key) => key.match(/team-(.+)/)?.[1])
          .filter(Boolean) as string[],
        type: cachedUserData.type,
        role: cachedUserData.role,
      };
    }
  }

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  if (isLoading || shouldRedirect || !resolvedUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children(resolvedUserData)}</>;
}
