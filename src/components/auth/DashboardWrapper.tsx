'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserData } from '@/app/interfaces/userInterface';
import { useUserData } from '@/hooks/useUserData';

interface DashboardWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

export function DashboardWrapper({
  children,
  allowedRoles = ['admin', 'teacher', 'student'],
  redirectTo = '/',
}: DashboardWrapperProps) {
  const router = useRouter();
  const { userData: cachedUserData, isLoading } = useUserData();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check student authentication first (legacy support)
        const studentAuth = localStorage.getItem('studentAuth');
        if (studentAuth && !cachedUserData) {
          try {
            const studentData = JSON.parse(studentAuth);
            const loginTime = new Date(studentData.loginTime);
            const now = new Date();
            const hoursDiff =
              (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
              localStorage.removeItem('studentAuth');
              router.push(redirectTo);
              return;
            }

            const mockStudentUserData: UserData = {
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

            if (!allowedRoles.includes('student')) {
              router.push(redirectTo);
              return;
            }

            setUserData(mockStudentUserData);
            return;
          } catch (error) {
            console.error('Invalid student auth data:', error);
            localStorage.removeItem('studentAuth');
            router.push(redirectTo);
            return;
          }
        }

        // Use cached user data from the new system
        if (cachedUserData) {
          // Check if user has required role
          if (!allowedRoles.includes(cachedUserData.role)) {
            router.push(redirectTo);
            return;
          }

          // Convert cached user data to the expected UserData format
          const convertedUserData: UserData = {
            userId: cachedUserData.id,
            keyId: 'user-' + cachedUserData.id,
            orgKeyId: 'org-' + cachedUserData.orgId,
            orgId: cachedUserData.orgId,
            userEmail: cachedUserData.email,
            firstName: cachedUserData.firstName,
            lastName: cachedUserData.lastName,
            permission: cachedUserData.permissions,
            allowedTeams: Object.keys(cachedUserData.permissions || {})
              .filter((key) => key.startsWith('team-'))
              .map((key) => key.match(/team-(\d+)/)?.[1])
              .filter(Boolean) as string[],
          };

          setUserData(convertedUserData);
          return;
        }

        // No cached data and not loading - redirect to login
        if (!isLoading) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [cachedUserData, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return <>{children(userData)}</>;
}
