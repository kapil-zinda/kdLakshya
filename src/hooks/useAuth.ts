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
    // Always redirect to auth subdomain for authentication
    const currentHost = window.location.host;
    const currentSubdomain = currentHost.split('.')[0];
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    // Store the origin subdomain for post-authentication redirect
    if (currentSubdomain && currentSubdomain !== 'auth') {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
      console.log('💾 Stored origin subdomain for return:', currentSubdomain);
    }

    let authUrl;
    if (isLocalhost) {
      // For development, use auth.localhost for authentication
      const port = currentHost.split(':')[1] || '3000';
      authUrl = `http://auth.localhost:${port}/login`;
    } else {
      // For production, always redirect to auth.uchhal.in for authentication
      const domain = currentHost.split('.').slice(1).join('.'); // Get base domain (uchhal.in)
      authUrl = `https://auth.${domain}/login`;
    }

    console.log(
      '🔑 useAuth: Redirecting to AUTH subdomain for authentication:',
      authUrl,
    );
    console.log('🔙 Origin subdomain:', currentSubdomain);
    window.location.href = authUrl;
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
