'use client';

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check student authentication first (legacy support)
  if (!cachedUserData) {
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
          router.push(redirectTo);
          return null;
        }

        if (allowedRoles.includes('student')) {
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
          return <>{children(mockStudentUserData)}</>;
        }
      }
    } catch (error) {
      console.error('Invalid student auth data:', error);
      localStorage.removeItem('studentAuth');
    }

    // No valid authentication found
    router.push(redirectTo);
    return null;
  }

  // Check if user has required role
  if (!allowedRoles.includes(cachedUserData.role)) {
    router.push(redirectTo);
    return null;
  }

  console.log(
    'DashboardWrapper cachedUserData:',
    JSON.stringify(cachedUserData, null, 2),
  );

  // Convert cached user data to the expected UserData format
  const userData: UserData = {
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

  console.log(
    'DashboardWrapper transformed userData:',
    JSON.stringify(userData, null, 2),
  );

  return <>{children(userData)}</>;
}
