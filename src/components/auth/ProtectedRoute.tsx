'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'teacher', 'student'],
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserAuth = async () => {
      if (isLoading) return;

      if (!user) {
        router.push(redirectTo);
        return;
      }

      try {
        // Get access token and fetch user data
        const tokenResponse = await fetch('/api/auth/token');
        const { accessToken } = await tokenResponse.json();

        if (!accessToken) {
          router.push(redirectTo);
          return;
        }

        const response = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = response.data;
        setUserRole(userData.role);

        // Check if user has required role
        if (!allowedRoles.includes(userData.role)) {
          // Redirect based on their actual role
          switch (userData.role) {
            case 'admin':
              router.push('/admin-portal/dashboard');
              break;
            case 'teacher':
              router.push('/teacher-dashboard');
              break;
            case 'student':
              router.push('/student-dashboard');
              break;
            default:
              router.push(redirectTo);
          }
          return;
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push(redirectTo);
      }
    };

    checkUserAuth();
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !userRole || !allowedRoles.includes(userRole as any)) {
    return null;
  }

  return <>{children}</>;
}
