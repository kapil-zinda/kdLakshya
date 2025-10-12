'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUserData } from '@/hooks/useUserData';
import { useUser } from '@auth0/nextjs-auth0/client';

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
  const { user, isLoading: authLoading } = useUser();
  const { userData: cachedUserData, isLoading: dataLoading } = useUserData();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserAuth = () => {
      if (authLoading || dataLoading) return;

      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (!cachedUserData) {
        router.push(redirectTo);
        return;
      }

      setUserRole(cachedUserData.role);

      // Check if user has required role
      if (!allowedRoles.includes(cachedUserData.role)) {
        router.push('/dashboard');
        return;
      }

      setIsCheckingAuth(false);
    };

    checkUserAuth();
  }, [
    user,
    authLoading,
    dataLoading,
    cachedUserData,
    router,
    allowedRoles,
    redirectTo,
  ]);

  if (authLoading || dataLoading || isCheckingAuth) {
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
