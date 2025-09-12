'use client';

import { useRouter } from 'next/navigation';

import { useUserData } from '@/hooks/useUserData';
import { useUser } from '@auth0/nextjs-auth0/client';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, any>;
  orgId: string;
}

export function useAuth() {
  const { user, error, isLoading: authLoading } = useUser();
  const {
    userData: cachedUserData,
    isLoading: dataLoading,
    clearUserData,
    refreshUserData,
  } = useUserData();
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      return await refreshUserData();
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const redirectBasedOnRole = () => {
    router.push('/dashboard');
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    clearUserData();
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    localStorage.removeItem('studentAuth');
    sessionStorage.removeItem('authCodeProcessed');
    sessionStorage.removeItem('isAuthCallback');
    sessionStorage.removeItem('userData');
    window.location.href = '/';
  };

  // Convert cached user data to the expected format
  const userData = cachedUserData
    ? {
        id: cachedUserData.id,
        email: cachedUserData.email,
        firstName: cachedUserData.firstName,
        lastName: cachedUserData.lastName,
        role: cachedUserData.role,
        permissions: cachedUserData.permissions,
        orgId: cachedUserData.orgId,
      }
    : null;

  return {
    user,
    userData,
    isLoading: authLoading || dataLoading,
    error,
    login,
    logout,
    fetchUserData,
    redirectBasedOnRole,
    isAuthenticated: !!user && !!cachedUserData,
  };
}
